# backend/services/models.py
from django.db import models
from django.conf import settings # Best practice to import User model this way

class ServiceCategory(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    icon_url = models.URLField(max_length=255, blank=True, null=True)

    class Meta:
        verbose_name_plural = "Service Categories"

    def __str__(self):
        return self.name

class Service(models.Model):
    category = models.ForeignKey(ServiceCategory, related_name='services', on_delete=models.CASCADE)
    name = models.CharField(max_length=100, unique=True)
    base_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, help_text="Optional estimated price")

    def __str__(self):
        return f"{self.category.name} - {self.name}"

class ServiceRequest(models.Model):
    class ServiceRequestStatus(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        ACCEPTED = 'ACCEPTED', 'Accepted'
        IN_PROGRESS = 'IN_PROGRESS', 'In Progress'
        COMPLETED = 'COMPLETED', 'Completed'
        CANCELLED = 'CANCELLED', 'Cancelled'
        
    # --- Relationships ---
    customer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='service_requests_as_customer')
    provider = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='service_requests_as_provider', limit_choices_to={'role': 'PROVIDER'})
    service = models.ForeignKey(Service, on_delete=models.PROTECT, related_name='requests')

    # --- Job Details ---
    status = models.CharField(max_length=20, choices=ServiceRequestStatus.choices, default=ServiceRequestStatus.PENDING)
    request_latitude = models.DecimalField(max_digits=9, decimal_places=6)
    request_longitude = models.DecimalField(max_digits=9, decimal_places=6)
    
    # Financials can be set later
    final_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    # --- Timestamps ---
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Request #{self.id} for {self.service.name} by {self.customer.email}"