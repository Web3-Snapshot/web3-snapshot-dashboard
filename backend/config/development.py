from os import environ
from pathlib import Path

TESTING = False
FLASK_ENV = "development"
FLASK_DEBUG = 1
# LOGLEVEL = environ.get("LOGLEVEL", "DEBUG")

SECRET_KEY = "dev"

# ROOT_PATH = (Path(__file__) / "../..").resolve()
# DATABASE = "db.sqlite"
# DATABASE_URI = f"sqlite:///{ROOT_PATH / 'instance' / DATABASE}"