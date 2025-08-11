import json
from os import environ

import redis

from data_fetcher.core.cache import redis_conn as cache

redis_conn = redis.from_url(environ.get("REDIS_URL"))

print("Redis connection ready: redis_conn")
print("Cache helper ready: cache")
print("Try running `redis_conn.keys('coins:*')` to see available data")
