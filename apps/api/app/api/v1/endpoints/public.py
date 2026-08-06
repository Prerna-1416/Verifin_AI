from fastapi import APIRouter, HTTPException
from bson import ObjectId

from app.core.database import get_database
from app.schemas.index import QRVerifyResponse

router = APIRouter(prefix="/public", tags=["public"])


@router.get("/verify/{qr_id}", response_model=QRVerifyResponse)
async def verify_qr(qr_id: str):
    db = get_database()

    try:
        qr = await db.qr_codes.find_one({"_id": ObjectId(qr_id)})
    except Exception:
        qr = await db.qr_codes.find_one({"notice_id": qr_id})

    if not qr:
        return QRVerifyResponse(
            is_valid=False,
            message="QR code not found in registry. This may be a fraudulent communication.",
        )

    # Increment scan count
    await db.qr_codes.update_one(
        {"_id": qr["_id"]},
        {"$inc": {"scan_count": 1}},
    )

    notice = await db.notices.find_one({"_id": ObjectId(qr["notice_id"])})
    institution = await db.institutions.find_one({"_id": ObjectId(qr["institution_id"])})

    if not notice or not institution:
        return QRVerifyResponse(is_valid=False, message="Linked records not found.")

    if notice["status"] != "ACTIVE":
        return QRVerifyResponse(
            is_valid=False,
            notice=_notice_dict(notice),
            institution=_institution_dict(institution),
            message=f"This communication is {notice['status']}. Verify with the institution directly.",
        )

    return QRVerifyResponse(
        is_valid=True,
        notice=_notice_dict(notice),
        institution=_institution_dict(institution),
        message="QR code is cryptographically valid and matches an official registered communication.",
    )


@router.get("/registry")
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
        }
        for doc in docs
    ]


@router.get("/threats")
async def public_threats():
    db = get_database()
    cursor = db.threat_feed.find({"is_active": True}).sort("published_at", -1).limit(20)
    docs = await cursor.to_list(length=20)
    return [
        {
            "id": str(doc["_id"]),
            "title": doc["title"],
            "description": doc["description"],
            "type": doc["type"],
            "severity": doc["severity"],
            "indicators": doc.get("indicators", {}),
            "source": doc["source"],
            "published_at": doc["published_at"],
        }
        for doc in docs
    ]


def _notice_dict(notice: dict) -> dict:
    return {
        "id": str(notice["_id"]),
        "title": notice["title"],
        "content": notice["content"],
        "signed_by": notice.get("signed_by"),
        "signed_at": notice.get("signed_at"),
        "status": notice["status"],
    }


def _institution_dict(institution: dict) -> dict:
    return {
        "id": str(institution["_id"]),
        "name": institution["name"],
        "registration_no": institution["registration_no"],
        "website": institution.get("website"),
        "is_verified": institution.get("is_verified", False),
    }
