// VeriFin scan result page (used by the right-click context menu).

const $ = (id) => document.getElementById(id);

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
  for (const t of threats || []) if (tMap[t]) parts.push(tMap[t]);
  for (const d of detectors || []) {
    if (d.status === "flagged" && d.detail && parts.length < 4 && !parts.includes(d.detail)) parts.push(d.detail);
  }
  return parts.length ? parts.slice(0, 4).join("; ") + "." : "No threats detected.";
}

function riskTone(score) {
  return score >= 80 ? "critical" : score >= 60 ? "high" : score >= 30 ? "medium" : "low";
}

function render(data) {
  const score = Number(data.score || 0);
  const threats = data.threats || [];
  const detectors = data.detectors || [];
  const explanation = data.explanation || composeExplanation(score, threats, detectors);
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
  const params = new URLSearchParams(location.search);
  const type = params.get("type") === "url" ? "url" : "text";
  const target = params.get("target") || "";
  $("raw").textContent = `${type.toUpperCase()}: ${target}`;

  const stored = await chrome.storage.sync.get("apiBase");
  const base = (stored.apiBase || "http://localhost:8001").replace(/\/+$/, "");

  try {
    const endpoint = type === "url" ? "/detect/url" : "/detect/explain";
    const payload = type === "url" ? { url: target } : { text: target };
    const res = await fetch(base + endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`API ${res.status}`);
    const data = await res.json();
    render(data);
    $("hint").textContent = "";
  } catch (err) {
    $("hint").textContent = `Scan failed (${err.message}). Is the AI service on ${base} running?`;
  }
}

main();