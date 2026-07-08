"""
config.py — centralised environment-variable loading for the Street Vendor Agent backend.
All modules import from here rather than reading os.environ directly.
"""
import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    # watsonx.ai credentials
    WATSONX_API_KEY: str = os.getenv("WATSONX_API_KEY", "")
    WATSONX_PROJECT_ID: str = os.getenv("WATSONX_PROJECT_ID", "")
    WATSONX_URL: str = os.getenv(
        "WATSONX_URL", "https://us-south.ml.cloud.ibm.com"
    )

    # Model IDs — verified against au-syd endpoint, ibm-watsonx-ai 1.5.14
    GRANITE_MODEL_ID: str = os.getenv(
        "GRANITE_MODEL_ID", "meta-llama/llama-3-3-70b-instruct"
    )
    EMBEDDING_MODEL_ID: str = os.getenv(
        "EMBEDDING_MODEL_ID", "intfloat/multilingual-e5-large"
    )

    # Vector store
    VECTOR_DB_PROVIDER: str = os.getenv("VECTOR_DB_PROVIDER", "chroma").lower()
    MILVUS_HOST: str = os.getenv("MILVUS_HOST", "localhost")
    MILVUS_PORT: int = int(os.getenv("MILVUS_PORT", "19530"))
    CHROMA_PERSIST_DIR: str = os.getenv("CHROMA_PERSIST_DIR", "./chroma_db")

    # Flask
    FLASK_ENV: str = os.getenv("FLASK_ENV", "development")
    DEBUG: bool = os.getenv("FLASK_DEBUG", "1") == "1"

    # Mock mode — set USE_MOCK=true to bypass watsonx calls (for UI demos / CI)
    USE_MOCK: bool = os.getenv("USE_MOCK", "false").lower() == "true"

    # RAG retrieval
    RAG_TOP_K: int = int(os.getenv("RAG_TOP_K", "4"))
    CHUNK_SIZE: int = int(os.getenv("CHUNK_SIZE", "500"))
    CHUNK_OVERLAP: int = int(os.getenv("CHUNK_OVERLAP", "80"))

    @classmethod
    def validate(cls) -> list[str]:
        """Return a list of missing-but-required variable names (non-mock mode)."""
        required = ["WATSONX_API_KEY", "WATSONX_PROJECT_ID"]
        return [k for k in required if not getattr(cls, k)]
