from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from datetime import datetime
from typing import Optional

from app.core.database import get_database
from app.core.security_deps import get_current_user
from app.schemas.index import ScanCreateRequest, ScanResponse, ScanListResponse, MessageResponse
from app.services import ai_service

router = APIRouter(prefix="/scans", tags=["scans"])


async def _process_text_content(db, user_id: str, content: str):
    try:
        result = await ai_service.detect_text(content)
    except Exception:
        result = {"score": 0, "level": "LOW", "detectors": [], "threats": []}

    score = result.get("score", 0)
    return {
        "risk_score": float(score),
        "risk_level": ai_service.map_score_to_level(float(score)),
        "detectors": result.get("detectors", []),
        "explanations": result.get("explanations"),
        "threats": result.get("threats", []),
        "status": "COMPLETED",
        "completed_at": datetime.utcnow(),
    }


@router.post("", response_model=ScanResponse, status_code=status.HTTP_201_CREATED)
async def create_scan(data: ScanCreateRequest, user=Depends(get_current_user)):
    db = get_database()
    scans = db.scans

    scan_doc = {
        "user_id": user.user_id,
        "input_type": data.input_type,
        "input_content": data.input_content,
        "risk_score": 0.0,
        "risk_level": "LOW",
        "detectors": [],
        "threats": [],
        "is_verified": False,
        "status": "PROCESSING",
        "created_at": datetime.utcnow(),
    }

    if data.input_type == "TEXT":
        scan_doc.update(await _process_text_content(db, user.user_id, data.input_content))
    elif data.input_type == "URL":
        scan_doc.update(await _process_text_content(db, user.user_id, data.input_content))

    result = await scans.insert_one(scan_doc)

    return ScanResponse(
        id=str(result.inserted_id),
        input_type=scan_doc["input_type"],
        input_content=scan_doc["input_content"],
        risk_score=scan_doc["risk_score"],
        risk_level=scan_doc["risk_level"],
        detectors=scan_doc["detectors"],
        explanations=scan_doc.get("explanations"),
        threats=scan_doc["threats"],
        is_verified=scan_doc["is_verified"],
        status=scan_doc["status"],
        created_at=scan_doc["created_at"],
    )


@router.post("/upload", response_model=ScanResponse, status_code=status.HTTP_201_CREATED)
async def upload_scan(
    file: UploadFile = File(...),
    input_type: str = Form(...),
    user=Depends(get_current_user),
):
    db = get_database()
    scans = db.scans

    file_bytes = await file.read()
    file_name = file.filename or "upload"
    file_size = len(file_bytes)

    try:
        if input_type == "IMAGE":
            result = await ai_service.detect_image(file_bytes, file_name)
        elif input_type == "AUDIO":
            result = await ai_service.detect_audio(file_bytes, file_name)
        else:
            result = {"score": 0, "level": "LOW", "detectors": [], "threats": []}
    except Exception:
        result = {"score": 0, "level": "LOW", "detectors": [], "threats": []}

    score = result.get("score", 0)
    scan_doc = {
        "user_id": user.user_id,
        "input_type": input_type,
        "input_content": f"uploaded:{file_name}",
        "file_name": file_name,
        "file_size": file_size,
        "mime_type": file.content_type,
        "risk_score": float(score),
        "risk_level": ai_service.map_score_to_level(float(score)),
        "detectors": result.get("detectors", []),
        "explanations": result.get("explanations"),
        "threats": result.get("threats", []),
        "is_verified": False,
        "status": "COMPLETED",
        "completed_at": datetime.utcnow(),
        "created_at": datetime.utcnow(),
    }
    result_id = await scans.insert_one(scan_doc)

    return ScanResponse(
        id=str(result_id.inserted_id),
        input_type=input_type,
        input_content=scan_doc["input_content"],
        risk_score=scan_doc["risk_score"],
        risk_level=scan_doc["risk_level"],
        detectors=scan_doc["detectors"],
        explanations=scan_doc.get("explanations"),
        threats=scan_doc["threats"],
        is_verified=False,
        status="COMPLETED",
        created_at=scan_doc["created_at"],
    )


@router.get("", response_model=ScanListResponse)
async def list_scans(
    page: int = 1,
    limit: int = 20,
    user=Depends(get_current_user),
):
    db = get_database()
    scans = db.scans

    skip = (page - 1) * limit
    cursor = scans.find({"user_id": user.user_id}).sort("created_at", -1).skip(skip).limit(limit)
    items = await cursor.to_list(length=limit)
    total = await scans.count_documents({"user_id": user.user_id})

    data = [
        ScanResponse(
            id=str(doc["_id"]),
            input_type=doc["input_type"],
            input_content=doc["input_content"],
            risk_score=doc.get("risk_score", 0),
            risk_level=doc.get("risk_level", "LOW"),
            detectors=doc.get("detectors", []),
            explanations=doc.get("explanations"),
            threats=doc.get("threats", []),
            is_verified=doc.get("is_verified", False),
            status=doc.get("status", "COMPLETED"),
            created_at=doc["created_at"],
        )
        for doc in items
    ]

    return ScanListResponse(
        data=data,
        total=total,
        page=page,
        limit=limit,
        total_pages=(total + limit - 1) // limit,
    )


@router.get("/{scan_id}", response_model=ScanResponse)
async def get_scan(scan_id: str, user=Depends(get_current_user)):
    db = get_database()
    from bson import ObjectId
    try:
        doc = await db.scans.find_one({"_id": ObjectId(scan_id), "user_id": user.user_id})
    except Exception:
        raise HTTPException(status_code=404, detail="Scan not found")

    if not doc:
        raise HTTPException(status_code=404, detail="Scan not found")

    return ScanResponse(
        id=str(doc["_id"]),
        input_type=doc["input_type"],
        input_content=doc["input_content"],
        risk_score=doc.get("risk_score", 0),
        risk_level=doc.get("risk_level", "LOW"),
        detectors=doc.get("detectors", []),
        explanations=doc.get("explanations"),
        threats=doc.get("threats", []),
        is_verified=doc.get("is_verified", False),
        status=doc.get("status", "COMPLETED"),
        created_at=doc["created_at"],
    )


@router.delete("/{scan_id}", response_model=MessageResponse)
async def delete_scan(scan_id: str, user=Depends(get_current_user)):
    db = get_database()
    from bson import ObjectId
    result = await db.scans.delete_one({"_id": ObjectId(scan_id), "user_id": user.user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Scan not found")
    return MessageResponse(message="Scan deleted")
