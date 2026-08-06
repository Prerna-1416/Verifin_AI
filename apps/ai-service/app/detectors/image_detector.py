"""Image detector: logo detection, QR extraction, ELA tampering analysis, OCR."""

import io
import os
from typing import Any, Dict, List
from PIL import Image, ImageChops

try:
    import cv2
    HAS_CV2 = True
except ImportError:
    HAS_CV2 = False

try:
    from pyzbar.pyzbar import decode
    HAS_PYZBAR = True
except ImportError:
    HAS_PYZBAR = False


def _analyze_ela(image_bytes: bytes) -> Dict[str, Any]:
    """Error Level Analysis to detect image tampering."""
    try:
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        # Downscale large images for performance
        max_dim = 800
        if max(img.size) > max_dim:
            ratio = max_dim / max(img.size)
            img = img.resize((int(img.width * ratio), int(img.height * ratio)))

        buffer = io.BytesIO()
        img.save(buffer, format="JPEG", quality=92)
        recompressed = Image.open(buffer).convert("RGB")

        diff = ImageChops.difference(img, recompressed)
        grayscale = diff.convert("L")
        hist = grayscale.histogram()
        total = sum(hist)
        if total == 0:
            return {"score": 0, "edited_percentage": 0, "explanation": "No tampering detected"}
        edited_pixels = sum(hist[80:])
        percentage = round(edited_pixels / total * 100, 2)
        return {
            "score": min(60, percentage * 3),
            "edited_percentage": percentage,
            "explanation": f"{percentage}% of pixels show tampering signatures",
        }
    except Exception:
        return {"score": 0, "edited_percentage": 0, "explanation": "Could not analyze"}


def _extract_qr(image_bytes: bytes) -> Dict[str, Any]:
    if not HAS_PYZBAR:
        return {"score": 0, "found": False, "payload": None, "explanation": "QR library unavailable"}
    try:
        img = Image.open(io.BytesIO(image_bytes))
        results = decode(img)
        if results:
            payload = results[0].data.decode("utf-8", errors="ignore")
            return {"score": 0, "found": True, "payload": payload, "explanation": "QR code found"}
        return {"score": 0, "found": False, "payload": None, "explanation": "No QR code in image"}
    except Exception:
        return {"score": 0, "found": False, "payload": None, "explanation": "Could not decode"}


def _detect_logo(image_bytes: bytes) -> Dict[str, Any]:
    """Detect logos by color region analysis (simplified heuristic)."""
    try:
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        img.thumbnail((400, 400))
        pixels = list(img.getdata())
        total = len(pixels)
        if total == 0:
            return {"score": 0, "has_logo": False, "explanation": "Empty image"}
        # Count dominant color regions (simplified logo detection)
        colors = {}
        for p in pixels:
            key = (p[0] // 32, p[1] // 32, p[2] // 32)
            colors[key] = colors.get(key, 0) + 1
        top = sorted(colors.values(), reverse=True)[:5]
        top_ratio = sum(top) / total
        # Logos often have high contrast areas
        return {
            "score": 10 if top_ratio < 0.6 else 0,
            "has_logo": top_ratio < 0.6,
            "explanation": "High-contrast branding detected" if top_ratio < 0.6 else "No prominent logo detected",
        }
    except Exception:
        return {"score": 0, "has_logo": False, "explanation": "Could not analyze"}


def detect_image(image_bytes: bytes) -> Dict[str, Any]:
    """Run all image detectors and return combined result."""
    ela = _analyze_ela(image_bytes)
    qr = _extract_qr(image_bytes)
    logo = _detect_logo(image_bytes)

    score = round(min(100, ela["score"] + logo["score"]), 1)

    threats = []
    if ela["edited_percentage"] > 10:
        threats.append("Image Tampering")
    if logo["has_logo"]:
        threats.append("Logo Detected - Verify Authenticity")

    detectors = [
        {"name": "Tampering Analysis (ELA)", "status": "flagged" if ela["edited_percentage"] > 10 else "passed", "detail": ela["explanation"]},
        {"name": "QR Code Extraction", "status": "passed" if qr["found"] else "info", "detail": qr["explanation"]},
        {"name": "Logo Detection", "status": "info" if logo["has_logo"] else "passed", "detail": logo["explanation"]},
    ]

    explanations = {
        "feature_importance": {
            "ela_tampering": ela["score"],
            "logo": logo["score"],
        },
        "rule_traces": [
            ela["explanation"],
            f"QR found: {qr['found']}",
        ],
    }

    return {
        "score": score,
        "detectors": detectors,
        "threats": threats,
        "explanations": explanations,
        "qr_payload": qr["payload"],
    }
