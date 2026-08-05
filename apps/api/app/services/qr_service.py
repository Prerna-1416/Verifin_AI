import base64
import io
import json
import qrcode
from nacl.signing import SigningKey
from nacl.encoding import HexEncoder
from datetime import datetime

from app.core.config import settings


def generate_keypair() -> tuple[str, str]:
    """Generate Ed25519 keypair. Returns (public_key_hex, private_key_hex)."""
    signing_key = SigningKey.generate()
    private_hex = signing_key.encode(encoder=HexEncoder).decode()
    public_hex = signing_key.verify_key.encode(encoder=HexEncoder).decode()
    return public_hex, private_hex


def sign_payload(payload: dict, private_key_hex: str) -> str:
    """Sign a payload with Ed25519 private key. Returns hex signature."""
    signing_key = SigningKey(bytes.fromhex(private_key_hex), encoder=HexEncoder)
    message = json.dumps(payload, sort_keys=True).encode()
    signed = signing_key.sign(message)
    return signed.signature.hex()


def verify_signature(payload: dict, signature: str, public_key_hex: str) -> bool:
    """Verify an Ed25519 signature against a public key."""
    from nacl.signing import VerifyKey
    from nacl.exceptions import BadSignatureError

    try:
        verify_key = VerifyKey(bytes.fromhex(public_key_hex), encoder=HexEncoder)
        message = json.dumps(payload, sort_keys=True).encode()
        verify_key.verify(message, bytes.fromhex(signature))
        return True
    except (BadSignatureError, ValueError):
        return False


def generate_qr_payload(notice_id: str, institution_id: str, content_hash: str, signature: str) -> str:
    """Build the signed payload embedded in a QR code."""
    payload = {
        "v": 1,
        "notice_id": notice_id,
        "institution_id": institution_id,
        "content_hash": content_hash,
        "sig": signature,
        "ts": datetime.utcnow().isoformat(),
    }
    return json.dumps(payload)


def generate_qr_image(payload: str) -> str:
    """Generate a QR code image and return it as a base64 data URI."""
    qr = qrcode.QRCode(version=None, error_correction=qrcode.constants.ERROR_CORRECT_H, box_size=10, border=4)
    qr.add_data(payload)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")

    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    img_base64 = base64.b64encode(buffer.getvalue()).decode()
    return f"data:image/png;base64,{img_base64}"
