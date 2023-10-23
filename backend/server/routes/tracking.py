import json
from time import sleep

from flask import Blueprint, Response, current_app
from server.db import get_db

bp = Blueprint("tracking", __name__)


def event_stream(redis_conn):
    """Handle message formatting"""

    pubsub = redis_conn.pubsub(ignore_subscribe_messages=True)
    pubsub.subscribe("coins")

    for message in pubsub.listen():
        data = "data:  %s\n\n" % json.dumps(message["data"])
        yield data


@bp.route("/tracking/timestamp", methods=["GET"])
def get_tracking_stream():
    redis_conn = current_app.redis_conn
    return Response(event_stream(redis_conn), mimetype="text/event-stream"), 200
