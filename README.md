# VeriFin AI

VeriFin AI is an AI-powered phishing detection backend built using FastAPI.

## Features

- Text Phishing Detection
- URL Phishing Detection
- Image OCR + Phishing Detection
- Audio Phishing Detection
- Risk Scoring
- PDF Report Generation
- Scan History

## Tech Stack

- FastAPI
- Transformers
- EasyOCR
- Whisper
- ReportLab

## Installation

```bash
git clone https://github.com/kshitiz374/Verifin_AI.git
cd Verifin_AI

python -m venv venv

source venv/bin/activate

pip install -r requirements.txt
```

## Run

```bash
uvicorn app:app --reload
```

Open:

http://127.0.0.1:8000/docs

## API Endpoints

- POST /text
- POST /url
- POST /image
- POST /audio
- POST /analyze
- GET /history
- GET /report