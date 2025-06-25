# backend/payments/admin.py
from django.contrib import admin
from .models import Transaction

@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    """
    Admin View for Transactions.
    """
    # These fields will be displayed in the list view of all transactions.
    list_display = ('id', 'service_request', 'customer', 'amount', 'status', 'created_at')
    
    # This allows you to filter transactions by their status.
    list_filter = ('status',)
    
    # This adds a search box to search by customer email or phone number.
    search_fields = ('customer__email', 'phone_number', 'checkout_request_id')
    
    # Make the fields that come from Safaricom read-only, as they should not be manually edited.
    readonly_fields = ('created_at', 'updated_at', 'merchant_request_id', 'checkout_request_id')