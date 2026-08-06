# VeriFin AI

AI-powered financial fraud detection platform for investors. VeriFin AI detects scams, phishing attempts, and fraudulent communications targeting investors — before they cost you money.

Built for the **SEBI Hackathon 2026**.

## Overview

VeriFin AI is a monorepo (Turborepo + pnpm workspaces) with a Next.js web app, a FastAPI backend, and a dedicated Python AI detection service. It covers 4 portals:

| Portal | Description | Key Pages |
|--------|-------------|-----------|
| **Public** | Marketing & trust-building | Landing, About, Contact, Registry, Threat Feed |
| **Investor** | Scan & verify content | Dashboard, AI Scanner, History, Reports, Verification |
| **Institution** | Sign & distribute official notices | Dashboard, Register Notice, QR Generator, Registry, Reports |
| **Admin** | Monitor & moderate the platform | Dashboard, Threat Feed, Analytics, Flagged Content, Institutions, Users, Settings |

## Features

- **Multi-format AI Scanner** — Scan text, URLs, images, and audio for scams, phishing, and fraud
- **Brand Impersonation Detection** — Typo-squatting detection flags misspelled brands (e.g. `paypall` → PayPal) in messages and sender addresses
- **Risk Scoring Engine** — Transparent 0-100 risk scores with per-detector breakdowns and explanations
- **Cryptographic QR Verification** — Verify official communications via Ed25519-signed QR codes
- **Verified Institution Registry** — Public registry of SEBI-registered financial institutions
- **Real-time Threat Intelligence** — Continuously updated threat feed with IOCs
- **Role-based Authentication** — Investor, Institution, and Admin portals (NextAuth + Prisma on MongoDB)
- **Responsive Design** — Works on mobile and desktop with elegant animations

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| **UI** | shadcn/ui components, Framer Motion, Recharts, Lucide Icons |
| **Backend** | FastAPI (Python), Motor (async MongoDB driver) |
| **Database** | MongoDB (Prisma in web, Motor in API) |
| **AI Service** | Python detectors (text, URL, image, audio) |
| **Crypto** | Ed25519 (PyNaCl), SHA-256 hashing |
| **Monorepo** | Turborepo, pnpm workspaces |
| **Deployment** | Vercel (web), Docker (API + AI service) |

## Architecture

The web app proxies requests to the two Python services through Next.js rewrites:

```
                /api/backend/*                  /detect/*
  Browser ───►  Next.js (3000) ─────────────►  FastAPI (8000) ──────►  AI Service (8001)
                /api/ai/*                                    ▲
                └────────────────────────────────────────────┘
                     (scanner detection calls)
                     │
                     └──► /api/scans  (Next.js API route → Prisma → MongoDB)
```

- The scanner calls the AI service directly through the `/api/ai` rewrite (`/detect/text`, `/detect/url`, `/detect/image`, `/detect/audio`).
- `/api/backend` rewrites to the FastAPI backend (auth, scans, institutions, admin, threats endpoints).
- Scan history is persisted by Next.js API routes (`/api/scans`) through Prisma into MongoDB.

## Project Structure

```
.
├── apps/
│   ├── web/                    # Next.js 14 frontend
│   │   └── src/
│   │       ├── app/            # App Router pages
│   │       │   ├── (public)/   # Landing, About, Contact, Registry, Threats
│   │       │   ├── (auth)/     # Login, Register, Forgot Password
│   │       │   ├── investor/   # Investor portal (dashboard, scanner, history)
│   │       │   ├── institution/# Institution portal
│   │       │   ├── admin/      # Admin portal
│   │       │   └── api/        # Next.js API routes (scans, auth, admin, registry)
│   │       ├── components/     # UI, layout, forms, charts
│   │       ├── lib/            # API client, auth, utils
│   │       └── prisma/         # MongoDB schema (for reference)
│   ├── api/                    # FastAPI backend
│   │   └── app/
│   │       ├── api/v1/         # REST endpoints (auth, scans, institutions, admin)
│   │       ├── core/           # Config, security, database
│   │       ├── schemas/        # Pydantic schemas
│   │       └── services/       # QR, AI integration
│   └── ai-service/             # AI detection microservice
│       └── app/detectors/      # Text, URL, Image, Audio detectors
├── docker-compose.yml          # Local dev stack (MongoDB, Redis, API, AI)
├── pnpm-workspace.yaml         # Workspace config
└── turbo.json                  # Turborepo config
```

## Getting Started

### Prerequisites

- Node.js 20+
- Python 3.11+ (3.12 recommended)
- MongoDB (local or Atlas)
- pnpm

### 1. Install dependencies

```bash
pnpm install
```

### 2. Set up environment variables

```bash
cp .env.example .env
# Update DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL, API_URL, AI_SERVICE_URL, etc.
```

### 3. Start MongoDB

Option A — Docker:

```bash
docker-compose up mongodb        # http://localhost:27017
```

Option B — local `mongod` (used in this repo's dev setup):

```bash
mongod --replSet rs0 --port 27018 --dbpath <data-dir>
# DATABASE_URL="mongodb://localhost:27018/verifin_ai?replicaSet=rs0"
```

### 4. Start the backend API

```bash
cd apps/api
python -m venv venv
venv\Scripts\activate           # Windows: venv\Scripts\activate
pip install -r requirements.txt
python run.py                   # http://localhost:8000  (interactive docs at /docs)
```

### 5. Start the AI service

```bash
cd apps/ai-service
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python run.py                   # http://localhost:8001  (/health)
```

> **Windows note:** the image detector uses `pyzbar`/`libzbar`. If `import pyzbar` fails, copy `libzbar-64.dll`, `libiconv.dll`, and `MSVCR120.dll` into `venv\Lib\site-packages\pyzbar\` (or install the Visual C++ 2013 redistributable).

### 6. Start the web app

```bash
pnpm dev                        # http://localhost:3000
```

For a production-style local run:

```bash
cd apps/web
pnpm exec next build
pnpm exec next start            # serves the optimized bundle on http://localhost:3000
```

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Investor | `test@verifin.ai` | `TestPass123` |
| Institution | `inst@verifin.ai` | `TestPass123` |
| Admin | `admin@verifin.ai` | `AdminPass123` |

## Demo Flow

1. **Upload suspicious content** — Text, URL, image, or audio
2. **AI scans content** — Runs the detection engines (text/URL/image/audio)
3. **Risk score generated** — Transparent 0-100 score with threat level
4. **Reasons displayed** — Per-detector breakdowns with explanations
5. **Verify official QR** — Cryptographic verification against institution keys
6. **Dashboard updates** — Scan history tracked via `/api/scans`

Try it: paste `From: security-alert@paypall-support.com` into the text scanner — the typo-squatting detector flags it as **Brand Impersonation** (paypall → PayPal).

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

The AI service exposes detection endpoints at `/detect/text`, `/detect/url`, `/detect/image`, and `/detect/audio`. Full interactive backend docs at `http://localhost:8000/docs`.

## AI Detection Engines

| Detector | Methods | Outputs |
|----------|---------|---------|
| **Text** | Phishing keyword patterns, urgency analysis, personal-info request detection, sender analysis, brand impersonation (typo-squatting via Levenshtein) | Score, threats, explanations |
| **URL** | Typo-squatting (Levenshtein), TLD analysis, SSL verification, redirect detection, IP detection | Score, threats, domain info |
| **Image** | Error Level Analysis (ELA) tampering, QR extraction, logo detection | Score, threats, QR payload |
| **Audio** | Transcription, scam script analysis, claim verification, urgency tactics | Score, threats, transcript preview |

## Roadmap

- PDF evidence report generation for scans
- ASR (Whisper) integration for real audio transcription
- ML-based text classifier to complement heuristics

## License

This project is for the SEBI Hackathon 2026.
