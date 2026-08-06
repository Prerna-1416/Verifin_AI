from fastapi import APIRouter, Depends, HTTPException, status
from datetime import datetime

from app.core.database import get_database
from app.core.security_deps import require_roles
from app.schemas.index import ThreatCreateRequest, ThreatResponse, MessageResponse

router = APIRouter(prefix="/threats", tags=["threats"])
admin_only = require_roles("ADMIN", "SUPER_ADMIN")


@router.get("")
async def list_threats(active: bool | None = None):
    db = get_database()
    query = {"is_active": True} if active else {}
    cursor = db.threat_feed.find(query).sort("published_at", -1).limit(100)
    docs = await cursor.to_list(length=100)
    return [_to_response(doc) for doc in docs]


@router.post("", response_model=ThreatResponse, status_code=status.HTTP_201_CREATED)
async def create_threat(data: ThreatCreateRequest, _=Depends(admin_only)):
    db = get_database()

    doc = {
        "title": data.title,
        "description": data.description,
        "type": data.type,
        "severity": data.severity,
        "indicators": data.indicators,
        "source": data.source,
        "source_url": data.source_url,
        "is_active": True,
        "published_at": datetime.utcnow(),
        "created_at": datetime.utcnow(),
    }
    result = await db.threat_feed.insert_one(doc)
    return _to_response({**doc, "_id": result.inserted_id})


@router.put("/{threat_id}", response_model=ThreatResponse)
async def update_threat(threat_id: str, data: ThreatCreateRequest, _=Depends(admin_only)):
    db = get_database()
    from bson import ObjectId

    update_data = data.model_dump(exclude_unset=True)
    result = await db.threat_feed.find_one_and_update(
        {"_id": ObjectId(threat_id)},
        {"$set": update_data},
        return_document=True,
    )
    if not result:
        raise HTTPException(status_code=404, detail="Threat not found")
    return _to_response(result)


@router.delete("/{threat_id}", response_model=MessageResponse)
async def delete_threat(threat_id: str, _=Depends(admin_only)):
    db = get_database()
    from bson import ObjectId
    result = await db.threat_feed.delete_one({"_id": ObjectId(threat_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Threat not found")
    return MessageResponse(message="Threat deleted")


def _to_response(doc: dict) -> ThreatResponse:
    return ThreatResponse(
        id=str(doc["_id"]),
        title=doc["title"],
        description=doc["description"],
        type=doc["type"],
        severity=doc["severity"],
        indicators=doc.get("indicators", {}),
        source=doc["source"],
        is_active=doc.get("is_active", True),
        published_at=doc["published_at"],
    )
