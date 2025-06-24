# backend/users/views.py
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

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