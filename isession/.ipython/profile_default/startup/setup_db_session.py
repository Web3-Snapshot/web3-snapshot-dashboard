import sqlite3
from os import environ
from pathlib import Path

from server.db import dict_factory

DATABASE_PATH = f"/app/instance/{environ.get('ENVIRONMENT')}.db"

if Path(DATABASE_PATH).exists():
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = dict_factory
    print("Database connection established (debugging).")
else:
    raise FileNotFoundError("Database file not found.")

cur = conn.cursor()
print("\nCursor (cur) ready.")
print("Try running `cur.execute('SELECT * FROM coins').fetchall()`")
