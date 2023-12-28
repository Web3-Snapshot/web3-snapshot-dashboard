import json
from asyncio import sleep
from contextlib import contextmanager
from datetime import datetime, timezone
from functools import partial
from unittest import mock

import pytest
from database_utils.helpers import (
    compute_extra_columns,
    generate_object_diff,
    normalize_coins,
    process_percentages,
)
from fakeredis import FakeStrictRedis
from rq import Queue
from rq.job import Job
from server.routes.coins import event_stream

UPDATED_AT = datetime(2022, 1, 1, 0, 0, 0, tzinfo=timezone.utc).isoformat()

# This has to be in sync with the INSERT_FIELDS array in the main.py from the database container
INSERT_FIELDS = [
    "market_cap_rank",
    "id",
    "symbol",
    "name",
    "image",
    "current_price",
    "market_cap",
    "fully_diluted_valuation",
    "total_volume",
    "high_24h",
    "low_24h",
    "price_change_24h",
    "price_change_percentage_24h",
    "market_cap_change_24h",
    "market_cap_change_percentage_24h",
    "circulating_supply",
    "total_supply",
    "max_supply",
    "ath",
    "ath_change_percentage",
    "ath_date",
    "atl",
    "atl_change_percentage",
    "atl_date",
    # "roi",
    "last_updated",
    "price_change_percentage_1h_in_currency",
    "price_change_percentage_24h_in_currency",
    "price_change_percentage_7d_in_currency",
    "price_change_percentage_14d_in_currency",
    "price_change_percentage_30d_in_currency",
    "price_change_percentage_200d_in_currency",
    "price_change_percentage_1y_in_currency",
    "updated_at",
]


@contextmanager
def mock_events():
    with mock.patch(
        "server.routes.coins.event_stream",
        partial(
            event_stream,
            single=True,
        ),
    ):
        yield


def seed_coin(conn, app):
    values = [
        1,
        "test_id",
        "test_symbol",
        "test_name",
        "test_img_url",
        0.123,
        10,
        1.23,
        1.23,
        1.23,
        1.23,
        1.23,
        1.23,
        1.23,
        1.23,
        1.23,
        1.23,
        1.23,
        1.23,
        1.23,
        "test_timestamp_at",
        1.23,
        1.23,
        "test_timestamp_atl",
        "test_last_updated",
        1.23,
        1.23,
        1.23,
        1.23,
        1.23,
        1.23,
        1.23,
        "test_updated_at",
    ]

    coins = [dict(zip(INSERT_FIELDS, values))]
    coins = compute_extra_columns(coins)
    coins = process_percentages(
        coins,
        [
            "ath_change_percentage",
            "price_change_percentage_1h_in_currency",
            "price_change_percentage_24h_in_currency",
            "price_change_percentage_7d_in_currency",
            "price_change_percentage_30d_in_currency",
            "price_change_percentage_1y_in_currency",
            "fully_diluted_valuation",
        ],
    )

    coins, order = normalize_coins(coins)
    app.redis_conn.set("coins:all", json.dumps(coins))
    app.redis_conn.set("coins:order", json.dumps(order))
    app.redis_conn.set("coins:updated_at", UPDATED_AT)


def test_get_coins(client, db_connection, app):
    """Test case for the 'get_coins' endpoint.

    This test verifies that the 'get_coins' endpoint returns the expected JSON response.

    Args:
        client (TestClient): The test client for making HTTP requests.
        db_connection (DatabaseConnection): The database connection object.
        app (Flask.app): The Flask application object.

    Returns:
        None
    """
    seed_coin(db_connection, app)

    response = client.get("/api/coins")

    assert response.json == {
        "prices": {
            "test_id": {
                "ath_change_percentage": 1.23,
                "ath_change_percentage_relative": 100,
                "current_price": 0.123,
                "id": "test_id",
                "image": "test_img_url",
                "market_cap_rank": 1,
                "name": "test_name",
                "price_change_percentage_1h_in_currency": 1.23,
                "price_change_percentage_1h_in_currency_relative": 100,
                "price_change_percentage_1y_in_currency": 1.23,
                "price_change_percentage_1y_in_currency_relative": 100,
                "price_change_percentage_24h_in_currency": 1.23,
                "price_change_percentage_24h_in_currency_relative": 100,
                "price_change_percentage_30d_in_currency": 1.23,
                "price_change_percentage_30d_in_currency_relative": 100,
                "price_change_percentage_7d_in_currency": 1.23,
                "price_change_percentage_7d_in_currency_relative": 100,
                "symbol": "test_symbol",
            }
        },
        "tokenomics": {
            "test_id": {
                "circ_supply_total_supply_ratio": 1.0,
                "circulating_supply": 1.23,
                "fully_diluted_valuation": 1.23,
                "id": "test_id",
                "image": "test_img_url",
                "market_cap": 10,
                "market_cap_rank": 1,
                "max_supply": 1.23,
                "mc_fdv_ratio": 8.13,
                "symbol": "test_symbol",
                "total_supply": 1.23,
                "total_volume": 1.23,
            },
        },
        "order": ["test_id"],
        "updated_at": UPDATED_AT,
    }

    assert response.json["updated_at"] == str(UPDATED_AT)


# FIXME: This test is not working yet. We need to find a way to run the event stream in
# the background.
@pytest.mark.skip
def test_get_coins_stream(client, app):
    "Test the coin event stream."

    async def send_pubsub():
        pub_payload = {
            "data": {
                "changed": 1,
                "updated_at": UPDATED_AT,
            },
            "errors": [],
        }

        while True:
            await sleep(0.1)
            print("publishing")

            app.redis_conn.publish("coins", json.dumps(pub_payload))

    queue = Queue(is_async=False, connection=app.redis_conn)
    job = queue.enqueue(
        send_pubsub,
    )
    assert job

    with mock_events():
        response = client.get(
            "/api/coin-stream", headers={"Accept": "text/event-stream"}
        )

    assert response.status_code == 200
    # assert response.content_type == "text/event-stream"
    # assert response.headers["Cache-Control"] == "no-cache"
    # assert response.headers["Connection"] == "keep-alive"
    # assert response.headers["X-Accel-Buffering"] == "no"
