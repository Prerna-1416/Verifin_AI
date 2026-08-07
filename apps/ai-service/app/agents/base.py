"""Agent base classes and the shared finding structure."""

from __future__ import annotations

from dataclasses import dataclass, field, asdict
from typing import Any, Dict, List, Optional


@dataclass
class ThreatFinding:
    """A structured threat surfaced by an agent and published to the web app."""

    title: str
    description: str
    type: str                       # ThreatType: PHISHING | MALWARE | SCAM | FRAUD | IMPERSONATION | DATA_LEAK | OTHER
    severity: str                   # RiskLevel: LOW | MEDIUM | HIGH | CRITICAL
    indicators: Dict[str, Any]      # {domains: [], urls: [], ips: [], hashes: [], patterns: []}
    source: str                     # agent name / feed used
    sourceUrl: str = ""
    confidence: float = 1.0
    agent: str = ""
    regulator: Optional[str] = None  # e.g. "SEBI" when impersonation targets a regulator

    def dedup_key(self) -> str:
        domains = sorted(self.indicators.get("domains") or [])
        urls = sorted(self.indicators.get("urls") or [])
        return f"{self.source}|{self.type}|{domains}|{urls}"

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


class Agent:
    """Base class for a threat-hunting agent."""

    name: str = "base"
    description: str = ""

    async def run(self, ctx: Dict[str, Any]) -> List[ThreatFinding]:  # noqa: D401
        raise NotImplementedError