"""
agents/base_agent.py — shared base class for all specialist agents.

Each subclass provides:
  COLLECTION_NAME : str  — the vector store collection to retrieve from
  SYSTEM_PROMPT   : str  — the agent's persona/role instruction

run() orchestrates:
  1. RAG retrieval from the agent's own collection (if RAG-backed)
  2. Prompt assembly with context + query
  3. Granite generation via WatsonxClient
  4. Return structured dict
"""
from __future__ import annotations

import logging
from typing import Any

from config import Config
from utils.watsonx_client import watsonx_client

logger = logging.getLogger(__name__)


class BaseAgent:
    # Subclasses must set these
    NAME: str = "BaseAgent"
    COLLECTION_NAME: str | None = None   # None → no RAG retrieval
    SYSTEM_PROMPT: str = ""

    def _retrieve(self, query: str) -> str:
        """
        Retrieve top-k relevant chunks from this agent's vector store.
        Returns a formatted context string, or empty string if nothing found.
        """
        if not self.COLLECTION_NAME:
            return ""

        try:
            from rag.vector_store import get_vector_store
            store = get_vector_store(self.COLLECTION_NAME)
            hits = store.query(query, top_k=Config.RAG_TOP_K)
        except Exception as exc:
            logger.warning("%s: RAG retrieval failed (%s)", self.NAME, exc)
            return ""

        if not hits:
            return ""

        parts = [
            f"[Source: {h['metadata'].get('source', 'unknown')}]\n{h['text']}"
            for h in hits
        ]
        return "\n\n---\n\n".join(parts)

    def _build_prompt(
        self,
        query: str,
        context: dict[str, Any],
        retrieved: str,
    ) -> str:
        """
        Assemble the full prompt sent to Granite.
        Subclasses may override for custom prompt structure.
        """
        location = context.get("location", "")
        category = context.get("category", "street vendor")

        rag_block = ""
        if retrieved:
            rag_block = f"""
RELEVANT KNOWLEDGE BASE EXCERPTS:
{retrieved}

Using the above excerpts as primary reference, answer the following query.
"""

        return f"""{self.SYSTEM_PROMPT}

VENDOR CONTEXT:
- Business type: {category}
- Location: {location or 'India (general)'}

{rag_block}
QUERY: {query}

RESPONSE:"""

    def run(self, query: str, context: dict[str, Any] | None = None) -> dict[str, Any]:
        """
        Execute the agent:  retrieve → prompt → generate → return.

        Parameters
        ----------
        query   : the specific question / task for this agent
        context : optional dict with keys like 'category', 'location', 'language'

        Returns
        -------
        {"agent": str, "response": str}
        """
        context = context or {}
        retrieved = self._retrieve(query)
        prompt = self._build_prompt(query, context, retrieved)

        response = watsonx_client.text_generate(
            prompt=prompt,
            max_new_tokens=900,
            temperature=0.4,
        )

        return {"agent": self.NAME, "response": response}
