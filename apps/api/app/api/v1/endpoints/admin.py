from fastapi import APIRouter, Depends, HTTPException, status
from datetime import datetime

from app.core.database import get_database
from app.core.security_deps import require_roles
from app.schemas.index import ThreatCreateRequest, ThreatResponse, MessageResponse

router = APIRouter(prefix="/admin", tags=["admin"])
admin_only = require_roles("ADMIN", "SUPER_ADMIN")


@router.get("/dashboard")
async def admin_dashboard(_=Depends(admin_only)):
    db = get_database()

    total_scans = await db.scans.count_documents({})
    total_threats = await db.threat_feed.count_documents({"is_active": True})
    total_institutions = await db.institutions.count_documents({})
    total_users = await db.users.count_documents({})
    flagged_pending = await db.flagged_content.count_documents({"action": "PENDING"})

    return {
        "total_scans": total_scans,
        "total_threats": total_threats,
        "total_institutions": total_institutions,
        "total_users": total_users,
        "flagged_pending": flagged_pending,
    }


@router.get("/analytics")
async def admin_analytics(_=Depends(admin_only)):
    db = get_database()

    pipeline = [
        {"$group": {"_id": "$risk_level", "count": {"$sum": 1}}}
    ]
    risk_distribution = await db.scans.aggregate(pipeline).to_list(length=10)

    threat_pipeline = [
        {"$match": {"is_active": True}},
        {"$group": {"_id": "$type", "count": {"$sum": 1}}},
    ]
    threat_by_type = await db.threat_feed.aggregate(threat_pipeline).to_list(length=10)

    return {
        "risk_distribution": risk_distribution,
        "threat_by_type": threat_by_type,
        "total_scans": await db.scans.count_documents({}),
        "avg_risk_score": 0,
    }


@router.get("/flagged")
async def list_flagged(_=Depends(admin_only)):
    db = get_database()
    cursor = db.flagged_content.find({}).sort("created_at", -1).limit(50)
    docs = await cursor.to_list(length=50)
    return [
        {
            "id": str(doc["_id"]),
            "scan_id": doc["scan_id"],
            "reason": doc["reason"],
            "action": doc["action"],
            "created_at": doc["created_at"],
        }
        for doc in docs
    ]


@router.put("/flagged/{flagged_id}")
async def update_flagged(flagged_id: str, action: str, _=Depends(admin_only)):
    db = get_database()
    from bson import ObjectId
    result = await db.flagged_content.update_one(
        {"_id": ObjectId(flagged_id)},
        {"$set": {"action": action, "reviewed_at": datetime.utcnow()}},
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Flagged content not found")
    return MessageResponse(message="Flagged content updated")


@router.get("/institutions")
async def list_all_institutions(_=Depends(admin_only)):
    db = get_database()
    cursor = db.institutions.find({}).sort("created_at", -1).limit(100)
    docs = await cursor.to_list(length=100)
    return [
        {
            "id": str(doc["_id"]),
            "name": doc["name"],
            "registration_no": doc["registration_no"],
            "is_verified": doc.get("is_verified", False),
            "owner_id": doc["owner_id"],
            "created_at": doc["created_at"],
        }
        for doc in docs
    ]


@router.put("/institutions/{inst_id}/verify")
async def verify_institution(inst_id: str, _=Depends(admin_only)):
    db = get_database()
    from bson import ObjectId
    result = await db.institutions.update_one(
        {"_id": ObjectId(inst_id)},
        {"$set": {"is_verified": True, "updated_at": datetime.utcnow()}},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Institution not found")
    return MessageResponse(message="Institution verified")


@router.get("/users")
async def list_users(_=Depends(admin_only)):
    db = get_database()
    cursor = db.users.find({}).sort("created_at", -1).limit(100)
    docs = await cursor.to_list(length=100)
    return [
        {
            "id": str(doc["_id"]),
            "email": doc["email"],
            "name": doc.get("name"),
            "role": doc["role"],
            "is_verified": doc.get("is_verified", False),
            "created_at": doc["created_at"],
        }
        for doc in docs
    ]
