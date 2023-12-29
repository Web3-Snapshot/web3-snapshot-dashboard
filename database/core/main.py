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

Note: The module relies on external dependencies such as requests, cache, and utils.helpers.
"""

import json
import pprint
import traceback
from datetime import datetime, timezone
from os import environ

import requests
from core.cache import redis_conn
from utils.helpers import (
    compute_extra_columns,
    generate_list_diff,
    generate_object_diff,
    normalize_coins,
    process_percentages,
)

DB_PATH = f"./instance/{environ.get('ENVIRONMENT')}.db"
SCHEMA_PATH = "./schema.sql"
BASE_URL = environ.get("COIN_API_URL")
NUMBER_OF_SINGLE_COINS = 2

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
            "price_change_percentage_1h_in_currency",
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
        coins_response = get_coins(100)  # Get the top 100 coins

        # Calculate MC/FDV which is the ratio MC/FDV
        coins = preprocess_data(coins_response.json())
        normalized_coins, order = normalize_coins(coins)

        previous_data = redis_conn.get("coins:all")

        if previous_data is not None:
            # If we have data stored from the run before, we deserialize it
            previous_data = json.loads(previous_data)
            diff = generate_object_diff(previous_data, normalized_coins)
        else:
            diff = normalized_coins

        diff_length = diff.get("prices") and len(diff["prices"]) or 0
        print("**************************************")
        print(f"Diff: {diff_length} rows changed")
        # print(f"Diff: {pprint.pprint(diff)}")
        print("**************************************")

        if diff_length > 0:
            updated_at = datetime.now(timezone.utc).isoformat()
            data, order = normalize_coins(coins)
            redis_conn.set("coins:all", json.dumps(data))
            redis_conn.set("coins:order", json.dumps(order))
            redis_conn.set("coins:updated_at", updated_at)

            print("order:", order)
            print("updated_at:", updated_at)
            pub_payload = {
                "data": {
                    "changed": diff_length,
                    "updated_at": updated_at,
                },
                "errors": [],
            }
            redis_conn.publish("coins", json.dumps(pub_payload))

    except Exception as err:  # pylint: disable=broad-except
        print("Something went wrong inside the main function while fetching all coins")
        print(err)
        print(traceback.format_exc())

    ### Fetch single coins
    try:
        coins = json.loads(redis_conn.get("coins:all"))
        # {prices: {bitcoin: {id: 1, name: "Bitcoin", ...}}, tokenomics:
        # {bitcoin: {id: 1, ...}, order: [bitcoin, ...], updated_at: ...}
        incoming_ids = [coin["id"] for coin in coins_response.json()]

        rotating_ids = redis_conn.get("coins:ids")
        if rotating_ids is None:
            rotating_ids = incoming_ids
            redis_conn.set("coins:ids", json.dumps(rotating_ids))

        # Convert to list
        rotating_ids = json.loads(rotating_ids)

        # Generate the diff and return the removed and new ids
        removed_ids, new_ids = generate_list_diff(rotating_ids, incoming_ids)
        print(f"Removed ids: {removed_ids}")
        print(f"New ids: {new_ids}")

        # First remove the obsolete ids
        rotating_ids = [id for id in rotating_ids if id not in removed_ids]

        # Then add the new ids (2 max) to the beginning of the list
        rotating_ids = (new_ids + rotating_ids)[:100]

        # Make requests to the first couple of ids
        for coin_id in rotating_ids[:NUMBER_OF_SINGLE_COINS]:
            coin_response = get_single_coin(coin_id)

            if coin_response.status_code != 200:
                raise DataFetcherException(
                    f'Coin "{coin_id}" not found, {coin_response.json()}'
                )

            filtered_coin = get_filtered_coin(coin_response.json())

            redis_conn.set(f"coins:{coin_id}", json.dumps(filtered_coin))

        # Remove the first id and add it to the end of the list
        rotating_ids = (
            rotating_ids[NUMBER_OF_SINGLE_COINS:]
            + rotating_ids[:NUMBER_OF_SINGLE_COINS]
        )
        print(f"rotating_ids before save: {rotating_ids}")
        redis_conn.set("coins:ids", json.dumps(rotating_ids))

    except Exception as err:  # pylint: disable=broad-except
        print(
            "Something went wrong inside the main function while fetching single coins"
        )
        print(err)
        print(traceback.format_exc())


if __name__ == "__main__":
    fetch_and_cache()
