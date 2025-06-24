# backend/communications/admin.py
from django.contrib import admin
from .models import ChatMessage, Notification

admin.site.register(ChatMessage)
admin.site.register(Notification)