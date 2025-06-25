# backend/reviews/urls.py
from django.urls import path
# Correct: Imports from its OWN views.py file
from .views import ReviewCreateView, ProviderReviewsListView

urlpatterns = [
    path('create/<int:job_id>/', ReviewCreateView.as_view(), name='review-create'),
    path('provider/<int:provider_id>/', ProviderReviewsListView.as_view(), name='provider-reviews'),
]