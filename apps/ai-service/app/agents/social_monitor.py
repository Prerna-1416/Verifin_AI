"""SocialMonitor agent: watches public social/messaging content and reported
phishing links for emerging AI-powered financial scams and impersonation
campaigns targeting SEBI / NSE / BSE / brokers."""

from __future__ import annotations

import re
from typing import List

from app.agents import config, sources
from app.agents.base import Agent, ThreatFinding
from app.detectors.text_detector import detect_text
from app.detectors.url_detector import detect_url
from app.rules import manager

FINANCE_MARKERS = re.compile(r"\b(sebi|rbi|nse|bse|nsdl|cdsl|zerodha|groww|upstox|demat|kite|broker|trading|dividend|refund|pan|kyc|paytm|phonepe)\b", re.I)


class SocialMonitorAgent(Agent):
    name = "social-monitor"
    description = "Monitors public feeds/messages for AI-scam campaigns and reported phishing links."

    async def run(self, ctx) -> List[ThreatFinding]:
        messages: List[str] = list(ctx.get("messages", []))
        messages.extend(await self._collect())

        findings: List[ThreatFinding] = []
        for msg in messages:
            if not FINANCE_MARKERS.search(msg):
                continue
            # Score the raw message text.
            text_result = detect_text(msg)
            # Score any embedded URL too.
            urls = re.findall(r"https?://[^\s\"']+|www\.[^\s\"']+", msg)
            domain_hits = set()
            for u in urls:
                domain = sources.extract_domain(u)
                url_result = detect_url(u)
                domain_hits.add(domain)
                if domain and manager.is_known_lookalike(domain):
                    domain_hits.add(f"known:{domain}")

            combined = text_result.get("score", 0)
            if domain_hits:
                combined = max(combined, 70)

            if combined < 55:
                continue

            severity = "CRITICAL" if combined >= 80 else ("HIGH" if combined >= 60 else "MEDIUM")
            domain_list = [d.replace("known:", "") for d in domain_hits if not d.startswith("known:")]
            indicators = {"urls": urls[:10], "domains": domain_list[:10], "patterns": ["AI-scam campaign"]}
            if domain_list:
                indicators["patterns"].append("links to known look-alike domain")

            regulator = None
            if re.search(r"\b(sebi|nse|bse|nsdl|cdsl)\b", msg, re.I):
                regulator = "SEBI"
            elif re.search(r"\brbi\b", msg, re.I):
                regulator = "RBI"

            findings.append(ThreatFinding(
                title="Suspected AI-powered financial scam in social/messaging content",
                description=f"Social-monitor flagged a message scoring {combined:.0f}/100: {msg[:240]}",
                type="SCAM",
                severity=severity,
                indicators=indicators,
                source="social-monitor",
                sourceUrl=urls[0] if urls else "",
                confidence=min(0.99, combined / 100),
                agent=self.name,
                regulator=regulator,
            ))
        return findings

    async def _collect(self) -> List[str]:
        """Public messages: live phishing feed + deterministic demo feed."""
        messages: List[str] = []
        for url in await sources.fetch_openphish_feed():
            messages.append(f"reported phishing link: {url}")
        if config.AGENT_DEMO:
            messages.extend(sources.demo_social_posts())
        return messages