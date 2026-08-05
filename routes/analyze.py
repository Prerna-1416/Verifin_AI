from fastapi import APIRouter
from pydantic import BaseModel

from models.text_detector import detect_text
from models.url_detector import detect_url

from utils.report_generator import generate_report
from utils.history import save_history

router = APIRouter(
    prefix="/analyze",
    tags=["AI Analysis"]
)


class AnalyzeRequest(BaseModel):
    text: str | None = None
    url: str | None = None


@router.post("/")
def analyze(data: AnalyzeRequest):

    response = {}

    scores = []
    all_reasons = []

    # ---------------- Text Analysis ----------------
    if data.text:
        text_result = detect_text(data.text)

        response["text"] = text_result

        scores.append(text_result["risk_score"])

        if "reasons" in text_result:
            all_reasons.extend(text_result["reasons"])

    # ---------------- URL Analysis ----------------
    if data.url:
        url_result = detect_url(data.url)

        response["url"] = url_result

        scores.append(url_result["risk_score"])

        if "reasons" in url_result:
            all_reasons.extend(url_result["reasons"])

    # ---------------- Overall Risk ----------------
    if scores:
        overall = round(sum(scores) / len(scores), 2)
    else:
        overall = 0

    if overall >= 80:
        level = "Critical"
    elif overall >= 60:
        level = "High"
    elif overall >= 40:
        level = "Medium"
    else:
        level = "Low"

    if overall >= 80:
        recommendation = "Do NOT interact with this content."
    elif overall >= 60:
        recommendation = "Exercise extreme caution."
    elif overall >= 40:
        recommendation = "Proceed carefully and verify authenticity."
    else:
        recommendation = "No significant threat detected."

    response["overall"] = {
        "risk_score": overall,
        "threat_level": level,
        "recommendation": recommendation
    }

    # ---------------- PDF Report ----------------
    report_path = generate_report({
        "prediction": "Malicious" if overall >= 40 else "Safe",
        "risk_score": overall,
        "threat_level": level,
        "recommendation": recommendation,
        "reasons": all_reasons
    })

    response["report"] = report_path

    # ---------------- Save History ----------------
    history_path = save_history(response)

    response["history"] = history_path

    return response