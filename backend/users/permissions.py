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