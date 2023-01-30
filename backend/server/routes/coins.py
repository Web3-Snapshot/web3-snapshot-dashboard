from flask import Blueprint
from server import ma
from server.db import query_db
from util.helpers import process_percentages

bp = Blueprint("coins", __name__, url_prefix="/coins")


class CoinSchema(ma.Schema):
    class Meta:
        fields = (
            "id",
            "name",
            "image_thumb",
            "symbol",
            "homepage",
            "blockchain_site",
            "categories",
            "market_cap_rank",
            "market_cap_usd",
            "fully_diluted_valuation_usd",
            "circulating_supply",
            "total_supply",
            "max_supply",
            "current_price",
            "total_value_locked",
            "price_change_percentage_24h",
            "price_change_percentage_7d",
            "price_change_percentage_30d",
            "price_change_percentage_1y",
            "ath_change_percentage",
            "description",
            "genesis_date",
            "hashing_algorithm",
            "coingecko_score",
            "developer_score",
            "community_score",
            "liquidity_score",
            "public_interest_score",
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
