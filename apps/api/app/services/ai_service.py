import httpx
from typing import Any, Dict, Optional

from app.core.config import settings

AI_SERVICE_URL = settings.AI_SERVICE_URL
AI_SERVICE_API_KEY = settings.AI_SERVICE_API_KEY


async def detect_text(content: str) -> Dict[str, Any]:
    return await _call_detector("text", {"text": content})


async def detect_url(url: str) -> Dict[str, Any]:
    return await _call_detector("url", {"url": url})


async def detect_image(file_bytes: bytes, filename: str = "image.png") -> Dict[str, Any]:
    async with httpx.AsyncClient(timeout=60) as client:
        response = await client.post(
            f"{AI_SERVICE_URL}/detect/image",
            headers={"X-API-Key": AI_SERVICE_API_KEY},
            files={"file": (filename, file_bytes, "application/octet-stream")},
        )
        response.raise_for_status()
        return response.json()


async def detect_audio(file_bytes: bytes, filename: str = "audio.mp3") -> Dict[str, Any]:
    async with httpx.AsyncClient(timeout=120) as client:
        response = await client.post(
            f"{AI_SERVICE_URL}/detect/audio",
            headers={"X-API-Key": AI_SERVICE_API_KEY},
            files={"file": (filename, file_bytes, "application/octet-stream")},
        )
        response.raise_for_status()
        return response.json()


async def _call_detector(detector: str, payload: Dict[str, Any]) -> Dict[str, Any]:
    async with httpx.AsyncClient(timeout=60) as client:
        response = await client.post(
            f"{AI_SERVICE_URL}/detect/{detector}",
            headers={"X-API-Key": AI_SERVICE_API_KEY, "Content-Type": "application/json"},
            json=payload,
        )
        response.raise_for_status()
        return response.json()


def map_score_to_level(score: float) -> str:
    if score >= 76:
        return "CRITICAL"
    if score >= 51:
        return "HIGH"
    if score >= 26:
        return "MEDIUM"
    return "LOW"
