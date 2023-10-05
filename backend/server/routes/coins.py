import json
from time import sleep

from flask import Blueprint, Response, current_app
from server.db import get_db
from util.helpers import compute_extra_columns, process_percentages

bp = Blueprint("coins", __name__)


def event_stream(cur):
    """Handle message formatting"""

    while True:
        sleep(60)
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

        data = "data:  %s\n\n" % json.dumps(processed_items)
        yield data


@bp.route("/coins", methods=["GET"])
def get_coins():
    conn = get_db(current_app)
    cur = conn.cursor()

    return Response(event_stream(cur), mimetype="text/event-stream"), 200
