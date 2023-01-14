from os import environ
from pathlib import Path

# We set the environment to development before loading this config
# so that flask and plugins initialize correctly to dev configs. Then, we
# overwrite the env here.
ENV = "testing"
TESTING = True
# LOGLEVEL = environ.get("LOGLEVEL", "DEBUG")

SECRET_KEY = "dev"

# In-memory database
DATABASE_URI = environ.get("DATABASE", "sqlite://")