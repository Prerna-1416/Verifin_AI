"""OSINT sources: phishing feeds, certificate-transparency logs, RDAP whois.

Every fetcher degrades gracefully: on network error or timeout it falls back to a
deterministic demo set so the agents remain functional (and testable) offline.
"""

from __future__ import annotations

import asyncio
import json
import re
from datetime import datetime, timedelta, timezone
from typing import List, Optional
from urllib.parse import urlparse

import httpx

from app.agents import config

_client: Optional[httpx.AsyncClient] = None


def _get_client() -> httpx.AsyncClient:
    global _client
    if _client is None:
        _client = httpx.AsyncClient(
            timeout=config.FETCH_TIMEOUT_SECONDS,
            follow_redirects=True,
            verify=False,  # crt.sh's cert chain is sometimes incomplete
        )
    return _client


async def _close_client() -> None:
    global _client
    if _client is not None:
        await _client.aclose()
        _client = None


# --------------------------------------------------------------------------- #
# Domain / URL helpers
# --------------------------------------------------------------------------- #
def extract_domain(value: str) -> str:
    value = value.strip()
    if not value:
        return ""
    parsed = urlparse(value if "://" in value else f"https://{value}")
    host = parsed.netloc.split("@")[-1].split(":")[0].lower()
    host = host.replace("www.", "")
    return host


def levenshtein(a: str, b: str) -> int:
    if len(a) < len(b):
        a, b = b, a
    if not b:
        return len(a)
    prev = list(range(len(b) + 1))
    for i, ca in enumerate(a):
        cur = [i + 1]
        for j, cb in enumerate(b):
            cur.append(min(prev[j + 1] + 1, cur[j] + 1, prev[j] + (ca != cb)))
        prev = cur
    return prev[-1]


def resembles(domain: str, candidate: str, max_dist: int = 2) -> bool:
    """True if ``domain`` is a plausible look-alike of ``candidate``."""
    a, b = domain.lower(), candidate.lower()
    if a == b or a == f"www.{b}" or b == f"www.{a}":
        return False
    if a.endswith(b) or b.endswith(a):
        # Sub-domains of a legit domain are not look-alikes by themselves.
        return len(a) != len(b) and (a.endswith("." + b) or b.endswith("." + a)) is False
    if levenshtein(a, b) <= max_dist:
        return True
    # dot-swap e.g. sebi.gov.in vs sebi.in
    base_a = a.split(".")[0]
    base_b = b.split(".")[0]
    return base_a == base_b and a != b and levenshtein(a, b) <= max_dist + 1


# --------------------------------------------------------------------------- #
# Feed sources
# --------------------------------------------------------------------------- #
async def fetch_openphish_feed() -> list[str]:
    """Latest phishing URLs from OpenPhish (no API key required)."""
    try:
        r = await asyncio.wait_for(_get_client().get("https://openphish.com/feed.txt"), timeout=config.FETCH_TIMEOUT_SECONDS)
        if r.status_code == 200:
            lines = [l.strip() for l in r.text.splitlines() if l.strip()]
            return [l for l in lines if l.startswith("http")][:300]
    except Exception:
        pass
    return []


async def fetch_ct_domains(label: str) -> list[str]:
    """Certificate transparency names for a label (e.g. `%sebi.gov.in`)."""
    query = f"%25.{label}" if "." in label else f"%25{label}"
    try:
        r = await asyncio.wait_for(_get_client().get(f"https://crt.sh/?q={query}&output=json"), timeout=config.FETCH_TIMEOUT_SECONDS)
        if r.status_code == 200:
            names: set = set()
            for row in r.json():
                for raw in (row.get("name_value") or "").split("\n"):
                    n = extract_domain(raw)
                    if n:
                        names.add(n)
            return list(names)[:300]
    except Exception:
        pass
    return []


async def fetch_registration_date(domain: str) -> Optional[datetime]:
    """Creation date of a domain via RDAP (None when unknown/unregistered)."""
    try:
        r = await asyncio.wait_for(_get_client().get(f"https://rdap.org/domain/{domain}"), timeout=config.FETCH_TIMEOUT_SECONDS)
        if r.status_code == 200:
            data = r.json()
            for ev in data.get("events", []):
                if ev.get("eventAction") == "registration":
                    return datetime.fromisoformat(ev.get("eventDate", "").replace("Z", "+00:00"))
        return None
    except Exception:
        return None


# --------------------------------------------------------------------------- #
# Deterministic demo fallback (offline)
# --------------------------------------------------------------------------- #
def demo_phishing_urls() -> list[str]:
    return [
        "http://sebi-gov.in/verify-pan",
        "https://nseindai.com/trading/login",
        "https://zerodhna.com/kite/profit",
        "https://growww.in/invest",
        "http://upstoxx.com/account",
        "https://sebigov.in/kyc",
        "http://sebi.giv.in/check",
        "http://paypall-support.com/login",
    ]


def demo_social_posts() -> list[str]:
    return [
        "URGENT: Your SEBI-linked demat is at risk, click nse-stocks.live now",
        "Confirmed INR 1,00,000 credit from your broker - confirm on zerodha-kite.top",
        "BSE admission offer, limited seats, pay registration via rbi-refunds.club",
        "Zerodha system upgrade (voice-cloned call) - verify at zerodha-kite.top to avoid logout",
    ]