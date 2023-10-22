import json

from flask import Blueprint, Response, current_app

# from server.routes import sleep_func as sleep

bp = Blueprint("coins", __name__)


@bp.route("/coins", methods=["GET"])
def get_coins():
    coins = json.loads(current_app.redis_conn.get("coins:all"))

    if coins is None:
        return {"error": "No coins found"}, 404

    return coins, 200


def event_stream(redis_conn):
    pubsub = redis_conn.pubsub(ignore_subscribe_messages=True)
    pubsub.subscribe("coins")

    for message in pubsub.listen():
        print(message)
        coins = json.loads(redis_conn.get("coins:all"))

        yield "data:  %s\n\n" % json.dumps(coins)


@bp.route("/coin-stream", methods=["GET"])
def get_coin_stream():
    redis_conn = current_app.redis_conn

    return Response(event_stream(redis_conn), mimetype="text/event-stream"), 200
