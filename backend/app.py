"""
app.py — Flask entry point for the Street Vendor Digitalization Agent backend.
"""
from flask import Flask, jsonify
from flask_cors import CORS

from config import Config
from agents.policy_scheme_agent import PolicySchemeAgent
from agents.market_insights_agent import MarketInsightsAgent
from agents.upi_guide_agent import UPIGuideAgent
from agents.marketing_agent import MarketingAgent
from agents.translation_agent import TranslationAgent
from agents.orchestrator import Orchestrator

app = Flask(__name__)
CORS(app)

# ── Instantiate agents once at startup ────────────────────────────────────────
policy_agent = PolicySchemeAgent()
market_agent = MarketInsightsAgent()
upi_agent = UPIGuideAgent()
marketing_agent = MarketingAgent()
translation_agent = TranslationAgent()
orchestrator = Orchestrator(
    policy_agent=policy_agent,
    market_agent=market_agent,
    upi_agent=upi_agent,
    marketing_agent=marketing_agent,
    translation_agent=translation_agent,
)

# ── Health ─────────────────────────────────────────────────────────────────────
@app.get("/api/health")
def health():
    missing = Config.validate()
    return jsonify(
        {
            "status": "ok",
            "mock_mode": Config.USE_MOCK,
            "missing_credentials": missing,
            "vector_db": Config.VECTOR_DB_PROVIDER,
        }
    )


# ── Main orchestrator endpoint ─────────────────────────────────────────────────
@app.post("/api/query")
def query():
    from flask import request

    body = request.get_json(force=True, silent=True) or {}
    message = body.get("message", "").strip()
    language = body.get("language", "en")

    if not message:
        return jsonify({"error": "message is required"}), 400

    result = orchestrator.run(message=message, language=language)
    return jsonify(result)


# ── Direct per-agent endpoints (for isolated testing) ─────────────────────────
@app.post("/api/agents/policy-scheme")
def agent_policy():
    from flask import request
    body = request.get_json(force=True, silent=True) or {}
    return jsonify(policy_agent.run(query=body.get("query", ""), context=body))


@app.post("/api/agents/market-insights")
def agent_market():
    from flask import request
    body = request.get_json(force=True, silent=True) or {}
    return jsonify(market_agent.run(query=body.get("query", ""), context=body))


@app.post("/api/agents/upi-guide")
def agent_upi():
    from flask import request
    body = request.get_json(force=True, silent=True) or {}
    return jsonify(upi_agent.run(query=body.get("query", ""), context=body))


@app.post("/api/agents/marketing")
def agent_marketing():
    from flask import request
    body = request.get_json(force=True, silent=True) or {}
    return jsonify(marketing_agent.run(query=body.get("query", ""), context=body))


@app.post("/api/agents/translate")
def agent_translate():
    from flask import request
    body = request.get_json(force=True, silent=True) or {}
    return jsonify(
        translation_agent.run(
            text=body.get("text", ""),
            target_language=body.get("language", "en"),
        )
    )


if __name__ == "__main__":
    if not Config.USE_MOCK:
        missing = Config.validate()
        if missing:
            print(
                f"[WARNING] watsonx credentials not set: {missing}. "
                "Set USE_MOCK=true to run in demo mode without credentials."
            )
    app.run(host="0.0.0.0", port=5000, debug=Config.DEBUG)
