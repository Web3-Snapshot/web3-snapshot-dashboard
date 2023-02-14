from os import environ

from flask import Flask


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


def create_app(config_location="config.development"):

    app = Flask(__name__, instance_relative_config=True)
    app.wsgi_app = PrefixMiddleware(app.wsgi_app, prefix="/api")

    app.config.from_object(config_location)
    print(app.config)

    from .db import close_connection

    app.teardown_appcontext(close_connection)

    from .routes import coins

    app.register_blueprint(coins.bp)

    return app
