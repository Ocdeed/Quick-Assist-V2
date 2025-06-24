# backend/communications/views.py
from rest_framework.views import APIView
from rest_framework.response import Response

from rest_framework import generics, permissions
from rest_framework.exceptions import PermissionDenied

from .models import ChatMessage
from .serializers import ChatMessageSerializer
from services.models import ServiceRequest

# Import our pusher client utility
from quickassist.pusher_client import pusher_client

class IsPartyToRequest(permissions.BasePermission):
    """
    Permission to only allow the customer or provider of a service request to access it.
    """
    def has_object_permission(self, request, view, obj):
        # The obj here is the ServiceRequest instance
        return request.user == obj.customer or request.user == obj.provider

class ChatMessageView(generics.ListCreateAPIView):
    """
    GET:  /api/v1/communications/requests/{request_id}/chat/ -> Lists messages for a request.
    POST: /api/v1/communications/requests/{request_id}/chat/ -> Creates a new message.
    """
    serializer_class = ChatMessageSerializer
    permission_classes = [permissions.IsAuthenticated, IsPartyToRequest]

    def get_queryset(self):
        """
        This view should be nested under a service request URL,
        so we can filter messages based on the request_id from the URL.
        """
        request_id = self.kwargs.get('request_id')
        service_request = ServiceRequest.objects.get(pk=request_id)
        # Check permissions before returning queryset
        self.check_object_permissions(self.request, service_request)
        return ChatMessage.objects.filter(service_request_id=request_id)
    
    def perform_create(self, serializer):
        request_id = self.kwargs.get('request_id')
        service_request = ServiceRequest.objects.get(pk=request_id)
        # Check permissions
        self.check_object_permissions(self.request, service_request)

        # Save the message with the sender and associated request
        message = serializer.save(sender=self.request.user, service_request=service_request)

        # --- Trigger Pusher Event ---
        # A private channel name ensures only intended users can subscribe
        channel_name = f'private-request-{request_id}'
        event_name = 'new-message'

        # Use our ChatMessageSerializer to send the full message object as a payload
        message_data = ChatMessageSerializer(message).data
        
        pusher_client.trigger(channel_name, event_name, {'message': message_data})
        
class PusherAuthView(APIView):
    """
    Authenticates the logged-in user to subscribe to private Pusher channels.
    """
    def post(self, request, *args, **kwargs):
        channel_name = request.data.get('channel_name')
        socket_id = request.data.get('socket_id')

        # Basic security check: Is the user trying to access a channel they should have access to?
        # A channel name is like 'private-request-123' or 'private-user-5'
        is_authorized = False
        try:
            if 'private-user-' in channel_name:
                # Is it the user's own private channel?
                user_id = int(channel_name.split('-')[-1])
                if request.user.id == user_id:
                    is_authorized = True
            elif 'private-request-' in channel_name:
                # Is the user a party to this service request?
                request_id = int(channel_name.split('-')[-1])
                service_request = ServiceRequest.objects.get(pk=request_id)
                if request.user == service_request.customer or request.user == service_request.provider:
                    is_authorized = True
        except (ValueError, ServiceRequest.DoesNotExist):
            is_authorized = False # Fail safely

        if not is_authorized:
            raise PermissionDenied('You are not authorized to access this channel.')

        # If authorized, use the Pusher library to create the auth signature
        auth = pusher_client.authenticate(channel=channel_name, socket_id=socket_id)
        return Response(auth)