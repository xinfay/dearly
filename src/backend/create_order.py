import requests
import json
import os
from dotenv import load_dotenv
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware


load_dotenv()
API_TOKEN = os.getenv("PRINTFUL_API_TOKEN")


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic model
class Order(BaseModel):
    name: str
    address: str
    quantity: int
    variantId: int
    city: str
    statecode: str
    countrycode: str
    zip: str
    url: str

# Build payload for Printful
def get_data(order: Order):
    data = {
        "recipient": {
            "name": order.name,
            "address1": order.address,
            "city": order.city,
            "state_code": order.statecode,
            "country_code": order.countrycode,
            "zip": order.zip
        },
        "items": [
            {
                "variant_id": order.variantId,
                "quantity": order.quantity,
                "files": [
                    {
                        "url": order.url
                    }
                ]
            }
        ]
    }
    return data

# FASTAPI ROUTE CALLS PRINTFUL
@app.post("/api/create-order")
async def create_order(order: Order):
    print("✅ Received Order:", order.dict())

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {API_TOKEN}"
    }

    payload = get_data(order)

    # Automatically confirms: POST https://api.printful.com/orders?confirm=1
    # Keeps as draft: POST https://api.printful.com/orders
    response = requests.post("https://api.printful.com/orders", headers=headers, json=payload)

    try:
        result = response.json()
        print("📦 Printful Response:", json.dumps(result, indent=4))
        return result
    except json.JSONDecodeError:
        print("❌ Failed to decode response:")
        print(response.text)
        return {"error": "Invalid JSON response from Printful"}
