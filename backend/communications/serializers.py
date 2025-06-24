# backend/communications/serializers.py
from rest_framework import serializers
from .models import ChatMessage
from users.serializers import UserSerializer

class ChatMessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    class Meta:
        model = ChatMessage
        fields = ['id', 'sender', 'text', 'created_at']
        read_only_fields = ['sender', 'created_at']