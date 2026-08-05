import whisper

from models.text_detector import detect_text

# -----------------------------
# Lazy Load Whisper Model
# -----------------------------
whisper_model = None


def get_model():
    global whisper_model

    if whisper_model is None:
        whisper_model = whisper.load_model("base")

    return whisper_model


# -----------------------------
# Audio Detection
# -----------------------------
def detect_audio(audio_path: str):

    model = get_model()

    result = model.transcribe(audio_path)

    detected_text = result["text"].lower()

    # -----------------------------
    # Normalize common Whisper mistakes
    # -----------------------------
    replacements = {
        "verified": "verify",
        "verification": "verify",
        "links": "link",
        "suspension": "suspended",
        "log in": "login",
        "one time password": "otp",
        "pass word": "password"
    }

    for old, new in replacements.items():
        detected_text = detected_text.replace(old, new)

    # -----------------------------
    # Analyze transcription
    # -----------------------------
    analysis = detect_text(detected_text)

    analysis["transcription"] = detected_text

    return analysis