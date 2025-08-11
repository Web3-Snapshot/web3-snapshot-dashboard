from os import environ

ENV = "production"
TESTING = False
FLASK_ENV = "production"
FLASK_DEBUG = 0
LOGLEVEL = environ.get("LOGLEVEL", "DEBUG")

SECRET_KEY = environ.get("SECRET_KEY")

ROOT_PATH = "/app"
