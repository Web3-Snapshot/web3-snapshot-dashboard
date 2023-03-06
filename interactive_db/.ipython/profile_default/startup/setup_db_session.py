from os import environ
from pathlib import Path
import sqlite3

from server.db import dict_factory

DATABASE_PATH = "./instance/db.sqlite"

env = environ.get("ENV") or "development"

if Path(DATABASE_PATH).exists():
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = dict_factory
    print("Database connection established (debugging).")
else:
    raise FileNotFoundError("Database file not found.")

cur = conn.cursor()
print("\nCursor (cur) ready.")
