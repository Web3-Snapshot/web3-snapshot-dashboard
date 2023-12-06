import json

from flask import Blueprint, Response, current_app

# from server.routes import sleep_func as sleep

bp = Blueprint("coins", __name__)


@bp.route("/coins", methods=["GET"])
def get_coins():

    coins = current_app.redis_conn.get("coins:all")

    if coins is None:
        return {"error": "No coins found"}, 404

    parsed_coins = json.loads(coins)

    return parsed_coins, 200


def event_stream(redis_conn):
    """Event stream function that listens to a Redis pubsub channel for updates on coin data.
    When a message is received, it retrieves the latest coin data from Redis and yields it.

    Args:
        redis_conn (redis.Redis): A Redis connection object.

    Yields:
        str: A JSON string representing the latest coin data.
    """
    pubsub = redis_conn.pubsub(ignore_subscribe_messages=True)
    pubsub.subscribe("coins")

    for message in pubsub.listen():
        print(message)
        coins = redis_conn.get("coins:all")
        if coins is None:
            continue 

        yield "data:  %s\n\n" % coins


@bp.route("/coin-stream", methods=["GET"])
def get_coin_stream():
    redis_conn = current_app.redis_conn

    return Response(event_stream(redis_conn), mimetype="text/event-stream"), 200
