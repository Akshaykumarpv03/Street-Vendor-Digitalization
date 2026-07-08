"""
rag/vector_store.py — swappable vector store wrapper.

Backend is selected via VECTOR_DB_PROVIDER env var:
  • "chroma"  — local ChromaDB, zero infrastructure needed (default for dev)
  • "milvus"  — Milvus via watsonx.data Lite plan

Both backends expose the same interface:
  store = get_vector_store(collection_name)
  store.add(texts, metadatas, ids)
  store.query(query_text, top_k) -> list[dict]  # [{text, metadata, score}]
"""
from __future__ import annotations

import logging
from typing import Any

from config import Config
from rag.embeddings import WatsonxEmbeddings

logger = logging.getLogger(__name__)
_embeddings = WatsonxEmbeddings()


# ── Chroma backend ─────────────────────────────────────────────────────────────
class _ChromaStore:
    def __init__(self, collection_name: str) -> None:
        try:
            import chromadb
            from chromadb.config import Settings
        except ImportError as exc:  # pragma: no cover
            raise RuntimeError(
                "chromadb is not installed. Run: pip install chromadb"
            ) from exc

        self._client = chromadb.PersistentClient(
            path=Config.CHROMA_PERSIST_DIR,
            settings=Settings(anonymized_telemetry=False),
        )
        self._col = self._client.get_or_create_collection(
            name=collection_name,
            embedding_function=_embeddings,
        )
        logger.info("ChromaStore ready: collection=%s", collection_name)

    def add(
        self,
        texts: list[str],
        metadatas: list[dict[str, Any]],
        ids: list[str],
    ) -> None:
        self._col.upsert(documents=texts, metadatas=metadatas, ids=ids)

    def query(self, query_text: str, top_k: int = 4) -> list[dict[str, Any]]:
        if self._col.count() == 0:
            logger.warning("ChromaStore: collection is empty — no results.")
            return []
        results = self._col.query(
            query_texts=[query_text],
            n_results=min(top_k, self._col.count()),
            include=["documents", "metadatas", "distances"],
        )
        hits = []
        for doc, meta, dist in zip(
            results["documents"][0],
            results["metadatas"][0],
            results["distances"][0],
        ):
            hits.append({"text": doc, "metadata": meta, "score": 1 - dist})
        return hits


# ── Milvus backend ─────────────────────────────────────────────────────────────
class _MilvusStore:
    def __init__(self, collection_name: str) -> None:
        try:
            from pymilvus import (
                connections,
                Collection,
                CollectionSchema,
                FieldSchema,
                DataType,
                utility,
            )
        except ImportError as exc:  # pragma: no cover
            raise RuntimeError(
                "pymilvus is not installed. Run: pip install pymilvus"
            ) from exc

        connections.connect(host=Config.MILVUS_HOST, port=Config.MILVUS_PORT)
        self._collection_name = collection_name
        self._Collection = Collection
        self._utility = utility
        self._DataType = DataType

        dim = len(_embeddings.embed_query("ping"))  # determine embedding dim

        if not utility.has_collection(collection_name):
            from pymilvus import FieldSchema, CollectionSchema, DataType
            fields = [
                FieldSchema(name="id", dtype=DataType.VARCHAR, is_primary=True, max_length=256),
                FieldSchema(name="text", dtype=DataType.VARCHAR, max_length=4096),
                FieldSchema(name="source", dtype=DataType.VARCHAR, max_length=512),
                FieldSchema(name="embedding", dtype=DataType.FLOAT_VECTOR, dim=dim),
            ]
            schema = CollectionSchema(fields=fields)
            Collection(name=collection_name, schema=schema)
            logger.info("MilvusStore: created collection %s", collection_name)

        self._col = Collection(name=collection_name)
        self._col.load()
        logger.info("MilvusStore ready: collection=%s", collection_name)

    def add(
        self,
        texts: list[str],
        metadatas: list[dict[str, Any]],
        ids: list[str],
    ) -> None:
        vectors = _embeddings.embed_documents(texts)
        sources = [m.get("source", "") for m in metadatas]
        data = [ids, texts, sources, vectors]
        self._col.upsert(data)
        self._col.flush()

    def query(self, query_text: str, top_k: int = 4) -> list[dict[str, Any]]:
        vec = _embeddings.embed_query(query_text)
        results = self._col.search(
            data=[vec],
            anns_field="embedding",
            param={"metric_type": "COSINE", "params": {"nprobe": 10}},
            limit=top_k,
            output_fields=["text", "source"],
        )
        hits = []
        for hit in results[0]:
            hits.append(
                {
                    "text": hit.entity.get("text", ""),
                    "metadata": {"source": hit.entity.get("source", "")},
                    "score": hit.score,
                }
            )
        return hits


# ── Public factory ─────────────────────────────────────────────────────────────
_store_cache: dict[str, Any] = {}


def get_vector_store(collection_name: str) -> "_ChromaStore | _MilvusStore":
    """
    Return (and cache) a vector store instance for *collection_name*.
    Backend is chosen by Config.VECTOR_DB_PROVIDER.
    """
    if collection_name in _store_cache:
        return _store_cache[collection_name]

    if Config.VECTOR_DB_PROVIDER == "milvus":
        store = _MilvusStore(collection_name)
    else:
        store = _ChromaStore(collection_name)

    _store_cache[collection_name] = store
    return store
