import pytest
from flask import Flask
from server import create_app
from server.db import get_db


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


def create_db(db):
    cur = db.cursor()
    cur.execute(SCHEMA)
    db.commit()


def seed_db(db):
    cur = db.cursor()
    cur.execute(
        """
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

                """,
        [
            "test_id",
            "test_name",
            "test_img_thumb",
            "test_symbol",
            0.123,
            10.3,
            20.4,
            34.4,
            17.4,
            10032.0,
            20934.3,
            20934.0,
            2390.1,
            2034.5,
            10934.0,
            1003203.0,
        ],
    )
    db.commit()


def clear_db(app):
    with app.app_context():
        db = get_db()
        db.cursor().execute(
            """
                    DELETE FROM coins;
                """
        )
        db.commit()


@pytest.fixture(scope="module")
def app():
    app = create_app(config_location="config.testing")
    with app.app_context():
        db = get_db()
        create_db(db)
        seed_db(db)
        yield app


@pytest.fixture(scope="function")
def client(app: Flask):
    yield app.test_client()
    clear_db(app)
