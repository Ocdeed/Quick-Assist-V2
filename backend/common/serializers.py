# common/serializers.py
from rest_framework import serializers
from users.models import User, Profile, ProviderProfile

# NOTE: These are defined here, in a central place.
class ProviderProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProviderProfile
        fields = ('bio', 'is_verified', 'is_available', 'average_rating')

class ProfileSerializer(serializers.ModelSerializer):
    provider_profile = ProviderProfileSerializer(read_only=True, required=False, allow_null=True)
    class Meta:
        model = Profile
        fields = ('phone_number', 'profile_picture_url', 'provider_profile')

class UserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)
    class Meta:
        model = User
        fields = ('id', 'email', 'first_name', 'last_name', 'role', 'profile')