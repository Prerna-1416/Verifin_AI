import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI, File, Form, HTTPException, UploadFile, Depends, Header, Query, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse
from pydantic import BaseModel, Field
from typing import Optional, Any, Dict

from app.detectors.text_detector import detect_text as run_text_detector
from app.detectors.url_detector import detect_url as run_url_detector
from app.detectors.image_detector import detect_image as run_image_detector
from app.detectors.audio_detector import detect_audio as run_audio_detector
from app.agents import config as agent_config
from app.agents import orchestrator
from app.explainer import plain_language, risk_label
from app.bot import whatsapp as whatsapp_bot
from app.privacy.pii import redact_pii, privacy_report
from app.ml.ensemble import ensemble_text
from app.ml.classifier import model_card as ml_model_card

API_KEY = "verifin-ai-service-key"

_agent_task: Optional[asyncio.Task] = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global _agent_task
    if agent_config.AGENT_ENABLED:
        _agent_task = asyncio.create_task(orchestrator.background_loop())
    yield
    if _agent_task:
        _agent_task.cancel()
        try:
            await _agent_task
        except asyncio.CancelledError:
            pass


class TextRequest(BaseModel):
    text: str = Field(..., min_length=10)


class URLRequest(BaseModel):
    url: str = Field(..., min_length=5)


app = FastAPI(
    title="VeriFin AI Detection Service",
    version="1.0.0",
    description="AI detection service for text, URL, image, and audio scam analysis",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


def verify_api_key(x_api_key: Optional[str] = Header(None)):
    if x_api_key != API_KEY:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid API key")
    return True


@app.get("/health")
async def health():
    return {"status": "healthy", "service": "verifin-ai-detection"}


@app.post("/detect/text")
async def detect_text(req: TextRequest):
    # Privacy Shield: redact PII first, then analyze the redacted text only.
    red = redact_pii(req.text)
    result = run_text_detector(red["redacted_text"])
    result["risk_level"] = risk_label(result["score"])
    result["privacy"] = privacy_report(len(req.text), red["redacted_text"], red["found"])
    result["ensemble"] = ensemble_text(result, red["redacted_text"])
    result["input_redacted"] = red["redacted_text"]
    return {"success": True, **result}


@app.post("/detect/url")
async def detect_url(req: URLRequest):
    result = run_url_detector(req.url)
    return {"success": True, **result}


@app.post("/detect/image")
async def detect_image(file: UploadFile = File(...)):
    data = await file.read()
    result = run_image_detector(data)
    return {"success": True, **result}


@app.post("/detect/audio")
async def detect_audio(file: UploadFile = File(...)):
    data = await file.read()
    result = run_audio_detector(data)
    return {"success": True, **result}


@app.get("/detect/version")
async def version():
    return {"version": "1.0.0", "detectors": ["text", "url", "image", "audio"]}


@app.get("/agents/status")
async def agents_status():
    """Current threat-hunter agent state (enabled, last run, rules version)."""
    return {"success": True, "data": orchestrator.last_status()}


@app.post("/agents/run")
async def agents_run(_: bool = Depends(verify_api_key)):
    """Trigger a hunt now (protected). Returns the publish summary."""
    summary = await orchestrator.run_agents_once(trigger="manual")
    return {"success": True, "data": summary}


@app.post("/detect/explain")
async def detect_explain(req: TextRequest):
    """Scan text and return a plain-language explanation (used by the extension)."""
    red = redact_pii(req.text)
    result = run_text_detector(red["redacted_text"])
    ensemble = ensemble_text(result, red["redacted_text"])
    result["ensemble"] = ensemble
    # Lead with the ensemble verdict so the popup shows the full AI signal,
    # not just the heuristics — the ML confidence is the interesting number.
    result["score"] = ensemble["score"]
    result["risk_level"] = ensemble["risk_level"]
    result["explanation"] = ensemble["explanation"]
    result["privacy"] = privacy_report(len(req.text), red["redacted_text"], red["found"])
    result["input_redacted"] = red["redacted_text"]
    return {"success": True, **result}


@app.post("/privacy/redact")
async def privacy_redact(req: TextRequest):
    """Redact PII locally and return the sanitized text (used by the demo UI)."""
    red = redact_pii(req.text)
    return {
        "success": True,
        "data": {
            "redacted_text": red["redacted_text"],
            "found": red["found"],
            "total_redacted": red["total_redacted"],
            "processed_locally": True,
            "retention": "none",
        },
    }


@app.get("/privacy/policy")
async def privacy_policy():
    """DPDP Act–aligned data-handling policy (compliance statement)."""
    return {
        "success": True,
        "data": {
            "act": "Digital Personal Data Protection (DPDP) Act, 2023 — aligned by design",
            "principles": {
                "purpose_limitation": "Input is analyzed only for fraud detection; no secondary use.",
                "data_minimisation": "PII (PAN, Aadhaar, UPI, OTP, phone, email) is redacted before analysis.",
                "local_processing": "All detection and ML inference runs locally in-process; no public cloud model calls.",
                "no_retention": "Scan inputs are not persisted by the detection service.",
                "transparency": "Every scan returns a privacy report listing what was redacted.",
            },
            "pii_redacted_types": ["PAN", "Aadhaar", "UPI ID", "OTP", "Mobile", "Email", "Bank Account", "Card", "DOB"],
            "training_data": "ML model trained on a synthetic, deterministic corpus with zero real PII.",
            "storage": "none",
            "third_parties": "none (inference is local; Resend emailing is opt-in via env vars only for regulator alerts)",
        },
    }


@app.get("/model/info")
async def model_info():
    """Model card: metrics, training data provenance, feature importance."""
    card = ml_model_card()
    return {"success": True, "data": card}


@app.post("/bot/whatsapp/analyze")
async def whatsapp_analyze(
    file: Optional[UploadFile] = File(None),
    text: Optional[str] = Form(None),
    _: bool = Depends(verify_api_key),
):
    """Analyze a WhatsApp export (.txt upload) or raw pasted conversation."""
    if text:
        return {"success": True, "data": whatsapp_bot.analyze_export(text)}
    if file:
        content = (await file.read()).decode("utf-8", errors="replace")
        return {"success": True, "data": whatsapp_bot.analyze_export(content)}
    raise HTTPException(status_code=400, detail="Provide 'text' or upload a .txt file")


@app.get("/bot/whatsapp/webhook")
async def whatsapp_webhook_verify(
    hub_mode: Optional[str] = Query(None, alias="hub.mode"),
    hub_token: Optional[str] = Query(None, alias="hub.verify_token"),
    hub_challenge: Optional[str] = Query(None, alias="hub.challenge"),
):
    """WhatsApp Graph API webhook verification handshake."""
    if hub_mode == "subscribe" and whatsapp_bot.verify_webhook_token(hub_token or ""):
        return PlainTextResponse(hub_challenge or "")
    raise HTTPException(status_code=403, detail="Verification failed")


@app.post("/bot/whatsapp/webhook")
async def whatsapp_webhook(payload: Dict[str, Any]):
    """Receive inbound WhatsApp messages and reply with risk verdicts."""
    result = await whatsapp_bot.handle_webhook(payload)
    return {"success": True, "data": result}


@app.get("/bot/whatsapp/status")
async def whatsapp_status():
    enabled = whatsapp_bot.whatsapp_enabled()
    return {
        "success": True,
        "data": {
            "enabled": enabled,
            "mode": "live" if enabled else "offline-analyzer-only",
            "hint": "Set WHATSAPP_VERIFY_TOKEN, WHATSAPP_ACCESS_TOKEN, WHATSAPP_PHONE_NUMBER_ID to enable live replies." if not enabled else None,
        },
    }
