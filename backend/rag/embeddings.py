"""
rag/embeddings.py — embedding client that delegates to WatsonxClient.

Provides a LangChain-compatible Embeddings interface so it can be plugged
directly into Chroma or any other LangChain-aware vector store.
"""
from __future__ import annotations

from typing import List

from utils.watsonx_client import watsonx_client


class WatsonxEmbeddings:
    """
    LangChain-compatible embedding wrapper around WatsonxClient.

    Implements embed_documents() and embed_query() so it can be passed
    directly to Chroma(..., embedding_function=WatsonxEmbeddings()).
    """

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        """Embed a list of documents; returns list-of-vectors."""
        return watsonx_client.embed(texts)

    def embed_query(self, text: str) -> List[float]:
        """Embed a single query string."""
        return watsonx_client.embed_query(text)

    # chromadb EmbeddingFunction protocol compat
    def __call__(self, input: List[str]) -> List[List[float]]:  # noqa: A002
        return self.embed_documents(input)
