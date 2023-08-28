from os import environ
from pathlib import Path

ENV = "development"
TESTING = False
FLASK_ENV = "development"
FLASK_DEBUG = 0
LOGLEVEL = environ.get("LOGLEVEL", "DEBUG")

SECRET_KEY = "dev"

ROOT_PATH = "/app"
DATABASE_NAME = "db.sqlite"
DATABASE_URI = f"{ROOT_PATH}/instance/{DATABASE_NAME}"
