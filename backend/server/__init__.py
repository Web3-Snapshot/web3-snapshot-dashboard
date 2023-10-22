from os import environ
from urllib.parse import quote, urlparse, urlunparse

from flask import Flask
from redis import from_url
from rq import Queue


class PrefixMiddleware(object):
    def __init__(self, app, prefix=""):
        self.app = app
        self.prefix = prefix

    def __call__(self, environ, start_response):
        if environ["PATH_INFO"].startswith(self.prefix):
            environ["PATH_INFO"] = environ["PATH_INFO"][len(self.prefix) :]
            environ["SCRIPT_NAME"] = self.prefix
            return self.app(environ, start_response)
        else:
            start_response("404", [("Content-Type", "text/plain")])
            return ["This url does not belong to the app.".encode()]


def enable_debugger():
    """Starts the debug server for Visual Studio Code on port 5678
    and waits until the debugger attaches"""
    import debugpy

    # 5678 is the default attach port in the VS Code debug configurations
    debugpy.listen(("0.0.0.0", 5678))
    debugpy.wait_for_client()


def get_redis_client(url, password=None):
    # redis.Redis.from_url() doesn't support passing the password separately
    # https://github.com/andymccurdy/redis-py/issues/1347

    if password:
        parts = urlparse(url)
        netloc = f":{quote(password)}@{parts.hostname}"
        if parts.port is not None:
            netloc += f":{parts.port}"

        url = urlunparse(
            (
                parts.scheme,
                netloc,
                parts.path,
                parts.params,
                parts.query,
                parts.fragment,
            )
        )

    return from_url(url, decode_responses=True)


def create_app(config_env="server.config.development"):
    print("Debug option set to", environ.get("DEBUG"))
    if environ.get("DEBUG") == "on":
        enable_debugger()

    app = Flask(__name__, instance_relative_config=True)
    app.wsgi_app = PrefixMiddleware(app.wsgi_app, prefix="/api")

    app.config.from_object(config_env)
    print(app.config)

    from .db import close_connection

    app.teardown_appcontext(close_connection)

    from server.routes import coins

    app.register_blueprint(coins.bp)

    from server.routes import tracking

    app.register_blueprint(tracking.bp)

    if app.config["ENV"] in ["production", "development"]:
        redis_conn = get_redis_client(environ.get("REDIS_URL"))

        app.redis_conn = redis_conn

    return app
