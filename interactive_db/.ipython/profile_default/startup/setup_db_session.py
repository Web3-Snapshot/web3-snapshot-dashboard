import sqlite3
from os import environ
from pprint import pprint

from server import create_app
from server.db import dict_factory


def fetchall(result):
    return pprint(result)


env = environ.get("ENV") or "development"

app = create_app("config.development")


db = sqlite3.connect(app.config["DATABASE_URI"])
db.row_factory = dict_factory

cur = db.cursor()
print("\nCursor (cur) ready.")
