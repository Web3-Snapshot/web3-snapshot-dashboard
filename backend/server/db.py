import sqlite3
from pathlib import Path

from config.development import ROOT_PATH
from flask import current_app, g


def dict_factory(cursor, row):
    d = {}
    for idx, col in enumerate(cursor.description):
        d[col[0]] = row[idx]
    return d


def _connect(app):
    if Path(app.config["DATABASE_URI"]).exists():
        conn = sqlite3.connect(app.config["DATABASE_URI"], uri=True)
        conn.row_factory = dict_factory
        g.db = conn
        return conn
    else:
        raise FileNotFoundError("Database file not found.")


def get_db(app):
    conn = getattr(g, "db", None)
    if conn is None:
        conn = _connect(app)
    return conn


def close_connection(exception=None):
    db = getattr(g, "_database", None)
    if db is not None:
        db.close()
