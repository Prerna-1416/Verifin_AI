from urllib.parse import urlparse

SUSPICIOUS_KEYWORDS = [
    "login",
    "verify",
    "secure",
    "update",
    "bank",
    "account",
    "signin",
    "wallet",
    "payment",
    "otp"
]

SUSPICIOUS_TLDS = [
    ".xyz",
    ".top",
    ".click",
    ".zip",
    ".gq",
    ".tk",
    ".cf"
]


def detect_url(url: str):

    score = 0
    reasons = []

    parsed = urlparse(url)
    domain = parsed.netloc.lower()

    # HTTPS check
    if not url.startswith("https://"):
        score += 20
        reasons.append("URL is not using HTTPS")

    # Suspicious keywords
    for word in SUSPICIOUS_KEYWORDS:
        if word in url.lower():
            score += 10
            reasons.append(f"Contains suspicious keyword: {word}")

    # Suspicious TLD
    for tld in SUSPICIOUS_TLDS:
        if domain.endswith(tld):
            score += 30
            reasons.append(f"Suspicious domain extension: {tld}")

    # Long URL
    if len(url) > 75:
        score += 10
        reasons.append("Unusually long URL")

    # Too many hyphens
    if domain.count("-") >= 2:
        score += 20
        reasons.append("Multiple hyphens in domain")

    score = min(score, 100)

    prediction = "Malicious" if score >= 50 else "Safe"

    return {
        "prediction": prediction,
        "risk_score": score,
        "reasons": reasons
    }