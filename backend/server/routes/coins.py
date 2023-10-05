import json
from time import sleep, time

from flask import Blueprint, Response, current_app
from server.db import get_db
from util.helpers import compute_extra_columns, process_percentages

bp = Blueprint("coins", __name__)


def process_data_stream(cur):
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


def event_stream(single=False):
    """Handle message formatting"""
    stop_condition = False
    while not stop_condition:
        if single:
            stop_condition = True
        conn = get_db(current_app)
        cur = conn.cursor()

        yield process_data_stream(cur)


@bp.route("/coins", methods=["GET"])
def get_coins():
    return Response(event_stream(), mimetype="text/event-stream"), 200
