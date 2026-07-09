import json


class TestHealth:
    def test_returns_200(self, client):
        resp = client.get("/api/health")
        assert resp.status_code == 200

    def test_reports_proxy_service(self, client):
        resp = client.get("/api/health")
        data = resp.get_json()
        assert data["status"] == "ok"
        assert data["service"] == "watsonx-orchestrate-proxy"
        assert data["mock_mode"] is True
        assert data["missing_credentials"] == []


class TestChat:
    def _post(self, client, payload):
        return client.post(
            "/api/chat",
            data=json.dumps(payload),
            content_type="application/json",
        )

    def test_returns_unified_message(self, client):
        resp = self._post(client, {"message": "I sell fruit in Pune"})
        data = resp.get_json()
        assert resp.status_code == 200
        assert isinstance(data["message"], str)
        assert "Orchestrate proxy" in data["message"]

    def test_accepts_language_field(self, client):
        resp = self._post(
            client,
            {"message": "I sell tea near Kalyan station", "language": "hi"},
        )
        assert resp.status_code == 200

    def test_empty_message_returns_400(self, client):
        resp = self._post(client, {"message": ""})
        assert resp.status_code == 400
        assert resp.get_json()["error"] == "message is required"

    def test_missing_message_returns_400(self, client):
        resp = self._post(client, {})
        assert resp.status_code == 400


class TestLegacyRoutes:
    def test_old_query_route_is_removed(self, client):
        resp = client.post("/api/query", json={"message": "hello"})
        assert resp.status_code == 404

    def test_old_agent_route_is_removed(self, client):
        resp = client.post("/api/agents/marketing", json={"query": "hello"})
        assert resp.status_code == 404
