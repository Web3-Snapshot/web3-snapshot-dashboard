import requests

COINS = 5
URL1 = f"https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page={COINS}&page=1&sparkline=false&price_change_percentage=1h%2C%2024h%2C%207d%2C%2030d%2C%20200d%2C%201y%2C%203y"
URL2 = f"https://api.coingecko.com/api/v3/coins"


def main():
    try:
        response = requests.get(URL1)
        coins = response.json()

        for coin in coins:
            print(requests.get(f"{URL2}/{coin['id']}").json())

    except Exception as err:
        print("Something went wrong inside the main function", exc_info=True)
        print(err)


if __name__ == "__main__":
    main()
