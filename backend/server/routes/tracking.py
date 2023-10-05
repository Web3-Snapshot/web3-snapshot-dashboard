import json
from time import sleep

from flask import Blueprint, Response, current_app
from server.db import get_db

bp = Blueprint("tracking", __name__)


def event_stream(cur):
    """Handle message formatting"""

    while True:
        cur.execute("""SELECT updated_at FROM tracking LIMIT 1""")
        payload = cur.fetchone()
        data = "data:  %s\n\n" % json.dumps(payload)
        sleep(1)
        yield data


@bp.route("/tracking/timestamp", methods=["GET"])
def get_tracking_stream():
    conn = get_db(current_app)
    cur = conn.cursor()
    return Response(event_stream(cur), mimetype="text/event-stream"), 200
