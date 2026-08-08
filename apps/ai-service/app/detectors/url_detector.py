"""URL detector: domain reputation, SSL, redirects, typo-squatting, threat feed match."""

import re
import socket
import ssl
from urllib.parse import urlparse
from typing import Any, Dict, List
from datetime import datetime, timezone

try:  # auto-updating rules (agents) extend the static bases below
    from app.rules import manager as rules_manager
except Exception:  # pragma: no cover - detector should still run standalone
    rules_manager = None


KNOWN_BANKING_DOMAINS = [
    "hdfcbank.com", "icicibank.com", "sbicard.com", "axisbank.com", "kotak.com",
    "hdfcsec.com", "icicidirect.com", "zerodha.com", "groww.in", "angelone.in",
    "sebi.gov.in", "nseindia.com", "bseindia.com", "rbi.org.in", "nsdl.co.in",
    "cdslindia.com", "paytm.com", "phonepe.com", "upi.org.in", "npscra.nsdl.co.in",
]

SUSPICIOUS_TLDS = [".xyz", ".top", ".club", ".work", ".gq", ".ml", ".tk", ".cf", ".click", ".zip", ".mov", ".info"]

URL_SHORTENERS = ["bit.ly", "tinyurl.com", "shorturl.at", "t.co", "goo.gl", "is.gd", "ow.ly", "rebrand.ly", "cutt.ly"]

REDIRECT_PATTERNS = ["redirect", "go.php", "url=", "click=", "out=", "l=", "r="]


def _extract_domain(url: str) -> str:
    parsed = urlparse(url if "://" in url else f"https://{url}")
    return parsed.netloc.lower().replace("www.", "")


def _levenshtein(a: str, b: str) -> int:
    """Compute edit distance between two strings."""
    if len(a) < len(b):
        a, b = b, a
    if not b:
        return len(a)
    previous_row = list(range(len(b) + 1))
    for i, ca in enumerate(a):
        current_row = [i + 1]
        for j, cb in enumerate(b):
            insertions = previous_row[j + 1] + 1
            deletions = current_row[j] + 1
            substitutions = previous_row[j] + (ca != cb)
            current_row.append(min(insertions, deletions, substitutions))
        previous_row = current_row
    return previous_row[-1]


def _all_known_domains() -> List[str]:
    """Static base domains + brands auto-maintained by the threat-hunter agents."""
    domains = list(KNOWN_BANKING_DOMAINS)
    if rules_manager is not None:
        domains.extend(rules_manager.brand_domains())
    return list(dict.fromkeys(d for d in domains if d))


def _typo_squatting_check(domain: str) -> Dict[str, Any]:
    """Detect look-alike domains, including compound ones like `paypall-support.com`.

    We compare the whole domain (catches `zerodhna.com`) AND each of its
    sub-domain tokens against each known brand (catches `paypall-support.com`,
    where `paypall` is a 1-edit variant of `paypal`).
    """
    matches = []
    tokens = [t for t in re.split(r"[.\-]", domain) if t]
    for legit in _all_known_domains():
        if domain == legit:
            continue
        if domain in KNOWN_BANKING_DOMAINS:
            continue
        dist = _levenshtein(domain, legit)
        if dist in (1, 2):
            matches.append({"legit": legit, "distance": dist})
            continue
        legit_brand = legit.split(".")[0]
        for token in tokens:
            if token == legit_brand:
                continue
            tdist = _levenshtein(token, legit_brand)
            if 0 < tdist <= 2:
                matches.append({"legit": legit, "distance": tdist})
                break
    return {
        "score": min(40, len(matches) * 20),
        "matches": matches[:5],
    }


def _known_lookalike_check(domain: str) -> Dict[str, Any]:
    """Flag domains the agents have already confirmed as malicious look-alikes."""
    known = False
    if rules_manager is not None:
        known = rules_manager.is_known_lookalike(domain)
    return {"score": 60 if known else 0, "known": known}


def _tld_check(domain: str) -> Dict[str, Any]:
    suspicious = [tld for tld in SUSPICIOUS_TLDS if domain.endswith(tld)]
    return {
        "score": 20 if suspicious else 0,
        "tlds": suspicious,
    }


def _shortener_check(url: str, domain: str) -> Dict[str, Any]:
    # Match the domain as a shortener host (exact or subdomain), never a
    # substring — `t.co` must not match `paypall-support.com`.
    is_shortened = any(domain == s or domain.endswith(f".{s}") for s in URL_SHORTENERS)
    return {
        "score": 25 if is_shortened else 0,
        "is_shortened": is_shortened,
    }


def _ssl_check(url: str) -> Dict[str, Any]:
    try:
        parsed = urlparse(url if "://" in url else f"https://{url}")
        hostname = parsed.netloc
        if ":" in hostname:
            hostname = hostname.split(":")[0]
        ctx = ssl.create_default_context()
        with socket.create_connection((hostname, 443), timeout=5) as sock:
            with ctx.wrap_socket(sock, server_hostname=hostname) as ssock:
                cert = ssock.getpeercert()
                return {
                    "score": 0,
                    "valid": True,
                    "issuer": dict(x[0] for x in cert.get("issuer", [])).get("organizationName", "Unknown"),
                    "expires": cert.get("notAfter"),
                }
    except Exception as e:
        return {
            "score": 25,
            "valid": False,
            "error": str(e)[:100],
        }


def _redirect_check(url: str) -> Dict[str, Any]:
    lower = url.lower()
    has_redirect = any(p in lower for p in REDIRECT_PATTERNS)
    return {
        "score": 20 if has_redirect else 0,
        "has_redirect": has_redirect,
    }


def _ip_address_check(url: str) -> Dict[str, Any]:
    ip_pattern = re.search(r"https?://(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})", url)
    return {
        "score": 30 if ip_pattern else 0,
        "is_ip": bool(ip_pattern),
    }


def detect_url(url: str) -> Dict[str, Any]:
    """Run all URL detectors and return combined result."""
    domain = _extract_domain(url)
    if not domain:
        return {"score": 50, "detectors": [], "threats": ["Invalid URL"], "explanations": {"rule_traces": ["Could not parse URL"]}}

    typo = _typo_squatting_check(domain)
    lookalike = _known_lookalike_check(domain)
    tld = _tld_check(domain)
    shortener = _shortener_check(url, domain)
    ssl_result = _ssl_check(url)
    redirect = _redirect_check(url)
    ip_result = _ip_address_check(url)

    raw_score = (
        typo["score"]
        + lookalike["score"]
        + tld["score"]
        + shortener["score"]
        + (ssl_result["score"] if not ssl_result["valid"] else 0)
        + redirect["score"]
        + ip_result["score"]
    )
    score = min(100, round(raw_score, 1))

    threats = []
    if lookalike["known"]:
        threats.append("Known Malicious Domain")
    if typo["matches"]:
        threats.append("Typo-Squatting")
    if tld["tlds"]:
        threats.append("Suspicious TLD")
    if shortener["is_shortened"]:
        threats.append("URL Shortener")
    if ip_result["is_ip"]:
        threats.append("IP Address URL")
    if not ssl_result["valid"]:
        threats.append("SSL Verification Failed")

    detectors = [
        {"name": "Threat Feed Match", "status": "flagged" if lookalike["known"] else "passed", "detail": "Domain confirmed as malicious look-alike by threat-hunter" if lookalike["known"] else "No known malicious match"},
        {"name": "Typo-Squatting Detection", "status": "flagged" if typo["matches"] else "passed", "detail": f"Similar to {typo['matches'][0]['legit']}" if typo["matches"] else "No similar known domains"},
        {"name": "Domain TLD Analysis", "status": "flagged" if tld["tlds"] else "passed", "detail": f"Suspicious TLD: {', '.join(tld['tlds'])}" if tld["tlds"] else "Domain TLD appears normal"},
        {"name": "SSL & Certificate Check", "status": "flagged" if not ssl_result["valid"] else "passed", "detail": "Valid SSL certificate" if ssl_result["valid"] else ssl_result.get("error", "No SSL")},
        {"name": "Redirect Analysis", "status": "flagged" if redirect["has_redirect"] else "passed", "detail": "Contains redirect parameters" if redirect["has_redirect"] else "No redirects detected"},
        {"name": "URL Structure Analysis", "status": "flagged" if ip_result["is_ip"] else "passed", "detail": "Uses raw IP address" if ip_result["is_ip"] else "Uses domain name"},
    ]

    explanations = {
        "feature_importance": {
            "known_lookalike": lookalike["score"],
            "typo_squatting": typo["score"],
            "tld": tld["score"],
            "shortener": shortener["score"],
            "ssl": ssl_result["score"] if not ssl_result["valid"] else 0,
            "redirect": redirect["score"],
            "ip_address": ip_result["score"],
        },
        "rule_traces": [
            f"Domain: {domain}",
            "Domain on agent-verified malicious list" if lookalike["known"] else "Not on known malicious list",
            f"Typo-squatting candidates: {', '.join(m['legit'] for m in typo['matches'])}" if typo["matches"] else "No typo-squatting detected",
        ],
    }

    return {
        "score": score,
        "domain": domain,
        "detectors": detectors,
        "threats": threats,
        "explanations": explanations,
    }
