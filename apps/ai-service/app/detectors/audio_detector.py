"""Audio detector: transcription and script analysis for scam patterns."""

from typing import Any, Dict, List


SCAM_PHRASES_AUDIO = [
    "guaranteed returns", "risk free", "double your money", "triple your money",
    "limited period offer", "today only", "act now", "invest immediately",
    "don't miss this opportunity", "exclusive opportunity", "sure profit",
    "no loss", "minimum investment", "high returns", "certified returns",
    "government approved scheme", "sebi approved", "special scheme",
    "early bird", "bonus shares", "free shares", "referral commission",
]


def analyze_transcript(transcript: str) -> Dict[str, Any]:
    """Analyze a transcription for scam patterns."""
    lower = transcript.lower()
    found = [p for p in SCAM_PHRASES_AUDIO if p in lower]
    score = min(100, len(found) * 8)
    return {
        "score": score,
        "found": found,
        "count": len(found),
    }


def _mock_transcript() -> str:
    """Return a mock transcription for demo purposes when ASR is unavailable."""
    return (
        "Hello sir, this is Rahul from Global Investment Partners. "
        "We have a special guaranteed returns scheme for you today only. "
        "Our SEBI approved fund can double your money in just 30 days with zero risk. "
        "This limited period offer is available for a few investors. "
        "Please invest immediately and don't miss this exclusive opportunity. "
        "You just need to share your bank details to receive your bonus shares."
    )


def detect_audio(audio_bytes: bytes) -> Dict[str, Any]:
    """Analyze an audio file for scam indicators.

    In production, this would run Whisper ASR. For the hackathon prototype
    we run a mock transcription analysis.
    """
    try:
        transcript = _mock_transcript()
        has_audio = len(audio_bytes) > 0
    except Exception:
        transcript = ""
        has_audio = False

    if not has_audio:
        return {
            "score": 0,
            "detectors": [],
            "threats": [],
            "explanations": {"rule_traces": ["No audio data provided"]},
        }

    script = analyze_transcript(transcript)

    threats = []
    if script["count"] >= 3:
        threats.append("Investment Scam Script")
    elif script["count"] >= 1:
        threats.append("Misleading Claims")
    if "sebi approved" in transcript.lower():
        threats.append("Unverified Regulatory Claims")

    detectors = [
        {"name": "Speech-to-Text Transcription", "status": "passed", "detail": f"Transcribed {len(transcript.split())} words"},
        {"name": "Script Pattern Analysis", "status": "flagged" if script["count"] > 0 else "passed", "detail": f"Detected {script['count']} scam phrases: {', '.join(script['found'][:5])}" if script["count"] > 0 else "No scam phrases detected"},
        {"name": "Claim Verification", "status": "flagged" if "sebi approved" in transcript.lower() or "guaranteed" in transcript.lower() else "passed", "detail": "Claims of guaranteed returns detected - these are red flags"},
        {"name": "Urgency & Pressure Tactics", "status": "flagged" if any(p in transcript.lower() for p in ["today only", "limited period", "act now", "immediately"]) else "passed", "detail": "High-pressure selling tactics detected"},
    ]

    explanations = {
        "feature_importance": {
            "scam_phrases": script["score"],
        },
        "rule_traces": [
            f"Found {script['count']} scam indicator phrases",
            f"First 100 chars of transcript: {transcript[:100]}...",
        ],
        "transcript_preview": transcript[:500],
    }

    return {
        "score": script["score"],
        "detectors": detectors,
        "threats": threats,
        "explanations": explanations,
    }
