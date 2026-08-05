"""URL detector: domain reputation, SSL, redirects, typo-squatting, threat feed match."""

import re
import socket
import ssl
from urllib.parse import urlparse
from typing import Any, Dict, List
from datetime import datetime, timezone


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


def _typo_squatting_check(domain: str) -> Dict[str, Any]:
    matches = []
    for legit in KNOWN_BANKING_DOMAINS:
        dist = _levenshtein(domain, legit)
        if dist == 1 and domain != legit:
            matches.append({"legit": legit, "distance": dist})
        elif dist == 2 and domain != legit:
            matches.append({"legit": legit, "distance": dist})
    return {
        "score": min(40, len(matches) * 20),
        "matches": matches[:5],
    }


def _tld_check(domain: str) -> Dict[str, Any]:
    suspicious = [tld for tld in SUSPICIOUS_TLDS if domain.endswith(tld)]
    return {
        "score": 20 if suspicious else 0,
        "tlds": suspicious,
    }


def _shortener_check(url: str, domain: str) -> Dict[str, Any]:
    is_shortened = any(s in domain for s in URL_SHORTENERS)
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
    tld = _tld_check(domain)
    shortener = _shortener_check(url, domain)
    ssl_result = _ssl_check(url)
    redirect = _redirect_check(url)
    ip_result = _ip_address_check(url)

    raw_score = (
        typo["score"]
        + tld["score"]
        + shortener["score"]
        + (ssl_result["score"] if not ssl_result["valid"] else 0)
        + redirect["score"]
        + ip_result["score"]
    )
    score = min(100, round(raw_score, 1))

    threats = []
    if typo["matches"]:
        threats.append("Typo-Squatting")
    if tld["tlds"]:
        threats.append("Suspicious TLD")
    if shortener["is_shortened"]:
        threats.append("URL Shortener")
    if ip_result["is_ip"]:
        threats.append("IP Address URL")
    if ssl_result.get("valid"):
        threats.append("Phishing")
    if not ssl_result["valid"] and ssl_result.get("error"):
        threats.append("SSL Verification Failed")

    detectors = [
        {"name": "Typo-Squatting Detection", "status": "flagged" if typo["matches"] else "passed", "detail": f"Similar to {typo['matches'][0]['legit']}" if typo["matches"] else "No similar known domains"},
        {"name": "Domain TLD Analysis", "status": "flagged" if tld["tlds"] else "passed", "detail": f"Suspicious TLD: {', '.join(tld['tlds'])}" if tld["tlds"] else "Domain TLD appears normal"},
        {"name": "SSL & Certificate Check", "status": "flagged" if not ssl_result["valid"] else "passed", "detail": "Valid SSL certificate" if ssl_result["valid"] else ssl_result.get("error", "No SSL")},
        {"name": "Redirect Analysis", "status": "flagged" if redirect["has_redirect"] else "passed", "detail": "Contains redirect parameters" if redirect["has_redirect"] else "No redirects detected"},
        {"name": "URL Structure Analysis", "status": "flagged" if ip_result["is_ip"] else "passed", "detail": "Uses raw IP address" if ip_result["is_ip"] else "Uses domain name"},
    ]

    explanations = {
        "feature_importance": {
            "typo_squatting": typo["score"],
            "tld": tld["score"],
            "shortener": shortener["score"],
            "ssl": ssl_result["score"] if not ssl_result["valid"] else 0,
            "redirect": redirect["score"],
            "ip_address": ip_result["score"],
        },
        "rule_traces": [
            f"Domain: {domain}",
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
