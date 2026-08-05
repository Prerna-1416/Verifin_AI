from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


# Auth schemas
class RegisterRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=8)
    role: str = "INVESTOR"


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]


class UserResponse(BaseModel):
    id: str
    email: str
    name: Optional[str] = None
    role: str
    is_verified: bool
    created_at: datetime


# Scan schemas
class ScanCreateRequest(BaseModel):
    input_type: str
    input_content: str = ""


class ScanResponse(BaseModel):
    id: str
    input_type: str
    input_content: str
    risk_score: float
    risk_level: str
    detectors: Dict[str, Any]
    explanations: Optional[Dict[str, Any]] = None
    threats: List[str]
    is_verified: bool
    status: str
    created_at: datetime


class ScanListResponse(BaseModel):
    data: List[ScanResponse]
    total: int
    page: int
    limit: int
    total_pages: int


# Institution schemas
class InstitutionCreateRequest(BaseModel):
    name: str = Field(..., min_length=2)
    registration_no: str = Field(..., min_length=5)
    website: Optional[str] = None
    logo_url: Optional[str] = None


class InstitutionResponse(BaseModel):
    id: str
    name: str
    registration_no: str
    website: Optional[str] = None
    is_verified: bool
    owner_id: str
    created_at: datetime


# Notice schemas
class NoticeCreateRequest(BaseModel):
    title: str = Field(..., min_length=5)
    type: str = "OTHER"
    content: str = Field(..., min_length=50)
    document_url: Optional[str] = None
    expires_at: Optional[datetime] = None


class NoticeResponse(BaseModel):
    id: str
    institution_id: str
    title: str
    content: str
    signature: str
    status: str
    created_at: datetime


# QR schemas
class QRGenerateRequest(BaseModel):
    notice_id: str


class QRResponse(BaseModel):
    id: str
    notice_id: str
    institution_id: str
    qr_image_url: str
    scan_count: int


class QRVerifyResponse(BaseModel):
    is_valid: bool
    notice: Optional[Dict[str, Any]] = None
    institution: Optional[Dict[str, Any]] = None
    message: str


# Threat schemas
class ThreatCreateRequest(BaseModel):
    title: str = Field(..., min_length=5)
    description: str = Field(..., min_length=20)
    type: str
    severity: str
    indicators: Dict[str, Any] = {}
    source: str = Field(..., min_length=2)
    source_url: Optional[str] = None


class ThreatResponse(BaseModel):
    id: str
    title: str
    description: str
    type: str
    severity: str
    indicators: Dict[str, Any]
    source: str
    is_active: bool
    published_at: datetime


# Generic
class MessageResponse(BaseModel):
    message: str
