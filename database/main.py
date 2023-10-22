import json
from datetime import datetime
from os import environ
from pathlib import Path

import requests
from cache import redis_conn

DB_PATH = f"./instance/{environ.get('ENVIRONMENT')}.db"
SCHEMA_PATH = "./schema.sql"
BASE_URL = environ.get("COIN_API_URL")


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


def get_coins(pages=100):
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


UPSERT_SQL = f"""
    INSERT OR REPLACE INTO coins (
        {", ".join(INSERT_FIELDS)}
        )
    VALUES ({", ".join(["?" for _ in INSERT_FIELDS])})
    """


def fetch_and_cache():
    try:
        print("##############################################")
        response = get_coins(100)  # Get the top 100 coins
        coins = response.json()
        print(
            [
                {
                    "name": coin["name"],
                    "market_cap_rank": coin["market_cap_rank"],
                }
                for coin in coins
            ]
        )

        redis_conn.set("coins:all", json.dumps(coins))
        redis_conn.publish("coins", json.dumps({"data": "update", "errors": []}))

    except Exception as err:
        print("Something went wrong inside the main function")
        print(err)


if __name__ == "__main__":
    fetch_and_cache()
