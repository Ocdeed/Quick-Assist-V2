# backend/services/views.py
from rest_framework import generics, permissions, status
from rest_framework.exceptions import PermissionDenied
from users.permissions import IsCustomer, IsProvider, IsPartyToRequest
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db import transaction
from django.utils import timezone
from datetime import timedelta
from geopy.distance import geodesic # type: ignore
import math
from quickassist.pusher_client import pusher_client 

from .models import ServiceCategory, ServiceRequest
from users.models import ProviderProfile, User


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
    Handles service requests.
    - CUSTOMER: GET -> lists their own requests. POST -> creates a new request.
    - PROVIDER: GET -> lists jobs they have accepted. POST -> is forbidden.
    """
    # Note: We now allow IsProvider for the GET method.
    permission_classes = [permissions.IsAuthenticated] 

    def get_queryset(self):
        """
        This method now returns a different queryset based on the user's role.
        """
        user = self.request.user
        if user.role == User.Role.CUSTOMER:
            # Customers see the requests they created.
            return ServiceRequest.objects.filter(customer=user).order_by('-created_at')
        elif user.role == User.Role.PROVIDER:
            # Providers see the requests they have accepted.
            return ServiceRequest.objects.filter(provider=user).order_by('-updated_at')
        
        # If user is an Admin or has no role, return an empty list.
        return ServiceRequest.objects.none()
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ServiceRequestCreateSerializer
        # The list serializer works for both customer and provider views.
        return ServiceRequestListSerializer

    def perform_create(self, serializer):
        # We need to ensure only customers can use this.
        # Adding a check here in addition to the frontend logic is good practice.
        if self.request.user.role != User.Role.CUSTOMER:
            raise PermissionDenied("Only customers can create service requests.")
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

        if not provider_profile.is_verified:
            return Response({"error": "Your account must be verified by an admin to see jobs."}, status=status.HTTP_403_FORBIDDEN)
        
        # Now, check for availability and location *after* confirming they are verified
        if not provider_profile.is_available:
            return Response({"message": "You are not marked as available."}, status=status.HTTP_400_BAD_REQUEST)
        
        if provider_profile.latitude is None or provider_profile.longitude is None:
            return Response({"error": "Your location is not set."}, status=status.HTTP_400_BAD_REQUEST)
        
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
            
            # Notify the customer that their request was accepted
            channel_name = f'private-user-{service_request.customer.id}' # A channel just for this user
            event_name = 'request-accepted'
            
            # Send the full request details in the payload
            payload = ServiceRequestListSerializer(service_request).data
            pusher_client.trigger(channel_name, event_name, {'request': payload})

            # Logic to notify the customer would go here (e.g., via WebSocket)

            serializer = ServiceRequestListSerializer(service_request)
            return Response(serializer.data, status=status.HTTP_200_OK)
        
class ServiceRequestDetailView(generics.RetrieveAPIView):
    """
    GET /api/v1/services/requests/{pk}/
    Retrieves the details of a single service request.
    Only accessible by the customer who created it or the provider assigned to it.
    """
    queryset = ServiceRequest.objects.all()
    serializer_class = ServiceRequestListSerializer # Our detailed "list" serializer works perfectly here
    permission_classes = [permissions.IsAuthenticated, IsPartyToRequest]
    
class ServiceRequestStatusUpdateView(APIView):
    """
    POST /api/v1/services/requests/{pk}/update_status/
    Allows a provider or customer to update the status of a job.
    """
    permission_classes = [permissions.IsAuthenticated, IsPartyToRequest]
    
    def post(self, request, pk, *args, **kwargs):
        try:
            service_request = ServiceRequest.objects.get(pk=pk)
            # Make sure we have the object before checking permissions
            self.check_object_permissions(request, service_request)
        except ServiceRequest.DoesNotExist:
            return Response({"error": "Service request not found."}, status=status.HTTP_404_NOT_FOUND)
        
        new_status = request.data.get('status')
        user = request.user
        
        # --- Define the state transition rules ---
        allowed_transitions = {
            'PROVIDER': {
                'ACCEPTED': ['IN_PROGRESS'],
                'IN_PROGRESS': ['COMPLETED'],
            },
            'CUSTOMER': {
                'PENDING': ['CANCELLED'],
                'ACCEPTED': ['CANCELLED'],
            }
        }
        
        current_status = service_request.status
        role = user.role
        
        if role in allowed_transitions and current_status in allowed_transitions[role]:
            if new_status in allowed_transitions[role][current_status]:
                service_request.status = new_status
                service_request.save()
                
                # --- Trigger Pusher Event for status update ---
                channel_name = f'private-request-{pk}'
                event_name = 'status-update'
                payload = {'status': new_status}
                pusher_client.trigger(channel_name, event_name, payload)
                
                return Response(ServiceRequestListSerializer(service_request).data)
        
        return Response({'error': f"Invalid status transition from {current_status} to {new_status} for your role."}, status=status.HTTP_400_BAD_REQUEST)