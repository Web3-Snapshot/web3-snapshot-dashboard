from copy import deepcopy

# def process_percentages(data, keys_to_process):
#     res = data[:]

#     buffer = {}
#     for key in keys_to_process:
#         print("DEBUGGING: ", key)
#         buffer[key] = max(
#             [abs(item.get(key, 0)) for item in data if item.get(key) is not None]
#         )

#     for i, item in enumerate(res):
#         for key in keys_to_process:
#             item[key] = {
#                 "original": int(item[key]) if item.get(key) is not None else None,
#                 "relative": int((abs(item[key]) / buffer[key]) * 100)
#                 if item.get(key) is not None
#                 else 0,
#             }

#     return res


def process_percentages(data):
    d = {}
    keys = [
        # "total_supply",
        "max_supply",
        "ath_change_percentage",
        "price_change_percentage_30d",
        "price_change_percentage_1y",
        "price_change_percentage_7d",
        "fully_diluted_valuation_usd",
        "current_price",
        "circulating_supply",
        "current_price",
        "market_cap_usd",
    ]

    for key in keys:
        print("\nProcesing key", key)
        print()
        original_values = []
        for o in data:
            original_values.append(o[key])

        if None in original_values:
            continue

        if d.get(key) == None:
            d[key] = {}
        d[key]["original"] = original_values

    for key, value in d.items():
        if len(value["original"]) > 0:
            max_value = max([abs(item) for item in value["original"]])
            print(f"max value of {max_value} for {value['original']}")

            d[key]["relative"] = [
                (abs(item) / max_value) * 100 for item in d[key]["original"]
            ]
        else:
            d[key]["relative"] = None

    res = deepcopy(data)
    print(d)

    for key, value in d.items():
        for i, o in enumerate(res):
            o[key] = {
                "original": d[key]["original"][i],
                "relative": d[key]["relative"][i]
                if d[key]["relative"] is not None
                else None,
            }

    return res
