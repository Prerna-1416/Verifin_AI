"""Publishes agent findings to the web app (ThreatFeed + RegulatorAlerts)."""

from __future__ import annotations

import logging
from typing import List

import httpx

from app.agents import config
from app.agents.base import ThreatFinding

logger = logging.getLogger("verifin.agents.publisher")

PUBLISH_PATH = "/api/internal/agents/publish"


async def publish(findings: List[ThreatFinding]) -> dict:
    if not findings:
        return {"created": 0, "deduped": 0, "alerts": 0, "notified": 0}
    url = f"{config.WEB_URL}{PUBLISH_PATH}"
    payload = {
        "findings": [f.to_dict() for f in findings],
        "agent": findings[0].agent,
    }
    try:
        async with httpx.AsyncClient(timeout=15, verify=False) as client:
            r = await client.post(
                url,
                json=payload,
                headers={"X-Agent-Key": config.AGENT_INTERNAL_KEY, "Content-Type": "application/json"},
            )
            if r.status_code != 200:
                logger.error("publish failed (%s): %s", r.status_code, r.text[:300])
                return {"created": 0, "deduped": 0, "alerts": 0, "notified": 0, "error": r.text[:300]}
            return r.json().get("data", {})
    except Exception as exc:  # noqa: BLE001
        logger.error("publish error: %s", exc)
        return {"created": 0, "deduped": 0, "alerts": 0, "notified": 0, "error": str(exc)}