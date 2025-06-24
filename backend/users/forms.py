# backend/users/forms.py
from django import forms
from django.contrib.auth.forms import ReadOnlyPasswordHashField, UserCreationForm as BaseUserCreationForm, UserChangeForm as BaseUserChangeForm
from .models import User

class CustomUserCreationForm(BaseUserCreationForm):
    """
    A form for creating new users. Includes all the required
    fields, plus a repeated password.
    """
    class Meta:
        model = User
        fields = ('email', 'role',) # Specify the fields to show on the creation form


class CustomUserChangeForm(BaseUserChangeForm):
    """A form for updating users. Includes all the fields on
    the user, but replaces the password field with a non-editable
    help text.
    """
    # This makes the password field on the "edit" page show "Raw passwords are not stored..."
    # and provides a link to the change password form, just like the default admin.
    password = ReadOnlyPasswordHashField(
        label=("Password"),
        help_text=(
            'Raw passwords are not stored, so there is no way to see '
            'this user’s password, but you can change the password '
            'using <a href="../password/">this form</a>.'
        ),
    )

    class Meta:
        model = User
        fields = ('email', 'first_name', 'last_name', 'role', 'is_active', 'is_staff', 'is_superuser')