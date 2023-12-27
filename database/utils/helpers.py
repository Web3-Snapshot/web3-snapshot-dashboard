from copy import deepcopy
from typing import List

PRICES_PROPS = [
    "id",
    "symbol",
    "name",
    "image",
    "market_cap_rank",
    "current_price",
    "price_change_percentage_1h_in_currency",
    "price_change_percentage_1h_in_currency_relative",
    "price_change_percentage_24h_in_currency",
    "price_change_percentage_24h_in_currency_relative",
    "price_change_percentage_7d_in_currency",
    "price_change_percentage_7d_in_currency_relative",
    "price_change_percentage_30d_in_currency",
    "price_change_percentage_30d_in_currency_relative",
    "price_change_percentage_1y_in_currency",
    "price_change_percentage_1y_in_currency_relative",
    "ath_change_percentage",
    "ath_change_percentage_relative",
]

TOKENOMICS_PROPS = [
    "id",
    "symbol",
    "image",
    "market_cap_rank",
    "market_cap",
    "fully_diluted_valuation",
    "circulating_supply",
    "circ_supply_total_supply_ratio",
    "mc_fdv_ratio",
    "total_supply",
    "max_supply",
    "total_volume",
]


def calculate_relative_percentage(key, original_value, d):
    if original_value is None:
        return 0
    if original_value >= 0:
        return round(((original_value) / d[key]["positive"]) * 100)
    else:
        return round((abs(original_value) / d[key]["negative"]) * 100)


def process_percentages(data, keys):
    d = {}

    for key in keys:
        positive_max = 0
        negative_max = 0
        for item in data:
            if item.get(key) is None:
                continue
            if item[key] >= 0:
                positive_max = item[key] if item[key] >= positive_max else positive_max
            else:
                negative_max = item[key] if item[key] < negative_max else negative_max

        if d.get(key) == None:
            d[key] = {}
        d[key]["positive"] = positive_max
        d[key]["negative"] = abs(negative_max)

    res = deepcopy(data)

    for key in d.keys():
        for item in res:
            original_value = item[key]
            item[f"{key}_relative"] = calculate_relative_percentage(
                key, original_value, d
            )

    return res


def compute_extra_columns(objs: List):
    res = []
    objects = deepcopy(objs)

    for obj in objects:
        if (
            obj.get("market_cap") is not None
            and obj.get("fully_diluted_valuation") is not None
        ):
            obj["mc_fdv_ratio"] = round(
                obj["market_cap"] / obj["fully_diluted_valuation"], 3
            )
        else:
            obj["mc_fdv_ratio"] = None

        if (
            obj.get("circulating_supply") is not None
            and obj.get("total_supply") is not None
        ):
            obj["circ_supply_total_supply_ratio"] = round(
                obj["circulating_supply"] / obj["total_supply"], 2
            )
        else:
            obj["circ_supply_total_supply_ratio"] = None

        res.append(obj)

    return res


def generate_object_diff(previous_data, current_data):
    """Generate the diff between a previous nested object and a current nested object"""

    diff = {}
    relevant_keys = {
        "prices": [
            "market_cap_rank",
            "current_price",
            "price_change_percentage_1h_in_currency",
            "price_change_percentage_24h_in_currency",
            "price_change_percentage_7d_in_currency",
            "price_change_percentage_30d_in_currency",
            "price_change_percentage_1y_in_currency",
            "ath_change_percentage",
        ],
        "tokenomics": [
            "market_cap_rank",
            "market_cap",
            "fully_diluted_valuation",
            "circulating_supply",
            "total_supply",
            "max_supply",
            "total_volume",
        ],
    }

    for category, category_data in current_data.items():
        # prices or tokenomics
        for coin, coin_data in category_data.items():
            # bitcoin, etherium, ...
            for key in relevant_keys[category]:
                if coin_data[key] != previous_data[category][coin][key]:
                    if diff.get("prices") is None:
                        diff["prices"] = {}
                    if diff.get("tokenomics") is None:
                        diff["tokenomics"] = {}
                    diff["prices"][coin] = current_data["prices"][coin]
                    diff["tokenomics"][coin] = current_data["tokenomics"][coin]
                    break

    return diff


def generate_list_diff(previous_data, current_data):
    """Generate the diff between a previous array and a current array.

    Args:
        previous_data (list): The previous array.
        current_data (list): The current array.

    Returns:
        list: The list contains two lists: the first list contains the items
        that were removed, the second list contains the items that were added.
    """
    diff = [[], []]

    for previous_item in previous_data:
        if previous_item not in current_data:
            diff[0].append(previous_item)

    for current_item in current_data:
        if current_item not in previous_data:
            diff[1].append(current_item)

    return diff


def normalize_coins(coins):
    """Normalizes the coins data.

    Args:
        coins (list): The list of coins.

    Returns:
        list: The normalized coins data.
    """
    data = {"prices": {}, "tokenomics": {}}
    order = []

    for coin in coins:
        data["prices"][coin["id"]] = {
            k: v for (k, v) in coin.items() if k in PRICES_PROPS
        }
        data["tokenomics"][coin["id"]] = {
            k: v for (k, v) in coin.items() if k in TOKENOMICS_PROPS
        }

        order.append(coin["id"])

    return data, order
