# backend/payments/urls.py
from django.urls import path
# Correct: Imports from its OWN views.py file
from .views import PaymentInitiateView, DarajaCallbackView,LogCashPaymentView

urlpatterns = [
    path('initiate/<int:job_id>/', PaymentInitiateView.as_view(), name='payment-initiate'),
    path('callback/', DarajaCallbackView.as_view(), name='daraja-callback'),
    path('log_cash/<int:job_id>/', LogCashPaymentView.as_view(), name='payment-log-cash'),
    
]