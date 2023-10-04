from flask import Blueprint, current_app  # pylint: disable=import-error
from server.db import get_db
from util.helpers import compute_extra_columns, process_percentages

bp = Blueprint("coins", __name__)


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
