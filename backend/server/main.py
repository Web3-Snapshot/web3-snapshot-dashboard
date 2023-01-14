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


def enable_debugger():
    """Starts the debug server for Visual Studio Code on port 5678
    and waits until the debugger attaches"""
    import debugpy

    # 5678 is the default attach port in the VS Code debug configurations
    print("Waiting for debugger attach")
    debugpy.listen(("localhost", 5678))
    debugpy.wait_for_client()



def create_app(config_location="config.development"):
    # if environ.get("VSCODE_DEBUGGER"):
    #     enable_debugger()


    app = Flask(__name__, instance_relative_config=True)
    app.wsgi_app = PrefixMiddleware(app.wsgi_app, prefix="/api")

    app.config.from_object(config_location)
    print(app.config)

    from .routes import hello

    app.register_blueprint(hello.bp)

    return app