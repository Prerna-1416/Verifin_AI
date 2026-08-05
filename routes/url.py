from fastapi import APIRouter
from pydantic import BaseModel
from models.url_detector import detect_url

router = APIRouter(prefix="/url", tags=["URL Detection"])

class URLRequest(BaseModel):
    url: str

@router.post("/detect")
def detect(request: URLRequest):
    return detect_url(request.url)