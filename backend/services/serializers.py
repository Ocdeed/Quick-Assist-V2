# backend/services/serializers.py
from rest_framework import serializers
from .models import Service, ServiceCategory, ServiceRequest
from users.serializers import UserSerializer 

from django.contrib.auth import get_user_model
from rest_framework.fields import CurrentUserDefault

User = get_user_model()


class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = ['id', 'name', 'base_price']

class ServiceCategorySerializer(serializers.ModelSerializer):
    # This nests the list of services under each category
    services = ServiceSerializer(many=True, read_only=True)
    class Meta:
        model = ServiceCategory
        fields = ['id', 'name', 'description', 'icon_url', 'services']

# class ServiceRequestCreateSerializer(serializers.ModelSerializer):
#     """
#     Serializer for a CUSTOMER to create a new service request.
#     The customer field is now handled automatically.
#     """
#     # This makes the 'customer' field a hidden, read-only field
#     # that defaults to the currently authenticated user.
#     customer = serializers.HiddenField(default=CurrentUserDefault())
    
#     class Meta:
#         model = ServiceRequest
#         # We need to add 'customer' to the fields list
#         fields = ['service', 'request_latitude', 'request_longitude', 'customer']

#     def validate(self, attrs):
#         # We can also add cross-field validation here if needed
#         # For example, check if the customer is allowed to make a request
#         if attrs['customer'].role != User.Role.CUSTOMER:
#             raise serializers.ValidationError("Only customers can create service requests.")
#         return attrs

class ServiceRequestCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for a CUSTOMER to create a new service request.
    This version expects the view to handle setting the customer.
    """
    class Meta:
        model = ServiceRequest
        # We only expect these fields from the client.
        fields = ['service', 'request_latitude', 'request_longitude']
        
class ServiceRequestListSerializer(serializers.ModelSerializer):
    """

    Serializer for LISTING service requests. Shows nested details.
    """
    service = ServiceSerializer(read_only=True)
    customer = UserSerializer(read_only=True)
    provider = UserSerializer(read_only=True)

    class Meta:
        model = ServiceRequest
        fields = [
            'id', 'status', 'service', 'customer', 'provider', 
            'request_latitude', 'request_longitude', 'created_at', 'updated_at'
        ]

# A simpler serializer for provider's available job list
class AvailableRequestSerializer(serializers.ModelSerializer):
    # Shows just enough detail for the provider to make a decision
    service = ServiceSerializer(read_only=True)
    customer_name = serializers.CharField(source='customer.get_full_name', read_only=True)

    class Meta:
        model = ServiceRequest
        fields = [
            'id', 'service', 'customer_name',
            'request_latitude', 'request_longitude', 'created_at'
        ]