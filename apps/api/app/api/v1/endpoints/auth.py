from fastapi import APIRouter, Depends, HTTPException, status
from datetime import datetime

from app.core.database import get_database
from app.core.security import hash_password, verify_password, create_access_token, create_refresh_token
from app.core.security_deps import get_current_user
from app.schemas.index import RegisterRequest, LoginRequest, TokenResponse, UserResponse, MessageResponse

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(data: RegisterRequest):
    db = get_database()
    users = db.users

    existing = await users.find_one({"email": data.email.lower()})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user_doc = {
        "email": data.email.lower(),
        "password_hash": hash_password(data.password),
        "name": data.name,
        "role": data.role,
        "is_verified": False,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }
    result = await users.insert_one(user_doc)

    return UserResponse(
        id=str(result.inserted_id),
        email=user_doc["email"],
        name=user_doc["name"],
        role=user_doc["role"],
        is_verified=False,
        created_at=user_doc["created_at"],
    )


@router.post("/login", response_model=TokenResponse)
async def login(data: LoginRequest):
    db = get_database()
    users = db.users

    user = await users.find_one({"email": data.email.lower()})
    if not user or not verify_password(data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    access_token = create_access_token(str(user["_id"]), user["role"])
    refresh_token = create_refresh_token(str(user["_id"]))

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user={
            "id": str(user["_id"]),
            "email": user["email"],
            "name": user.get("name"),
            "role": user["role"],
            "is_verified": user.get("is_verified", False),
        },
    )


@router.get("/me", response_model=UserResponse)
async def get_me(user=Depends(get_current_user)):
    db = get_database()
    doc = await db.users.find_one({"_id": user.user_id})
    if not doc:
        raise HTTPException(status_code=404, detail="User not found")
    return UserResponse(
        id=str(doc["_id"]),
        email=doc["email"],
        name=doc.get("name"),
        role=doc["role"],
        is_verified=doc.get("is_verified", False),
        created_at=doc.get("created_at"),
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh(refresh_token: str):
    from app.core.security import decode_token

    payload = decode_token(refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    db = get_database()
    user = await db.users.find_one({"_id": payload["sub"]})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    access_token = create_access_token(str(user["_id"]), user["role"])
    new_refresh = create_refresh_token(str(user["_id"]))

    return TokenResponse(
        access_token=access_token,
        refresh_token=new_refresh,
        user={
            "id": str(user["_id"]),
            "email": user["email"],
            "name": user.get("name"),
            "role": user["role"],
            "is_verified": user.get("is_verified", False),
        },
    )


@router.post("/logout", response_model=MessageResponse)
async def logout():
    return MessageResponse(message="Logged out successfully")
