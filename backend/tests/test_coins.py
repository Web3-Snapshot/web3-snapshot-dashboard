import json
from contextlib import contextmanager
from functools import partial
from unittest import mock

import pytest
from server.routes.coins import event_stream


@contextmanager
def mock_events():
    with mock.patch(
        # NOTE: For example, if your function is found in app/views/translations.py,
        # then this import path would be 'app.views.translations.event_stream'
        "server.routes.coins.event_stream",
        partial(event_stream, single=True),
    ):
        yield


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


def seed_coin(conn):
    cur = conn.cursor()
    cur.execute(
        f"""
        INSERT INTO coins (
            {", ".join(INSERT_FIELDS)}
        )
        VALUES ({", ".join(["?" for _ in INSERT_FIELDS])})
        """,
        [
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
        ],
    )
    conn.commit()


def test_get_coins(client, db_connection):
    seed_coin(db_connection)

    with mock_events():
        response = client.get("/api/coins")

        # We have to remove the "data:  " part from the response before we can parse it
        assert json.loads(response.data[6:]) == [
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
                "ath_change_percentage_in_currency": None,
                "description": None,
                "total_value_locked": None,
                "genesis_date": None,
                "hashing_algorithm": None,
                "coingecko_score": None,
                "developer_score": None,
                "community_score": None,
                "liquidity_score": None,
                "public_interest_score": None,
                "homepage": None,
                "blockchain_site": None,
                "categories": None,
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
