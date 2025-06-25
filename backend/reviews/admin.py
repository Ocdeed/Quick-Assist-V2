# backend/reviews/admin.py
from django.contrib import admin
from .models import Review

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    """
    Admin View for Reviews.
    """
    # Fields to display in the list view of all reviews.
    list_display = ('id', 'service_request', 'customer', 'provider', 'rating', 'created_at')

    # Allow filtering reviews by rating.
    list_filter = ('rating',)
    
    # Add a search box to search by the customer's or provider's email.
    search_fields = ('customer__email', 'provider__email', 'comment')
    
    # Make some fields read-only since they are set automatically.
    readonly_fields = ('created_at',)