import sqlite3
from os import environ

import fakeredis
import pytest
from flask import Flask, g
from server import create_app
from server.db import dict_factory

SCHEMA_PATH = "./schema.sql"


def init_db(cur):
    with open(SCHEMA_PATH, "r") as sql_file:
        sql_script = sql_file.read()
        cur.executescript(sql_script)


@pytest.fixture(scope="module")
def app():
    app = create_app(config_env="server.config.testing")
    app.redis_conn = fakeredis.FakeStrictRedis(decode_responses=True)
    yield app


@pytest.fixture(scope="function")
def db_connection(app):
    with app.app_context():
        conn = sqlite3.connect(app.config["DATABASE_URI"], uri=True)
        conn.row_factory = dict_factory
        cur = conn.cursor()
        init_db(cur)
        g.db = conn
        yield conn

    conn.close()


@pytest.fixture(scope="function")
def client(app: Flask):
    yield app.test_client()
