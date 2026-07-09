"""
Flask entry point for the IBM watsonx Orchestrate proxy backend.
"""
from __future__ import annotations

from flask import Flask, jsonify, request
from flask_cors import CORS

from config import Config
from utils.orchestrate_client import OrchestrateClient, OrchestrateError


app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})


@app.get("/api/health")
def health():
    missing = Config.validate()
    return jsonify(
        {
            "status": "ok" if not missing else "misconfigured",
            "service": "watsonx-orchestrate-proxy",
            "missing_credentials": missing,
            "mock_mode": Config.USE_MOCK,
        }
    ), 200 if not missing or Config.USE_MOCK else 500


@app.route("/api/chat", methods=["POST", "OPTIONS"])
def chat():
    # Intercept CORS preflight and approve it immediately
    if request.method == "OPTIONS":
        return jsonify({"status": "preflight ok"}), 200

    body = request.get_json(force=True, silent=True) or {}
    message = str(body.get("message", "")).strip()
    language = str(body.get("language", "en")).strip() or "en"

    if not message:
        return jsonify({"error": "message is required"}), 400

    if language != "en":
        message = (
            f"{message}\n\n"
            f"Please respond in the user's selected language code: {language}."
        )

    if Config.USE_MOCK:
        return jsonify(
            {
                "message": (
                    "## Digital Business Guidance\n\n"
                    "This is a local mock response from the Orchestrate proxy. "
                    "Set `USE_MOCK=false` and configure IBM Cloud credentials "
                    "to call the live watsonx Orchestrate agent."
                )
            }
        )

    try:
        client = OrchestrateClient.from_config()
        answer = client.chat(message)
        return jsonify({"message": answer})
    except OrchestrateError as exc:
        return jsonify({"error": str(exc)}), exc.status_code
    except Exception as exc:  # pragma: no cover
        return jsonify({"error": f"Unexpected server error: {exc}"}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=Config.DEBUG)
