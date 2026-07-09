"""
Backend configuration for the IBM watsonx Orchestrate proxy.
"""
from __future__ import annotations

import os
from pathlib import Path

from dotenv import load_dotenv


BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")


class Config:
    IBM_CLOUD_API_KEY: str = os.getenv("IBM_CLOUD_API_KEY", "")
    ORCHESTRATE_INSTANCE_URL: str = os.getenv("ORCHESTRATE_INSTANCE_URL", "")
    ORCHESTRATE_AGENT_ID: str = os.getenv("ORCHESTRATE_AGENT_ID", "")

    FLASK_ENV: str = os.getenv("FLASK_ENV", "development")
    DEBUG: bool = os.getenv("FLASK_DEBUG", "1") == "1"
    CORS_ORIGINS: list[str] = [
        origin.strip()
        for origin in os.getenv(
            "CORS_ORIGINS",
            "http://localhost:5173,http://127.0.0.1:5173",
        ).split(",")
        if origin.strip()
    ]

    USE_MOCK: bool = os.getenv("USE_MOCK", "false").lower() == "true"

    @classmethod
    def validate(cls) -> list[str]:
        required = [
            "IBM_CLOUD_API_KEY",
            "ORCHESTRATE_INSTANCE_URL",
            "ORCHESTRATE_AGENT_ID",
        ]
        return [name for name in required if not getattr(cls, name)]
