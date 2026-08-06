"""Text detector: phishing keywords, urgency patterns, and ML classifier."""

import re
from typing import Any, Dict, List


URGENCY_PHRASES = [
    "urgent", "immediately", "act now", "within 24 hours", "limited time",
    "expires soon", "your account will be suspended", "final notice",
    "last chance", "act immediately", "do not delay", "right now",
    "as soon as possible", "asap", "immediate action required",
]

SUSPICIOUS_PHRASES = [
    "verify your account", "update your details", "confirm your password",
    "click here to verify", "unusual activity", "locked account",
    "security alert", "winning prize", "you have won", "lottery",
    "guaranteed returns", "risk free", "double your money", "get rich quick",
    "investment opportunity", "high returns", "no risk", "money back guarantee",
    "claim your reward", "wire transfer", "send money", "bitcoin", "crypto",
]

FINANCIAL_KEYWORDS = [
    "sebi", "rbi", "nsdl", "cdsl", "demat", "pan card", "aadhaar", "otp",
    "bank account", "trading account", "mutual fund", "stock", "broker",
    "dividend", "nav", "kyc", "folio", "trading", "shares", "portfolio",
]

PERSONAL_INFO_REQUEST = [
    "provide your", "share your", "enter your", "send your",
    "your pan", "your aadhaar", "your otp", "your password", "your pin",
    "your cvv", "your bank details", "your card number",
]

SUSPICIOUS_SENDERS = [
    "no-reply", "helpdesk", "accounts@", "security@", "alert@", "billing@",
    "verify@", "support@", "service@", "info@", "admin@", "customer@",
]

# Sample of common scam keyword indicators
SCAM_INDICATORS = [
    "free money", "no cost", "earn from home", "passive income",
    "referral bonus", "signup bonus", "trading signals", "guaranteed profit",
    "secret formula", "insider tip", "sure shot", "100% return",
]

KNOWN_BRANDS = [
    "paypal", "netflix", "amazon", "apple", "google", "microsoft",
    "whatsapp", "instagram", "facebook", "linkedin", "ebay",
    "hdfc", "icici", "sbi", "axis", "kotak", "yesbank", "pnb",
    "sebi", "rbi", "nse", "bse", "nsdl", "cdsl",
    "zerodha", "groww", "coinbase", "binance",
    "bankofamerica", "chase", "citibank", "hsbc",
]


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


def analyze_brand_impersonation(text: str) -> Dict[str, Any]:
    """Flag misspelled brand names (typo-squatting) in the message text."""
    lower = text.lower()
    tokens = re.findall(r"[a-z][a-z0-9]{2,}", lower)
    matches = []
    seen = set()
    for token in tokens:
        if token in KNOWN_BRANDS:
            continue
        best_brand = None
        best_distance = 99
        for brand in KNOWN_BRANDS:
            distance = _levenshtein(token, brand)
            if distance < best_distance:
                best_distance = distance
                best_brand = brand
        min_len = 4 if best_distance == 1 else 5
        if best_brand and best_distance <= 2 and len(token) >= min_len:
            key = (token, best_brand)
            if key not in seen:
                seen.add(key)
                matches.append({"word": token, "brand": best_brand, "distance": best_distance})
    return {
        "score": min(40, len(matches) * 15),
        "matches": matches[:6],
        "count": len(matches),
    }


def analyze_urgency(text: str) -> Dict[str, Any]:
    lower = text.lower()
    found = [p for p in URGENCY_PHRASES if p in lower]
    return {
        "score": min(40, len(found) * 10),
        "found": found,
        "count": len(found),
    }


def analyze_suspicious(text: str) -> Dict[str, Any]:
    lower = text.lower()
    found = [p for p in SUSPICIOUS_PHRASES if p in lower]
    return {
        "score": min(40, len(found) * 6),
        "found": found,
        "count": len(found),
    }


def analyze_financial_context(text: str) -> Dict[str, Any]:
    lower = text.lower()
    found = [p for p in FINANCIAL_KEYWORDS if p in lower]
    return {
        "score": min(20, len(found) * 2),
        "found": found,
        "count": len(found),
    }


def analyze_personal_info_requests(text: str) -> Dict[str, Any]:
    lower = text.lower()
    found = [p for p in PERSONAL_INFO_REQUEST if p in lower]
    return {
        "score": min(50, len(found) * 10),
        "found": found,
        "count": len(found),
    }


def analyze_links(text: str) -> Dict[str, Any]:
    urls = re.findall(r"https?://[^\s<>'\"]+|www\.[^\s<>'\"]+", text)
    suspicious = 0
    for url in urls:
        if "bit.ly" in url or "tinyurl" in url or "shorturl" in url:
            suspicious += 1
        if re.search(r"\d{2,}\.\d{1,3}\.\d{1,3}\.\d{1,3}", url):
            suspicious += 1
    return {
        "score": min(30, suspicious * 10),
        "urls_found": len(urls),
        "suspicious_count": suspicious,
    }


def analyze_sender(text: str) -> Dict[str, Any]:
    """Look for sender headers / claims of impersonation."""
    lower = text.lower()
    found = []
    for s in SUSPICIOUS_SENDERS:
        if s in lower:
            found.append(s)
    claimed_official = any(k in lower for k in ["sebi", "rbi", "bank", "broker", "exchange"])
    return {
        "score": min(30, len(found) * 6),
        "found": found,
        "claims_official_identity": claimed_official,
    }


def detect_text(text: str) -> Dict[str, Any]:
    """Run all text heuristic detectors and return combined result."""
    urgency = analyze_urgency(text)
    suspicious = analyze_suspicious(text)
    financial = analyze_financial_context(text)
    personal_info = analyze_personal_info_requests(text)
    links = analyze_links(text)
    sender = analyze_sender(text)
    brand = analyze_brand_impersonation(text)

    # Weighted aggregation
    raw_score = (
        urgency["score"] * 0.2
        + suspicious["score"] * 0.2
        + personal_info["score"] * 0.3
        + links["score"] * 0.1
        + sender["score"] * 0.1
        + brand["score"] * 0.1
    )
    score = min(100, round(raw_score, 1))
    if brand["count"] > 0 and score < 35:
        score = 35.0

    threats = []
    if personal_info["count"] > 0:
        threats.append("Sensitive Information Request")
    if urgency["count"] > 0:
        threats.append("Urgency Manipulation")
    if suspicious["count"] > 0:
        threats.append("Suspicious Content Patterns")
    if links["suspicious_count"] > 0:
        threats.append("Suspicious Links")
    if brand["count"] > 0:
        threats.append("Brand Impersonation")

    detectors = [
        {"name": "Phishing Pattern Analysis", "status": "flagged" if suspicious["count"] > 0 else "passed", "detail": f"{suspicious['count']} suspicious patterns found" if suspicious["count"] > 0 else "No suspicious patterns found"},
        {"name": "Urgency Detection", "status": "flagged" if urgency["count"] > 0 else "passed", "detail": f"{urgency['count']} urgency triggers detected" if urgency["count"] > 0 else "No urgency triggers"},
        {"name": "Personal Information Requests", "status": "flagged" if personal_info["count"] > 0 else "passed", "detail": f"{personal_info['count']} personal data requests detected" if personal_info["count"] > 0 else "No personal data requests"},
        {"name": "Sender Identity Analysis", "status": "flagged" if sender["found"] else "passed", "detail": f"Sender patterns: {', '.join(sender['found'])}" if sender["found"] else "No suspicious sender patterns"},
        {"name": "Brand Impersonation Check", "status": "flagged" if brand["count"] > 0 else "passed", "detail": ", ".join(f"{m['word']} looks like {m['brand']}" for m in brand["matches"][:3]) if brand["matches"] else "No brand impersonation detected"},
    ]

    explanations = {
        "feature_importance": {
            "urgency": urgency["score"],
            "suspicious": suspicious["score"],
            "personal_info": personal_info["score"],
            "links": links["score"],
            "sender": sender["score"],
            "brand_impersonation": brand["score"],
        },
        "rule_traces": [
            f"Detected {urgency['count']} urgency phrases",
            f"Detected {suspicious['count']} suspicious phrases",
            f"Detected {personal_info['count']} personal info requests",
        ],
    }

    return {
        "score": score,
        "detectors": detectors,
        "threats": threats,
        "explanations": explanations,
    }
