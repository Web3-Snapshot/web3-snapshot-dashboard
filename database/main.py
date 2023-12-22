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


def preprocess_data(coins):
    # Calculate MC/FDV which is the ratio MC/FDV

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


def fetch_and_cache():
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
        # pprint.pprint(
        #     [
        #         {
        #             # "name": coin["name"],
        #             # "market_cap_rank": coin["market_cap_rank"],
        #             "ath_change_percentage": coin["ath_change_percentage"],
        #             "price_change_percentage_24h_in_currency: ": coin[
        #                 "price_change_percentage_24h_in_currency"
        #             ],
        #             "price_change_percentage_7d_in_currency: ": coin[
        #                 "price_change_percentage_7d_in_currency"
        #             ],
        #             "price_change_percentage_30d_in_currency: ": coin[
        #                 "price_change_percentage_30d_in_currency"
        #             ],
        #             "price_change_percentage_1y_in_currency: ": coin[
        #                 "price_change_percentage_1y_in_currency"
        #             ],
        #             "fully_diluted_valuation": coin["fully_diluted_valuation"],
        #         }
        #         for coin in coins[:4]
        #     ]
        # )

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

    except Exception as err:
        print("Something went wrong inside the main function")
        print(err)


if __name__ == "__main__":
    fetch_and_cache()
