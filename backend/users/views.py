# backend/users/views.py
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.core.exceptions import PermissionDenied

from rest_framework.views import APIView
from services.models import Service
from .permissions import IsProvider
from services.serializers import ServiceSerializer

from .serializers import UserRegisterSerializer, UserSerializer

class RegisterView(generics.CreateAPIView):
    """
    POST /api/v1/auth/register/
    Creates a new user. No authentication required.
    """
    # This serializer is used for INPUT VALIDATION AND CREATION
    serializer_class = UserRegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        """
        Override the default create method to use a different
        serializer for the response.
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # --- This is the key change ---
        # Now, create the response using the UserSerializer (our read serializer)
        response_serializer = UserSerializer(user)
        
        # We can also generate tokens for the user to be logged in automatically
        refresh = RefreshToken.for_user(user)
        
        response_data = {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': response_serializer.data,
        }
        
        headers = self.get_success_headers(serializer.data)
        return Response(response_data, status=status.HTTP_201_CREATED, headers=headers)


class ProfileView(generics.RetrieveUpdateAPIView):
    """
    GET /api/v1/auth/profile/
    PUT /api/v1/auth/profile/
    PATCH /api/v1/auth/profile/
    Retrieves or updates the profile of the authenticated user.
    """
    serializer_class = UserSerializer
    # Permission is IsAuthenticated by default, which is what we want.

    def get_object(self):
        # Returns the user object of the currently logged-in user.
        return self.request.user

class LogoutView(generics.GenericAPIView):
    """

    POST /api/v1/auth/logout/
    Blacklists the refresh token for the user, effectively logging them out.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        
class ProviderServicesView(APIView):
    """
    GET: Returns a list of services the provider currently offers.
    POST: Adds a service to the provider's offered list.
    DELETE: Removes a service from the provider's offered list.
    """
    permission_classes = [permissions.IsAuthenticated, IsProvider]
    
    def check_verification(self, request):
        """Helper method to check for verification."""
        if not request.user.profile.provider_profile.is_verified:
            raise PermissionDenied("Your account is not yet verified by an administrator. Service management is disabled.")

    def get(self, request, *args, **kwargs):
        """Returns the list of services currently offered by the provider."""
        provider_profile = request.user.profile.provider_profile
        services = provider_profile.services_offered.all()
        serializer = ServiceSerializer(services, many=True)
        return Response(serializer.data)

    def post(self, request, *args, **kwargs):
        """Adds a service to the provider's list."""
        service_id = request.data.get('service_id')
        if not service_id:
            return Response({'error': 'Service ID is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            service_to_add = Service.objects.get(pk=service_id)
            provider_profile = request.user.profile.provider_profile
            provider_profile.services_offered.add(service_to_add)
            return Response({'status': 'Service added successfully.'}, status=status.HTTP_200_OK)
        except Service.DoesNotExist:
            return Response({'error': 'Service not found.'}, status=status.HTTP_404_NOT_FOUND)

    def delete(self, request, *args, **kwargs):
        """Removes a service from the provider's list."""
        service_id = request.data.get('service_id')
        if not service_id:
            return Response({'error': 'Service ID is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            service_to_remove = Service.objects.get(pk=service_id)
            provider_profile = request.user.profile.provider_profile
            provider_profile.services_offered.remove(service_to_remove)
            return Response({'status': 'Service removed successfully.'}, status=status.HTTP_200_OK)
        except Service.DoesNotExist:
            return Response({'error': 'Service not found.'}, status=status.HTTP_404_NOT_FOUND)