from os import environ

ENV = "development"
TESTING = False
FLASK_ENV = "development"
FLASK_DEBUG = 0
LOGLEVEL = environ.get("LOGLEVEL", "DEBUG")

SECRET_KEY = "dev"

ROOT_PATH = "/app"
