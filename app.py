from fastapi import FastAPI
from routes.text import router as text_router
from routes.url import router as url_router
from routes.risk import router as risk_router
from routes.image import router as image_router
from routes.analyze import router as analyze_router
from routes.audio import router as audio_router
from fastapi.responses import FileResponse
from routes.history import router as history_router

app = FastAPI(title="VeriFin AI")

@app.get("/report")
def download_report(path: str):
    return FileResponse(
        path=path,
        filename="VeriFin_AI_Report.pdf",
        media_type="application/pdf"
    )

app.include_router(history_router)
app.include_router(text_router)
app.include_router(url_router)
app.include_router(risk_router)
app.include_router(image_router)
app.include_router(audio_router)
app.include_router(analyze_router)

@app.get("/")
def home():
    return {
        "message": "VeriFin AI Backend Running 🚀"
    }