# backend/payments/daraja_api.py
import os
import requests
from requests.auth import HTTPBasicAuth
from datetime import datetime
import base64

from dotenv import load_dotenv

load_dotenv() # Load environment variables

DARAJA_CONSUMER_KEY = os.getenv('DARAJA_CONSUMER_KEY')
DARAJA_CONSUMER_SECRET = os.getenv('DARAJA_CONSUMER_SECRET')
DARAJA_API_BASE_URL = 'https://sandbox.safaricom.co.ke/'

def get_daraja_access_token():
    """Fetches access token from the Daraja API."""
    try:
        res = requests.get(
            f'{DARAJA_API_BASE_URL}/oauth/v1/generate?grant_type=client_credentials',
            auth=HTTPBasicAuth(DARAJA_CONSUMER_KEY, DARAJA_CONSUMER_SECRET)
        )
        res.raise_for_status() # Raise an exception for bad status codes
        return res.json()['access_token']
    except requests.exceptions.RequestException as e:
        print(f"Error fetching Daraja token: {e}")
        return None

def trigger_stk_push(phone_number, amount, business_short_code, passkey, transaction_desc, callback_url, reference):
    """Initiates an STK push request."""
    access_token = get_daraja_access_token()
    if not access_token:
        return None

    api_url = f'{DARAJA_API_BASE_URL}/mpesa/stkpush/v1/processrequest'
    
    timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
    password_str = business_short_code + passkey + timestamp
    password_bytes = password_str.encode('utf-8')
    encoded_password = base64.b64encode(password_bytes).decode('utf-8')

    headers = {'Authorization': f'Bearer {access_token}'}
    
    payload = {
        'BusinessShortCode': business_short_code,
        'Password': encoded_password,
        'Timestamp': timestamp,
        'TransactionType': 'CustomerPayBillOnline', # or "CustomerBuyGoodsOnline"
        'Amount': str(amount),
        'PartyA': phone_number,
        'PartyB': business_short_code,
        'PhoneNumber': phone_number,
        'CallBackURL': callback_url,
        'AccountReference': reference,
        'TransactionDesc': transaction_desc,
    }

    try:
        response = requests.post(api_url, json=payload, headers=headers)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error triggering STK push: {e}")
        # To get more details on failure
        if e.response:
             print("Error response:", e.response.json())
        return None