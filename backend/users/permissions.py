# backend/users/permissions.py
from rest_framework.permissions import BasePermission
from .models import User

class IsCustomer(BasePermission):
    """
    Allows access only to users with the 'CUSTOMER' role.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == User.Role.CUSTOMER)

class IsProvider(BasePermission):
    """
    Allows access only to users with the 'PROVIDER' role.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == User.Role.PROVIDER)
    
class IsPartyToRequest(BasePermission):
    """
    Permission to only allow the customer or provider of a service request to access it.
    """
    def has_object_permission(self, request, view, obj):
        # The 'obj' here is the ServiceRequest instance fetched from the database
        return request.user == obj.customer or request.user == obj.provider