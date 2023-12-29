import json
import sqlite3
from os import environ
from pathlib import Path

import redis
from server.db import dict_factory

from database.core.cache import redis_conn as cache

DATABASE_PATH = f"/app/instance/{environ.get('ENVIRONMENT')}.db"
redis_conn = redis.from_url(environ.get("REDIS_URL"))

if Path(DATABASE_PATH).exists():
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = dict_factory
    print("Database connection established (debugging).")
else:
    raise FileNotFoundError("Database file not found.")

cur = conn.cursor()
print("\nCursor (cur) ready.")
print("Try running `cur.execute('SELECT * FROM coins').fetchall()`")
print("Redis connection ready: redis_conn")
