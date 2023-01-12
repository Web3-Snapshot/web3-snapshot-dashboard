from pathlib import Path
import requests
import sqlite3

COINS = 6
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
                [market_cap_rank] INTEGER,
                [market_cap_usd] REAL,
                [fully_diluted_valuation_usd] REAL,
                [circulating_supply] REAL,
                [total_supply] REAL,
                [max_supply] REAL,
                [current_price] REAL,
                [price_change_percentage_24h] REAL,
                [price_change_percentage_7d] REAL,
                [price_change_percentage_30d] REAL,
                [price_change_percentage_1y] REAL,
                [ath_change_percentage] REAL
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


UPSERT_SQL = """
    INSERT INTO coins (
        id,
        name,
        image_thumb,
        symbol,
        market_cap_rank,
        market_cap_usd,
        fully_diluted_valuation_usd,
        circulating_supply,
        total_supply,
        max_supply,
        current_price,
        price_change_percentage_24h,
        price_change_percentage_7d,
        price_change_percentage_30d,
        price_change_percentage_1y,
        ath_change_percentage
        )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
    id=excluded.id,
    name=excluded.name,
    image_thumb=excluded.image_thumb,
    symbol=excluded.symbol,
    market_cap_rank=excluded.market_cap_rank,
    market_cap_usd=excluded.market_cap_usd,
    fully_diluted_valuation_usd=excluded.fully_diluted_valuation_usd,
    circulating_supply=excluded.circulating_supply,
    total_supply=excluded.total_supply,
    max_supply=excluded.max_supply,
    current_price=excluded.current_price,
    price_change_percentage_24h=excluded.price_change_percentage_24h,
    price_change_percentage_7d=excluded.price_change_percentage_7d,
    price_change_percentage_30d=excluded.price_change_percentage_30d,
    price_change_percentage_1y=excluded.price_change_percentage_1y,
    ath_change_percentage=excluded.ath_change_percentage;
    """


def main():

    if not Path(DB_PATH).is_file():
        setup_database(DB_PATH)

    conn = create_connection(DB_PATH)

    with conn:
        try:
            response = requests.get(URL1)
            coins = response.json()
            print(coins)

            for coin in coins:
                coin_item = requests.get(f"{URL2}/{coin['id']}").json()

                cur = conn.cursor()
                cur.execute(
                    UPSERT_SQL,
                    [
                        coin_item["id"],
                        coin_item["name"],
                        coin_item["image"]["thumb"],
                        coin_item["symbol"],
                        coin_item["market_cap_rank"],
                        coin_item["market_data"]["market_cap"]["usd"],
                        coin_item["market_data"]["fully_diluted_valuation"]["usd"],
                        coin_item["market_data"]["circulating_supply"],
                        coin_item["market_data"]["total_supply"],
                        coin_item["market_data"]["max_supply"],
                        coin_item["market_data"]["current_price"]["usd"],
                        coin_item["market_data"]["price_change_percentage_24h"],
                        coin_item["market_data"]["price_change_percentage_7d"],
                        coin_item["market_data"]["price_change_percentage_30d"],
                        coin_item["market_data"]["price_change_percentage_1y"],
                        coin_item["market_data"]["ath_change_percentage"]["usd"],
                    ],
                )

            conn.commit()

        except Exception as err:
            print("Something went wrong inside the main function")
            print(err)


if __name__ == "__main__":
    main()
