from os import environ
from pathlib import Path

ENV = "production"
TESTING = False
FLASK_ENV = "production"
FLASK_DEBUG = 0
LOGLEVEL = environ.get("LOGLEVEL", "DEBUG")

SECRET_KEY = environ.get("SECRET_KEY")

ROOT_PATH = "/app"
DATABASE_NAME = "production.db"
DATABASE_URI = f"{ROOT_PATH}/instance/{DATABASE_NAME}"
