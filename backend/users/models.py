# backend/users/models.py
from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db.models.signals import post_save
from services.models import Service
from django.dispatch import receiver

# --- 1. The Custom User Manager ---
# This manager will teach Django how to create users with an email instead of a username.
class CustomUserManager(BaseUserManager):
    def create_user(self, email, password, **extra_fields):
        """Creates and saves a User with the given email and password."""
        if not email:
            raise ValueError('The Email must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password, **extra_fields):
        """Creates and saves a SuperUser with the given email and password."""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        extra_fields.setdefault('role', 'ADMIN') # Default role for superusers

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
        
        return self.create_user(email, password, **extra_fields)

# --- 2. The Custom User Model ---
class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = 'ADMIN', 'Admin'
        CUSTOMER = 'CUSTOMER', 'Customer'
        PROVIDER = 'PROVIDER', 'Provider'
    
    # We remove the username field and make email the unique identifier.
    username = None
    email = models.EmailField(unique=True, help_text='Required. Your unique email for login.')
    role = models.CharField(max_length=50, choices=Role.choices)

    # Use the custom manager.
    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = [] # No extra fields are required when creating a superuser

    def __str__(self):
        return self.email

# --- 3. Profile Models ---
class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    phone_number = models.CharField(max_length=20, unique=True, blank=True, null=True)
    profile_picture_url = models.URLField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.email}'s Profile"

class ProviderProfile(models.Model):
    profile = models.OneToOneField(Profile, on_delete=models.CASCADE, related_name='provider_profile')
    bio = models.TextField(blank=True)
    is_verified = models.BooleanField(default=False)
    is_available = models.BooleanField(default=False)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    average_rating = models.FloatField(default=0.0)
    rating_count = models.IntegerField(default=0)
    services_offered = models.ManyToManyField(Service, related_name='providers', blank=True)


    def __str__(self):
        return f"Provider details for {self.profile.user.email}"

# --- 4. Django Signals ---
# These functions will run automatically when a User object is saved.
@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """Automatically create a Profile when a new User is created."""
    if created:
        Profile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    """Ensure the associated Profile is saved when the User is saved."""
    # Note: Added a check to prevent recursion if a Profile doesn't exist yet
    # The 'created' signal handles initial creation.
    if hasattr(instance, 'profile'):
        instance.profile.save()