import easyocr

# Initialize OCR reader
reader = easyocr.Reader(['en'])

SUSPICIOUS_WORDS = {
    "verify": 15,
    "login": 15,
    "password": 20,
    "otp": 20,
    "bank": 15,
    "urgent": 10,
    "account": 10,
    "reward": 10,
    "winner": 10,
    "claim": 10,
    "click": 10,
    "limited": 10,
    "gift": 10,
    "free": 10,
    "payment": 15,
    "upi": 15,
    "refund": 15,
    "security": 10,
    "suspended": 20,
    "expired": 15
}

SUSPICIOUS_PHRASES = {
    "verify your account": 30,
    "click here": 25,
    "password will expire": 30,
    "follow the link": 30,
    "update your password": 30,
    "account suspended": 40,
    "verify immediately": 40,
    "limited time": 20,
    "claim your reward": 25,
    "confirm your identity": 35,
}

def detect_image(image_path: str):

    results = reader.readtext(image_path)

    detected_text = " ".join(
        [item[1].lower() for item in results]
    )

    score = 0
    reasons = []

    # Check suspicious words
    for word, weight in SUSPICIOUS_WORDS.items():
        if word in detected_text:
            score += weight
            reasons.append(f"Detected word: {word} (+{weight})")

    # Check suspicious phrases
    for phrase, weight in SUSPICIOUS_PHRASES.items():
        if phrase in detected_text:
            score += weight
            reasons.append(f"Detected phrase: {phrase} (+{weight})")

    # Limit score to 100
    score = min(score, 100)

    # Threat level
    if score >= 80:
        threat_level = "Critical"
    elif score >= 60:
        threat_level = "High"
    elif score >= 40:
        threat_level = "Medium"
    else:
        threat_level = "Low"

    # Prediction
    prediction = "Malicious" if score >= 40 else "Safe"

    return {
    "prediction": prediction,
    "risk_score": score,
    "threat_level": threat_level,
    "text_preview": detected_text[:200] + "..." if len(detected_text) > 200 else detected_text,
    "reasons": reasons
}