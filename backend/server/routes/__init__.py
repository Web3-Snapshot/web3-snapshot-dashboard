from os import environ

sleep_func = None

if environ.get("ENVIRONMENT") == "development":
    import time

    sleep_func = time.sleep

else:
    import gevent

    sleep_func = gevent.sleep


__all__ = ["sleep_func"]
