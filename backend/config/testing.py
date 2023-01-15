from os import environ

ENV = "testing"
TESTING = True
LOGLEVEL = environ.get("LOGLEVEL", "DEBUG")

SECRET_KEY = "testing"

# In-memory database
DATABASE_URI = "file::memory:?cache=shared"
