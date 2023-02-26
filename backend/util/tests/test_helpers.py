import pytest
from util.helpers import compute_extra_columns, process_percentages


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
            "market_cap_usd": 428569062162,
            "fully_diluted_valuation_usd": 466538642853,
            "circulating_supply": 251816.736,
            "total_supply": 251816.736,
            "mc_fdv_ratio": 0.919,
            "circ_supply_total_supply_ratio": 1.0,
        },
        {
            "market_cap_usd": 188109860328,
            "fully_diluted_valuation_usd": 188109860328,
            "mc_fdv_ratio": 1.0,
            "circ_supply_total_supply_ratio": None,
        },
    ]

    input_data = [
        {
            "market_cap_usd": 428569062162,
            "fully_diluted_valuation_usd": 466538642853,
            "circulating_supply": 251816.736,
            "total_supply": 251816.736,
        },
        {
            "market_cap_usd": 188109860328,
            "fully_diluted_valuation_usd": 188109860328,
        },
    ]
    assert expected == compute_extra_columns(input_data)
