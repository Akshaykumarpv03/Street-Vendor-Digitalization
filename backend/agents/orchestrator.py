"""
agents/orchestrator.py — Orchestrator agent.

Responsibilities:
  1. Extract intent (category / location / language) from the vendor's free text
     using utils/extraction.py.
  2. Delegate to all four specialist agents in parallel (or sequentially if
     concurrency is not available).
  3. Merge their responses into the structured JSON shape defined in README 5.2.
  4. If a non-English language was requested or detected, pass the merged
     English response through the Translation Agent last.
  5. Return the final combined response dict.

The orchestrator does NOT have its own knowledge base or RAG step.
"""
from __future__ import annotations

import logging
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import Any

from utils.extraction import extract_intent
from utils.watsonx_client import watsonx_client

logger = logging.getLogger(__name__)


class Orchestrator:
    def __init__(
        self,
        policy_agent,
        market_agent,
        upi_agent,
        marketing_agent,
        translation_agent,
    ) -> None:
        self._policy = policy_agent
        self._market = market_agent
        self._upi = upi_agent
        self._marketing = marketing_agent
        self._translation = translation_agent

    def run(self, message: str, language: str = "en") -> dict[str, Any]:
        """
        Orchestrate a full vendor query end-to-end.

        Parameters
        ----------
        message  : vendor's free-text input
        language : ISO 639-1 code for preferred response language
                   (may be overridden by language detected in message)

        Returns
        -------
        {
          "category": str,
          "location": str,
          "sections": {
            "policy_scheme": str,
            "market_insights": str,
            "upi_guide": str,
            "marketing": str
          },
          "translated": bool,
          "language": str
        }
        """
        # ── 1. Intent extraction ───────────────────────────────────────────────
        intent = extract_intent(message, client=watsonx_client)
        category = intent.get("category", "street vendor")
        location = intent.get("location", "")
        # Language: explicit param takes precedence; else use extracted
        if language and language != "en":
            detected_lang = language
        else:
            detected_lang = intent.get("language", language or "en")

        context = {"category": category, "location": location, "language": detected_lang}
        logger.info(
            "Orchestrator: category=%s location=%s language=%s",
            category, location, detected_lang,
        )

        # ── 2. Build per-agent queries ─────────────────────────────────────────
        agent_query = (
            f"I am a {category} vendor"
            + (f" based in {location}" if location else "")
            + f". Original request: {message}"
        )

        agent_tasks = {
            "policy_scheme": (self._policy, agent_query, context),
            "market_insights": (self._market, agent_query, context),
            "upi_guide": (self._upi, agent_query, context),
            "marketing": (self._marketing, agent_query, context),
        }

        # ── 3. Run agents (threaded for speed with live clients) ───────────────
        sections: dict[str, str] = {}
        with ThreadPoolExecutor(max_workers=4) as pool:
            futures = {
                pool.submit(agent.run, query=query, context=ctx): key
                for key, (agent, query, ctx) in agent_tasks.items()
            }
            for future in as_completed(futures):
                key = futures[future]
                try:
                    result = future.result()
                    sections[key] = result.get("response", "")
                except Exception as exc:  # pragma: no cover
                    logger.error("Agent %s raised: %s", key, exc)
                    sections[key] = f"[Error: {exc}]"

        # ── 4. Translation pass ────────────────────────────────────────────────
        translated = False
        if detected_lang and detected_lang != "en":
            combined_english = _merge_for_translation(sections)
            trans_result = self._translation.run(
                text=combined_english,
                target_language=detected_lang,
            )
            translated_text = trans_result.get("translated_text", combined_english)
            translated = trans_result.get("translated", False)

            # Split translated text back into sections if possible; otherwise
            # put everything into each section (full translation).
            sections = _split_translated(sections, translated_text)

        return {
            "category": category,
            "location": location,
            "sections": sections,
            "translated": translated,
            "language": detected_lang,
        }


# ── Helpers ────────────────────────────────────────────────────────────────────

def _merge_for_translation(sections: dict[str, str]) -> str:
    """Combine all section texts into a single string for the translation agent."""
    parts = []
    headings = {
        "policy_scheme": "## Policy & Scheme Information",
        "market_insights": "## Market Insights & Pricing",
        "upi_guide": "## UPI & Digital Payments Setup",
        "marketing": "## Marketing & Promotions",
    }
    for key in ("policy_scheme", "market_insights", "upi_guide", "marketing"):
        text = sections.get(key, "")
        if text:
            parts.append(f"{headings[key]}\n\n{text}")
    return "\n\n---\n\n".join(parts)


def _split_translated(
    original_sections: dict[str, str],
    translated_text: str,
) -> dict[str, str]:
    """
    Best-effort: keep section keys intact after translation.
    If the translation preserved markdown H2 headings, split on them.
    Otherwise replace each section's value with the full translated text
    (so the frontend still gets all 4 keys).
    """
    markers = {
        "policy_scheme": ["## Policy", "## नीति", "## धोरण", "## பாலிசி"],
        "market_insights": ["## Market", "## बाजार", "## बाज़ार", "## சந்தை"],
        "upi_guide": ["## UPI", "## यूपीआई", "## यूपीआई"],
        "marketing": ["## Marketing", "## मार्केटिंग", "## विपणन"],
    }

    # Try a simple split on the section markers
    result: dict[str, str] = {}
    remaining = translated_text
    section_order = ["policy_scheme", "market_insights", "upi_guide", "marketing"]

    # If we can find at least two markers, attempt ordered splitting
    found_any = False
    for key in section_order:
        for marker in markers[key]:
            idx = remaining.find(marker)
            if idx != -1:
                # Content before this marker belongs to previous section (already captured)
                before = remaining[:idx].strip()
                remaining = remaining[idx:].strip()
                found_any = True
                break

    if found_any:
        # Second pass: split by section in order
        remaining = translated_text
        for i, key in enumerate(section_order):
            start_idx = -1
            for marker in markers[key]:
                start_idx = remaining.find(marker)
                if start_idx != -1:
                    break
            if start_idx == -1:
                result[key] = original_sections.get(key, "")
                continue
            # Find where the next section starts
            end_idx = len(remaining)
            for next_key in section_order[i + 1:]:
                for nm in markers[next_key]:
                    ni = remaining.find(nm, start_idx + 1)
                    if ni != -1:
                        end_idx = min(end_idx, ni)
            result[key] = remaining[start_idx:end_idx].strip()
    else:
        # Fallback: put full translated text in every section
        for key in section_order:
            result[key] = translated_text

    return result
