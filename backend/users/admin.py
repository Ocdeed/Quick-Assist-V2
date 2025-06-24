# backend/users/admin.py
from django.contrib import admin
from .models import User, Profile, ProviderProfile

# It's good practice to create custom admin classes, but this works for now.
admin.site.register(User)
admin.site.register(Profile)
admin.site.register(ProviderProfile)