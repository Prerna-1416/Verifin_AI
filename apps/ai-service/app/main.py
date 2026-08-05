from fastapi import FastAPI, File, Form, HTTPException, UploadFile, Depends, Header, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, Any, Dict

from app.detectors.text_detector import detect_text as run_text_detector
from app.detectors.url_detector import detect_url as run_url_detector
from app.detectors.image_detector import detect_image as run_image_detector
from app.detectors.audio_detector import detect_audio as run_audio_detector

API_KEY = "verifin-ai-service-key"


class TextRequest(BaseModel):
    text: str = Field(..., min_length=10)


class URLRequest(BaseModel):
    url: str = Field(..., min_length=5)


app = FastAPI(
    title="VeriFin AI Detection Service",
    version="1.0.0",
    description="AI detection service for text, URL, image, and audio scam analysis",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


def verify_api_key(x_api_key: Optional[str] = Header(None)):
    if x_api_key != API_KEY:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid API key")
    return True


@app.get("/health")
async def health():
    return {"status": "healthy", "service": "verifin-ai-detection"}


@app.post("/detect/text")
async def detect_text(req: TextRequest):
    result = run_text_detector(req.text)
    return {"success": True, **result}


@app.post("/detect/url")
async def detect_url(req: URLRequest):
    result = run_url_detector(req.url)
    return {"success": True, **result}


@app.post("/detect/image")
async def detect_image(file: UploadFile = File(...)):
    data = await file.read()
    result = run_image_detector(data)
    return {"success": True, **result}


@app.post("/detect/audio")
async def detect_audio(file: UploadFile = File(...)):
    data = await file.read()
    result = run_audio_detector(data)
    return {"success": True, **result}


@app.get("/detect/version")
async def version():
    return {"version": "1.0.0", "detectors": ["text", "url", "image", "audio"]}
