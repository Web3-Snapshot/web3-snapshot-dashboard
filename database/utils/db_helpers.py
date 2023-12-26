import sqlite3

SCHEMA_PATH = "./schema.sql"


def setup_database(db_path):
    """
    Sets up a SQLite database at the specified path with the schema defined in SCHEMA_PATH.

    Args:
        db_path (str): The path to the database file.

    Returns:
        None
    """
    conn = sqlite3.connect(db_path, uri=True)
    cur = conn.cursor()

    with open(SCHEMA_PATH, "r", encoding="UTF-8") as sql_file:
        sql_script = sql_file.read()
        cur.executescript(sql_script)

    conn.commit()


def create_connection(db_path):
    """Create a database connection to the SQLite database

    ARGS:
        db_file: database file

    RETURNS:
        Connection object or None
    """

    conn = None
    try:
        conn = sqlite3.connect(db_path, uri=True)
    except Exception as err:
        print(err)

    return conn
