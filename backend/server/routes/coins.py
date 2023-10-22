import json

from flask import Blueprint, Response, current_app
from server.routes import sleep_func as sleep
from util.helpers import compute_extra_columns, process_percentages

bp = Blueprint("coins", __name__)


def process_data_stream(coins):
    # Calculate MC/FDV which is the ratio MC/FDV

    coins = compute_extra_columns(coins)

    processed_items = process_percentages(
        coins,
        [
            "ath_change_percentage",
            "price_change_percentage_24h_in_currency",
            "price_change_percentage_7d_in_currency",
            "price_change_percentage_30d_in_currency",
            "price_change_percentage_1y_in_currency",
            "fully_diluted_valuation",
        ],
    )

    return "data:  %s\n\n" % json.dumps(processed_items)


@bp.route("/coins", methods=["GET"])
def get_coins():
    items = json.loads(current_app.redis_conn.get("coins:all"))

    if items is None:
        return {"error": "No coins found"}, 404

    # Calculate MC/FDV which is the ratio MC/FDV
    items = compute_extra_columns(items)

    processed_items = process_percentages(
        items,
        [
            "ath_change_percentage",
            "price_change_percentage_24h_in_currency",
            "price_change_percentage_7d_in_currency",
            "price_change_percentage_30d_in_currency",
            "price_change_percentage_1y_in_currency",
            "fully_diluted_valuation",
        ],
    )

    return processed_items, 200


def event_stream(redis_conn):
    pubsub = redis_conn.pubsub(ignore_subscribe_messages=True)
    pubsub.subscribe("coins")

    for message in pubsub.listen():
        print(message)
        coins = json.loads(redis_conn.get("coins:all"))

        yield process_data_stream(coins)


@bp.route("/coin-stream", methods=["GET"])
def get_coin_stream():
    redis_conn = current_app.redis_conn

    return Response(event_stream(redis_conn), mimetype="text/event-stream"), 200
