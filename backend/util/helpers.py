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


def calculate_mc_fdv_ratio(objs: List):
    res = []
    objects = deepcopy(objs)

    for obj in objects:
        if (
            obj["market_cap_usd"] is not None
            and obj["fully_diluted_valuation_usd"] is not None
        ):
            obj["mc_fdv_ratio"] = round(
                obj["market_cap_usd"] / obj["fully_diluted_valuation_usd"], 2
            )
        else:
            obj["mc_fdv_ratio"] = None

        res.append(obj)

    return res
