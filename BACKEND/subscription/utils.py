import requests
from django.conf import settings

PAYSTACK_SECRET_KEY = getattr(settings, 'PAYSTACK_SECRET_KEY', None)
PAYSTACK_BASE_URL = 'https://api.paystack.co'


def initialize_paystack_payment(email, amount, reference, callback_url):
    headers = {
        'Authorization': 'Bearer {}'.format(PAYSTACK_SECRET_KEY),
        'Content-Type': 'application/json',
    }
    data = {
        'email': email,
        'amount': int(amount * 100),  # Paystack expects amount in kobo
        'reference': reference,
        'callback_url': callback_url,
    }
    response = requests.post(f'{PAYSTACK_BASE_URL}/transaction/initialize', json=data, headers=headers)
    return response.json()


def verify_paystack_payment(reference):
    headers = {
        'Authorization': 'Bearer {}'.format(PAYSTACK_SECRET_KEY),
    }
    response = requests.get(f'{PAYSTACK_BASE_URL}/transaction/verify/{reference}', headers=headers)
    return response.json()