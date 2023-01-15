import pytest
from flask import Flask
from server import create_app

CLEAR_TABLES = ""


@pytest.fixture(scope="session")
def app_config():
    return {
        # "DB_NAME": "testing",
        # "DB_USER": "postgres",
        # "DB_PASS": "foobar",
        # "DB_HOST": "localhost",
        "SECRET_KEY": "testing",
        "TESTING": True,
        "DOMAIN": "localhost",
    }


@pytest.fixture(scope="module")
def app(app_config):
    app = create_app(config_location="config.testing")
    yield app

    with app.app_context():
        clear_db()


def clear_db():
    """Clears all data from the database.

    The client fixture runs this after each individual test.
    """
    # db_session = db.connect()

    # cursor = db_session.cursor()
    # cursor.execute(CLEAR_TABLES)

    # db_session.commit()


@pytest.fixture(scope="function")
def client(app: Flask):
    yield app.test_client()
    # with app.app_context():
    # clear_db()
