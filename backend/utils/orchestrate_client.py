"""
REST client for IBM watsonx Orchestrate chat completions.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Any

import requests

from config import Config


IAM_TOKEN_URL = "https://iam.cloud.ibm.com/identity/token"


class OrchestrateError(RuntimeError):
    def __init__(self, message: str, status_code: int = 502) -> None:
        super().__init__(message)
        self.status_code = status_code


@dataclass(frozen=True)
class OrchestrateClient:
    api_key: str
    instance_url: str
    agent_id: str

    @classmethod
    def from_config(cls) -> "OrchestrateClient":
        missing = Config.validate()
        if missing:
            raise OrchestrateError(
                f"Missing required environment variables: {', '.join(missing)}",
                status_code=500,
            )
        return cls(
            api_key=Config.IBM_CLOUD_API_KEY,
            instance_url=Config.ORCHESTRATE_INSTANCE_URL.rstrip("/"),
            agent_id=Config.ORCHESTRATE_AGENT_ID,
        )

    def get_access_token(self) -> str:
        try:
            response = requests.post(
                IAM_TOKEN_URL,
                data={
                    "grant_type": "urn:ibm:params:oauth:grant-type:apikey",
                    "apikey": self.api_key,
                },
                headers={
                    "Accept": "application/json",
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                timeout=30,
            )
        except requests.RequestException as exc:
            raise OrchestrateError(f"IAM token request failed: {exc}") from exc

        if not response.ok:
            raise OrchestrateError(
                f"IAM token request failed with HTTP {response.status_code}",
                status_code=response.status_code,
            )

        token = response.json().get("access_token")
        if not token:
            raise OrchestrateError("IAM response did not include an access token")
        return token

    def chat(self, message: str) -> str:
        token = self.get_access_token()
        endpoint = (
            f"{self.instance_url}/v1/orchestrate/"
            f"{self.agent_id}/chat/completions"
        )

        try:
            response = requests.post(
                endpoint,
                json={
                    "messages": [{"role": "user", "content": message}],
                    "stream": False,
                },
                headers={
                    "Authorization": f"Bearer {token}",
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                },
                timeout=90,
            )
        except requests.RequestException as exc:
            raise OrchestrateError(f"Orchestrate chat request failed: {exc}") from exc

        if not response.ok:
            detail = _extract_error_detail(response)
            raise OrchestrateError(
                detail or f"Orchestrate returned HTTP {response.status_code}",
                status_code=response.status_code,
            )

        return _extract_message_text(response.json())


def _extract_message_text(payload: dict[str, Any]) -> str:
    choices = payload.get("choices")
    if not isinstance(choices, list) or not choices:
        raise OrchestrateError("Orchestrate response did not include choices")

    content = choices[0].get("message", {}).get("content")
    if isinstance(content, str):
        text = content.strip()
    elif isinstance(content, list):
        parts = []
        for item in content:
            if isinstance(item, dict):
                parts.append(str(item.get("text") or item.get("content") or ""))
            else:
                parts.append(str(item))
        text = "\n".join(part for part in parts if part).strip()
    else:
        text = ""

    if not text:
        raise OrchestrateError("Orchestrate response did not include message text")
    return text


def _extract_error_detail(response: requests.Response) -> str:
    try:
        payload = response.json()
    except ValueError:
        return response.text.strip()

    if isinstance(payload, dict):
        for key in ("error", "message", "detail"):
            value = payload.get(key)
            if isinstance(value, str):
                return value
        errors = payload.get("errors")
        if isinstance(errors, list) and errors:
            return str(errors[0])
    return ""
