import pytest
from util.helpers import process_percentages


@pytest.fixture
def coin_data():
    return [
        {
            "name": "Bitcoin",
            "price_change_percentage_7d": 3.45469,
            "price_change_percentage_1y": -37.76463,
            "ath_change_percentage": -65.88023,
            "price_change_percentage_30d": 41.53542,
            "timestamp": 1674999721.754476,
            "max_supply": 21000000.0,
            "circulating_supply": 19276125.0,
            "market_cap_usd": 454101002153.0,
            "current_price": 23558.0,
            "fully_diluted_valuation_usd": 494711517238.0,
            "price_change_percentage_24h": 2.60416,
            "id": "bitcoin",
            "total_supply": 21000000.0,
            "market_cap_rank": 1,
            "symbol": "btc",
        },
        {
            "name": "Ethereum",
            "price_change_percentage_7d": -0.68616,
            "price_change_percentage_1y": -36.70394,
            "ath_change_percentage": -66.89862,
            "price_change_percentage_30d": 34.38993,
            "timestamp": 1674999722.11675,
            "max_supply": None,
            "circulating_supply": 120516416.151123,
            "market_cap_usd": 194606353664.0,
            "current_price": 1614.75,
            "fully_diluted_valuation_usd": 194606353664.0,
            "price_change_percentage_24h": 2.67904,
            "id": "ethereum",
            "total_supply": 120516416.151123,
            "market_cap_rank": 2,
            "symbol": "eth",
        },
        {
            "name": "Tether",
            "price_change_percentage_7d": -0.03122,
            "price_change_percentage_1y": -0.21203,
            "ath_change_percentage": -24.47589,
            "price_change_percentage_30d": -0.05938,
            "timestamp": 1674999722.551404,
            "max_supply": None,
            "circulating_supply": 67620214772.9107,
            "market_cap_usd": 67600633098.0,
            "current_price": 0.99971,
            "fully_diluted_valuation_usd": 67600633098.0,
            "price_change_percentage_24h": -0.11791,
            "id": "tether",
            "total_supply": 67620214772.9107,
            "market_cap_rank": 3,
            "symbol": "usdt",
        },
    ]

    # return [
    #     {"market_cap_rank": 101, "total_supply": 10, "ath_change_percentage": 20.0},
    #     {"market_cap_rank": 102, "total_supply": 5, "ath_change_percentage": 100.0},
    #     {"market_cap_rank": 103, "total_supply": -5, "ath_change_percentage": -200.0},
    #     {"market_cap_rank": 104, "total_supply": None, "ath_change_percentage": -100.0},
    # ]


def test_process_percentages(coin_data):
    expected_output = [
        {
            "market_cap_rank": 101,
            "total_supply": {"original": 10, "relative": 100},
            "ath_change_percentage": {"original": 20, "relative": 10},
        },
        {
            "market_cap_rank": 102,
            "total_supply": {"original": 5, "relative": 50},
            "ath_change_percentage": {"original": 100, "relative": 50},
        },
        {
            "market_cap_rank": 103,
            "total_supply": {"original": -5, "relative": 50},
            "ath_change_percentage": {"original": -200, "relative": 100},
        },
        {
            "market_cap_rank": 104,
            "total_supply": {"original": None, "relative": 0},
            "ath_change_percentage": {"original": -100, "relative": 50},
        },
    ]

    assert (
        process_percentages(coin_data, ["total_supply", "ath_change_percentage"])
        == expected_output
    )
