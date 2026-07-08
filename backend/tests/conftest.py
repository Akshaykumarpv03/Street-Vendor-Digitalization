"""
tests/conftest.py — shared pytest fixtures for the Street Vendor Agent test suite.

Sets USE_MOCK=true before importing anything so no watsonx credentials are
needed and the test suite runs in CI without any external services.
"""
import os

# Force mock mode before any app modules are imported
os.environ["USE_MOCK"] = "true"
os.environ["FLASK_ENV"] = "testing"

import pytest  # noqa: E402
from app import app as flask_app  # noqa: E402


@pytest.fixture()
def app():
    flask_app.config.update({"TESTING": True})
    yield flask_app


@pytest.fixture()
def client(app):
    return app.test_client()
