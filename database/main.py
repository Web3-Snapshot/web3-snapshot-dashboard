import sqlite3
from datetime import datetime
from functools import reduce
from pathlib import Path

import requests


def deep_get(dictionary, keys, default=None):
    return reduce(
        lambda d, key: d.get(key, default) if isinstance(d, dict) else default,
        keys.split("."),
        dictionary,
    )


COINS = 100
URL1 = f"https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page={COINS}&page=1&sparkline=false&price_change_percentage=1h%2C%2024h%2C%207d%2C%2030d%2C%20200d%2C%201y%2C%203y"
URL2 = f"https://api.coingecko.com/api/v3/coins"

DB_PATH = "./instance/db.sqlite"

SCHEMA = """
            CREATE TABLE IF NOT EXISTS coins
            (
                [id] VARCHAR(20) PRIMARY KEY,
                [name] VARCHAR(50),
                [image_thumb] TEXT,
                [symbol] TEXT,
                [homepage] TEXT,
                [blockchain_site] TEXT,
                [categories] TEXT,
                [market_cap_rank] INTEGER,
                [market_cap_usd] REAL,
                [fully_diluted_valuation_usd] REAL,
                [circulating_supply] REAL,
                [total_supply] REAL,
                [max_supply] REAL,
                [current_price] REAL,
                [total_value_locked] REAL,
                [price_change_percentage_24h] REAL,
                [price_change_percentage_7d] REAL,
                [price_change_percentage_30d] REAL,
                [price_change_percentage_1y] REAL,
                [ath_change_percentage] REAL,
                [description] TEXT,
                [genesis_date] TEXT,
                [hashing_algorithm] TEXT,
                [coingecko_score] REAL,
                [developer_score] REAL,
                [community_score] REAL,
                [liquidity_score] REAL,
                [public_interest_score] REAL,
                [timestamp] DATE DEFAULT (datetime('now','localtime'))
            );
        """


def setup_database(database):
    conn = sqlite3.connect(database)
    cur = conn.cursor()

    cur.execute(SCHEMA)

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
        conn = sqlite3.connect(db_path)
    except Exception as err:
        print(err)

    return conn


INSERT_SQL = """
    INSERT INTO coins (
        id,
        name,
        image_thumb,
        symbol,
        homepage,
        blockchain_site,
        categories,
        market_cap_rank,
        market_cap_usd,
        fully_diluted_valuation_usd,
        circulating_supply,
        total_supply,
        max_supply,
        current_price,
        total_value_locked,
        price_change_percentage_24h,
        price_change_percentage_7d,
        price_change_percentage_30d,
        price_change_percentage_1y,
        ath_change_percentage,
        description,
        genesis_date,
        hashing_algorithm,
        coingecko_score,
        developer_score,
        community_score,
        liquidity_score,
        public_interest_score,
        timestamp
        )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
        price_change_percentage_24h=?,
        price_change_percentage_7d=?,
        price_change_percentage_30d=?,
        price_change_percentage_1y=?,
        ath_change_percentage=?,
        description=?,
        genesis_date=?,
        hashing_algorithm=?,
        coingecko_score=?,
        developer_score=?,
        community_score=?,
        liquidity_score=?,
        public_interest_score=?,
        timestamp=?
    WHERE
        id = ?
    """


def main():

    if not Path(DB_PATH).is_file():
        setup_database(DB_PATH)

    conn = create_connection(DB_PATH)

    with conn:
        try:
            response = requests.get(URL1)
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

            cur = conn.cursor()
            cur.execute("""SELECT id FROM coins""")

            stored_coins = [c[0] for c in cur.fetchall()]
            new_coins = [c["id"] for c in coins]

            next_batch_coins = [
                c for c in coins if c["id"] in list(set(new_coins) - set(stored_coins))
            ][:5]

            if len(next_batch_coins) > 0:

                print("Fetching next batch", [c["name"] for c in next_batch_coins])

                for coin in next_batch_coins:
                    coin_item = requests.get(f"{URL2}/{coin['id']}").json()

                    cur.execute(
                        INSERT_SQL,
                        [
                            coin_item["id"],
                            coin_item["name"],
                            coin_item["image"]["thumb"],
                            coin_item["symbol"],
                            ", ".join(
                                [
                                    item
                                    for item in coin_item["links"]["homepage"]
                                    if item
                                ]
                            ),
                            ", ".join(
                                [
                                    item
                                    for item in coin_item["links"]["blockchain_site"]
                                    if item
                                ]
                            ),
                            ", ".join(coin_item["categories"]),
                            coin_item["market_cap_rank"],
                            coin_item["market_data"]["market_cap"]["usd"],
                            coin_item["market_data"]["fully_diluted_valuation"].get(
                                "usd"
                            ),
                            coin_item["market_data"]["circulating_supply"],
                            coin_item["market_data"]["total_supply"],
                            coin_item["market_data"]["max_supply"],
                            coin_item["market_data"]["current_price"]["usd"],
                            deep_get(
                                coin_item["market_data"], "total_value_locked.usd"
                            ),
                            coin_item["market_data"]["price_change_percentage_24h"],
                            coin_item["market_data"]["price_change_percentage_7d"],
                            coin_item["market_data"]["price_change_percentage_30d"],
                            coin_item["market_data"]["price_change_percentage_1y"],
                            coin_item["market_data"]["ath_change_percentage"]["usd"],
                            coin_item["description"]["en"],
                            coin_item["genesis_date"],
                            coin_item["hashing_algorithm"],
                            coin_item["coingecko_score"],
                            coin_item["developer_score"],
                            coin_item["community_score"],
                            coin_item["liquidity_score"],
                            coin_item["public_interest_score"],
                            datetime.timestamp(datetime.now()),
                        ],
                    )

                conn.commit()
            else:

                cur.execute(
                    """
                    SELECT
                        id, timestamp, market_cap_rank
                    FROM
                        coins
                    ORDER BY
                        timestamp ASC, market_cap_rank ASC
                    LIMIT 5
                    """
                )

                update_batch_coins = [d[0] for d in [c for c in cur.fetchall()]]

                print(
                    "Updating next batch",
                    update_batch_coins,
                )

                for coin in update_batch_coins:
                    coin_item = requests.get(f"{URL2}/{coin}").json()

                    cur.execute(
                        UPDATE_SQL,
                        [
                            ", ".join(
                                [
                                    item
                                    for item in coin_item["links"]["homepage"]
                                    if item
                                ]
                            ),
                            ", ".join(
                                [
                                    item
                                    for item in coin_item["links"]["blockchain_site"]
                                    if item
                                ]
                            ),
                            ", ".join(coin_item["categories"]),
                            coin_item["market_cap_rank"],
                            coin_item["market_data"]["market_cap"]["usd"],
                            coin_item["market_data"]["fully_diluted_valuation"].get(
                                "usd"
                            ),
                            coin_item["market_data"]["circulating_supply"],
                            coin_item["market_data"]["total_supply"],
                            coin_item["market_data"]["max_supply"],
                            coin_item["market_data"]["current_price"]["usd"],
                            deep_get(
                                coin_item["market_data"], "total_value_locked.usd"
                            ),
                            coin_item["market_data"]["price_change_percentage_24h"],
                            coin_item["market_data"]["price_change_percentage_7d"],
                            coin_item["market_data"]["price_change_percentage_30d"],
                            coin_item["market_data"]["price_change_percentage_1y"],
                            coin_item["market_data"]["ath_change_percentage"]["usd"],
                            coin_item["description"]["en"],
                            coin_item["genesis_date"],
                            coin_item["hashing_algorithm"],
                            coin_item["coingecko_score"],
                            coin_item["developer_score"],
                            coin_item["community_score"],
                            coin_item["liquidity_score"],
                            coin_item["public_interest_score"],
                            datetime.timestamp(datetime.now()),
                            coin_item["id"],
                        ],
                    )

                conn.commit()

        except Exception as err:
            print("Something went wrong inside the main function")
            print(err)


if __name__ == "__main__":
    main()
