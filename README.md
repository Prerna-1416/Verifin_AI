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
- **Privacy Shield (DPDP)** — PII (PAN, Aadhaar, UPI ID, OTP, mobile, email, bank account, card, DOB) is **redacted locally before any analysis**, so personal data never reaches the detection or ML models. Every scan returns a privacy report; the service persists nothing and only processes locally
- **Ensemble AI Classification** — A locally trained TF-IDF + Logistic Regression classifier fuses with the rule engines (confidence-aware weighting) to produce the final risk score, with a consensus breakdown and plain-language explanation. Full model card served at `/model/info`
- **Cryptographic QR Verification** — Verify official communications via Ed25519-signed QR codes
- **Verified Institution Registry** — Public registry of SEBI-registered financial institutions
- **Real-time Threat Intelligence** — Continuously updated threat feed with IOCs
- **Agentic Threat Hunter** — Autonomous agents crawl CT logs, phishing feeds, and RDAP whois to discover newly-registered look-alike domains impersonating SEBI / RBI / NSE / BSE / brokers. Confirmed findings auto-update the detection rules, populate the threat feed, and raise **Regulator Alerts** for review and automated email notification
- **WhatsApp Scam Scanner** — Paste an exported WhatsApp chat and every message gets a per-message risk score, threat list, and plain-language explanation (with an optional live Business Cloud API webhook mode)
- **Browser Extension** — Manifest V3 extension that risk-scans any selected text or right-clicked link with a live `Risk Score: N%` popup
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
| **ML** | scikit-learn (TF-IDF + Logistic Regression), joblib-persisted model |
| **Privacy** | Local PII redaction engine (PAN, Aadhaar, UPI, OTP, mobile, email, etc.) |
| **Crypto** | Ed25519 (PyNaCl), SHA-256 hashing |
| **Monorepo** | Turborepo, pnpm workspaces |
| **Deployment** | Vercel (web), Docker (API + AI service) |

## Architecture

The web app proxies requests to the two Python services through Next.js rewrites and dedicated server-side proxy routes:

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
- `/api/proxy/*` are thin server-side routes (no browser secrets) that forward UI requests to the AI service: `/api/proxy/agents/status`, `/api/proxy/agents/run`, `/api/proxy/whatsapp`, `/api/proxy/privacy/policy`, `/api/proxy/privacy/redact`, `/api/proxy/model/info`.
- Scan history is persisted by Next.js API routes (`/api/scans`) through Prisma into MongoDB.

### Detection pipeline (text)

```
  input text
      │
      ▼
  Privacy Shield ──► PII redacted (PAN, Aadhaar, OTP, mobile, email, ...)
      │                  ▲ nothing personal is stored or sent to models
      ▼
  Rule engines ──► phishing, urgency, personal-info request, sender identity, brand impersonation
      │
      ▼
  ML classifier ──► TF-IDF + Logistic Regression (confidence-aware ensemble fusion)
      │
      ▼
  risk score (0-100) + threat list + explanations + privacy report
```

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
│   │       │   ├── admin/      # Admin portal (+ Regulator Alerts)
│   │       │   ├── whatsapp/   # WhatsApp chat analyzer UI
│   │       │   ├── threat-hunter/ # Agent status + manual hunt UI
│   │       │   ├── privacy/    # Privacy Shield (DPDP) demo page
│   │       │   ├── extension/  # Browser extension install guide
│   │       │   └── api/        # Next.js API routes (scans, auth, admin, proxy, internal)
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
│       └── app/
│           ├── detectors/      # Text, URL, Image, Audio detectors
│           ├── agents/         # Agentic threat-hunter (domain watch, social monitor, publisher)
│           ├── bot/            # WhatsApp scam analyzer
│           ├── privacy/        # PII redaction + DPDP privacy report
│           ├── ml/             # Synthetic corpus, classifier, ensemble fusion, model card
│           ├── rules/          # Financial brand list + auto-updated look-alike domains
│           └── explainer.py    # Plain-language explanations & risk labels
└── tools/
    └── browser-extension/      # Manifest V3 Chrome extension
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

Option B — local `mongod` (used in this repo's dev setup; a plain standalone is fine):

```bash
mongod --port 27018 --dbpath <data-dir>
# DATABASE_URL="mongodb://localhost:27018/verifin_ai"
```

> **Never share your local MongoDB data folder between machines.** The demo accounts
> live in the local DB, so a fresh machine gets an empty database until you seed it (next step).

### 3b. Seed demo users (required on a fresh machine)

A brand-new checkout has an empty database, so sign-in has no users and appears to do nothing. Create
the demo accounts (idempotent — safe to re-run):

```bash
cd apps/web
node scripts/seed.mjs            # creates test@ / inst@ / admin@ (see Demo Accounts)
```

To reset to empty, just point `DATABASE_URL` at a fresh Mongo data dir.

### 4. Start the backend API

> **Windows note:** use Python 3.12 for the API and AI-service venvs. The pre-installed
> Python 3.14 builds a broken `pydantic_core`, so pin 3.12 explicitly:
> `py -3.12 -m venv venv`.

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

> **ML model:** the classifier trains itself on a synthetic, PII-free corpus on first
> startup and persists to `app/ml/artifacts/scam_classifier.joblib` (git-ignored). Delete
> that file to retrain with updated corpus data.
>
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

1. **Upload suspicious content** — paste text, enter a URL, or upload an image or audio file
2. **Privacy Shield** — any PII pasted in is redacted locally first
3. **AI scans content** — rule engines + the ML classifier run in an ensemble
4. **Risk score generated** — Transparent 0-100 score with threat level and consensus breakdown
5. **Reasons displayed** — Per-detector breakdowns with plain-language explanations
6. **Verify official QR** — Cryptographic verification against institution keys
7. **Dashboard updates** — Scan history tracked via `/api/scans`

Try it: paste `From: security-alert@paypall-support.com` into the text scanner — the typo-squatting detector flags it as **Brand Impersonation** (paypall → PayPal).

Or open these pages directly:
- **`/investor/scanner`** — multi-format scanner with ensemble + privacy shield UI
- **`/whatsapp`** — paste a WhatsApp chat, every message is risk-scored
- **`/threat-hunter`** — agent status and a "Run Hunt Now" trigger
- **`/privacy`** — live PII redaction demo + DPDP policy + model card
- **`/extension`** — how to install the Chrome extension

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

The AI service exposes the endpoints below. Detection endpoints (`/detect/*` and `/privacy/*`) are unauthenticated; management endpoints (`/agents/run`, `/bot/whatsapp/analyze`) require `X-API-Key`. Full interactive docs at `http://localhost:8001/docs`.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/detect/text` | Scan text — returns score, threats, explanations, **privacy report**, **ensemble verdict** |
| POST | `/detect/url` | Scan URL (typo-squat, TLD, SSL, redirect, IP) |
| POST | `/detect/image` | Scan image (ELA tampering, QR, logo) |
| POST | `/detect/audio` | Scan audio (transcription, urgency, claims) |
| POST | `/detect/explain` | Text scan + plain-language explanation (used by the extension) |
| POST | `/privacy/redact` | Redact PII locally; returns sanitized text + counts |
| GET | `/privacy/policy` | DPDP Act–aligned data-handling policy |
| GET | `/model/info` | Model card: metrics, provenance, feature importance |
| GET | `/agents/status` | Threat-hunter agent state (enabled, last run, rules version) |
| POST | `/agents/run` | Trigger a manual hunt **now** (protected) |
| POST | `/bot/whatsapp/analyze` | Analyze a WhatsApp chat export (protected) |
| GET/POST | `/bot/whatsapp/webhook` | WhatsApp Business Cloud API webhook (optional) |
| GET | `/bot/whatsapp/status` | Which bot mode is active |

## AI Detection Engines

| Detector | Methods | Outputs |
|----------|---------|---------|
| **Text** | Phishing keyword patterns, urgency analysis, personal-info request detection, sender analysis, brand impersonation (typo-squatting via Levenshtein) | Score, threats, explanations |
| **URL** | Typo-squatting (Levenshtein), TLD analysis, SSL verification, redirect detection, IP detection | Score, threats, domain info |
| **Image** | Error Level Analysis (ELA) tampering, QR extraction, logo detection | Score, threats, QR payload |
| **Audio** | Transcription, scam script analysis, claim verification, urgency tactics | Score, threats, transcript preview |

## Privacy Shield (DPDP Act, 2023)

Designed for the SEBI track's data-privacy angle — detection that never sees your personal data.

- **Local PII redaction** (`apps/ai-service/app/privacy/pii.py`) — PAN, Aadhaar, UPI ID, OTP/PIN, mobile (+91), email, bank account, card, and DOB are matched and masked (e.g. `ABCDE1234F` → `[REDACTED]`, `9876543210` → `M****3210`) **before** any detector or model runs.
- **Privacy report per scan** — every `/detect/text` and `/detect/explain` response includes a `privacy` block: what PII types were found, count, `pii_removed_ratio`, `processed_locally: true`, `data_retention: "none"`, `dpdp_compliant: true`, plus the exact redacted input.
- **DPDP principles** — purpose limitation, data minimisation, local processing, no retention, transparency (each scan discloses what was redacted). See `GET /privacy/policy`.
- **Synthetic training data** — the ML model trains on a deterministic, PII-free corpus (`app/ml/corpus.py`), so no real-world user data ever enters training.
- **UI** — `/privacy` page shows a live redaction demo, the policy grid, and the model card.

## Ensemble ML Classification

A local scikit-learn classifier complements the heuristic detectors:

- **Model** — TF-IDF (1-2 n-grams) → Logistic Regression (`class_weight=balanced`, `C=2.0`), persisted to `app/ml/artifacts/scam_classifier.joblib`.
- **Training data** — deterministic synthetic corpus (`app/ml/corpus.py`) with Indian banks, brokers, and regulators (SEBI / RBI / NSDL / CDSL), scam + legit templates, and adversarial near-miss cases. No PII, no network calls.
- **Honest evaluation** — metrics are reported on a held-out split plus 5-fold cross-validation, with the never-gamed adversarial near-miss set benchmarked separately (`adversarial_accuracy`, `adversarial_f1`) so nothing looks artificially perfect.
- **Ensemble fusion** (`app/ml/ensemble.py`) — the rule-engine score and the ML probability are combined with **confidence-aware weights** (the ML vote grows to at most 60% when it is confident). The response includes `rule_verdict`, `ml_verdict`, `consensus` (agree/disagree), and per-model contributions.
- **Model card** — `GET /model/info` returns algorithm, sample counts, metrics, and top feature-importance terms per class. Surfaced on the `/privacy` page.

## Agentic Threat Hunter

Autonomous agents run inside the AI service (`apps/ai-service/app/agents/`) and publish to the web app:

```
agents (ai-service:8001)                     web (Next.js:3000)
┌─────────────────────────────────┐          ┌────────────────────────────────┐
│ DomainWatchAgent                │          │ POST /api/internal/agents/publish │
│   CT logs (crt.sh)             │ ──findings──► ThreatFeed (public feed)      │
│   phishing feeds (OpenPhish)   │          │   + RegulatorAlert (SEBI/RBI)   │
│   RDAP whois (registration age)│          │   + Resend email (if key set)   │
│   demo feed (offline fallback) │          │ Admin console: /admin/alerts    │
│ SocialMonitorAgent             │          └────────────────────────────────┘
│   text/url detectors on messages│
└─────────────────────────────────┘
```

- **Auto-updating rules** — agents persist confirmed look-alike domains to
  `apps/ai-service/app/rules/suspicious_lookalikes.json`. The URL/text detectors hot-reload
  that file, so a domain discovered by an agent is flagged by `/detect/url` immediately
  (e.g. `zerodhna.com` → "Known Malicious Domain", score 100).
- **Regulator alerts** — HIGH/CRITICAL impersonation creates a `RegulatorAlert` record.
  Review in **Admin → Regulator Alerts**. When `RESEND_API_KEY` is configured, a plain-language
  email is sent to `REGULATOR_EMAIL` automatically.
- **Control** — `AGENT_ENABLED` (default on), `AGENT_INTERVAL_SECONDS` (default 600), `AGENT_DEMO`
  (deterministic offline feed). Manually trigger a hunt: `POST /agents/run` with `X-API-Key`; status: `GET /agents/status`.
- **Web env**: `AGENT_INTERNAL_KEY` must match the key the agents send in `X-Agent-Key`.

## Investor Alert Layer

Proactive risk alerts on the messages and links investors actually encounter, using the same
detector engine as the scanner.

- **Browser extension** (`tools/browser-extension/`) — Manifest V3. Paste a message/URL in the
  popup, or right-click a link / selection and choose "Scan with VeriFin". It calls the AI service
  (`http://localhost:8001`) and shows a live `Risk Score: N%` with a plain-language explanation
  (e.g. *"Risk Score: 91% — domain is a known malicious look-alike; brand impersonation detected"*).
  Load unpacked from `chrome://extensions`; set the API base in the popup footer if the AI service
  runs elsewhere.
- **WhatsApp bot** (`apps/ai-service/app/bot/whatsapp.py`, endpoints `/bot/whatsapp/*`):
  - *Offline export analyzer* — `POST /bot/whatsapp/analyze` (`?text=` or a `.txt` upload) parses
    an exported chat and returns per-message `risk_score`, `risk_level`, `threats` and a
    plain-language `explanation`. No credentials needed.
  - *Live Business Cloud API* — `GET|POST /bot/whatsapp/webhook` verifies and receives inbound
    messages and auto-replies with the risk verdict. Enabled by setting
    `WHATSAPP_VERIFY_TOKEN`, `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`.
    `GET /bot/whatsapp/status` shows which mode is active (requests are never silently dropped; if
    undeployed it reports `offline-analyzer-only`).

## Roadmap

- PDF evidence report generation for scans
- ASR (Whisper) integration for real audio transcription
- DistilBERT fine-tune to upgrade the TF-IDF classifier
- Live social/messaging monitoring dashboards (WebSocket feed)

## License

This project is for the SEBI Hackathon 2026.
