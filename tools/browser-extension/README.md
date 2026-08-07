# VeriFin AI — Investor Alert browser extension

A Chrome (Manifest V3) extension that proactively risk-checks messages and links,
returning a live risk score with a plain-language explanation.

## What it does

- **Toolbar popup** — paste a suspicious message or URL and get an instant
  `Risk Score: N%` verdict plus an explanation (e.g.
  *"Risk Score: 91% — domain is a known malicious look-alike; brand impersonation detected"*).
- **Right-click scan** — "Scan link with VeriFin" and "Scan selection with VeriFin"
  open a result page for whatever you selected.

## Install (load unpacked)

1. Open `chrome://extensions` in Chrome.
2. Enable **Developer mode** (top-right).
3. **Load unpacked** → select the `tools/browser-extension/` folder.
4. Pin the extension to the toolbar.

## Pointing it at the API

The extension calls the VeriFin AI service directly (default `http://localhost:8001`).
Start the stack first:

```bash
# ai-service must be running on :8001
cd apps/ai-service && python run.py
```

To use a different host, set it in the popup footer (API field) and click *save*;
it is stored in `chrome.storage.sync`.

> CORS note: the AI service allows all origins, so the extension can call it
> directly from any page. If you instead prefer to go through the web app proxy
> (`http://localhost:3000/api/ai/...`), change the API base and ensure Next.js is running.

## Files

- `manifest.json` — MV3 manifest (contextMenus, storage, host permission for :8001)
- `background.js` — context-menu items and tab opening
- `popup/popup.html|js|css` — toolbar popup scanner
- `popup/scan.html|js` — full-page scan result for context-menu scans
