import json
from unittest.mock import Mock, patch

import pytest
from core.main import DataFetcherException, fetch_and_cache


@patch("core.main.redis_conn")
@patch("core.main.get_coins")
def test_fetch_and_cache_new_data(mock_get_coins, mock_redis_conn):
    """Test fetch_and_cache with new data."""
    # Setup mock response
    mock_response = Mock()
    mock_response.json.return_value = [
        {
            "id": "bitcoin",
            "market_cap_rank": 1,
            "current_price": 50000,
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
    mock_get_coins.return_value = mock_response

    # Setup mock Redis
    mock_redis_conn.get.return_value = None
    mock_redis_conn.set.return_value = True
    mock_redis_conn.publish.return_value = True

    # Run function
    fetch_and_cache()

    # Verify Redis operations
    assert mock_redis_conn.set.called
    assert mock_redis_conn.publish.called


@patch("core.main.redis_conn")
@patch("core.main.get_coins")
def test_fetch_and_cache_no_changes(mock_get_coins, mock_redis_conn):
    """Test fetch_and_cache when no data changes."""
    # Setup existing data
    existing_data = {
        "prices": {"bitcoin": {"current_price": 50000}},
        "tokenomics": {"bitcoin": {"market_cap": 1000000}},
    }

    mock_response = Mock()
    mock_response.json.return_value = [
        {
            "id": "bitcoin",
            "market_cap_rank": 1,
            "current_price": 50000,
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
    mock_get_coins.return_value = mock_response

    # Setup Redis with existing data
    mock_redis_conn.get.return_value = json.dumps(existing_data)
    mock_redis_conn.set.return_value = True

    # Run function
    fetch_and_cache()

    # Should still call get but may not publish if no changes
    assert mock_redis_conn.get.called


@patch("core.main.redis_conn")
@patch("core.main.get_single_coin")
@patch("core.main.get_coins")
def test_fetch_single_coin_error(mock_get_coins, mock_get_single_coin, mock_redis_conn):
    """Test handling of single coin fetch errors."""
    # Setup main coins response
    mock_response = Mock()
    mock_response.json.return_value = [{"id": "bitcoin"}]
    mock_get_coins.return_value = mock_response

    # Setup single coin error response
    mock_single_response = Mock()
    mock_single_response.status_code = 404
    mock_single_response.json.return_value = {"error": "Not found"}
    mock_get_single_coin.return_value = mock_single_response

    # Setup Redis mock responses
    def mock_get(key):
        if key == "coins:all":
            return json.dumps({"prices": {"bitcoin": {}}})
        elif key == "coins:ids":
            return json.dumps(["bitcoin"])
        return None

    mock_redis_conn.get.side_effect = mock_get
    mock_redis_conn.set.return_value = True

    # Should not raise exception, should handle gracefully
    fetch_and_cache()

    assert mock_get_single_coin.called


def test_data_fetcher_exception_handling():
    """Test DataFetcherException is properly raised."""
    with pytest.raises(DataFetcherException) as exc_info:
        raise DataFetcherException("Test error")

    assert "Test error" in str(exc_info.value)
