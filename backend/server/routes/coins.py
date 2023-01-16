from datetime import datetime

from flask import Blueprint
from server import ma
from server.db import query_db

bp = Blueprint("coins", __name__, url_prefix="/coins")


class CoinSchema(ma.Schema):
    class Meta:
        fields = (
            "id",
            "name",
            "image_thumb",
            "symbol",
            "market_cap_rank",
            "market_cap_usd",
            "fully_diluted_valuation_usd",
            "circulating_supply",
            "total_supply",
            "max_supply",
            "current_price",
            "price_change_percentage_24h",
            "price_change_percentage_7d",
            "price_change_percentage_30d",
            "price_change_percentage_1y",
            "ath_change_percentage",
            "timestamp",
        )


coins_schema = CoinSchema(many=True)


@bp.route("", methods=["GET"])
def get_coins():
    items = query_db(
        """
            SELECT *
            FROM coins
        """
    )

    return coins_schema.dump(items), 200
