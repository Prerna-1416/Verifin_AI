"""Orchestrates the autonomous threat-hunting agents."""

from __future__ import annotations

import asyncio
import logging
import time
from typing import List

from app.agents import publisher
from app.agents.base import Agent, ThreatFinding
from app.agents.domain_watch import DomainWatchAgent
from app.agents.social_monitor import SocialMonitorAgent
from app.rules import manager

logger = logging.getLogger("verifin.agents")

AGENTS: List[Agent] = [DomainWatchAgent(), SocialMonitorAgent()]

_last_run = 0.0
_last_summary: dict = {}


async def run_agents_once(trigger: str = "manual") -> dict:
    """Run every agent, deduplicate, publish, and auto-update detection rules."""
    global _last_run, _last_summary

    findings: List[ThreatFinding] = []
    for agent in AGENTS:
        try:
            findings.extend(await agent.run({}))
        except Exception as exc:  # noqa: BLE001
            logger.error("agent %s failed: %s", agent.name, exc)

    # Deduplicate across agents.
    seen: set = set()
    unique: List[ThreatFinding] = []
    for f in findings:
        key = f.dedup_key()
        if key in seen:
            continue
        seen.add(key)
        unique.append(f)

    # Rules are updated in-place by agents; book-keeping only.
    updated_rules_at = manager.rules_updated_at()

    # Publish to web (persists ThreatFeed + RegulatorAlerts).
    result = await publisher.publish(unique)

    _last_run = time.time()
    _last_summary = {
        "last_run": _last_run,
        "trigger": trigger,
        "raw_findings": len(findings),
        "published": len(unique),
        "publish": result,
        "rules_updated_at": updated_rules_at,
    }
    logger.info("agent run complete: %s", _last_summary)
    return _last_summary


def last_status() -> dict:
    return {
        "enabled": _enabled(),
        "agents": [{"name": a.name, "description": a.description} for a in AGENTS],
        "last_run": _last_run,
        "summary": _last_summary,
        "rules_updated_at": manager.rules_updated_at(),
    }


def _enabled() -> bool:
    from app.agents import config
    return config.AGENT_ENABLED


async def background_loop():
    """Continuously run agents on an interval (autonomous mode)."""
    from app.agents import config

    while True:
        try:
            await run_agents_once(trigger="scheduled")
        except Exception as exc:  # noqa: BLE001
            logger.error("scheduled agent run error: %s", exc)
        await asyncio.sleep(config.AGENT_INTERVAL_SECONDS)