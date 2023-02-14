from flask import Blueprint

from server.db import query_db
from util.helpers import process_percentages, calculate_mc_fdv_ratio

bp = Blueprint("coins", __name__, url_prefix="/coins")


@bp.route("", methods=["GET"])
def get_coins():
    items = query_db(
        """
            SELECT *
            FROM coins
        """
    )

    # Calcultate MC/FDV which is the ratio MC/FDV
    items = calculate_mc_fdv_ratio(items)

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
