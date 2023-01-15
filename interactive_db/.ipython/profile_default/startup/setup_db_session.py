from os import environ
from pprint import pprint
import sqlite3

from server import create_app
from server.routes.coins import coins_schema


def fetchall(result, schema=coins_schema):
    res = schema.dumps(result)
    pprint(res)
    return res


env = environ.get("ENV") or "development"

app = create_app("config.development")


db = sqlite3.connect(app.config["DATABASE_URI"])
db.row_factory = sqlite3.Row

cur = db.cursor()
print("\nCursor (cur) ready.")
