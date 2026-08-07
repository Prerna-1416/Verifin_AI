// VeriFin Investor Alert popup logic.

const DEFAULT_API = "http://localhost:8001";

const $ = (id) => document.getElementById(id);

async function getApiBase() {
  const stored = await chrome.storage.sync.get("apiBase");
  return (stored.apiBase || DEFAULT_API).replace(/\/+$/, "");
}

function riskTone(score) {
  if (score >= 80) return "critical";
  if (score >= 60) return "high";
  if (score >= 30) return "medium";
  return "low";
}

function composeExplanation(score, threats, detectors) {
  const tMap = {
    "Known Malicious Domain": "domain is a known malicious look-alike",
    "Typo-Squatting": "domain is similar to a legitimate site",
    "Brand Impersonation": "brand impersonation detected",
    "Suspicious TLD": "unusual top-level domain",
    "URL Shortener": "uses a URL shortener",
    "SSL Verification Failed": "invalid SSL certificate",
    "IP Address URL": "uses a raw IP address",
    "Sensitive Information Request": "message asks for sensitive personal data",
    "Urgency Manipulation": "urgency/panic pressure tactics",
    "Suspicious Content Patterns": "known scam language patterns",
    "Suspicious Links": "contains suspicious links",
    "Phishing": "possible phishing attempt",
  };
  const parts = [];
  for (const t of threats || []) {
    if (tMap[t]) parts.push(tMap[t]);
  }
  for (const d of detectors || []) {
    if (d.status === "flagged" && d.detail && parts.length < 4 && !parts.includes(d.detail)) {
      parts.push(d.detail);
    }
  }
  if (!parts.length) return "No threats detected.";
  return parts.slice(0, 4).join("; ") + ".";
}

async function scan(kind, content) {
  const base = await getApiBase();
  let payload;
  let url;
  if (kind === "url") {
    url = `${base}/detect/url`;
    payload = { url: content };
  } else {
    url = `${base}/detect/explain`;
    payload = { text: content };
  }
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

function render(data, kind) {
  const score = Number(data.score || 0);
  const threats = data.threats || [];
  const detectors = data.detectors || [];
  const explanation =
    data.explanation || composeExplanation(score, threats, detectors);
  const level = data.risk_level || (score >= 80 ? "Critical" : score >= 60 ? "High" : score >= 30 ? "Medium" : "Low");

  $("result").hidden = false;
  $("score").textContent = `Risk ${score.toFixed(0)}%`;
  $("score").className = "score " + riskTone(score);
  $("level").textContent = level;
  $("level").className = "level " + riskTone(score);
  $("explanation").textContent = explanation;

  $("threats").innerHTML = "";
  for (const t of threats.slice(0, 6)) {
    const li = document.createElement("li");
    li.textContent = t;
    $("threats").appendChild(li);
  }
  if (!threats.length) {
    const li = document.createElement("li");
    li.textContent = "No known threat patterns.";
    $("threats").appendChild(li);
  }
}

async function main() {
  const base = await getApiBase();
  $("apiBase").value = base;

  $("scanBtn").addEventListener("click", async () => {
    const kind = document.querySelector('input[name="kind"]:checked').value;
    const content = $("input").value.trim();
    if (!content) {
      $("hint").textContent = "Paste a message or URL first.";
      return;
    }
    $("hint").textContent = "Scanning…";
    $("scanBtn").disabled = true;
    try {
      const data = await scan(kind, content);
      render(data, kind);
      $("hint").textContent = "";
    } catch (err) {
      $("hint").textContent = `Scan failed (${err.message}). Is the AI service on ${base} running?`;
    } finally {
      $("scanBtn").disabled = false;
    }
  });

  $("save").addEventListener("click", () => {
    chrome.storage.sync.set({ apiBase: $("apiBase").value.trim() }, () => {
      $("hint").textContent = "Saved.";
    });
  });
}

main();