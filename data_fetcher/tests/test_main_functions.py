import json
from unittest.mock import Mock, patch

import pytest
from core.main import (
    COIN_DETAIL_FIELDS,
    DataFetcherException,
    get_filtered_coin,
    preprocess_data,
)


def test_get_filtered_coin():
    """Test filtering coin response data."""
    mock_response = {
        "id": "bitcoin",
        "symbol": "btc",
        "name": "Bitcoin",
        "image": "bitcoin.png",
        "description": {"en": "Bitcoin description"},
        "links": {"homepage": ["https://bitcoin.org"]},
        "last_updated": "2023-01-01T00:00:00Z",
    }

    filtered = get_filtered_coin(mock_response)

    assert filtered["id"] == "bitcoin"
    assert filtered["symbol"] == "btc"
    assert filtered["description"] == "Bitcoin description"
    assert filtered["homepage"] == ["https://bitcoin.org"]


def test_get_filtered_coin_missing_fields():
    """Test filtering with missing nested fields."""
    mock_response = {"id": "bitcoin", "symbol": "btc"}

    filtered = get_filtered_coin(mock_response)

    assert filtered["id"] == "bitcoin"
    assert filtered["description"] is None
    assert filtered["homepage"] is None


def test_preprocess_data():
    """Test data preprocessing."""
    coins = [
        {
            "id": "bitcoin",
            "market_cap": 1000000,
            "fully_diluted_valuation": 1200000,
            "ath_change_percentage": -50.5,
            "price_change_percentage_1h_in_currency": 1.0,
            "price_change_percentage_24h_in_currency": 2.5,
            "price_change_percentage_7d_in_currency": 5.0,
            "price_change_percentage_30d_in_currency": 10.0,
            "price_change_percentage_1y_in_currency": 50.0,
        }
    ]

    processed = preprocess_data(coins)

    assert len(processed) == 1
    assert "mc_fdv_ratio" in processed[0]
    assert processed[0]["ath_change_percentage_relative"] == 100


def test_data_fetcher_exception():
    """Test DataFetcherException creation."""
    message = "Test error message"
    exception = DataFetcherException(message)

    assert str(exception) == message
    assert exception.message == message


@patch("core.main.requests.get")
def test_get_single_coin_api_call(mock_get):
    """Test API call for single coin."""
    from core.main import get_single_coin

    mock_response = Mock()
    mock_response.status_code = 200
    mock_response.json.return_value = {"id": "bitcoin"}
    mock_get.return_value = mock_response

    result = get_single_coin("bitcoin")

    assert result.status_code == 200
    mock_get.assert_called_once()


@patch("core.main.requests.get")
def test_get_coins_api_call(mock_get):
    """Test API call for multiple coins."""
    from core.main import get_coins

    mock_response = Mock()
    mock_response.status_code = 200
    mock_response.json.return_value = [{"id": "bitcoin"}]
    mock_get.return_value = mock_response

    result = get_coins(10)

    assert result.status_code == 200
    mock_get.assert_called_once()

    # Verify correct parameters were passed
    call_args = mock_get.call_args
    assert "per_page" in call_args[1]["params"]
    assert call_args[1]["params"]["per_page"] == 10
