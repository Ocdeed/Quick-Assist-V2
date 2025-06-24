from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import User, Profile, ProviderProfile
from .forms import CustomUserCreationForm, CustomUserChangeForm # <-- IMPORT OUR NEW FORMS

@admin.register(User)
class CustomUserAdmin(BaseUserAdmin):
    """
    This is the final, correct, and robust UserAdmin.
    """
    # --- THIS IS THE KEY FIX ---
    # Point the admin to our custom forms
    form = CustomUserChangeForm
    add_form = CustomUserCreationForm
    # --- END OF KEY FIX ---
    
    # Redefine the lists to remove 'username' and add 'role'
    list_display = ('email', 'first_name', 'last_name', 'role', 'is_staff', 'is_active')
    list_filter = ('role', 'is_staff', 'is_superuser', 'is_active')
    
    # Define the fields shown on the user creation/edit page
    # This is for display purposes on the "change" form
    fieldsets = (
        (None, {'fields': ('email', 'password')}), # password is the ReadOnlyPasswordHashField here
        ('Personal Info', {'fields': ('first_name', 'last_name')}),
        ('Permissions & Role', {
            'fields': ('role', 'is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
        }),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    
    # This is for the "add" form (user creation)
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'role', 'password', 'password2'), # password2 comes from the BaseUserCreationForm
        }),
    )

    search_fields = ('email',)
    ordering = ('email',)


# --- Profile and ProviderProfile Admins remain the same from the previous fix ---
class ProviderProfileInline(admin.StackedInline):
    model = ProviderProfile
    can_delete = False
    verbose_name_plural = 'Provider-Specific Details'
    fk_name = 'profile' 

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'phone_number', 'is_provider_verified')
    list_select_related = ('user', 'provider_profile')
    search_fields = ('user__email', 'phone_number')
    
    inlines = [ProviderProfileInline]

    def get_inlines(self, request, obj=None):
        if obj and obj.user.role == User.Role.PROVIDER:
            return self.inlines
        return []

    @admin.display(description='Verified Provider?', boolean=True)
    def is_provider_verified(self, obj):
        if hasattr(obj, 'provider_profile'):
            return obj.provider_profile.is_verified
        return None