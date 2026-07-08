"""
utils/watsonx_client.py — thin wrapper around the watsonx.ai Runtime API.

Supports:
  • text_generate()  — chat completions via ibm-watsonx-ai ModelInference.chat()
                       (uses /ml/v1/text/chat endpoint, not the deprecated /text/generation)
  • embed()          — document embeddings via ibm-watsonx-ai Embeddings class
  • embed_query()    — single-query convenience wrapper

Model IDs are read from config.py so they can be updated without touching code.
If USE_MOCK=true (or credentials are absent) every call returns canned mock
responses so the rest of the system can run without live credentials.

Confirmed working with ibm-watsonx-ai 1.5.14 against:
  - Generation : meta/llama-3-3-70b-instruct  (au-syd endpoint)
  - Embeddings : intfloat/multilingual-e5-large (1024-dim, multilingual)
"""
from __future__ import annotations

import logging
import warnings
from typing import Any

from config import Config

logger = logging.getLogger(__name__)

# ── Optional imports ───────────────────────────────────────────────────────────
try:
    from ibm_watsonx_ai import Credentials
    from ibm_watsonx_ai.foundation_models import ModelInference, Embeddings
    _IBM_SDK_AVAILABLE = True
except ImportError:
    _IBM_SDK_AVAILABLE = False
    logger.warning("ibm-watsonx-ai SDK not installed — running in mock mode.")

# ── Mock responses ─────────────────────────────────────────────────────────────
_MOCK_GENERATION = (
    "[MOCK RESPONSE] This is a placeholder answer generated in mock mode. "
    "Set USE_MOCK=false and provide valid watsonx credentials for real output."
)
_MOCK_EMBEDDING_DIM = 1024   # matches intfloat/multilingual-e5-large
_MOCK_EMBEDDING: list[float] = [0.01] * _MOCK_EMBEDDING_DIM


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
            self._chat_model = None
            self._emb_model = None
            return

        if not _IBM_SDK_AVAILABLE:
            logger.error("ibm-watsonx-ai is not installed. Run: pip install ibm-watsonx-ai")
            self._mock = True
            self._chat_model = None
            self._emb_model = None
            return

        creds = Credentials(
            url=Config.WATSONX_URL,
            api_key=Config.WATSONX_API_KEY,
        )

        # Generation model — use chat() to avoid deprecated /text/generation endpoint
        self._chat_model = ModelInference(
            model_id=Config.GRANITE_MODEL_ID,
            credentials=creds,
            project_id=Config.WATSONX_PROJECT_ID,
        )

        # Embedding model — Embeddings class (distinct from ModelInference)
        self._emb_model = Embeddings(
            model_id=Config.EMBEDDING_MODEL_ID,
            credentials=creds,
            project_id=Config.WATSONX_PROJECT_ID,
        )

        logger.info(
            "WatsonxClient: connected. generation=%s  embedding=%s  url=%s",
            Config.GRANITE_MODEL_ID,
            Config.EMBEDDING_MODEL_ID,
            Config.WATSONX_URL,
        )

    # ── Text generation ────────────────────────────────────────────────────────
    def text_generate(
        self,
        prompt: str,
        max_new_tokens: int = 800,
        temperature: float = 0.3,
        stop_sequences: list[str] | None = None,
    ) -> str:
        """
        Generate text for *prompt* via the chat completions API.

        The prompt is sent as a single user message. System-style instructions
        embedded in the prompt string are preserved as-is.
        """
        if self._mock:
            return _MOCK_GENERATION

        params: dict[str, Any] = {
            "max_tokens": max_new_tokens,
            "temperature": temperature,
        }
        if stop_sequences:
            params["stop"] = stop_sequences

        try:
            with warnings.catch_warnings():
                warnings.simplefilter("ignore")
                response = self._chat_model.chat(
                    messages=[{"role": "user", "content": prompt}],
                    params=params,
                )
            return response["choices"][0]["message"]["content"]
        except Exception as exc:
            logger.error("text_generate failed: %s", exc)
            return f"[ERROR] watsonx generation failed: {exc}"

    # ── Embeddings ─────────────────────────────────────────────────────────────
    def embed(self, texts: list[str]) -> list[list[float]]:
        """
        Return a list of 1024-dim embedding vectors (one per input text).
        Uses intfloat/multilingual-e5-large — supports all Indian languages.
        """
        if self._mock:
            return [_MOCK_EMBEDDING[:] for _ in texts]

        try:
            with warnings.catch_warnings():
                warnings.simplefilter("ignore")
                return self._emb_model.embed_documents(texts=texts)
        except Exception as exc:
            logger.error("embed failed: %s", exc)
            return [_MOCK_EMBEDDING[:] for _ in texts]

    def embed_query(self, text: str) -> list[float]:
        """Convenience wrapper — embed a single query string."""
        return self.embed([text])[0]


# Module-level singleton — imported by agents and rag modules.
watsonx_client = WatsonxClient()
