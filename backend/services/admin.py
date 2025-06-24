# backend/services/admin.py
from django.contrib import admin
from .models import ServiceCategory, Service, ServiceRequest

admin.site.register(ServiceCategory)
admin.site.register(Service)
admin.site.register(ServiceRequest)