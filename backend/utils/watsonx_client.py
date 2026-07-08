"""
utils/watsonx_client.py — thin wrapper around the watsonx.ai Runtime API.

Supports:
  • text_generate()  — Granite (or any text-generation model)
  • embed()          — watsonx.ai embedding model

Model IDs are read from config.py so they can be updated without touching code.
If USE_MOCK=true (or credentials are absent) every call returns canned mock
responses so the rest of the system can run without live credentials.
"""
from __future__ import annotations

import logging
from typing import Any

from config import Config

logger = logging.getLogger(__name__)

# ── Optional imports — guarded so the app can start without these installed ──
try:
    from ibm_watsonx_ai import Credentials
    from ibm_watsonx_ai.foundation_models import ModelInference
    from ibm_watsonx_ai.foundation_models.utils.enums import EmbeddingTypes
    _IBM_SDK_AVAILABLE = True
except ImportError:  # pragma: no cover
    _IBM_SDK_AVAILABLE = False
    logger.warning(
        "ibm-watsonx-ai SDK not installed — running in mock mode automatically."
    )


# ── Mock responses ─────────────────────────────────────────────────────────────
_MOCK_GENERATION = (
    "[MOCK RESPONSE] This is a placeholder answer generated in mock mode. "
    "Set USE_MOCK=false and provide valid watsonx credentials for real output."
)

_MOCK_EMBEDDING: list[float] = [0.01] * 384  # 384-dim zero vector


class WatsonxClient:
    """
    Centralised client for watsonx.ai text generation and embeddings.

    Usage
    -----
    client = WatsonxClient()
    text   = client.text_generate("Explain PM SVANidhi in simple terms")
    vecs   = client.embed(["sentence one", "sentence two"])
    """

    def __init__(self) -> None:
        self._mock = Config.USE_MOCK or not Config.WATSONX_API_KEY

        if self._mock:
            logger.info("WatsonxClient: running in MOCK mode.")
            self._gen_model = None
            self._emb_model = None
            return

        if not _IBM_SDK_AVAILABLE:
            logger.error(
                "ibm-watsonx-ai is not installed. Install it with: "
                "pip install ibm-watsonx-ai"
            )
            self._mock = True
            self._gen_model = None
            self._emb_model = None
            return

        creds = Credentials(
            url=Config.WATSONX_URL,
            api_key=Config.WATSONX_API_KEY,
        )
        self._gen_model = ModelInference(
            model_id=Config.GRANITE_MODEL_ID,
            credentials=creds,
            project_id=Config.WATSONX_PROJECT_ID,
        )
        self._emb_model = ModelInference(
            model_id=Config.EMBEDDING_MODEL_ID,
            credentials=creds,
            project_id=Config.WATSONX_PROJECT_ID,
        )
        logger.info(
            "WatsonxClient: connected. generation=%s  embedding=%s",
            Config.GRANITE_MODEL_ID,
            Config.EMBEDDING_MODEL_ID,
        )

    # ── Text generation ────────────────────────────────────────────────────────
    def text_generate(
        self,
        prompt: str,
        max_new_tokens: int = 800,
        temperature: float = 0.3,
        stop_sequences: list[str] | None = None,
    ) -> str:
        """Return generated text for *prompt*."""
        if self._mock:
            return _MOCK_GENERATION

        params: dict[str, Any] = {
            "max_new_tokens": max_new_tokens,
            "temperature": temperature,
            "decoding_method": "greedy" if temperature == 0 else "sample",
        }
        if stop_sequences:
            params["stop_sequences"] = stop_sequences

        try:
            response = self._gen_model.generate_text(
                prompt=prompt, params=params
            )
            # ibm-watsonx-ai ≥ 1.x returns a string directly from generate_text
            return response if isinstance(response, str) else str(response)
        except Exception as exc:  # pragma: no cover
            logger.error("text_generate failed: %s", exc)
            return f"[ERROR] watsonx generation failed: {exc}"

    # ── Embeddings ─────────────────────────────────────────────────────────────
    def embed(self, texts: list[str]) -> list[list[float]]:
        """
        Return a list of embedding vectors, one per input text.
        Uses the configured embedding model.
        """
        if self._mock:
            return [_MOCK_EMBEDDING[:] for _ in texts]

        try:
            response = self._emb_model.embed_documents(texts=texts)
            # ibm-watsonx-ai returns list-of-list directly
            return response
        except Exception as exc:  # pragma: no cover
            logger.error("embed failed: %s", exc)
            return [_MOCK_EMBEDDING[:] for _ in texts]

    def embed_query(self, text: str) -> list[float]:
        """Convenience wrapper — embed a single query string."""
        return self.embed([text])[0]


# Module-level singleton — imported by agents and rag modules.
watsonx_client = WatsonxClient()
