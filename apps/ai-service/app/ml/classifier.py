"""Train and serve a local scam classifier (TF-IDF + Logistic Regression).

The model trains entirely on the synthetic, PII-free corpus from
``app.ml.corpus`` — no real data, no cloud calls. The fitted pipeline is
persisted to ``app/ml/artifacts/scam_classifier.joblib`` so the service
starts fast and the model card is stable across restarts.
"""

from __future__ import annotations

import os
import threading
from typing import Any, Dict, List, Optional, Tuple

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report, f1_score, precision_score, recall_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline

try:
    import joblib
except Exception:  # pragma: no cover
    joblib = None

from app.ml.corpus import generate_dataset

ARTIFACT_DIR = os.path.join(os.path.dirname(__file__), "artifacts")
ARTIFACT_PATH = os.path.join(ARTIFACT_DIR, "scam_classifier.joblib")

_lock = threading.Lock()

# Lazy-loaded pipeline.
_pipeline: Optional[Pipeline] = None
_model_card: Dict[str, Any] = {}


def _fit_and_persist() -> Tuple[Pipeline, Dict[str, Any]]:
    """Generate synthetic data, fit, evaluate, persist. Returns (pipeline, card)."""
    messages, labels = generate_dataset(n_scams=600, n_legit=400)

    # Held-out adversarial near-misses (NEVER in training) — hard, honest benchmark.
    adv_messages, adv_labels = _adversarial_holdout()

    X_train, X_test, y_train, y_test = train_test_split(
        messages, labels, test_size=0.25, random_state=42, stratify=labels
    )

    pipeline = Pipeline(
        [
            (
                "tfidf",
                TfidfVectorizer(
                    ngram_range=(1, 2),
                    min_df=1,
                    max_df=0.95,
                    strip_accents="unicode",
                    token_pattern=r"(?u)\b\w[\w%₹]{2,}\b",
                ),
            ),
            (
                "clf",
                LogisticRegression(max_iter=1000, C=2.0, random_state=42, class_weight="balanced"),
            ),
        ]
    )
    pipeline.fit(X_train, y_train)

    # 5-fold cross-validation on the synthetic corpus for a more honest metric.
    from sklearn.model_selection import cross_val_score

    cv_scores = cross_val_score(
        pipeline,
        messages,
        labels,
        cv=5,
        scoring="f1_macro",
    )

    preds = pipeline.predict(X_test)
    classes = list(pipeline.classes_)

    # Hard benchmark: only the never-designed adversarial near-misses.
    adv_preds = pipeline.predict(adv_messages)
    adv_acc = float(accuracy_score(adv_labels, adv_preds))
    adv_f1 = float(f1_score(adv_labels, adv_preds, pos_label="scam", zero_division=0))

    accuracy = float(accuracy_score(y_test, preds))
    precision = float(precision_score(y_test, preds, pos_label="scam", zero_division=0))
    recall = float(recall_score(y_test, preds, pos_label="scam", zero_division=0))
    f1 = float(f1_score(y_test, preds, pos_label="scam", zero_division=0))

    # Feature importance: top log-odds terms per class from the linear model.
    coef = pipeline.named_steps["clf"].coef_[0]
    feature_names = pipeline.named_steps["tfidf"].get_feature_names_out()
    paired = sorted(zip(feature_names, coef), key=lambda kv: kv[1], reverse=True)
    importance = {"scam": [w for w, _ in paired[:25]], "legit": [w for w, _ in sorted(paired, key=lambda kv: kv[1])[:25]]}

    card = {
        "model": "VeriFin ScamClassifier v1",
        "algorithm": "TF-IDF + Logistic Regression",
        "trained_on": "synthetic (deterministic, PII-free)",
        "training_samples": len(X_train),
        "test_samples": len(X_test),
        "synthetic": True,
        "no_pii": True,
        "local_only": True,
        "metrics": {
            "accuracy": round(accuracy, 4),
            "precision_scam": round(precision, 4),
            "recall_scam": round(recall, 4),
            "f1_scam": round(f1, 4),
            "cross_val_f1_macro": round(float(cv_scores.mean()), 4),
            "adversarial_accuracy": round(adv_acc, 4),
            "adversarial_f1": round(adv_f1, 4),
        },
        "classes": classes,
        "evaluation": "Synthetic held-out split + 5-fold CV for training fit; adversarial near-miss benchmark (never in training) reported separately as adversarial_*.",
        "feature_importance_top_scam": importance["scam"],
        "feature_importance_top_legit": importance["legit"],
    }

    if joblib is not None:
        os.makedirs(ARTIFACT_DIR, exist_ok=True)
        joblib.dump({"pipeline": pipeline, "card": card}, ARTIFACT_PATH)
    return pipeline, card


def _adversarial_holdout() -> Tuple[list, list]:
    """Never-gamed over-flag/near-miss cases held out of training as a hard test."""
    pairs = [
        ("Your OTP for HDFC Bank is 448291. Do NOT share it. Never disclose your PIN or password.", "legit"),
        ("A new device logged into your ICICI account. If this was you, no action is needed.", "legit"),
        ("Your password was changed. If this was not you, call support immediately.", "legit"),
        ("Important: update nominee details before your next SIP debit.", "legit"),
        ("Your card has been suspended due to a security breach. Verify at the secure link within 24 hours.", "scam"),
        ("Win a free iPhone every week! Register on this secure form to participate.", "scam"),
        ("Your electricity bill is overdue. Pay immediately via this link to avoid disconnection.", "scam"),
        ("I am from SEBI's investor helpline. We recovered Rs 40,000 for you. Send a small fee to release it.", "scam"),
        ("Your account has been flagged — verify details on the link or profits will be suspended.", "scam"),
    ]
    ms, ls = zip(*pairs)
    return list(ms), list(ls)


def load_or_train() -> Tuple[Pipeline, Dict[str, Any]]:
    global _pipeline, _model_card
    with _lock:
        if _pipeline is not None:
            return _pipeline, _model_card
        if joblib is not None and os.path.exists(ARTIFACT_PATH):
            try:
                data = joblib.load(ARTIFACT_PATH)
                _pipeline = data["pipeline"]
                _model_card = data["card"]
                return _pipeline, _model_card
            except Exception:  # pragma: no cover
                pass
        _pipeline, _model_card = _fit_and_persist()
        return _pipeline, _model_card


def classify(text: str) -> Dict[str, Any]:
    """Return model verdict: label, probability, top contributing terms."""
    pipeline, _ = load_or_train()
    classes = list(pipeline.classes_)
    scam_idx = classes.index("scam") if "scam" in classes else 1
    proba = pipeline.predict_proba([text])[0]
    scam_prob = float(proba[scam_idx])
    pred = pipeline.predict([text])[0]
    return {
        "label": pred,
        "probability_scam": round(scam_prob, 4),
        "score": round(min(100, scam_prob * 100), 1),
        "confidence": round(max(scam_prob, 1 - scam_prob), 4),
    }


def model_card() -> Dict[str, Any]:
    _, card = load_or_train()
    return card