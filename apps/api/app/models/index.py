from beanie import Document, Indexed, Link
from datetime import datetime
from typing import Optional
from enum import Enum


class Role(str, Enum):
    INVESTOR = "INVESTOR"
    INSTITUTION = "INSTITUTION"
    ADMIN = "ADMIN"
    SUPER_ADMIN = "SUPER_ADMIN"


class RiskLevel(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class ScanStatus(str, Enum):
    PENDING = "PENDING"
    PROCESSING = "PROCESSING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"


class InputType(str, Enum):
    TEXT = "TEXT"
    URL = "URL"
    IMAGE = "IMAGE"
    AUDIO = "AUDIO"
    FILE = "FILE"


class NoticeStatus(str, Enum):
    ACTIVE = "ACTIVE"
    EXPIRED = "EXPIRED"
    REVOKED = "REVOKED"


class ThreatType(str, Enum):
    PHISHING = "PHISHING"
    MALWARE = "MALWARE"
    SCAM = "SCAM"
    FRAUD = "FRAUD"
    IMPERSONATION = "IMPERSONATION"
    DATA_LEAK = "DATA_LEAK"
    OTHER = "OTHER"


class FlagAction(str, Enum):
    PENDING = "PENDING"
    CONFIRMED_THREAT = "CONFIRMED_THREAT"
    FALSE_POSITIVE = "FALSE_POSITIVE"
    ESCALATED = "ESCALATED"


class User(Document):
    email: Indexed(str, unique=True)
    password_hash: str
    name: Optional[str] = None
    role: Role = Role.INVESTOR
    avatar_url: Optional[str] = None
    is_verified: bool = False
    created_at: datetime = datetime.utcnow()
    updated_at: datetime = datetime.utcnow()

    class Settings:
        name = "users"
        indexes = [("email", 1), ("role", 1)]


class Session(Document):
    user_id: Indexed(str)
    token: Indexed(str, unique=True)
    expires_at: datetime

    class Settings:
        name = "sessions"


class Institution(Document):
    name: Indexed(str)
    registration_no: Indexed(str, unique=True)
    logo_url: Optional[str] = None
    website: Optional[str] = None
    public_key: str
    private_key_hash: str
    is_verified: bool = False
    owner_id: str
    created_at: datetime = datetime.utcnow()
    updated_at: datetime = datetime.utcnow()

    class Settings:
        name = "institutions"
        indexes = [("owner_id", 1), ("registration_no", 1)]


class Notice(Document):
    institution_id: str
    title: str
    content: str
    document_url: Optional[str] = None
    signature: str
    signed_by: str
    signed_at: datetime = datetime.utcnow()
    status: NoticeStatus = NoticeStatus.ACTIVE
    expires_at: Optional[datetime] = None
    created_at: datetime = datetime.utcnow()

    class Settings:
        name = "notices"
        indexes = [("institution_id", 1), ("status", 1)]


class QRCode(Document):
    notice_id: str
    institution_id: str
    payload: str
    qr_image_url: str
    scan_count: int = 0
    last_scanned_at: Optional[datetime] = None
    created_at: datetime = datetime.utcnow()

    class Settings:
        name = "qr_codes"
        indexes = [("notice_id", 1), ("institution_id", 1)]


class Scan(Document):
    user_id: str
    qr_code_id: Optional[str] = None
    input_type: InputType
    input_content: str
    file_url: Optional[str] = None
    file_name: Optional[str] = None
    file_size: Optional[int] = None
    mime_type: Optional[str] = None

    risk_score: float = 0.0
    risk_level: RiskLevel = RiskLevel.LOW
    detectors: dict = {}
    explanations: Optional[dict] = None
    threats: list = []

    is_verified: bool = False
    verified_at: Optional[datetime] = None
    matched_notice_id: Optional[str] = None

    status: ScanStatus = ScanStatus.PENDING
    completed_at: Optional[datetime] = None
    created_at: datetime = datetime.utcnow()

    class Settings:
        name = "scans"
        indexes = [("user_id", 1), ("status", 1), ("risk_level", 1), ("created_at", 1)]


class ThreatFeed(Document):
    title: str
    description: str
    type: ThreatType
    severity: RiskLevel
    indicators: dict = {}
    source: str
    source_url: Optional[str] = None
    is_active: bool = True
    published_at: datetime = datetime.utcnow()
    created_at: datetime = datetime.utcnow()

    class Settings:
        name = "threat_feed"
        indexes = [("type", 1), ("severity", 1), ("is_active", 1)]


class FlaggedContent(Document):
    scan_id: str
    reason: str
    reviewed_by: Optional[str] = None
    reviewed_at: Optional[datetime] = None
    action: FlagAction = FlagAction.PENDING
    created_at: datetime = datetime.utcnow()

    class Settings:
        name = "flagged_content"
        indexes = [("action", 1)]
