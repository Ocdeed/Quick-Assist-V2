# backend/services/urls.py
from django.urls import path
from payments.views import PaymentInitiateView

from .views import (
    ServiceCategoryListView, ServiceRequestView, ServiceRequestDetailView, 
    AvailableRequestListView, AcceptServiceRequestView, ServiceRequestStatusUpdateView
)

urlpatterns = [
    path('categories/', ServiceCategoryListView.as_view(), name='service-category-list'),
    
    # Customer endpoints
    path('requests/', ServiceRequestView.as_view(), name='service-request-list-create'),
    path('requests/<int:pk>/', ServiceRequestDetailView.as_view(), name='service-request-detail'),
    
    # Provider endpoints
    path('requests/<int:pk>/accept/', AcceptServiceRequestView.as_view(), name='service-request-accept'),
    path('matching/available-requests/', AvailableRequestListView.as_view(), name='available-requests-list'),
    path('requests/<int:pk>/update_status/', ServiceRequestStatusUpdateView.as_view(), name='service-request-update-status'), 
    
    path('requests/<int:job_id>/initiate_payment/', PaymentInitiateView.as_view(), name='job-payment-initiate'),
]