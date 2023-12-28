import json

from flask import Blueprint, Response, current_app

bp = Blueprint("coins", __name__)


@bp.route("/coins/<string:coin_id>", methods=["GET"])
def get_coin(coin_id):
    """Retrieve information about a specific coin.

    Args:
        coin_id (str): The ID of the coin.

    Returns:
        tuple: A tuple containing the coin information and the HTTP status code.
    """
    coin = current_app.redis_conn.get(f"coins:{coin_id}")
    if coin is None:
        return {"error": "No coin found"}, 404

    coin = json.loads(coin)

    return coin, 200


@bp.route("/coins", methods=["GET"])
def get_coins():
    """Retrieve the list of coins from the Redis cache.

    Returns:
        A tuple containing the parsed coins and the last updated timestamp.
        If no coins are found, returns an error message with status code 404.
    """
    coins = current_app.redis_conn.get("coins:all")
    if coins is None:
        return {"error": "No coins found"}, 404
    coins = json.loads(coins)

    order = current_app.redis_conn.get("coins:order")
    if order is None:
        return {"error": "No sort order found"}, 404
    order = json.loads(order)

    updated_at = current_app.redis_conn.get("coins:updated_at")

    parsed_coins = {
        "prices": coins["prices"],
        "tokenomics": coins["tokenomics"],
        "order": order,
        "updated_at": updated_at,
    }

    return parsed_coins, 200


def event_stream(redis_conn, pubsub, single=False):
    """Event stream function that listens to a Redis pubsub channel for updates on coin data.
    When a message is received, it retrieves the latest coin data from Redis and yields it.

    Args:
        pubsub: (Redis.pubsub): A Redis pubsub connection.

    Yields:
        str: A JSON string representing the latest coin data.
    """
    for message in pubsub.listen():
        print(message)
        coins = redis_conn.get("coins:all")
        if coins is None:
            return {"error": "No coins found"}, 404
        coins = json.loads(coins)

        order = redis_conn.get("coins:order")
        if order is None:
            return {"error": "No sort order found"}, 404
        order = json.loads(order)

        updated_at = redis_conn.get("coins:updated_at")

        payload = {
            "prices": coins["prices"],
            "tokenomics": coins["tokenomics"],
            "order": order,
            "updated_at": updated_at,
        }

        if single:
            single = False
            yield "data: %s\n\n" % json.dumps(payload)

        yield "data:  %s\n\n" % json.dumps(payload)


@bp.route("/coin-stream", methods=["GET"])
def get_coin_stream():
    """Get the coin stream.

    Returns:
        Response: The response containing the coin stream as a text/event-stream.
    """
    redis_conn = current_app.redis_conn
    pubsub = redis_conn.pubsub(ignore_subscribe_messages=True)
    pubsub.subscribe("coins")

    return Response(event_stream(redis_conn, pubsub), mimetype="text/event-stream"), 200
