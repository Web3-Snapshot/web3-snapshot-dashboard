import pytest
from utils.helpers import (
    compute_extra_columns,
    generate_object_diff,
    process_percentages,
)


@pytest.fixture
def coin_data():
    return [
        {
            "prop1": 10.0,  # Different signs should generate two independent list
            "prop2": -4.00,  # Same, signs inverted
            "prop3": 16.0,  # One value is `None'; it should be set to 0
            "prop4": -1,  # All values are equal, they should all have a 100% assigned
            "prop5": 144,  # Should not be considered since it is not in the keys list
        },
        {
            "prop1": 100.0,
            "prop2": -8.00,
            "prop3": None,
            "prop4": -1,
            "prop5": 200,
        },
        {"prop1": -100.0, "prop2": 1234.00, "prop3": 4.0, "prop4": -1, "prop5": 400},
    ]


def test_process_percentages(coin_data):
    expected_output = [
        {
            "prop1": 10.0,
            "prop1_relative": 10,
            "prop2": -4.0,
            "prop2_relative": 50,
            "prop3": 16.0,
            "prop3_relative": 100,
            "prop4": -1,
            "prop4_relative": 100,
            "prop5": 144,
        },
        {
            "prop1": 100.0,
            "prop1_relative": 100,
            "prop2": -8.0,
            "prop2_relative": 100,
            "prop3": None,
            "prop3_relative": 0,
            "prop4": -1,
            "prop4_relative": 100,
            "prop5": 200,
        },
        {
            "prop1": -100.0,
            "prop1_relative": 100,
            "prop2": 1234.0,
            "prop2_relative": 100,
            "prop3": 4.0,
            "prop3_relative": 25,
            "prop4": -1,
            "prop4_relative": 100,
            "prop5": 400,
        },
    ]

    assert (
        process_percentages(
            coin_data,
            ["prop1", "prop2", "prop3", "prop4"],
        )
        == expected_output
    )


def test_compute_extra_columns():
    expected = [
        {
            "market_cap": 428569062162,
            "fully_diluted_valuation": 466538642853,
            "circulating_supply": 251816.736,
            "total_supply": 251816.736,
            "mc_fdv_ratio": 0.919,
            "circ_supply_total_supply_ratio": 1.0,
        },
        {
            "market_cap": 188109860328,
            "fully_diluted_valuation": 188109860328,
            "mc_fdv_ratio": 1.0,
            "circ_supply_total_supply_ratio": None,
        },
    ]

    input_data = [
        {
            "market_cap": 428569062162,
            "fully_diluted_valuation": 466538642853,
            "circulating_supply": 251816.736,
            "total_supply": 251816.736,
        },
        {
            "market_cap": 188109860328,
            "fully_diluted_valuation": 188109860328,
        },
    ]
    assert expected == compute_extra_columns(input_data)


def test_generate_diff_all_equal():
    previous_data = current_data = {
        "prices": {
            "bitcoin": {
                "id": "bitcoin",
                "symbol": "btc",
                "name": "Bitcoin",
                "image": "https://assets.coingecko.com/coins/images/1/large/bitcoin.png?1547033579",
                "market_cap_rank": 1,
                "current_price": 27300,
                "price_change_percentage_1h_in_currency": -0.1564735720678735,
                "price_change_percentage_24h_in_currency": -2.248931288518162,
                "price_change_percentage_7d_in_currency": 4.360420461311904,
                "price_change_percentage_30d_in_currency": 5.360420461311904,
                "price_change_percentage_1y_in_currency": 6.360420461311904,
                "ath_change_percentage": 0.23,
                "market_cap": 533052722379,
                "fully_diluted_valuation": 573962971793,
                "circulating_supply": 19503187,
                "total_supply": 21000000,
                "max_supply": 21000000,
                "total_volume": 14118300117,
            },
        },
        "tokenomics": {
            "bitcoin": {
                "id": "bitcoin",
                "symbol": "btc",
                "name": "Bitcoin",
                "image": "https://assets.coingecko.com/coins/images/1/large/bitcoin.png?1547033579",
                "market_cap_rank": 1,
                "current_price": 27300,
                "price_change_percentage_1h_in_currency": -0.1564735720678735,
                "price_change_percentage_24h_in_currency": -2.248931288518162,
                "price_change_percentage_7d_in_currency": 4.360420461311904,
                "price_change_percentage_30d_in_currency": 5.360420461311904,
                "price_change_percentage_1y_in_currency": 6.360420461311904,
                "ath_change_percentage": 0.23,
                "market_cap": 533052722379,
                "fully_diluted_valuation": 573962971793,
                "circulating_supply": 19503187,
                "total_supply": 21000000,
                "max_supply": 21000000,
                "total_volume": 14118300117,
            }
        },
    }

    expected_diff = {}
    assert generate_object_diff(previous_data, current_data) == expected_diff


def test_generate_diff_one_different():
    previous_data = {
        "prices": {
            "bitcoin": {
                "id": "bitcoin",
                "symbol": "btc",
                "name": "Bitcoin",
                "image": "https://assets.coingecko.com/coins/images/1/large/bitcoin.png?1547033579",
                "market_cap_rank": 1,
                "current_price": 27301,
                "price_change_percentage_1h_in_currency": -0.1564735720678735,
                "price_change_percentage_24h_in_currency": -2.248931288518162,
                "price_change_percentage_7d_in_currency": 4.360420461311904,
                "price_change_percentage_30d_in_currency": 5.360420461311904,
                "price_change_percentage_1y_in_currency": 6.360420461311904,
                "ath_change_percentage": 0.23,
            },
            "etherium": {
                "id": "etherium",
                "symbol": "eth",
                "name": "Etherium",
                "image": "https://assets.coingecko.com/coins/images/1/large/etherium.png?1547033579",
                "market_cap_rank": 2,
                "current_price": 7301,
                "price_change_percentage_1h_in_currency": -0.1564735720678735,
                "price_change_percentage_24h_in_currency": -2.248931288518162,
                "price_change_percentage_7d_in_currency": 4.360420461311904,
                "price_change_percentage_30d_in_currency": 5.360420461311904,
                "price_change_percentage_1y_in_currency": 6.360420461311904,
                "ath_change_percentage": 0.23,
            },
        },
        "tokenomics": {
            "bitcoin": {
                "id": "bitcoin",
                "symbol": "btc",
                "name": "Bitcoin",
                "image": "https://assets.coingecko.com/coins/images/1/large/bitcoin.png?1547033579",
                "market_cap": 533052722379,
                "market_cap_rank": 1,
                "fully_diluted_valuation": 573962971793,
                "circulating_supply": 19503187,
                "total_supply": 21000000,
                "max_supply": 21000000,
                "total_volume": 14118300117,
            },
            "etherium": {
                "id": "etherium",
                "symbol": "eth",
                "name": "Etherium",
                "image": "https://assets.coingecko.com/coins/images/1/large/etherium.png?1547033579",
                "market_cap": 533052722379,
                "market_cap_rank": 2,
                "fully_diluted_valuation": 573962971793,
                "circulating_supply": 19503187,
                "total_supply": 21000000,
                "max_supply": 21000000,
                "total_volume": 14118300117,
            },
        },
    }

    current_data = {
        "prices": {
            "bitcoin": {
                "id": "bitcoin",
                "symbol": "btc",
                "name": "Bitcoin",
                "image": "https://assets.coingecko.com/coins/images/1/large/bitcoin.png?1547033579",
                "market_cap_rank": 1,
                "current_price": 27301,
                "price_change_percentage_1h_in_currency": -0.2564735720678735,  # This is the only difference
                "price_change_percentage_24h_in_currency": -2.248931288518162,
                "price_change_percentage_7d_in_currency": 4.360420461311904,
                "price_change_percentage_30d_in_currency": 5.360420461311904,
                "price_change_percentage_1y_in_currency": 6.360420461311904,
                "ath_change_percentage": 0.23,
            },
            "etherium": {
                "id": "etherium",
                "symbol": "eth",
                "name": "Etherium",
                "image": "https://assets.coingecko.com/coins/images/1/large/etherium.png?1547033579",
                "market_cap_rank": 2,
                "current_price": 7301,
                "price_change_percentage_1h_in_currency": -0.1564735720678735,
                "price_change_percentage_24h_in_currency": -2.248931288518162,
                "price_change_percentage_7d_in_currency": 4.360420461311904,
                "price_change_percentage_30d_in_currency": 5.360420461311904,
                "price_change_percentage_1y_in_currency": 6.360420461311904,
                "ath_change_percentage": 0.23,
            },
        },
        "tokenomics": {
            "bitcoin": {
                "id": "bitcoin",
                "symbol": "btc",
                "name": "Bitcoin",
                "image": "https://assets.coingecko.com/coins/images/1/large/bitcoin.png?1547033579",
                "market_cap": 533052722379,
                "market_cap_rank": 1,
                "fully_diluted_valuation": 573962971793,
                "circulating_supply": 19503187,
                "total_supply": 21000000,
                "max_supply": 21000000,
                "total_volume": 14118300117,
            },
            "etherium": {
                "id": "etherium",
                "symbol": "eth",
                "name": "Etherium",
                "image": "https://assets.coingecko.com/coins/images/1/large/etherium.png?1547033579",
                "market_cap": 533052722379,
                "market_cap_rank": 2,
                "fully_diluted_valuation": 573962971793,
                "circulating_supply": 19503187,
                "total_supply": 21000000,
                "max_supply": 21000000,
                "total_volume": 14118300117,
            },
        },
    }

    expected_diff = {
        "prices": {
            "bitcoin": {
                "id": "bitcoin",
                "symbol": "btc",
                "name": "Bitcoin",
                "image": "https://assets.coingecko.com/coins/images/1/large/bitcoin.png?1547033579",
                "market_cap_rank": 1,
                "current_price": 27301,
                "price_change_percentage_1h_in_currency": -0.2564735720678735,
                "price_change_percentage_24h_in_currency": -2.248931288518162,
                "price_change_percentage_7d_in_currency": 4.360420461311904,
                "price_change_percentage_30d_in_currency": 5.360420461311904,
                "price_change_percentage_1y_in_currency": 6.360420461311904,
                "ath_change_percentage": 0.23,
            }
        },
        "tokenomics": {
            "bitcoin": {
                "id": "bitcoin",
                "symbol": "btc",
                "name": "Bitcoin",
                "image": "https://assets.coingecko.com/coins/images/1/large/bitcoin.png?1547033579",
                "market_cap": 533052722379,
                "market_cap_rank": 1,
                "fully_diluted_valuation": 573962971793,
                "circulating_supply": 19503187,
                "total_supply": 21000000,
                "max_supply": 21000000,
                "total_volume": 14118300117,
            }
        },
    }

    assert generate_object_diff(previous_data, current_data) == expected_diff
