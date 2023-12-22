"""This module contains functions for fetching data from an API, processing the
data, and storing it in a cache.

The main functionality of this module is to fetch data for the top 100 coins
from an API, calculate the MC/FDV ratio, compare it with the previous data, and
update the cache if there are changes. It also fetches information for single
coin and stores them in the cache under their id.

The module includes the following functions:
- get_single_coin: Retrieves information about a single coin from the API.
- get_coins: Retrieves a list of coins from the API.
- preprocess_data: Calculates the MC/FDV ratio and other percentage values for the coins.
- get_filtered_coin: Filters the coin response data based on specified fields.
- fetch_and_cache: Fetches data from the API and stores it in the cache.

Additionally, the module defines a custom exception class, DataFetcherException,
which is raised when there are errors during data fetching.

Note: The module relies on external dependencies such as requests, cache, and util.helpers.
"""

# Rest of the code...
import json
import pprint
from datetime import datetime, timezone
from os import environ
from pathlib import Path

import requests
from cache import redis_conn
from util.helpers import compute_extra_columns, generate_diff, process_percentages

DB_PATH = f"./instance/{environ.get('ENVIRONMENT')}.db"
SCHEMA_PATH = "./schema.sql"
BASE_URL = environ.get("COIN_API_URL")

COIN_DETAIL_FIELDS = {
    "id": "id",
    "symbol": "symbol",
    "name": "name",
    "image": "image",
    "community_data": "community_data",
    "description": "description.en",
    "homepage": "links.homepage",
    "last_updated": "last_updated",
}


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


class DataFetcherException(Exception):
    """Exception raised for errors that occur during data fetching.

    Attributes:
        message -- explanation of the error
    """

    def __init__(self, message):
        self.message = message
        super().__init__(self.message)


def get_single_coin(coin_id):
    """Retrieves information about a single coin from the API.

    Args:
        coin_id (str): The ID of the coin to retrieve.

    Returns:
        requests.Response: The response object containing the coin information.
    """
    return requests.get(f"{BASE_URL}/coins/{coin_id}")


def get_coins(pages=100):
    """Retrieves a list of coins from the API.

    Args:
        pages (int): The number of pages to retrieve (default is 100).

    Returns:
        requests.Response: The response object containing the list of coins.
    """
    payload = {
        "price_change_percentage": "1h,24h,7d,14d,30d,200d,1y",
        "locale": "en",
        "per_page": pages,
        "page": 1,
        "sparkline": False,
        "vs_currency": "usd",
        "order": "market_cap_desc",
    }
    return requests.get(f"{BASE_URL}/coins/markets", params=payload)


def preprocess_data(coins):
    """Calculate MC/FDV which is the ratio MC/FDV."""

    coins = compute_extra_columns(coins)

    processed_items = process_percentages(
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

    return processed_items


def get_filtered_coin(coin_response):
    """Filters the coin response data based on the specified fields.

    Args:
        coin_response (Response): The response object containing the coin data.

    Returns:
        dict: The filtered coin data.
    """

    def get_nested_value(data, keys):
        for key in keys:
            if key in data:
                data = data[key]
            else:
                return None
        return data

    filtered_coin = {
        key: get_nested_value(coin_response, value.split("."))
        for key, value in COIN_DETAIL_FIELDS.items()
    }

    return filtered_coin


def fetch_and_cache():
    """Fetch data from the API and store it in the cache.

    Fetches data for the top 100 coins, calculates the MC/FDV ratio, compares it
    with the previous data, and updates the cache if there are changes.
    Additionally, fetches information for a single coin (bitcoin) and stores it
    in the cache.

    Raises:
        DataFetcherException: If the status code for fetching the single coin is not 200.

    """
    try:
        response = get_coins(100)  # Get the top 100 coins

        # Calculate MC/FDV which is the ratio MC/FDV
        coins = preprocess_data(response.json())

        previous_data = redis_conn.get("coins:all")

        if previous_data is not None:
            previous_data = json.loads(previous_data)
            diff = generate_diff(previous_data, coins)
        else:
            diff = coins

        print("**************************************")
        print(f"Diff: {len(diff)} rows changed")
        print("**************************************")

        if len(diff) > 0:
            updated_at = datetime.now(timezone.utc).isoformat()
            print(f"Updated at: {updated_at}")
            pub_payload = {
                "data": {
                    "changed": len(diff),
                    "updated_at": updated_at,
                },
                "errors": [],
            }

            redis_conn.publish("coins", json.dumps(pub_payload))
            redis_conn.set("coins:all", json.dumps(coins))
            redis_conn.set("coins:updated_at", updated_at)

    except Exception as err:  # pylint: disable=broad-except
        print("Something went wrong inside the main function while fetching coins")
        print(err)

    ### Fetch single coins
    try:
        coin_response = get_single_coin("bitcoin")

        if coin_response.status_code != 200:
            raise DataFetcherException('Coin "bitcoin" not found')

        filtered_coin = get_filtered_coin(coin_response.json())

        redis_conn.set("coins:bitcoin", json.dumps(filtered_coin))
        print(f"Fetched bitcoin information: {pprint.pprint(filtered_coin)}")

    except Exception as err:  # pylint: disable=broad-except
        print(
            "Something went wrong inside the main function while fetching single coins"
        )
        print(err)


if __name__ == "__main__":
    fetch_and_cache()
