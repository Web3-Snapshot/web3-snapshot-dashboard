import fakeredis
import pytest
from flask import Flask
from server import create_app


@pytest.fixture(scope="module")
def app():
    _app = create_app(config_env="server.config.testing")
    _app.redis_conn = fakeredis.FakeStrictRedis(decode_responses=True)
    yield _app


@pytest.fixture(scope="function")
def client(app: Flask):
    yield app.test_client()
