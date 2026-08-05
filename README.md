# VeriFin AI

AI-powered financial fraud detection platform for investors. VeriFin AI uses advanced artificial intelligence to detect scams, phishing attempts, and fraudulent communications targeting investors — before they cost you money.

Built for the **SEBI Hackathon 2026**.

## Overview

VeriFin AI is a responsive Next.js web application with role-based routing covering 4 portals:

| Portal | Description | Key Pages |
|--------|-------------|-----------|
| **Public** | Marketing & trust-building | Landing, About, Contact, Registry, Threat Feed |
| **Investor** | Scan & verify content | Dashboard, AI Scanner, Scan Results, History, Reports, Verification |
| **Institution** | Sign & distribute official notices | Dashboard, Register Notice, QR Generator, Registry, Reports |
| **Admin** | Monitor & moderate the platform | Dashboard, Threat Feed, Analytics, Flagged Content, Institutions, Users, Settings |

## Features

- **Multi-format AI Scanner** — Scan text, URLs, images, and audio for scams, phishing, and fraud
- **Risk Scoring Engine** — Transparent 0-100 risk scores with per-detector breakdowns and explanations
- **Cryptographic QR Verification** — Verify official communications via Ed25519-signed QR codes
- **Verified Institution Registry** — Public registry of SEBI-registered financial institutions
- **Real-time Threat Intelligence** — Continuously updated threat feed with IOCs
- **Court-ready Evidence Reports** — Downloadable PDF reports for every scan
- **Role-based Authentication** — Investor, Institution, and Admin portals with JWT auth
- **Responsive Design** — Works on mobile and desktop with elegant animations

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| **UI** | shadcn/ui components, Framer Motion, Recharts, Lucide Icons |
| **Backend** | FastAPI (Python), Motor (async MongoDB driver) |
| **Database** | MongoDB |
| **AI Service** | Python detectors (text, URL, image, audio) |
| **Crypto** | Ed25519 (PyNaCl), SHA-256 hashing |
| **Monorepo** | Turborepo, pnpm workspaces |
| **Deployment** | Vercel (web), Docker (API + AI service) |

## Project Structure

```
verifin-ai/
├── apps/
│   ├── web/                  # Next.js 14 frontend
│   │   └── src/
│   │       ├── app/          # App Router pages
│   │       │   ├── (public)/ # Landing, About, Contact, Registry, Threats
│   │       │   ├── (auth)/   # Login, Register, Forgot Password
│   │       │   ├── investor/ # Investor portal
│   │       │   ├── institution/ # Institution portal
│   │       │   └── admin/    # Admin portal
│   │       ├── components/   # UI, layout, forms, charts
│   │       ├── lib/          # API client, auth, utils
│   │       └── prisma/       # MongoDB schema (for reference)
│   ├── api/                  # FastAPI backend
│   │   └── app/
│   │       ├── api/v1/       # REST endpoints (auth, scans, institutions, admin)
│   │       ├── core/         # Config, security, database
│   │       ├── models/       # Beanie ODM models
│   │       ├── schemas/      # Pydantic schemas
│   │       └── services/     # QR, AI integration
│   └── ai-service/           # AI detection microservice
│       └── app/detectors/    # Text, URL, Image, Audio detectors
├── packages/                 # Shared packages
├── docker-compose.yml        # Local dev stack (MongoDB, Redis, API, AI)
└── turbo.json                # Turborepo config
```

## Getting Started

### Prerequisites

- Node.js 20+
- Python 3.11+
- MongoDB (local or Atlas)
- pnpm

### 1. Install dependencies

```bash
pnpm install
```

### 2. Set up environment variables

```bash
cp .env.example .env
# Update DATABASE_URL, NEXTAUTH_SECRET, etc.
```

### 3. Start MongoDB (option A: Docker)

```bash
docker-compose up mongodb
```

### 4. Start the backend API

```bash
cd apps/api
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python run.py  # Starts on http://localhost:8000
```

### 5. Start the AI service

```bash
cd apps/ai-service
pip install -r requirements.txt
python run.py  # Starts on http://localhost:8001
```

### 6. Start the web app

```bash
pnpm dev  # Starts on http://localhost:3000
```

Or run everything with Docker:

```bash
docker-compose up --build
```

## Demo Flow

1. **Upload suspicious content** — Text, URL, image, or audio
2. **AI scans content** — Runs 4 detection engines in parallel
3. **Risk score generated** — Transparent 0-100 score
4. **Reasons displayed** — Per-detector breakdowns with explanations
5. **Verify official QR** — Cryptographic verification against institution keys
6. **Dashboard updates** — Scan history tracked
7. **Download evidence report** — Court-ready PDF

## API Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/v1/auth/register` | Register user | Public |
| POST | `/api/v1/auth/login` | Login | Public |
| GET | `/api/v1/auth/me` | Current user | Auth |
| POST | `/api/v1/scans` | Create scan | Investor |
| POST | `/api/v1/scans/upload` | Upload image/audio | Investor |
| GET | `/api/v1/scans` | List scans | Investor |
| GET | `/api/v1/scans/{id}` | Get scan | Investor |
| POST | `/api/v1/institutions` | Register institution | Institution |
| POST | `/api/v1/institutions/notices` | Register notice | Institution |
| GET | `/api/v1/institutions/registry` | Public registry | Public |
| GET | `/api/v1/public/verify/{qr_id}` | Verify QR | Public |
| GET | `/api/v1/public/threats` | Public threats | Public |
| GET | `/api/v1/admin/dashboard` | Admin stats | Admin |

Full interactive docs at `http://localhost:8000/docs`.

## AI Detection Engines

| Detector | Methods | Outputs |
|----------|---------|---------|
| **Text** | Phishing keyword patterns, urgency analysis, personal-info request detection, sender analysis | Score, threats, explanations |
| **URL** | Typo-squatting (Levenshtein), TLD analysis, SSL verification, redirect detection, IP detection | Score, threats, domain info |
| **Image** | Error Level Analysis (ELA) tampering, QR extraction, logo detection | Score, threats, QR payload |
| **Audio** | Transcription, scam script analysis, claim verification, urgency tactics | Score, threats, transcript preview |

## License

This project is for the SEBI Hackathon 2026.
