import pytest
import sqlite3
from flask import Flask, g
from server import create_app
from server.db import dict_factory

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


@pytest.fixture(scope="module")
def app():
    app = create_app(config_location="config.testing")
    yield app


@pytest.fixture(scope="function")
def db_connection(app):
    with app.app_context():
        conn = sqlite3.connect(app.config["DATABASE_URI"], uri=True)
        conn.row_factory = dict_factory
        cur = conn.cursor()
        cur.execute(SCHEMA)
        conn.commit()
        g.db = conn
        yield conn

    conn.close()


@pytest.fixture(scope="function")
def client(app: Flask):
    yield app.test_client()
