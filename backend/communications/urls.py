# backend/communications/urls.py
from django.urls import path
from .views import ChatMessageView, PusherAuthView

urlpatterns = [
    # IMPORTANT: The pusher auth endpoint has a specific name by convention
    path('pusher/auth/', PusherAuthView.as_view(), name='pusher-auth'),
    path('requests/<int:request_id>/chat/', ChatMessageView.as_view(), name='chat-messages'),
]