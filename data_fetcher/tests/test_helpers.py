import pytest
from utils.helpers import (
    compute_extra_columns,
    generate_object_diff,
    process_percentages,
)


@pytest.fixture
def coin_data():
    """Fixture for the coin data with some fictional properties."""
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
    """Test the process_percentages function.

    Args:
        coin_data (list): List of coin data.

    Returns:
        None
    """
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
    """Test case for the compute_extra_columns function.

    This test case verifies that the compute_extra_columns function correctly
    computes the extra columns for the given input data and returns the expected
    output.

    The input data consists of a list of dictionaries, where each dictionary
    represents a data entry with various properties such as market_cap,
    fully_diluted_valuation, circulating_supply, and total_supply.

    The expected output is a list of dictionaries, where each dictionary
    represents a data entry with the computed extra columns such as mc_fdv_ratio
    and circ_supply_total_supply_ratio which are computed from the input data.
    """
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

    assert compute_extra_columns(input_data) == expected


def test_generate_diff_all_equal():
    """Return an empty dictionary when the two data objects are equal.

    The expected behavior is that the function should return an empty
    dictionary, indicating that there are no differences between the two data
    objects.
    """
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


def test_generate_diff_one_new_coins():
    """Test case for generating the difference between previous and current data
    when there is one new coin added.

    In this case we have a change in the first coin's
    price_change_percentage_1h_in_currency and a new coin added to the data.
    Both should be returned in the diff.
    """
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

    assert generate_object_diff(previous_data, current_data) == expected_diff


def test_generate_diff_one_coin_removed():
    """Test case for generating the difference between previous and current data
    when there is a coin removed.

    In this case we have a change in the first coin's
    price_change_percentage_1h_in_currency and one coins from the previous run
    was removed.  The diff should only return the first coin, in the second one
    we're not interested anymore.
    """
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
        },
    }

    assert generate_object_diff(previous_data, current_data) == expected_diff
