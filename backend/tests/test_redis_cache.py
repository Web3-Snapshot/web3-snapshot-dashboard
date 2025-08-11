import json

import pytest

from data_fetcher.utils.helpers import compute_extra_columns, normalize_coins


def test_redis_coin_storage(app):
    """Test storing and retrieving coin data from Redis cache."""
    test_coin = {
        "id": "bitcoin",
        "symbol": "btc",
        "name": "Bitcoin",
        "current_price": 50000,
    }

    app.redis_conn.set("coins:bitcoin", json.dumps(test_coin))
    retrieved = json.loads(app.redis_conn.get("coins:bitcoin"))

    assert retrieved == test_coin


def test_redis_coins_all_storage(app):
    """Test storing normalized coin data in Redis."""
    coins = [{"id": "bitcoin", "market_cap_rank": 1, "current_price": 50000}]
    coins = compute_extra_columns(coins)
    normalized, order = normalize_coins(coins)

    app.redis_conn.set("coins:all", json.dumps(normalized))
    app.redis_conn.set("coins:order", json.dumps(order))

    retrieved_data = json.loads(app.redis_conn.get("coins:all"))
    retrieved_order = json.loads(app.redis_conn.get("coins:order"))

    assert "prices" in retrieved_data
    assert "tokenomics" in retrieved_data
    assert retrieved_order == ["bitcoin"]


def test_redis_pubsub(app):
    """Test Redis pub/sub functionality."""
    test_message = {"data": {"changed": 1, "updated_at": "2023-01-01"}}

    pubsub = app.redis_conn.pubsub()
    pubsub.subscribe("coins")
    pubsub.get_message()  # Clear subscription message

    app.redis_conn.publish("coins", json.dumps(test_message))
    message = pubsub.get_message(timeout=1)

    assert message is not None
    assert message["type"] == "message"
    assert json.loads(message["data"]) == test_message


def test_redis_key_expiry(app):
    """Test Redis key operations."""
    app.redis_conn.set("test:key", "value")
    assert app.redis_conn.get("test:key") == "value"

    app.redis_conn.delete("test:key")
    assert app.redis_conn.get("test:key") is None


def test_redis_coin_ids_rotation(app):
    """Test coin IDs rotation storage."""
    coin_ids = ["bitcoin", "ethereum", "cardano"]

    app.redis_conn.set("coins:ids", json.dumps(coin_ids))
    retrieved_ids = json.loads(app.redis_conn.get("coins:ids"))

    assert retrieved_ids == coin_ids
