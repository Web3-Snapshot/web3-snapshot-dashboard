import json
from contextlib import contextmanager
from datetime import datetime, timezone
from functools import partial
from unittest import mock

import pytest
from database_util.helpers import (
    compute_extra_columns,
    generate_diff,
    process_percentages,
)
from server.routes.coins import event_stream


@contextmanager
def mock_events():
    with mock.patch(
        "server.routes.coins.event_stream",
        partial(event_stream, single=True),
    ):
        yield


UPDATED_AT = "2022-01-01T00:00:00Z"

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

    cur = conn.cursor()
    cur.execute(
        f"""
        INSERT INTO coins (
            {", ".join(INSERT_FIELDS)}
        )
        VALUES ({", ".join(["?" for _ in INSERT_FIELDS])})
        """,
        values,
    )
    conn.commit()

    coins = [dict(zip(INSERT_FIELDS, values))]
    coins = compute_extra_columns(coins)
    coins = process_percentages(
        coins,
        [
            "ath_change_percentage",
            "price_change_percentage_24h_in_currency",
            "price_change_percentage_7d_in_currency",
            "price_change_percentage_30d_in_currency",
            "price_change_percentage_1y_in_currency",
            "fully_diluted_valuation",
        ],
    )
    app.redis_conn.set("coins:all", json.dumps(coins))

    app.redis_conn.set("coins:updated_at", UPDATED_AT)


def test_get_coins(client, db_connection, app):
    seed_coin(db_connection, app)

    with mock_events():
        response = client.get("/api/coins")

        assert response.json["payload"] == [
            {
                "market_cap_rank": 1,
                "id": "test_id",
                "symbol": "test_symbol",
                "name": "test_name",
                "image": "test_img_url",
                "current_price": 0.123,
                "market_cap": 10,
                "fully_diluted_valuation": 1.23,
                "total_volume": 1.23,
                "high_24h": 1.23,
                "low_24h": 1.23,
                "price_change_24h": 1.23,
                "price_change_percentage_24h": 1.23,
                "market_cap_change_24h": 1.23,
                "market_cap_change_percentage_24h": 1.23,
                "circulating_supply": 1.23,
                "total_supply": 1.23,
                "max_supply": 1.23,
                "ath": 1.23,
                "ath_change_percentage": 1.23,
                "ath_date": "test_timestamp_at",
                "atl": 1.23,
                "atl_change_percentage": 1.23,
                "atl_date": "test_timestamp_atl",
                "last_updated": "test_last_updated",
                "price_change_percentage_1h_in_currency": 1.23,
                "price_change_percentage_24h_in_currency": 1.23,
                "price_change_percentage_7d_in_currency": 1.23,
                "price_change_percentage_14d_in_currency": 1.23,
                "price_change_percentage_30d_in_currency": 1.23,
                "price_change_percentage_200d_in_currency": 1.23,
                "price_change_percentage_1y_in_currency": 1.23,
                # "ath_change_percentage_in_currency": None,
                # "description": None,
                # "total_value_locked": None,
                # "genesis_date": None,
                # "hashing_algorithm": None,
                # "coingecko_score": None,
                # "developer_score": None,
                # "community_score": None,
                # "liquidity_score": None,
                # "public_interest_score": None,
                # "homepage": None,
                # "blockchain_site": None,
                # "categories": None,
                "updated_at": "test_updated_at",
                "mc_fdv_ratio": 8.13,
                "circ_supply_total_supply_ratio": 1.0,
                "ath_change_percentage_relative": 100,
                "price_change_percentage_24h_in_currency_relative": 100,
                "price_change_percentage_7d_in_currency_relative": 100,
                "price_change_percentage_30d_in_currency_relative": 100,
                "price_change_percentage_1y_in_currency_relative": 100,
                "fully_diluted_valuation_relative": 100,
            }
        ]
        assert response.json["updated_at"] == UPDATED_AT


@pytest.mark.skip
def test_get_coins_stream(client, app):
    with mock_events():
        response = client.get(
            "/api/coin-stream", headers={"Accept": "text/event-stream"}
        )

        app.redis_conn.publish("coins")
        # app.redis_conn.set("coins:all", json.dumps([]))

        assert response.status_code == 200
        assert response.json == {}

        # assert response.content_type == "text/event-stream"
        # assert response.headers["Cache-Control"] == "no-cache"
        # assert response.headers["Connection"] == "keep-alive"
        # assert response.headers["X-Accel-Buffering"] == "no"
