"""Text detector: phishing keywords, urgency patterns, and ML classifier."""

import re
from typing import Any, Dict, List

try:  # auto-updating rules (agents) can add protected brands to detect
    from app.rules import manager as rules_manager
except Exception:  # pragma: no cover
    rules_manager = None


URGENCY_PHRASES = [
    "urgent", "immediately", "act now", "within 24 hours", "limited time",
    "expires soon", "your account will be suspended", "final notice",
    "last chance", "act immediately", "do not delay", "right now",
    "as soon as possible", "asap", "immediate action required",
]

SUSPICIOUS_PHRASES = [
    "verify your account", "update your details", "confirm your password",
    "click here to verify", "unusual activity", "locked account",
    "security alert", "winning prize", "you have won", "you have been selected",
    "you won", "you've won", "congratulations", "lucky draw", "lottery",
    "claim your prize", "claim your reward", "claim your cashback", "claim your wallet",
    "processing fee", "release fee", "activation fee", "registration fee",
    "handling fee", "small fee", "nominal fee", "verification fee",
    "guaranteed returns", "risk free", "double your money", "get rich quick",
    "investment opportunity", "high returns", "no risk", "money back guarantee",
    "claim your reward", "wire transfer", "send money", "bitcoin", "crypto",
    "won a prize", "winner", "cash prize", "gift voucher", "coupon code free",
    "upfront amount", "security deposit", "advance payment", "pay to release",
    "pay a small", "pay the fee", "pay now to", "fee to claim", "fee to release",
]

# Combinations that scream "advance-fee / prize scam" — strong standalone signal.
SCAM_COMBOS = [
    (("won", "lucky", "prize", "winner", "lottery", "draw"), ("fee", "pay", "deposit", "charge", "advance", "percentage", "tax", "processing")),
    (("inherit", "inheritance", "refund", "reimbursement", "dividend", "compensation"), ("fee", "pay", "deposit", "charge", "tax", "insurance", "processing")),
    (("loan", "credit card", "sanctioned"), ("processing fee", "advance", "security deposit")),
]

# Phrases real institutions use to tell you to PROTECT your data. Their presence
# indicates the sender is trying to keep you safe (a genuine security message),
# so we dampen the risk score instead of crying wolf.
SECURITY_REASSURANCE_PHRASES = [
    "do not share", "don't share", "never share", "do not disclose",
    "never disclose", "do not reveal", "never reveal", "keep it confidential",
    "we will never ask", "we never ask", "will not ask", "no one from",
    "never call you asking", "if this was not you", "if not you", "ignor",
    "ignore if not requested", "did you request this", "we only call from",
    "bank will never ask", "do not click", "we will never contact", "don't respond",
    "not a request", "you can safely ignore", "for your information only",
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


def _all_brands() -> List[str]:
    """Static brands + any added by the threat-hunter (names/aliases only)."""
    brands = list(KNOWN_BRANDS)
    if rules_manager is not None:
        brands.extend(rules_manager.brand_aliases())
        for b in rules_manager.get_brands():
            name = b.get("name")
            if name:
                brands.append(name.lower())
    return list(dict.fromkeys(b for b in brands if b))


# Words commonly used in financial messages that are edit-distance-close to brands
# (e.g. "balance" ~ "binance"). Never treat these as impersonation.
COMMON_WORDS_SKIP = {
    "balance", "account", "banking", "security", "service", "support",
    "payment", "transfer", "statement", "customer", "investor", "brokerage",
    "trading", "deposit", "withdraw", "manager", "advisor", "broker", "income",
    "return", "returns", "profit", "amount", "mobile", "email", "password",
    "message", "message", "attention", "important", "official", "limited",
    "finance", "financial", "investment", "portfolio", "demat", "company",
    "compliance", "transaction", "transactions", "registered", "activation",
}


def analyze_brand_impersonation(text: str) -> Dict[str, Any]:
    """Flag misspelled brand names (typo-squatting) in the message text."""
    brands = _all_brands()
    lower = text.lower()
    tokens = re.findall(r"[a-z][a-z0-9]{2,}", lower)
    matches = []
    seen = set()
    for token in tokens:
        if token in brands or token in COMMON_WORDS_SKIP:
            continue
        best_brand = None
        best_distance = 99
        for brand in brands:
            distance = _levenshtein(token, brand)
            if distance < best_distance:
                best_distance = distance
                best_brand = brand
        min_len = 4 if best_distance == 1 else 5
        # Distance-2 matches must be long AND share the first character —
        # otherwise common words (e.g. "balance" vs "binance") cause false alarms.
        if best_brand and best_distance <= 2 and len(token) >= min_len:
            if best_distance == 2 and (len(token) < 6 or token[0] != best_brand[0]):
                continue
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


def analyze_scam_combos(text: str) -> Dict[str, Any]:
    """Detect classic advance-fee / prize scams: a reward word + a fee/payment word."""
    lower = text.lower()
    matches = []
    for reward_terms, fee_terms in SCAM_COMBOS:
        hit_reward = [t for t in reward_terms if t in lower]
        hit_fee = [t for t in fee_terms if t in lower]
        if hit_reward and hit_fee:
            matches.append({"reward": hit_reward, "fee": hit_fee})
    return {
        "score": min(60, len(matches) * 30),
        "matches": matches[:3],
        "count": len(matches),
    }


def analyze_security_reassurance(text: str) -> Dict[str, Any]:
    """Detect genuine 'protect your data' language. Dampens the risk score."""
    lower = text.lower()
    found = [p for p in SECURITY_REASSURANCE_PHRASES if p in lower]
    return {
        "found": found,
        "count": len(found),
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
    combos = analyze_scam_combos(text)
    reassurance = analyze_security_reassurance(text)

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
    # A confirmed reward+fee combo is a strong scam signal on its own.
    if combos["count"] > 0 and score < combos["score"]:
        score = combos["score"]

    # Legitimate-security dampening: "do not share your OTP" is a REAL security
    # message, not phishing. Reduce the score so we don't cry wolf.
    if reassurance["count"] > 0:
        score = round(score * 0.4, 1)
    if score < 0:
        score = 0

    threats = []
    if combos["count"] > 0:
        threats.append("Advance-Fee / Prize Scam")
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
        {"name": "Phishing Pattern Analysis", "status": "flagged" if suspicious["count"] > 0 or combos["count"] > 0 else "passed", "detail": f"Advance-fee/prize scam pattern: {combos['matches'][0]['reward'][0] if combos['matches'] else ''} + {combos['matches'][0]['fee'][0] if combos['matches'] else ''}" if combos["count"] > 0 else (f"{suspicious['count']} suspicious patterns found" if suspicious["count"] > 0 else "No suspicious patterns found")},
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
            "advance_fee_scam": combos["score"],
        },
        "rule_traces": [
            f"Detected {urgency['count']} urgency phrases",
            f"Detected {suspicious['count']} suspicious phrases",
            f"Detected {personal_info['count']} personal info requests",
            f"Detected {combos['count']} advance-fee/prize scam combos",
        ],
    }

    return {
        "score": score,
        "detectors": detectors,
        "threats": threats,
        "explanations": explanations,
        "reassurance": reassurance,
    }
