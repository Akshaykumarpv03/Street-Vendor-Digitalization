"""
tests/test_api.py — basic endpoint tests for the Street Vendor Agent backend.

All tests run against the Flask test client in mock mode (USE_MOCK=true set
in conftest.py) so they work without watsonx credentials or a vector store.
"""
import json
import pytest


# ── /api/health ────────────────────────────────────────────────────────────────

class TestHealth:
    def test_returns_200(self, client):
        resp = client.get("/api/health")
        assert resp.status_code == 200

    def test_response_is_json(self, client):
        resp = client.get("/api/health")
        data = resp.get_json()
        assert data is not None

    def test_status_ok(self, client):
        resp = client.get("/api/health")
        data = resp.get_json()
        assert data["status"] == "ok"

    def test_mock_mode_flag(self, client):
        resp = client.get("/api/health")
        data = resp.get_json()
        # In test suite conftest sets USE_MOCK=true
        assert data["mock_mode"] is True


# ── /api/query ─────────────────────────────────────────────────────────────────

class TestQuery:
    def _post(self, client, payload):
        return client.post(
            "/api/query",
            data=json.dumps(payload),
            content_type="application/json",
        )

    def test_returns_200(self, client):
        resp = self._post(client, {"message": "I sell fruit in Pune's Camp area"})
        assert resp.status_code == 200

    def test_response_has_required_keys(self, client):
        resp = self._post(client, {"message": "I sell vegetables in Mumbai"})
        data = resp.get_json()
        assert "category" in data
        assert "location" in data
        assert "sections" in data
        assert "translated" in data

    def test_sections_has_all_agents(self, client):
        resp = self._post(client, {"message": "I sell chai in Jaipur"})
        data = resp.get_json()
        sections = data["sections"]
        for key in ("policy_scheme", "market_insights", "upi_guide", "marketing"):
            assert key in sections, f"Missing section: {key}"
            assert isinstance(sections[key], str)
            assert len(sections[key]) > 0

    def test_empty_message_returns_400(self, client):
        resp = self._post(client, {"message": ""})
        assert resp.status_code == 400

    def test_missing_message_returns_400(self, client):
        resp = self._post(client, {})
        assert resp.status_code == 400

    def test_language_field_defaults_to_english(self, client):
        resp = self._post(client, {"message": "I sell flowers in Chennai"})
        data = resp.get_json()
        # No language specified — should default to "en" and not translate
        assert data["translated"] is False

    def test_non_english_language_sets_translated(self, client):
        resp = self._post(
            client, {"message": "I sell mangoes in Pune", "language": "mr"}
        )
        data = resp.get_json()
        # Mock translator returns translated=True for non-English
        assert data["translated"] is True
        assert data["language"] == "mr"

    def test_category_extraction_fruit(self, client):
        resp = self._post(client, {"message": "I sell fruit in Pune's Camp area"})
        data = resp.get_json()
        assert "fruit" in data["category"].lower()

    def test_category_extraction_vegetable(self, client):
        resp = self._post(client, {"message": "I sell vegetables in Delhi"})
        data = resp.get_json()
        assert "vegetable" in data["category"].lower()


# ── Direct per-agent endpoints ─────────────────────────────────────────────────

class TestAgentEndpoints:
    def _post_agent(self, client, path, payload):
        return client.post(
            path,
            data=json.dumps(payload),
            content_type="application/json",
        )

    @pytest.mark.parametrize("path", [
        "/api/agents/policy-scheme",
        "/api/agents/market-insights",
        "/api/agents/upi-guide",
        "/api/agents/marketing",
    ])
    def test_agent_returns_200_with_response(self, client, path):
        resp = self._post_agent(client, path, {"query": "How do I register my business?"})
        assert resp.status_code == 200
        data = resp.get_json()
        assert "response" in data
        assert len(data["response"]) > 0

    def test_translate_endpoint_english_passthrough(self, client):
        resp = self._post_agent(
            client,
            "/api/agents/translate",
            {"text": "Hello world", "language": "en"},
        )
        data = resp.get_json()
        assert data["translated"] is False
        assert data["translated_text"] == "Hello world"

    def test_translate_endpoint_non_english(self, client):
        resp = self._post_agent(
            client,
            "/api/agents/translate",
            {"text": "Hello world", "language": "hi"},
        )
        data = resp.get_json()
        assert data["translated"] is True
        assert data["language"] == "hi"
