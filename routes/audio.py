from fastapi import APIRouter, UploadFile, File
import shutil
import os

from models.audio_detector import detect_audio

router = APIRouter(
    prefix="/audio",
    tags=["Audio Detection"]
)

UPLOAD_DIR = "uploads"

os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/detect")
async def detect(file: UploadFile = File(...)):

    filepath = os.path.join(UPLOAD_DIR, file.filename)

    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    result = detect_audio(filepath)

    return result