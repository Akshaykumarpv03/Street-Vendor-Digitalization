"""Shared pytest fixtures for the Orchestrate proxy backend."""
import os

os.environ["USE_MOCK"] = "true"
os.environ["FLASK_ENV"] = "testing"
os.environ["IBM_CLOUD_API_KEY"] = "test-api-key"
os.environ["ORCHESTRATE_INSTANCE_URL"] = "https://example.com/instances/test"
os.environ["ORCHESTRATE_AGENT_ID"] = "test-agent-id"

import pytest  # noqa: E402
from app import app as flask_app  # noqa: E402


@pytest.fixture()
def app():
    flask_app.config.update({"TESTING": True})
    yield flask_app


@pytest.fixture()
def client(app):
    return app.test_client()
