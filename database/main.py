from pathlib import Path
import requests
import sqlite3

COINS = 7
URL1 = f"https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page={COINS}&page=1&sparkline=false&price_change_percentage=1h%2C%2024h%2C%207d%2C%2030d%2C%20200d%2C%201y%2C%203y"
URL2 = f"https://api.coingecko.com/api/v3/coins"

DB_PATH = "./instance/db.sqlite"

SCHEMA = """
            CREATE TABLE IF NOT EXISTS coins
            ([id] VARCHAR(20) PRIMARY KEY, [name] VARCHAR(50), [rank] INTEGER)
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
    INSERT INTO coins (id, name, rank)
    VALUES (?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
    name=excluded.name,
    rank=excluded.rank
    """


def main():

    if not Path(DB_PATH).is_file():
        setup_database(DB_PATH)

    conn = create_connection(DB_PATH)

    with conn:
        try:
            response = requests.get(URL1)
            coins = response.json()

            for coin in coins:
                coin_item = requests.get(f"{URL2}/{coin['id']}").json()

                print(f"id: {coin_item['id']}")
                print(f"name: {coin_item['name']}")
                print(f"rank: {coin_item['coingecko_rank']}")

                cur = conn.cursor()
                cur.execute(
                    INSERT_SQL,
                    [
                        coin_item["id"],
                        coin_item["name"],
                        coin_item["coingecko_rank"],
                    ],
                )

            conn.commit()

        except Exception as err:
            print("Something went wrong inside the main function")
            print(err)


if __name__ == "__main__":
    main()
