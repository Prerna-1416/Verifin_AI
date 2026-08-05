# VeriFin AI

AI-powered phishing detection backend built with **FastAPI**, **Transformers**, **EasyOCR**, and **Whisper**. VeriFin AI analyzes text, URLs, images, and audio to detect phishing attempts and generates a detailed risk assessment report.

---

## Features

- Text Phishing Detection (NLP + Rule-based scoring)
- URL Phishing Detection
- Image OCR + Phishing Detection
- Audio Transcription + Phishing Detection
- Combined Risk Analysis
- PDF Report Generation
- Scan History
- Swagger API Documentation

---

## Tech Stack

- FastAPI
- Python
- Transformers
- EasyOCR
- OpenAI Whisper
- ReportLab

---

## Installation

### Clone the Repository

```bash
git clone https://github.com/kshitiz374/Verifin_AI.git
cd Verifin_AI
```

### Create Virtual Environment

#### Windows

```cmd
python -m venv venv
venv\Scripts\activate
```

#### macOS / Linux

```bash
python3 -m venv venv
source venv/bin/activate
```

### Install Dependencies

```bash
pip install -r requirements.txt
```

---

## Run the Backend

```bash
uvicorn app:app --reload
```

Open Swagger UI:

```
http://127.0.0.1:8000/docs
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/text` | Analyze phishing text |
| POST | `/url` | Analyze URL |
| POST | `/image` | Analyze image |
| POST | `/audio` | Analyze audio |
| POST | `/analyze` | Combined analysis |
| GET | `/history` | View scan history |
| GET | `/report` | Download PDF report |

---

## Project Structure

```
Verifin_AI/
│
├── app.py
├── requirements.txt
├── README.md
│
├── models/
├── routes/
├── utils/
├── uploads/
├── reports/
└── history/
```

---

