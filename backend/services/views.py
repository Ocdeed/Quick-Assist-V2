# backend/services/views.py
from rest_framework import generics, permissions, status
from users.permissions import IsCustomer, IsProvider
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db import transaction
from django.utils import timezone
from datetime import timedelta
from geopy.distance import geodesic # type: ignore
import math

from .models import ServiceCategory, ServiceRequest
from users.models import ProviderProfile


from .serializers import (
    ServiceCategorySerializer, ServiceRequestCreateSerializer, 
    ServiceRequestListSerializer, AvailableRequestSerializer
)

# --- Service Listing Endpoint ---
class ServiceCategoryListView(generics.ListAPIView):
    """
    GET /api/v1/services/categories/
    Returns a list of all service categories with their nested services.
    Accessible by any authenticated user.
    """
    queryset = ServiceCategory.objects.prefetch_related('services').all()
    serializer_class = ServiceCategorySerializer
    permission_classes = [permissions.IsAuthenticated]

# --- Service Request Endpoints (For Customers) ---
class ServiceRequestView(generics.ListCreateAPIView):
    """
    GET /api/v1/services/requests/
        - Lists all requests made by the currently authenticated CUSTOMER.
    POST /api/v1/services/requests/
        - Creates a new service request for the currently authenticated CUSTOMER.
    """
    permission_classes = [permissions.IsAuthenticated, IsCustomer] 

    def get_queryset(self):
        # Users can only see their own requests
        return ServiceRequest.objects.filter(customer=self.request.user).order_by('-created_at')
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ServiceRequestCreateSerializer
        return ServiceRequestListSerializer
    
    def perform_create(self, serializer):
        """
        This hook is called by CreateModelMixin when saving a new object instance.
        We use it to set the customer to the currently authenticated user.
        """
        serializer.save(customer=self.request.user)

# --- Provider-Specific Endpoints ---
class AvailableRequestListView(APIView):
    """
    GET /api/v1/services/matching/available-requests/
    For PROVIDERS. Returns a list of pending requests within their service area.
    """
    permission_classes = [permissions.IsAuthenticated, IsProvider]

    def get(self, request, *args, **kwargs):
        provider_user = request.user
        try:
            provider_profile = provider_user.profile.provider_profile
        except ProviderProfile.DoesNotExist:
            return Response({"error": "Provider profile not found."}, status=status.HTTP_400_BAD_REQUEST)

        if not provider_profile.is_available:
            return Response({"message": "You are not marked as available for jobs."}, status=status.HTTP_400_BAD_REQUEST)
        
        # --- START OF THE FIX ---
        
        # Ensure that latitude and longitude from the profile are not None before proceeding
        if provider_profile.latitude is None or provider_profile.longitude is None:
            return Response({"error": "Provider location is not set."}, status=status.HTTP_400_BAD_REQUEST)

        # Cast the Decimal objects from the database into standard floats for calculation
        user_lat = float(provider_profile.latitude)
        user_lon = float(provider_profile.longitude)
        
        # --- END OF THE FIX ---
        
        search_radius_km = 20

        lat_diff = search_radius_km / 111.0
        lon_diff = search_radius_km / (111.0 * abs(math.cos(math.radians(user_lat))))
        
        min_lat, max_lat = user_lat - lat_diff, user_lat + lat_diff
        min_lon, max_lon = user_lon - lon_diff, user_lon + lon_diff
        
        # ... the rest of the method remains the same ...
        time_threshold = timezone.now() - timedelta(minutes=30)
        candidate_requests = ServiceRequest.objects.filter(
            status=ServiceRequest.ServiceRequestStatus.PENDING,
            created_at__gte=time_threshold,
            request_latitude__range=(min_lat, max_lat),
            request_longitude__range=(min_lon, max_lon)
        )
        
        provider_location = (user_lat, user_lon)
        nearby_requests = []
        for req in candidate_requests:
            request_location = (req.request_latitude, req.request_longitude)
            distance = geodesic(provider_location, request_location).kilometers
            if distance <= search_radius_km:
                req.distance = distance 
                nearby_requests.append(req)
        
        sorted_requests = sorted(nearby_requests, key=lambda r: r.distance)
        
        serializer = AvailableRequestSerializer(sorted_requests, many=True)
        return Response(serializer.data)

class AcceptServiceRequestView(APIView):
    """
    POST /api/v1/services/requests/{id}/accept/
    Allows a provider to accept a pending service request.
    This action must be atomic to prevent race conditions.
    """
    permission_classes = [permissions.IsAuthenticated, IsProvider]
    
    def post(self, request, pk, *args, **kwargs):
        provider_user = request.user
        
        with transaction.atomic():
            try:
                # Use select_for_update to lock the row until the transaction is complete.
                # This is the key to preventing two providers from accepting the same job.
                service_request = ServiceRequest.objects.select_for_update().get(
                    pk=pk,
                    status=ServiceRequest.ServiceRequestStatus.PENDING
                )
            except ServiceRequest.DoesNotExist:
                return Response({"error": "Service request not found or has already been accepted."}, status=status.HTTP_404_NOT_FOUND)

            # Assign the provider and update the status
            service_request.provider = provider_user
            service_request.status = ServiceRequest.ServiceRequestStatus.ACCEPTED
            service_request.save()

            # Logic to notify the customer would go here (e.g., via WebSocket)

            serializer = ServiceRequestListSerializer(service_request)
            return Response(serializer.data, status=status.HTTP_200_OK)