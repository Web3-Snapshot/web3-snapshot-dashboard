import sqlite3
from datetime import datetime
from functools import reduce
from os import environ
from pathlib import Path

import requests

DB_PATH = f"./instance/{environ.get('ENVIRONMENT')}.db"
SCHEMA_PATH = "./schema.sql"
BASE_URL = "https://api.coingecko.com/api/v3/coins"

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
    return requests.get(f"{BASE_URL}/markets", params=payload)


def deep_get(dictionary, keys, default=None):
    return reduce(
        lambda d, key: d.get(key, default) if isinstance(d, dict) else default,
        keys.split("."),
        dictionary,
    )


def transformListToCleanString(list_item):
    return ", ".join([item for item in list_item if item])


def setup_database(db_path):
    conn = sqlite3.connect(db_path, uri=True)
    cur = conn.cursor()

    with open(SCHEMA_PATH, "r") as sql_file:
        sql_script = sql_file.read()
        cur.executescript(sql_script)

    conn.commit()


def create_connection(db_path):
    """Create a database connection to the SQLite database

    ARGS:
        db_file: database file

    RETURNS:
        Connection object or None
    """

    conn = None
    try:
        conn = sqlite3.connect(db_path, uri=True)
    except Exception as err:
        print(err)

    return conn


UPSERT_SQL = f"""
    INSERT OR REPLACE INTO coins (
        {", ".join(INSERT_FIELDS)}
        )
    VALUES ({", ".join(["?" for _ in INSERT_FIELDS])})
    """

UPDATE_SQL = """
    UPDATE
        coins
    SET
        homepage=?,
        blockchain_site=?,
        categories=?,
        market_cap_rank=?,
        market_cap_usd=?,
        fully_diluted_valuation_usd=?,
        circulating_supply=?,
        total_supply=?,
        max_supply=?,
        current_price=?,
        total_value_locked=?,
        price_change_percentage_24h_in_currency=?,
        price_change_percentage_7d_in_currency=?,
        price_change_percentage_30d_in_currency=?,
        price_change_percentage_1y_in_currency=?,
        ath_change_percentage=?,
        total_volume=?,
        description=?,
        genesis_date=?,
        hashing_algorithm=?,
        coingecko_score=?,
        developer_score=?,
        community_score=?,
        liquidity_score=?,
        public_interest_score=?,
        updated_at=?
    WHERE
        id = ?
    """


def main():
    if not Path(DB_PATH).exists():
        setup_database(DB_PATH)

    conn = create_connection(DB_PATH)

    with conn:
        cur = conn.cursor()
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

            for coin in coins:
                cur.execute(
                    UPSERT_SQL,
                    [
                        coin[prop]
                        if prop != "updated_at"
                        else datetime.utcnow().isoformat()
                        for prop in INSERT_FIELDS
                    ],
                )

            cur.execute(
                f"""INSERT OR REPLACE INTO tracking (id,updated_at) VALUES (1,'{datetime.utcnow().isoformat()}')"""
            )
            conn.commit()

        except Exception as err:
            print("Something went wrong inside the main function")
            print(err)


if __name__ == "__main__":
    main()
