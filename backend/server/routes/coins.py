import json
from os import environ

from flask import Blueprint, Response, current_app
from server.db import get_db
from server.routes import sleep_func as sleep
from util.helpers import compute_extra_columns, process_percentages

bp = Blueprint("coins", __name__)


def process_data_stream(conn):
    cur = conn.cursor()
    cur.execute("""SELECT * FROM coins""")
    items = cur.fetchall()

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

    return "data:  %s\n\n" % json.dumps(processed_items)


def event_stream(conn, single=False):
    stop_condition = False
    while not stop_condition:
        if single:
            stop_condition = True

        sleep(60)
        yield process_data_stream(conn)


@bp.route("/coins", methods=["GET"])
def get_coins():
    conn = get_db(current_app)
    cur = conn.cursor()

    cur.execute("""SELECT * FROM coins""")
    items = cur.fetchall()

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


@bp.route("/coin-stream", methods=["GET"])
def get_coin_stream():
    conn = get_db(current_app)

    return Response(event_stream(conn), mimetype="text/event-stream"), 200
