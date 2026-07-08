"""
rag/ingest.py — one-time ingestion script.

Walks knowledge_base/<agent>/*.pdf, chunks each PDF, embeds the chunks,
and upserts them into a per-agent vector store collection so each agent
only ever retrieves from its own knowledge base.

Usage
-----
  cd backend
  python rag/ingest.py                # ingest all agents
  python rag/ingest.py policy_scheme  # ingest one agent only
"""
from __future__ import annotations

import hashlib
import logging
import os
import sys

logging.basicConfig(level=logging.INFO, format="%(levelname)s  %(message)s")
logger = logging.getLogger(__name__)

# Ensure the backend/ directory is on the path when run directly.
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config import Config  # noqa: E402 (after path setup)
from rag.vector_store import get_vector_store  # noqa: E402

# ── Agent → collection name mapping ───────────────────────────────────────────
AGENT_COLLECTIONS: dict[str, str] = {
    "policy_scheme": "policy_scheme",
    "market_insights": "market_insights",
    "upi_guide": "upi_guide",
    "marketing": "marketing",
}

KB_BASE = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "knowledge_base")


def _chunk_pdf(pdf_path: str) -> list[str]:
    """
    Parse a PDF and split it into overlapping text chunks.
    Returns a list of chunk strings.
    """
    try:
        from pypdf import PdfReader
    except ImportError as exc:
        raise RuntimeError("pypdf not installed. Run: pip install pypdf") from exc

    reader = PdfReader(pdf_path)
    full_text = "\n".join(
        page.extract_text() or "" for page in reader.pages
    )

    chunk_size = Config.CHUNK_SIZE
    overlap = Config.CHUNK_OVERLAP
    chunks: list[str] = []
    start = 0
    while start < len(full_text):
        end = start + chunk_size
        chunk = full_text[start:end].strip()
        if chunk:
            chunks.append(chunk)
        start = end - overlap  # slide with overlap

    logger.info("  %s → %d chunks", os.path.basename(pdf_path), len(chunks))
    return chunks


def _stable_id(pdf_path: str, chunk_index: int) -> str:
    """Generate a deterministic, stable document ID."""
    key = f"{pdf_path}::{chunk_index}"
    return hashlib.md5(key.encode()).hexdigest()


def ingest_agent(agent_name: str) -> None:
    """Ingest all PDFs for a single agent."""
    kb_dir = os.path.join(KB_BASE, agent_name)
    if not os.path.isdir(kb_dir):
        logger.warning("No knowledge_base directory found for agent '%s' at %s", agent_name, kb_dir)
        return

    pdfs = [f for f in os.listdir(kb_dir) if f.lower().endswith(".pdf")]
    if not pdfs:
        logger.warning(
            "No PDFs found in %s — place PDFs there and re-run ingest.py", kb_dir
        )
        return

    collection_name = AGENT_COLLECTIONS[agent_name]
    store = get_vector_store(collection_name)

    for pdf_file in pdfs:
        pdf_path = os.path.join(kb_dir, pdf_file)
        logger.info("Processing %s ...", pdf_path)
        chunks = _chunk_pdf(pdf_path)

        texts, metadatas, ids = [], [], []
        for i, chunk in enumerate(chunks):
            texts.append(chunk)
            metadatas.append({"source": pdf_file, "agent": agent_name, "chunk": i})
            ids.append(_stable_id(pdf_path, i))

        store.add(texts=texts, metadatas=metadatas, ids=ids)
        logger.info("  Upserted %d chunks for %s", len(chunks), pdf_file)

    logger.info("Agent '%s' ingestion complete.", agent_name)


def ingest_all() -> None:
    for agent_name in AGENT_COLLECTIONS:
        logger.info("=== Ingesting agent: %s ===", agent_name)
        ingest_agent(agent_name)
    logger.info("All agents ingested.")


if __name__ == "__main__":
    if len(sys.argv) > 1:
        target = sys.argv[1]
        if target not in AGENT_COLLECTIONS:
            logger.error(
                "Unknown agent '%s'. Valid agents: %s",
                target,
                list(AGENT_COLLECTIONS),
            )
            sys.exit(1)
        ingest_agent(target)
    else:
        ingest_all()
