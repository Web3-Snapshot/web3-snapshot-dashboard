import pytest
from flask import g


def seed_coin(db):
    cur = db.cursor()
    cur.execute(
        """
        INSERT INTO coins (
            id,
            name,
            image_thumb,
            symbol,
            market_cap_rank,
            market_cap_usd,
            fully_diluted_valuation_usd,
            circulating_supply,
            total_supply,
            max_supply,
            current_price,
            price_change_percentage_24h,
            price_change_percentage_7d,
            price_change_percentage_30d,
            price_change_percentage_1y,
            ath_change_percentage
            )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)

                """,
        [
            "test_id",
            "test_name",
            "test_img_thumb",
            "test_symbol",
            0.123,
            10.3,
            20.4,
            34.4,
            17.4,
            10032.0,
            20934.3,
            20934.0,
            2390.1,
            2034.5,
            10934.0,
            1003203.0,
        ],
    )
    db.commit()


def test_get_coins(client):
    db = g._db
    seed_coin(db)

    response = client.get("/api/coins")

    assert response.status_code == 200
    assert len(response.json) == 1
    assert all(
        [
            True if el in response.json[0] else False
            for el in [
                "id",
                "name",
                "image_thumb",
                "symbol",
                "market_cap_rank",
                "market_cap_usd",
                "fully_diluted_valuation_usd",
                "circulating_supply",
                "total_supply",
                "max_supply",
                "current_price",
                "price_change_percentage_24h",
                "price_change_percentage_7d",
                "price_change_percentage_30d",
                "price_change_percentage_1y",
                "ath_change_percentage",
            ]
        ]
    )
