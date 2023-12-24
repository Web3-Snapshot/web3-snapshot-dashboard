from copy import deepcopy
from typing import List


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
    """Generate the diff between a previous array of objects and a current array of objects"""
    diff = []
    relevant_keys = [
        "market_cap_rank",
        "current_price",
        "price_change_percentage_24h_in_currency",
        "price_change_percentage_7d_in_currency",
        "price_change_percentage_30d_in_currency",
        "price_change_percentage_1y_in_currency",
        "ath_change_percentage",
        "fully_diluted_valuation",
        "mc_fdv_ratio",
        "total_supply",
        "max_supply",
        "circ_supply_total_supply_ratio",
        "total_volume",
    ]
    for current_item in current_data:
        previous_item = next(
            (item for item in previous_data if item["id"] == current_item["id"]),
            None,
        )
        if previous_item is None:
            diff.append(current_item)
        else:
            for key in relevant_keys:
                if current_item[key] != previous_item[key]:
                    diff.append(current_item)
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
