# backend/users/serializers.py
from rest_framework import serializers
from .models import User, Profile, ProviderProfile

# --- Read-Only Serializers (For GET requests) ---

class ProviderProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProviderProfile
        fields = ('bio', 'is_verified', 'is_available', 'average_rating')

class ProfileSerializer(serializers.ModelSerializer):
    provider_profile = ProviderProfileSerializer(read_only=True)
    class Meta:
        model = Profile
        fields = ('phone_number', 'profile_picture_url', 'provider_profile')

class UserSerializer(serializers.ModelSerializer):
    """Serializer for retrieving user details."""
    profile = ProfileSerializer(read_only=True)
    class Meta:
        model = User
        fields = ('id', 'email', 'first_name', 'last_name', 'role', 'profile')

# --- Write/Action Serializers (For POST/PUT requests) ---

class UserRegisterSerializer(serializers.ModelSerializer):
    """Serializer for user registration."""
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'}, min_length=8)
    
    # --- Make this field write_only ---
    phone_number = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ('email', 'password', 'first_name', 'last_name', 'role', 'phone_number')
        
    def validate_role(self, value):
        """Ensure the role is either CUSTOMER or PROVIDER, not ADMIN."""
        if value == User.Role.ADMIN:
            raise serializers.ValidationError("Cannot register as an Admin.")
        return value
    
    def validate_phone_number(self, value):
        """Check that the phone number is not blank."""
        if not value or value.strip() == '':
            raise serializers.ValidationError("Phone number cannot be blank.")
        # We can add more complex regex validation later if needed.
        return value

    def create(self, validated_data):
        """Handle the creation of the user and their associated profiles."""
        phone_number = validated_data.pop('phone_number')
        
        # This now only contains fields that belong on the User model
        user = User.objects.create_user(**validated_data)
        
        # The signal created the Profile, now we fetch and update it
        profile = Profile.objects.get(user=user)
        profile.phone_number = phone_number
        profile.save()
        
        # If the role is Provider, create the ProviderProfile
        if user.role == User.Role.PROVIDER:
            ProviderProfile.objects.create(profile=profile)
            
        return user