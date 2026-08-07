"""Plain-language explanation builder.

Turns a structured detector result into an investor-friendly sentence such as:

    Risk Score: 91% — Known malicious look-alike domain; domain similar to sebi.gov.in;
    AI-powered scam indicators; invalid SSL certificate.

Used by the WhatsApp bot and the browser extension.
"""

from __future__ import annotations

from typing import Any, Dict


def risk_label(score: float) -> str:
    if score >= 80:
        return "Critical"
    if score >= 60:
        return "High"
    if score >= 30:
        return "Medium"
    return "Low"


def plain_language(result: Dict[str, Any]) -> str:
    """Compose a single human sentence from a detector result dict."""
    score = float(result.get("score", 0))
    threats: list = result.get("threats") or []
    detectors: list = result.get("detectors") or []

    phrases: list = []

    # Threat names -> plain wording.
    threat_plain = {
        "Known Malicious Domain": "domain is a known malicious look-alike",
        "Typo-Squatting": "domain is similar to a legitimate site (typo-squatting)",
        "Brand Impersonation": "brand impersonation detected",
        "Suspicious TLD": "unusual top-level domain",
        "URL Shortener": "uses a URL shortener",
        "SSL Verification Failed": "invalid SSL certificate",
        "IP Address URL": "uses a raw IP address",
        "Sensitive Information Request": "message asks for sensitive personal data",
        "Urgency Manipulation": "urgency/panic pressure tactics",
        "Suspicious Content Patterns": "known scam language patterns",
        "Suspicious Links": "message contains suspicious links",
        "Phishing": "possible phishing attempt",
    }
    for t in threats:
        phrases.append(threat_plain.get(t, t.lower()))

    # Flagged detector details (most specific signal).
    for d in detectors:
        if d.get("status") == "flagged" and d.get("detail"):
            detail = str(d["detail"])
            if detail and not any(detail == p for p in phrases):
                if len(phrases) < 4:
                    phrases.append(detail)

    if not phrases:
        return f"Risk Score: {score:.0f}% — No threats detected."

    joined = "; ".join(phrases[:4])
    return f"Risk Score: {score:.0f}% — {joined}."


def scan_summary(score: float, threats: list, reasons: list) -> str:
    """Same as plain_language but from web-adapted fields."""
    return plain_language(
        {"score": score, "threats": threats or [], "detectors": [{"status": "flagged", "detail": r} for r in (reasons or [])]}
    )