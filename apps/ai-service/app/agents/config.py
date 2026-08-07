"""Agent framework configuration (environment-driven with sane defaults)."""

from __future__ import annotations

import os


def _bool(name: str, default: bool) -> bool:
    v = os.getenv(name)
    if v is None:
        return default
    return v.strip().lower() in ("1", "true", "yes", "on")


# Where the web app (Next.js) lives. The agents publish findings to it.
WEB_URL = os.getenv("WEB_URL", "http://localhost:3000")
# Shared secret the web app accepts in the X-Agent-Key header on /api/internal/agents/publish.
AGENT_INTERNAL_KEY = os.getenv("AGENT_INTERNAL_KEY", "verifin-agent-internal-key")

# Autonomy controls.
AGENT_ENABLED = _bool("AGENT_ENABLED", True)
AGENT_INTERVAL_SECONDS = int(os.getenv("AGENT_INTERVAL_SECONDS", "600"))
# Seed a deterministic demo feed so the agents always produce results even fully offline.
AGENT_DEMO = _bool("AGENT_DEMO", True)
# Timeout (seconds) for outbound OSINT requests.
FETCH_TIMEOUT_SECONDS = float(os.getenv("AGENT_FETCH_TIMEOUT", "4"))
# Only flag look-alike domains registered within this many days.
MAX_REGISTRATION_AGE_DAYS = int(os.getenv("AGENT_MAX_REG_AGE_DAYS", "90"))