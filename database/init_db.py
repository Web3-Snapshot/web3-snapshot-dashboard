import sqlite3

DB_PATH = "./instance/db.sqlite"
SCHEMA_PATH = "./schema.sql"

if __name__ == "__main__":
    print("Initializing the database")
    conn = sqlite3.connect(DB_PATH, uri=True)
    cur = conn.cursor()

    with open(SCHEMA_PATH, "r") as sql_file:
        sql_script = sql_file.read()
        cur.executescript(sql_script)

    conn.commit()