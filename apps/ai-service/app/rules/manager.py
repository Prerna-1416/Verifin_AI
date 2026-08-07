"""Auto-updating detection rules.

Rules are plain JSON files under ``app/rules/``. Detectors load them lazily and
re-read whenever the file mtime changes, so when a hunting agent discovers a new
look-alike domain it can be enforced immediately without a restart.

Layout
------
- ``financial_brands.json``  protected brands (SEBI/NSE/BSE/brokers) with their
  official domains and aliases (this is the canonical brand list).
- ``suspicious_lookalikes.json``  domains observed impersonating the brands.

All paths in this module are resolved relative to the rules directory so the
code works both from the repo and inside a container.
"""

from __future__ import annotations

import json
import os
import threading
from typing import Any, Dict, List, Optional

_RULES_DIR = os.path.dirname(os.path.abspath(__file__))
BRANDS_FILE = os.path.join(_RULES_DIR, "financial_brands.json")
LOOKALIKES_FILE = os.path.join(_RULES_DIR, "suspicious_lookalikes.json")

_lock = threading.Lock()
_cache: Dict[str, Any] = {}  # path -> (mtime, value)


def _load_json(path: str, default: Any) -> Any:
    try:
        mtime = os.path.getmtime(path)
    except OSError:
        return default
    with _lock:
        cached = _cache.get(path)
        if cached and cached[0] == mtime:
            return cached[1]
    try:
        with open(path, "r", encoding="utf-8") as fh:
            data = json.load(fh)
    except (OSError, json.JSONDecodeError):
        data = default
        mtime = -1
    with _lock:
        _cache[path] = (mtime, data)
    return data


def _save_json(path: str, data: Any) -> None:
    with _lock:
        with open(path, "w", encoding="utf-8") as fh:
            json.dump(data, fh, ensure_ascii=False, indent=2)
        _cache[path] = (os.path.getmtime(path), data)


def _touch(value: str) -> str:
    try:
        from datetime import datetime, timezone
        return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    except Exception:
        return value


# --------------------------------------------------------------------------- #
# Brands
# --------------------------------------------------------------------------- #
def get_brands() -> List[Dict[str, Any]]:
    """All protected brands with their official domains and aliases."""
    return _load_json(BRANDS_FILE, {"brands": []}).get("brands", [])


def brand_aliases() -> List[str]:
    """Flattened aliases (brand short-names) used for text impersonation checks."""
    aliases = []
    for b in get_brands():
        aliases.append(b.get("name", "").lower())
        aliases.extend(a.lower() for a in b.get("aliases", []))
    return [a for a in aliases if a]


def brand_domains() -> List[str]:
    """Flattened official domains used for typo-squatting comparison."""
    domains = []
    for b in get_brands():
        domains.extend(b.get("domains", []))
    return [d.strip().lower() for d in domains if d.strip()]


# --------------------------------------------------------------------------- #
# Look-alike (malicious) domains
# --------------------------------------------------------------------------- #
def get_lookalikes() -> List[str]:
    return [d.lower() for d in _load_json(LOOKALIKES_FILE, {"domains": []}).get("domains", [])]


def add_lookalike(domain: str) -> bool:
    """Persist a discovered malicious look-alike domain. Returns True if new."""
    domain = domain.strip().lower()
    if not domain:
        return False
    data = _load_json(LOOKALIKES_FILE, {"domains": []})
    existing = set(d.lower() for d in data.get("domains", []))
    if domain in existing:
        return False
    data["domains"].append(domain)
    data["updatedAt"] = _touch(data.get("updatedAt"))
    _save_json(LOOKALIKES_FILE, data)
    return True


def is_known_lookalike(domain: str) -> bool:
    return domain.lower() in set(get_lookalikes())


def rules_updated_at() -> Optional[str]:
    data = _load_json(LOOKALIKES_FILE, {"updatedAt": None})
    return data.get("updatedAt")