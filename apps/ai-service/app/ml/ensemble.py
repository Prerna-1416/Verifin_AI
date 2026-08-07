"""Ensemble engine: fuses rule-based detectors with the trained ML classifier.

Produces a single 0-100 risk score plus an interpretable breakdown:
 - ``contributions``: per-signal scores (rule detectors + ML model)
 - ``confidence``: how strongly the signals agree
 - ``model_consensus``: whether ML and rules agree on the verdict
 - ``explanation``: plain-language verdict

This is the "AI depth" story: rules alone are brittle, a single model can be
gamed, but an ensemble with agreement detection is far harder to bypass.
"""

from __future__ import annotations

from typing import Any, Dict, List

from app.ml.classifier import classify as ml_classify
from app.explainer import plain_language, risk_label

# Weights for the ML component vs rule component (base).
_ML_WEIGHT = 0.45
_RULE_WEIGHT = 0.55


def _rule_score(detectors: List[Dict[str, Any]], threats: List[str]) -> float:
    """Infer a 0-100 rule score from the detector list (mirrors detect_text)."""
    raw = 0.0
    weights = {
        "Phishing Pattern Analysis": 0.2,
        "Urgency Detection": 0.2,
        "Personal Information Requests": 0.3,
        "Sender Identity Analysis": 0.1,
        "Brand Impersonation Check": 0.1,
        "Link Analysis": 0.1,
    }
    for d in detectors:
        if d.get("status") == "flagged":
            w = weights.get(d.get("name", ""), 0.1)
            raw += w * 100
    if "Brand Impersonation" in threats and raw < 35:
        raw = 35.0
    return round(min(100, raw), 1)


def ensemble_text(detect_result: Dict[str, Any], text: str) -> Dict[str, Any]:
    """Combine rule detector output with the ML classifier on (redacted) text."""
    detectors = detect_result.get("detectors", [])
    threats = detect_result.get("threats", [])
    rule_score = float(detect_result.get("score", _rule_score(detectors, threats)))

    ml = ml_classify(text)
    ml_score = float(ml["score"])

    # Confidence-aware fusion: trust the ML more when it is highly confident.
    # Base 45/55 split, shifting up to 60/40 toward the confident model.
    ml_conf = float(ml.get("confidence", 0.5))
    ml_weight = min(0.60, _ML_WEIGHT + (ml_conf - 0.5) * 0.6)
    rule_weight = 1.0 - ml_weight
    ensemble = round(rule_weight * rule_score + ml_weight * ml_score, 1)
    ensemble = min(100, ensemble)

    # Confidence = agreement between rule & model verdicts.
    rule_verdict = "malicious" if rule_score >= 50 else "benign"
    ml_verdict = "malicious" if ml_score >= 50 else "benign"
    agree = rule_verdict == ml_verdict
    # More extreme scores -> higher confidence.
    extremity = min(ensemble, 100 - ensemble)
    base_conf = 0.5 + (extremity / 100) * 0.45
    confidence = round(min(0.99, base_conf + (0.15 if agree else 0.0)), 4)

    return {
        "score": ensemble,
        "risk_level": risk_label(ensemble),
        "confidence": confidence,
        "rule_verdict": rule_verdict,
        "ml_verdict": ml_verdict,
        "consensus": "agree" if agree else "disagree",
        "contributions": {
            "rule_engine": {"score": rule_score, "weight": round(rule_weight, 4)},
            "ml_classifier": {"score": ml_score, "weight": round(ml_weight, 4), "probability_scam": ml.get("probability_scam")},
        },
        "explanation": _compose_explanation(ensemble, detect_result, ml, agree),
        "model": "VeriFin Ensemble v1 (rule engines + TF-IDF logistic regression)",
    }


def _compose_explanation(score: float, detect_result: Dict[str, Any], ml: Dict[str, Any], agree: bool) -> str:
    base = plain_language(
        {"score": score, "threats": detect_result.get("threats") or [], "detectors": detect_result.get("detectors") or []}
    )
    consensus = "Both the rule engines and the AI model agree." if agree else "The AI model and rule engines give differing signals."
    return f"{base} ({consensus} ML probability of scam: {ml.get('probability_scam', 0) * 100:.0f}%)"