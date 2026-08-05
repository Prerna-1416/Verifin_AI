from fastapi import APIRouter
from pydantic import BaseModel
from models.text_detector import detect_text

router = APIRouter(prefix="/text", tags=["Text Detection"])

class TextRequest(BaseModel):
    text: str

@router.post("/detect")
def detect(request: TextRequest):
    return detect_text(request.text)