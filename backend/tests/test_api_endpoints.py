import json

import pytest


def test_get_coin_not_found(client, app):
    """Test getting a coin that doesn't exist."""
    response = client.get("/api/coins/nonexistent")

    assert response.status_code == 404
    assert response.json == {"error": "No coin found"}


def test_get_coins_empty_cache(client, app):
    """Test getting coins when cache is empty."""
    response = client.get("/api/coins")

    assert response.status_code == 404
    assert response.json == {"error": "No coins found"}


def test_get_coins_missing_order(client, app):
    """Test getting coins when order is missing."""
    app.redis_conn.set("coins:all", json.dumps({"prices": {}, "tokenomics": {}}))

    response = client.get("/api/coins")

    assert response.status_code == 404
    assert response.json == {"error": "No sort order found"}


def test_get_single_coin_success(client, app):
    """Test successfully getting a single coin."""
    coin_data = {
        "id": "bitcoin",
        "symbol": "btc",
        "name": "Bitcoin",
        "image": "bitcoin.png",
    }

    app.redis_conn.set("coins:bitcoin", json.dumps(coin_data))

    response = client.get("/api/coins/bitcoin")

    assert response.status_code == 200
    assert response.json == coin_data


def test_api_cors_headers(client):
    """Test API response headers."""
    response = client.get("/api/coins")

    # Should have proper content type even on error
    assert "application/json" in response.content_type
