import pytest


def test_get_coins(client):
    response = client.get("/api/coins")
    assert response.status_code == 200
    assert all(
        [
            True
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
            if el in response.json
        ]
    )
