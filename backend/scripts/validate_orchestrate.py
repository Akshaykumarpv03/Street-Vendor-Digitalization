"""
Validate IBM watsonx Orchestrate connectivity from backend/.env.

Usage:
  python scripts/validate_orchestrate.py
  python scripts/validate_orchestrate.py --message "I sell fruit in Pune"
"""
from __future__ import annotations

import argparse
import os
import sys
from pathlib import Path

import requests
from dotenv import load_dotenv


IAM_TOKEN_URL = "https://iam.cloud.ibm.com/identity/token"


def load_config() -> tuple[str, str, str]:
    backend_dir = Path(__file__).resolve().parents[1]
    load_dotenv(backend_dir / ".env")

    api_key = os.getenv("IBM_CLOUD_API_KEY") or os.getenv("ORCHESTRATE_API_KEY")
    instance_url = os.getenv("ORCHESTRATE_INSTANCE_URL", "").rstrip("/")
    agent_id = os.getenv("ORCHESTRATE_AGENT_ID", "")

    missing = [
        name
        for name, value in (
            ("IBM_CLOUD_API_KEY", api_key),
            ("ORCHESTRATE_INSTANCE_URL", instance_url),
            ("ORCHESTRATE_AGENT_ID", agent_id),
        )
        if not value
    ]
    if missing:
        raise RuntimeError(f"Missing required environment variables: {', '.join(missing)}")

    return api_key, instance_url, agent_id


def get_access_token(api_key: str) -> str:
    response = requests.post(
        IAM_TOKEN_URL,
        data={
            "grant_type": "urn:ibm:params:oauth:grant-type:apikey",
            "apikey": api_key,
        },
        headers={
            "Content-Type": "application/x-www-form-urlencoded",
            "Accept": "application/json",
        },
        timeout=30,
    )
    response.raise_for_status()
    token = response.json().get("access_token")
    if not token:
        raise RuntimeError("IAM token response did not include access_token")
    return token


def send_probe(instance_url: str, agent_id: str, token: str, message: str) -> str:
    endpoint = f"{instance_url}/v1/orchestrate/{agent_id}/chat/completions"
    response = requests.post(
        endpoint,
        json={"messages": [{"role": "user", "content": message}]},
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
        timeout=60,
    )
    response.raise_for_status()
    payload = response.json()
    return (
        payload.get("choices", [{}])[0]
        .get("message", {})
        .get("content", "")
        .strip()
    )


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--message",
        help="Optional chat probe message. If omitted, only IAM token exchange is tested.",
    )
    args = parser.parse_args()

    try:
        api_key, instance_url, agent_id = load_config()
        token = get_access_token(api_key)
        print("IAM token exchange succeeded.")

        if args.message:
            answer = send_probe(instance_url, agent_id, token, args.message)
            print("Orchestrate chat probe succeeded.")
            print(answer or "[No text content returned]")

        return 0
    except Exception as exc:
        print(f"Validation failed: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
