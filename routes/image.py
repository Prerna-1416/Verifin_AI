from fastapi import APIRouter, UploadFile, File
import shutil
import os

from models.image_detector import detect_image

router = APIRouter(
    prefix="/image",
    tags=["Image Detection"]
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/detect")
async def image_detect(file: UploadFile = File(...)):

    file_path = os.path.join(UPLOAD_DIR, file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    result = detect_image(file_path)

    return result