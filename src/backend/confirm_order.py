import requests
import os
from dotenv import load_dotenv

load_dotenv()
API_TOKEN = os.getenv("PRINTFUL_API_TOKEN")
PRINTFUL_API_URL = "https://api.printful.com/orders"

def confirm_printful_order(order_data):
    """
    order_data should include:
    - recipient (dict)
    - items (list of dicts)
    """
    headers = {
        "Authorization": f"Bearer {API_TOKEN}",
        "Content-Type": "application/json"
    }

    payload = {
        "recipient": order_data["recipient"],  # Name, address, etc.
        "items": order_data["items"],          # Each with variant_id, quantity, etc.
        "external_id": order_data.get("external_id"),  # Optional: link to your order ID
    }

    response = requests.post(PRINTFUL_API_URL, json=payload, headers=headers)

    if response.status_code == 200 or response.status_code == 201:
        return {
            "success": True,
            "data": response.json()
        }
    else:
        return {
            "success": False,
            "status_code": response.status_code,
            "error": response.json()
        }
