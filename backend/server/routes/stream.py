import json

from flask import Response, current_app
from flask.views import MethodView
from flask_smorest import Blueprint

blp = Blueprint(
    "stream",
    __name__,
    description="Stream the application status to the frontend.",
)


def event_stream(pubsub=None):
    """Handle message formatting"""

    for message in pubsub.listen():
        # 'message'  is a dictionary with the following keys:
        # - type: "message"
        # - pattern: None
        # - channel: "workers"
        # - data: {"data": {"timestamp": "2021-08-04T15:00:00.000Z",
        #                   "x_gyro": 0, "y_gyro": 0, "z_gyro": 0,
        #                   "measurement": {"id": "some-id"}}, error: ["some-error"]}
        #
        # Calling json.dumps(message["data"].decode("utf-8")) will return as string similar to this:
        # '"{\\"data\\": {\\"timestamp\\": \\"2021-08-04T15:00:00.000Z\\", \\"x_gyro\\": 0}, \\"errors\\": []}"'
        data = "data:  %s\n\n" % json.dumps(message["data"].decode("utf-8"))
        yield data


@blp.route("/stream")
class Stream(MethodView):
    """Resource Stream"""

    @blp.response(200, content_type="text/event-stream")
    def get(self):
        """Stream the application status to the frontend.

        The response contains the URL which the frontend will use to re-route to
        if a change is detected by the workers.
        """
        with current_app.app_context():
            pubsub = current_app.redis_conn.pubsub(ignore_subscribe_messages=True)
            pubsub.subscribe("workers")
            return Response(event_stream(pubsub), mimetype="text/event-stream")
