# backend/tracking/urls.py
from django.urls import path
from .views import LocationUpdateView

urlpatterns = [
    path('requests/<int:request_id>/location/', LocationUpdateView.as_view(), name='location-update'),
]