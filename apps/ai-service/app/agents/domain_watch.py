"""DomainWatch agent: hunts newly-registered look-alike domains impersonating
SEBI / RBI / exchanges / brokers / listed companies, using CT logs, phishing
feeds, RDAP whois and a deterministic offline demo feed."""

from __future__ import annotations

import asyncio
from datetime import datetime, timezone
from typing import List, Optional

from app.agents import config, sources
from app.agents.base import Agent, ThreatFinding
from app.rules import manager

_concurrency = asyncio.Semaphore(5)


async def _limit(coro):
    async with _concurrency:
        return await coro


class DomainWatchAgent(Agent):
    name = "domain-watch"
    description = "Crawls certificate transparency, phishing feeds and RDAP for look-alike domains."

    # Deterministic demo domains: always flagged regardless of live RDAP age.
    _DEMO_DOMAINS = {
        "sebi-gov.in", "sebigov.in", "sebi.giv.in", "nseindai.com",
        "zerodhna.com", "growww.in", "upstoxx.com",
    }

    async def run(self, ctx) -> List[ThreatFinding]:
        brands = manager.get_brands()
        all_brand_domains = [d for b in brands for d in (b.get("domains") or [])]
        brand_by_domain = {d.lower(): b for b in brands for d in (b.get("domains") or [])}

        candidates: set = set()
        # 1) CT-log look-alikes of each official domain (bounded by concurrency).
        ct_results = await asyncio.gather(*[_limit(sources.fetch_ct_domains(d)) for d in all_brand_domains])
        for doms in ct_results:
            candidates.update(doms)
        # 2) domains seen in the live phishing feed.
        for url in await _limit(sources.fetch_openphish_feed()):
            candidates.add(sources.extract_domain(url))
        # 3) deterministic demo feed (works offline / without external keys).
        if config.AGENT_DEMO:
            for url in sources.demo_phishing_urls():
                candidates.add(sources.extract_domain(url))
            candidates.update(["sebi-gov.in", "sebigov.in", "sebi.giv.in", "nseindai.com", "zerodhna.com", "growww.in", "upstoxx.com"])

        now = datetime.now(timezone.utc)
        findings: List[ThreatFinding] = []
        seen: set = set()

        # Pre-filter candidates that resemble a protected brand before the (slow) RDAP calls.
        suspects = []
        for domain in candidates:
            domain = (domain or "").strip().lower()
            if not domain or domain in seen:
                continue
            seen.add(domain)
            matched = self._match(domain, all_brand_domains)
            if matched:
                suspects.append((domain, *matched))
        suspects = suspects[:40]

        reg_dates = await asyncio.gather(*[_limit(sources.fetch_registration_date(d)) for d, _, _ in suspects])

        for (domain, brand_domain, dist), reg_date in zip(suspects, reg_dates):
            brand = brand_by_domain.get(brand_domain, {})
            brand_name = (brand.get("name") or brand_domain.title()).title()
            regulator = "RBI" if "rbi" in brand_domain.lower() else "SEBI"

            age_days = None
            if domain not in self._DEMO_DOMAINS and reg_date:
                age_days = (now - reg_date).days
                if age_days > config.MAX_REGISTRATION_AGE_DAYS:
                    continue

            severity = "CRITICAL" if (dist <= 1 and (age_days is None or age_days <= 30)) else "HIGH"

            # Persist to detection rules so URL detection starts flagging it immediately.
            manager.add_lookalike(domain)

            age_txt = "unknown" if age_days is None else f"{age_days} day(s)"
            findings.append(ThreatFinding(
                title=f"Look-alike domain impersonating {brand_name}",
                description=(
                    f"Threat-hunter agent '{self.name}' flagged domain '{domain}' (edit distance {dist}) "
                    f"as a close match to official site '{brand_domain}'. Registration age: {age_txt}. "
                    f"Added to auto-updated detection rules."
                ),
                type="IMPERSONATION",
                severity=severity,
                indicators={"domains": [domain], "urls": [f"http://{domain}"], "patterns": [f"{brand_name} impersonation"]},
                source="domain-watch",
                sourceUrl=f"https://rdap.org/domain/{domain}",
                confidence=max(0.5, 1.0 - dist * 0.25),
                agent=self.name,
                regulator=regulator,
            ))
        return findings

    @staticmethod
    def _match(domain: str, candidates: list[str]) -> Optional[tuple]:
        best = None
        for cand in candidates:
            if sources.resembles(domain, cand):
                dist = sources.levenshtein(domain, cand)
                if best is None or dist < best[1]:
                    best = (cand, dist)
        return best