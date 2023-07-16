from flask import Blueprint, current_app, g
from server.db import get_db
from util.helpers import compute_extra_columns, process_percentages

bp = Blueprint("coins", __name__, url_prefix="/coins")


@bp.route("", methods=["GET"])
def get_coins():
    conn = get_db(current_app)
    cur = conn.cursor()

    cur.execute("""SELECT * FROM coins""")
    items = cur.fetchall()

    # Calculate MC/FDV which is the ratio MC/FDV
    items = compute_extra_columns(items)

    processed_items = process_percentages(
        items,
        [
            "ath_change_percentage",
            "price_change_percentage_24h",
            "price_change_percentage_7d",
            "price_change_percentage_30d",
            "price_change_percentage_1y",
            "fully_diluted_valuation_usd",
        ],
    )

    return processed_items, 200
