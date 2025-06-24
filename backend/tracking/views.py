# backend/tracking/views.py
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .serializers import LocationUpdateSerializer
from users.permissions import IsProvider
from services.models import ServiceRequest
from quickassist.pusher_client import pusher_client

class LocationUpdateView(APIView):
    """
    PUT /api/v1/tracking/requests/{request_id}/location/
    Allows an assigned provider to update and broadcast their location.
    """
    permission_classes = [IsAuthenticated, IsProvider]

    def put(self, request, request_id, *args, **kwargs):
        serializer = LocationUpdateSerializer(data=request.data)
        if serializer.is_valid():
            try:
                service_request = ServiceRequest.objects.get(pk=request_id, provider=request.user)
            except ServiceRequest.DoesNotExist:
                return Response({"error": "You are not assigned to this active service request."}, status=status.HTTP_404_NOT_FOUND)
            
            # --- START OF THE FIX ---

            # validated_data still contains Decimal objects, which is fine for the DB
            latitude_decimal = serializer.validated_data['latitude']
            longitude_decimal = serializer.validated_data['longitude']
            
            # Update provider's profile in the database with the precise Decimal
            provider_profile = request.user.profile.provider_profile
            provider_profile.latitude = latitude_decimal
            provider_profile.longitude = longitude_decimal
            provider_profile.save()
            
            # Create a NEW dictionary for JSON serialization by converting Decimals to strings
            location_data_for_json = {
                'latitude': str(latitude_decimal),
                'longitude': str(longitude_decimal)
            }
            
            # --- END OF THE FIX ---

            # Trigger Pusher Event with the JSON-safe dictionary
            channel_name = f'private-request-{request_id}'
            event_name = 'provider-location-update'
            
            pusher_client.trigger(channel_name, event_name, {'location': location_data_for_json})

            # Send the JSON-safe dictionary back in the response
            return Response(location_data_for_json, status=status.HTTP_200_OK)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)