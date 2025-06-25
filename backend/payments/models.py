# backend/payments/models.py
from django.db import models
from services.models import ServiceRequest
from django.conf import settings

class Transaction(models.Model):
    class TransactionStatus(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        SUCCESSFUL = 'SUCCESSFUL', 'Successful'
        FAILED = 'FAILED', 'Failed'

    service_request = models.ForeignKey(ServiceRequest, on_delete=models.CASCADE, related_name='transactions')
    customer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    phone_number = models.CharField(max_length=15)
    status = models.CharField(max_length=20, choices=TransactionStatus.choices, default=TransactionStatus.PENDING)
    
    # Fields to store the response from Daraja
    merchant_request_id = models.CharField(max_length=100)
    checkout_request_id = models.CharField(max_length=100)
    result_code = models.CharField(max_length=10, blank=True, null=True)
    result_desc = models.TextField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Transaction {self.id} for Request #{self.service_request.id}"