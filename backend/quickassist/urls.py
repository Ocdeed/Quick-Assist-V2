# backend/quickassist/urls.py
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/auth/', include('users.urls')),
    path('api/v1/services/', include('services.urls')),
    path('api/v1/communications/', include('communications.urls')), 
    path('api/v1/tracking/', include('tracking.urls')),
    path('api/v1/payments/', include('payments.urls')),
    path('api/v1/reviews/', include('reviews.urls')),
]