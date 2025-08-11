from os import environ

from redis import from_url

redis_conn = from_url(environ.get("REDIS_URL"))
