"""WhatsApp bot: risk-scans messages and links for investors.

Two modes:
1. **Offline export analyzer** — upload a WhatsApp ``.txt`` export; every message is
   scored with the existing detectors and returned with a plain-language explanation.
   Works with zero credentials.
2. **WhatsApp Business Cloud API** — optional webhook receiver that scans incoming
   messages and replies with the risk verdict. Enabled only when the
   ``WHATSAPP_VERIFY_TOKEN``, ``WHATSAPP_ACCESS_TOKEN`` and ``WHATSAPP_PHONE_NUMBER_ID``
   env vars are set (Meta app + phone number required).
"""

from __future__ import annotations

import logging
import os
import re
from typing import Any, Dict, List, Optional, Tuple

from app.detectors.text_detector import detect_text
from app.detectors.url_detector import detect_url
from app.explainer import plain_language, risk_label
from app.privacy.pii import redact_pii

logger = logging.getLogger("verifin.bot.whatsapp")

SYSTEM_SKIP = re.compile(
    r"end-to-end encrypted|created this group|changed the group|added |removed |"
    r"joined using this group|messages and calls are secured|"
    r"image omitted|video omitted|audio omitted|sticker omitted|document omitted",
    re.I,
)

# iOS:  [10/08/26, 2:34:56 PM] Sender: message
_RE_IOS = re.compile(r"^\[\s*(\d{1,2}[/.]\d{1,2}[/.]\d{2,4}),\s*(\d{1,2}:\d{2}(?::\d{2})?\s*[AP]\.?M\.?)\]\s*(.*?):\s*(.*)$", re.I)
# Android:  10/08/26, 2:34:56 pm - Sender: message
_RE_ANDROID = re.compile(r"^(\d{1,2}[/.]\d{1,2}[/.]\d{2,4}),\s*(\d{1,2}:\d{2}(?::\d{2})?\s*[AP]\.?M\.?)\s*-\s*(.*?):\s*(.*)$", re.I)

MAX_MESSAGES = 200


# --------------------------------------------------------------------------- #
# Export parsing
# --------------------------------------------------------------------------- #
def parse_export(text: str) -> List[Dict[str, str]]:
    """Split a WhatsApp export into (sender, timestamp, message) records."""
    messages: List[Dict[str, str]] = []
    current: Optional[Dict[str, str]] = None
    text = text.lstrip("\ufeff")
    for raw_line in text.splitlines():
        line = raw_line.strip()
        if not line:
            continue
        m = _RE_IOS.match(line) or _RE_ANDROID.match(line)
        if m:
            if current:
                messages.append(current)
            current = {"timestamp": m.group(1) + " " + m.group(2), "sender": m.group(3).strip(), "message": m.group(4).strip()}
        elif current:
            current["message"] += " " + line
    if current:
        messages.append(current)
    return messages


def _skip_message(sender: str, message: str) -> bool:
    return (not sender or not message) or bool(SYSTEM_SKIP.search(message))


def analyze_message(sender: str, message: str) -> Dict[str, Any]:
    """Score one message with text + embedded URL detectors.

    PII is redacted first (Privacy Shield) so personal data never reaches the
    detector or model pipelines.
    """
    red = redact_pii(message)
    clean_message = red["redacted_text"]
    text_result = detect_text(clean_message)
    urls = re.findall(r"https?://[^\s<>'\"]+|www\.[^\s<>'\"]+", clean_message)
    url_results = [detect_url(u) for u in urls[:5]]

    score = float(text_result.get("score", 0))
    threats = list(text_result.get("threats", []))
    reasons: List[str] = []
    for d in text_result.get("detectors", []):
        if d.get("status") == "flagged" and d.get("detail"):
            reasons.append(str(d["detail"]))
    for u, r in zip(urls[:5], url_results):
        if float(r.get("score", 0)) > score:
            score = float(r["score"])
        for d in r.get("detectors", []):
            if d.get("status") == "flagged" and d.get("detail") and str(d["detail"]) not in reasons:
                reasons.append(str(d["detail"]))
        for t in r.get("threats", []):
            if t not in threats:
                threats.append(t)

    return {
        "sender": sender,
        "message": message,
        "urls": urls[:5],
        "risk_score": round(score, 1),
        "risk_level": risk_label(score),
        "threats": threats,
        "reasons": reasons[:8],
        "privacy": red["found"],
        "explanation": plain_language({"score": score, "threats": threats, "detectors": [{"status": "flagged", "detail": r} for r in reasons]}),
    }


def analyze_export(text: str) -> Dict[str, Any]:
    records = parse_export(text)
    results = [analyze_message(r["sender"], r["message"]) for r in records if not _skip_message(r["sender"], r["message"])]
    results = results[:MAX_MESSAGES]
    flagged = [r for r in results if r["risk_score"] >= 30]
    return {
        "total_messages": len(records),
        "analyzed": len(results),
        "flagged": len(flagged),
        "max_risk": round(max((r["risk_score"] for r in results), default=0), 1),
        "messages": results,
    }


# --------------------------------------------------------------------------- #
# WhatsApp Business Cloud API (optional)
# --------------------------------------------------------------------------- #
def whatsapp_enabled() -> bool:
    return bool(
        os.getenv("WHATSAPP_VERIFY_TOKEN")
        and os.getenv("WHATSAPP_ACCESS_TOKEN")
        and os.getenv("WHATSAPP_PHONE_NUMBER_ID")
    )


def verify_webhook_token(token: str) -> bool:
    expected = os.getenv("WHATSAPP_VERIFY_TOKEN", "")
    return bool(expected) and token == expected


async def handle_webhook(payload: Dict[str, Any]) -> Dict[str, Any]:
    """Extract inbound messages, analyze them, and reply via the Graph API."""
    if not whatsapp_enabled():
        return {"received": 0, "replied": 0, "error": "WhatsApp API not configured"}
    replied = 0
    received = 0
    for entry in payload.get("entry", []):
        for change in entry.get("changes", []):
            value = change.get("value", {})
            for msg in value.get("messages", []):
                received += 1
                text = (msg.get("text") or {}).get("body", "")
                from_number = msg.get("from")
                if not text or not from_number:
                    continue
                analysis = analyze_message(from_number, text)
                body = f"VeriFin Alert: {analysis['explanation']}"
                if await _send_reply(from_number, body):
                    replied += 1
    return {"received": received, "replied": replied}


async def _send_reply(to_number: str, body: str) -> bool:
    import httpx

    access_token = os.getenv("WHATSAPP_ACCESS_TOKEN", "")
    phone_number_id = os.getenv("WHATSAPP_PHONE_NUMBER_ID", "")
    url = f"https://graph.facebook.com/v19.0/{phone_number_id}/messages"
    try:
        async with httpx.AsyncClient(timeout=12) as client:
            r = await client.post(
                url,
                headers={"Authorization": f"Bearer {access_token}"},
                json={
                    "messaging_product": "whatsapp",
                    "to": to_number,
                    "type": "text",
                    "text": {"body": body[:4000]},
                },
            )
            if r.status_code != 200:
                logger.error("whatsapp reply failed (%s): %s", r.status_code, r.text[:300])
                return False
            return True
    except Exception as exc:  # noqa: BLE001
        logger.error("whatsapp reply error: %s", exc)
        return False