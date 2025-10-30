"""
Utilities to safely coerce LLM output into JSON structures.

The helpers here deliberately avoid third-party dependencies so they can be
reused in other services or swapped out when moving away from OpenAI.
"""
from __future__ import annotations

import json
import logging
import re
from typing import Any, Dict

log = logging.getLogger(__name__)

JSON_PATTERN = re.compile(r"\{.*\}", re.DOTALL)


def extract_json_like(text: str) -> str:
    """Return the first balanced JSON-like substring found in text."""
    match = JSON_PATTERN.search(text or "")
    if not match:
        raise ValueError("No JSON object found in text.")
    return match.group(0)


def parse_or_default(text: str, default: Dict[str, Any]) -> Dict[str, Any]:
    """Attempt to parse JSON, falling back to default on error."""
    try:
        document = extract_json_like(text)
        parsed = json.loads(document)
        if not isinstance(parsed, dict):
            raise ValueError("Parsed payload is not a JSON object.")
        return parsed
    except Exception as exc:
        log.info("JSON coercion fallback triggered: %s", exc)
        return default.copy()
