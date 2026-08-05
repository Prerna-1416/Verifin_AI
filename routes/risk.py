from fastapi import APIRouter
from pydantic import BaseModel

from models.explainer import generate_explanation
from models.text_detector import detect_text
from models.url_detector import detect_url
from models.risk_engine import calculate_risk

router = APIRouter(prefix="/risk", tags=["Risk Analysis"])


class RiskRequest(BaseModel):
    text: str
    url: str


@router.post("/analyze")
def analyze(request: RiskRequest):

    text_result = detect_text(request.text)
    url_result = detect_url(request.url)

    overall = calculate_risk(text_result, url_result)

    explanation = generate_explanation(
        text_result,
        url_result
    )

    return {
        "text": text_result,
        "url": url_result,
        "overall": overall,
        "explanation": explanation
    }