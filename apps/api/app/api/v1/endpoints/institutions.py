from fastapi import APIRouter, Depends, HTTPException, status
from datetime import datetime

from app.core.database import get_database
from app.core.security_deps import get_current_user, require_roles
from app.schemas.index import (
    InstitutionCreateRequest,
    InstitutionResponse,
    NoticeCreateRequest,
    NoticeResponse,
    QRResponse,
    QRVerifyResponse,
    MessageResponse,
)
from app.services.qr_service import (
    generate_keypair,
    generate_qr_image,
    generate_qr_payload,
    sign_payload,
    verify_signature,
)
from app.models.index import RiskLevel

router = APIRouter(prefix="/institutions", tags=["institutions"])


@router.post("", response_model=InstitutionResponse, status_code=status.HTTP_201_CREATED)
async def register_institution(data: InstitutionCreateRequest, user=Depends(get_current_user)):
    db = get_database()

    existing = await db.institutions.find_one({"registration_no": data.registration_no})
    if existing:
        raise HTTPException(status_code=400, detail="Registration number already exists")

    public_key, private_key = generate_keypair()

    inst_doc = {
        "name": data.name,
        "registration_no": data.registration_no,
        "website": data.website,
        "logo_url": data.logo_url,
        "public_key": public_key,
        "private_key_hash": private_key,  # Note: store encrypted in production
        "is_verified": False,
        "owner_id": user.user_id,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }
    result = await db.institutions.insert_one(inst_doc)

    return InstitutionResponse(
        id=str(result.inserted_id),
        name=inst_doc["name"],
        registration_no=inst_doc["registration_no"],
        website=inst_doc["website"],
        is_verified=False,
        owner_id=user.user_id,
        created_at=inst_doc["created_at"],
    )


@router.get("/me", response_model=InstitutionResponse)
async def get_my_institution(user=Depends(get_current_user)):
    db = get_database()
    doc = await db.institutions.find_one({"owner_id": user.user_id})
    if not doc:
        raise HTTPException(status_code=404, detail="No institution found for this user")
    return _to_response(doc)


@router.post("/notices", response_model=NoticeResponse, status_code=status.HTTP_201_CREATED)
async def register_notice(data: NoticeCreateRequest, user=Depends(get_current_user)):
    db = get_database()

    inst = await db.institutions.find_one({"owner_id": user.user_id})
    if not inst:
        raise HTTPException(status_code=403, detail="User is not associated with an institution")

    import hashlib
    content_hash = hashlib.sha256(data.content.encode()).hexdigest()
    payload = {"title": data.title, "content_hash": content_hash, "institution": inst["name"]}
    signature = sign_payload(payload, inst["private_key_hash"])

    notice_doc = {
        "institution_id": str(inst["_id"]),
        "title": data.title,
        "content": data.content,
        "document_url": data.document_url,
        "signature": signature,
        "signed_by": inst["name"],
        "signed_at": datetime.utcnow(),
        "status": "ACTIVE",
        "expires_at": data.expires_at,
        "created_at": datetime.utcnow(),
    }
    result = await db.notices.insert_one(notice_doc)
    notice_id = str(result.inserted_id)

    qr_payload = generate_qr_payload(notice_id, str(inst["_id"]), content_hash, signature)
    qr_image = generate_qr_image(qr_payload)

    await db.qr_codes.insert_one({
        "notice_id": notice_id,
        "institution_id": str(inst["_id"]),
        "payload": qr_payload,
        "qr_image_url": qr_image,
        "scan_count": 0,
        "created_at": datetime.utcnow(),
    })

    return NoticeResponse(
        id=notice_id,
        institution_id=str(inst["_id"]),
        title=notice_doc["title"],
        content=notice_doc["content"],
        signature=signature,
        status=notice_doc["status"],
        created_at=notice_doc["created_at"],
    )


@router.get("/notices", response_model=list[NoticeResponse])
async def list_notices(user=Depends(get_current_user)):
    db = get_database()
    inst = await db.institutions.find_one({"owner_id": user.user_id})
    if not inst:
        raise HTTPException(status_code=403, detail="User is not associated with an institution")

    cursor = db.notices.find({"institution_id": str(inst["_id"])}).sort("created_at", -1)
    docs = await cursor.to_list(length=100)

    return [
        NoticeResponse(
            id=str(doc["_id"]),
            institution_id=doc["institution_id"],
            title=doc["title"],
            content=doc["content"],
            signature=doc["signature"],
            status=doc["status"],
            created_at=doc["created_at"],
        )
        for doc in docs
    ]


@router.get("/registry", response_model=list[dict])
async def public_registry():
    db = get_database()
    cursor = db.institutions.find({"is_verified": True}).sort("name", 1)
    docs = await cursor.to_list(length=1000)
    return [
        {
            "id": str(doc["_id"]),
            "name": doc["name"],
            "registration_no": doc["registration_no"],
            "website": doc.get("website"),
            "is_verified": doc["is_verified"],
        }
        for doc in docs
    ]


@router.get("/qr-codes", response_model=list[QRResponse])
async def list_qr_codes(user=Depends(get_current_user)):
    db = get_database()
    inst = await db.institutions.find_one({"owner_id": user.user_id})
    if not inst:
        raise HTTPException(status_code=403, detail="User is not associated with an institution")

    cursor = db.qr_codes.find({"institution_id": str(inst["_id"])}).sort("created_at", -1)
    docs = await cursor.to_list(length=100)

    return [
        QRResponse(
            id=str(doc["_id"]),
            notice_id=doc["notice_id"],
            institution_id=doc["institution_id"],
            qr_image_url=doc["qr_image_url"],
            scan_count=doc["scan_count"],
        )
        for doc in docs
    ]


def _to_response(doc: dict) -> InstitutionResponse:
    return InstitutionResponse(
        id=str(doc["_id"]),
        name=doc["name"],
        registration_no=doc["registration_no"],
        website=doc.get("website"),
        is_verified=doc.get("is_verified", False),
        owner_id=doc["owner_id"],
        created_at=doc["created_at"],
    )
