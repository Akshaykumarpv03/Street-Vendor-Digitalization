"""
utils/extraction.py — extract category, location, and language from a vendor's
free-text input.

In production this calls Granite (via WatsonxClient) with a structured extraction
prompt and parses the JSON it returns.  In mock mode (or if parsing fails) it falls
back to lightweight keyword heuristics so the system is always runnable.
"""
from __future__ import annotations

import json
import logging
import re

logger = logging.getLogger(__name__)

# ── Language keyword map ───────────────────────────────────────────────────────
_LANG_KEYWORDS: dict[str, list[str]] = {
    "hi": ["hindi", "हिन्दी", "हिंदी"],
    "mr": ["marathi", "मराठी"],
    "ta": ["tamil", "தமிழ்"],
    "te": ["telugu", "తెలుగు"],
    "kn": ["kannada", "ಕನ್ನಡ"],
    "ml": ["malayalam", "മലയാളം"],
    "bn": ["bengali", "বাংলা"],
    "gu": ["gujarati", "ગુજરાતી"],
    "pa": ["punjabi", "ਪੰਜਾਬੀ"],
    "ur": ["urdu", "اردو"],
}

# ── Category keyword map ───────────────────────────────────────────────────────
_CATEGORY_KEYWORDS: list[tuple[str, list[str]]] = [
    ("fruit vendor", ["fruit", "fruits", "mango", "banana", "apple", "grapes", "orange"]),
    ("vegetable vendor", ["vegetable", "vegetables", "sabzi", "onion", "tomato", "potato"]),
    ("food stall", ["food", "snacks", "chaat", "vada", "pav", "idli", "dosa", "street food"]),
    ("flower vendor", ["flower", "flowers", "garland", "marigold"]),
    ("tea stall", ["tea", "chai", "coffee"]),
    ("clothing vendor", ["clothes", "clothing", "garment", "fabric", "saree"]),
    ("electronics vendor", ["mobile", "phone", "electronic", "repair"]),
    ("handicraft vendor", ["handicraft", "craft", "handmade", "pottery", "jewelry"]),
    ("fish vendor", ["fish", "seafood", "prawn"]),
    ("grocery vendor", ["grocery", "groceries", "kiryana", "kirana"]),
]


def _heuristic_extract(text: str) -> dict[str, str]:
    """Lightweight fallback extractor using keyword matching."""
    lower = text.lower()

    # Category
    category = "street vendor"
    for cat, kws in _CATEGORY_KEYWORDS:
        if any(kw in lower for kw in kws):
            category = cat
            break

    # Location — look for common Indian city names
    cities = [
        "mumbai", "pune", "delhi", "bangalore", "bengaluru", "hyderabad",
        "chennai", "kolkata", "ahmedabad", "surat", "jaipur", "lucknow",
        "kanpur", "nagpur", "visakhapatnam", "bhopal", "patna", "ludhiana",
        "agra", "nashik", "kochi", "coimbatore", "mysore", "thiruvananthapuram",
    ]
    location = ""
    for city in cities:
        if city in lower:
            location = city.title()
            break
    # Also grab area mentions like "Camp area", "Koramangala", etc.
    area_match = re.search(r"\b([A-Z][a-z]+ (?:area|nagar|puram|ganj|bazar|bazaar|market))\b", text)
    if area_match:
        location = f"{location}, {area_match.group(1)}" if location else area_match.group(1)

    # Language
    language = "en"
    for code, kws in _LANG_KEYWORDS.items():
        if any(kw in lower for kw in kws):
            language = code
            break

    return {"category": category, "location": location, "language": language}


def extract_intent(text: str, client=None) -> dict[str, str]:
    """
    Extract category, location, and language from *text*.

    Parameters
    ----------
    text   : the vendor's raw free-text input
    client : a WatsonxClient instance; if None, falls back to heuristics

    Returns
    -------
    {"category": str, "location": str, "language": str}
    """
    if client is None or getattr(client, "_mock", True):
        return _heuristic_extract(text)

    prompt = f"""You are an intent extraction assistant. Given the vendor's message below, extract:
1. category: the type of business/product the vendor sells (e.g. "fruit vendor", "vegetable vendor")
2. location: the city and area mentioned (e.g. "Pune, Camp area"). Empty string if not mentioned.
3. language: the 2-letter ISO 639-1 code for the language the vendor prefers (default "en").

Respond ONLY with valid JSON — no explanation, no markdown fences.

Vendor message: "{text}"

JSON:"""

    try:
        raw = client.text_generate(prompt, max_new_tokens=120, temperature=0)
        # Strip potential markdown fences
        raw = re.sub(r"```[a-z]*\n?", "", raw).strip()
        data = json.loads(raw)
        return {
            "category": str(data.get("category", "")),
            "location": str(data.get("location", "")),
            "language": str(data.get("language", "en")),
        }
    except (json.JSONDecodeError, Exception) as exc:
        logger.warning("Intent extraction via LLM failed (%s); using heuristics.", exc)
        return _heuristic_extract(text)
