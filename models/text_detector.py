from transformers import pipeline

# -------------------------------
# Lazy Load Transformer Model
# -------------------------------
classifier = None

def get_classifier():
    global classifier

    if classifier is None:
        classifier = pipeline(
            "text-classification",
            model="mrm8488/bert-tiny-finetuned-sms-spam-detection"
        )

    return classifier


# -------------------------------
# Suspicious Keywords
# -------------------------------
TEXT_KEYWORDS = {
    "verify": 20,
    "login": 20,
    "password": 25,
    "otp": 25,
    "bank": 20,
    "urgent": 15,
    "account": 15,
    "security": 15,
    "payment": 20,
    "refund": 20,
    "upi": 20,
    "expired": 20,
    "click": 15
}

# -------------------------------
# Suspicious Phrases
# -------------------------------
TEXT_PHRASES = {
    "verify your account": 40,
    "click here": 30,
    "password will expire": 40,
    "follow the link": 30,
    "update your password": 40,
    "confirm your identity": 40,
    "account suspended": 40,
    "verify immediately": 40,
    "limited time": 20,
    "claim your reward": 25,
    "your account has been suspended": 50,
    "bank account": 25,
    "security alert": 25,
    "act now": 20
}


def detect_text(text: str):

    model = get_classifier()

    result = model(text)[0]

    label = result["label"].lower()
    confidence = round(result["score"] * 100, 2)

    text_lower = text.lower()

    score = 0
    reasons = []

    # -------------------------------
    # Keyword Detection
    # -------------------------------
    for word, weight in TEXT_KEYWORDS.items():
        if word in text_lower:
            score += weight
            reasons.append(f"Detected keyword: {word} (+{weight})")

    # -------------------------------
    # Phrase Detection
    # -------------------------------
    for phrase, weight in TEXT_PHRASES.items():
        if phrase in text_lower:
            score += weight
            reasons.append(f"Detected phrase: {phrase} (+{weight})")

    # -------------------------------
    # AI Bonus
    # AI can only increase the score
    # -------------------------------
    if "spam" in label:
        score += 20
        reasons.append("AI model detected possible spam (+20)")

    score = min(score, 100)

    # -------------------------------
    # Threat Level
    # -------------------------------
    if score >= 80:
        threat_level = "Critical"
    elif score >= 60:
        threat_level = "High"
    elif score >= 30:
        threat_level = "Medium"
    else:
        threat_level = "Low"

    prediction = "Malicious" if score >= 30 else "Safe"

    return {
        "prediction": prediction,
        "confidence": confidence,
        "risk_score": score,
        "threat_level": threat_level,
        "reasons": reasons
    }