"""
CORS tests for the backend (openspec: consolidate-deploy-root, deployment spec).

main.py reads FRONTEND_URL at import time, so each test reloads the module
after setting the environment.
"""

import importlib

import pytest
from starlette.testclient import TestClient

FRONTEND = "https://broadcaster-agent-frontend.onrender.com"


def _client(monkeypatch: pytest.MonkeyPatch, frontend_url: str | None) -> TestClient:
    if frontend_url is None:
        monkeypatch.delenv("FRONTEND_URL", raising=False)
    else:
        monkeypatch.setenv("FRONTEND_URL", frontend_url)
    import main

    importlib.reload(main)
    return TestClient(main.app)


def _preflight(client: TestClient, origin: str):
    return client.options(
        "/health",
        headers={
            "Origin": origin,
            "Access-Control-Request-Method": "GET",
        },
    )


def test_configured_frontend_origin_is_allowed(monkeypatch):
    client = _client(monkeypatch, FRONTEND)
    response = _preflight(client, FRONTEND)
    assert response.headers.get("access-control-allow-origin") == FRONTEND


def test_local_dev_origin_is_allowed(monkeypatch):
    client = _client(monkeypatch, FRONTEND)
    response = _preflight(client, "http://localhost:3000")
    assert response.headers.get("access-control-allow-origin") == "http://localhost:3000"


def test_unknown_origin_is_rejected(monkeypatch):
    client = _client(monkeypatch, FRONTEND)
    response = _preflight(client, "https://evil.example.com")
    assert "access-control-allow-origin" not in response.headers


def test_frontend_url_unset_allows_only_local_origins(monkeypatch):
    client = _client(monkeypatch, None)
    assert _preflight(client, FRONTEND).headers.get("access-control-allow-origin") is None
    assert (
        _preflight(client, "http://127.0.0.1:3000").headers.get("access-control-allow-origin")
        == "http://127.0.0.1:3000"
    )
