from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.shortcuts import get_object_or_404
import os

from services.models import ServiceRequest
from .models import Transaction
from users.permissions import IsCustomer
from .serializers import PaymentInitiateSerializer
from .daraja_api import trigger_stk_push

class PaymentInitiateView(APIView):
    permission_classes = [IsAuthenticated, IsCustomer]
    serializer_class = PaymentInitiateSerializer

    def post(self, request, job_id, *args, **kwargs):
        service_request = get_object_or_404(ServiceRequest, pk=job_id, customer=request.user)

        if service_request.status != ServiceRequest.ServiceRequestStatus.COMPLETED:
            return Response({"error": "Payment can only be made for completed jobs."}, status=status.HTTP_400_BAD_REQUEST)

        # Optional: Check if a successful payment already exists
        if Transaction.objects.filter(service_request=service_request, status=Transaction.TransactionStatus.SUCCESSFUL).exists():
             return Response({"error": "This job has already been paid for."}, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)

        phone_number = serializer.validated_data['phone_number']
        amount = serializer.validated_data['amount']

        business_short_code = os.getenv('DARAJA_BUSINESS_SHORT_CODE')
        passkey = os.getenv('DARAJA_PASSKEY')
        callback_url = "https://af8f-196-249-93-82.ngrok-free.app/api/v1/payments/callback/"
        
        response = trigger_stk_push(
            phone_number=phone_number,
            amount=amount,
            business_short_code=business_short_code,
            passkey=passkey,
            transaction_desc=f"Payment for Job #{job_id}",
            callback_url=callback_url,
            reference=f"QUICKASSIST_JOB_{job_id}"
        )
        
        if response and response.get("ResponseCode") == "0":
            # Store initial transaction data
            Transaction.objects.create(
                service_request=service_request,
                customer=request.user,
                amount=amount,
                phone_number=phone_number,
                merchant_request_id=response['MerchantRequestID'],
                checkout_request_id=response['CheckoutRequestID'],
            )
            return Response({"message": "STK Push initiated successfully. Please enter your PIN."}, status=status.HTTP_200_OK)
        
        return Response({"error": "Failed to initiate STK push.", "details": response}, status=status.HTTP_400_BAD_REQUEST)

class DarajaCallbackView(APIView):
    permission_classes = [AllowAny] # This webhook must be public

    def post(self, request, *args, **kwargs):
        data = request.data
        stk_callback = data.get('Body', {}).get('stkCallback', {})
        merchant_request_id = stk_callback.get('MerchantRequestID')
        checkout_request_id = stk_callback.get('CheckoutRequestID')
        result_code = stk_callback.get('ResultCode')
        result_desc = stk_callback.get('ResultDesc')
        
        # You can add more logic here to parse callbackMetadata for amount, phone, etc.
        
        try:
            transaction = Transaction.objects.get(
                merchant_request_id=merchant_request_id,
                checkout_request_id=checkout_request_id
            )
            transaction.result_code = str(result_code)
            transaction.result_desc = str(result_desc)

            if result_code == 0:
                transaction.status = Transaction.TransactionStatus.SUCCESSFUL
                # Here you could mark the job as 'PAID' if you add a status field
            else:
                transaction.status = Transaction.TransactionStatus.FAILED
            
            transaction.save()
            print(f"Callback for transaction {transaction.id} processed.")

        except Transaction.DoesNotExist:
            # Safaricom might send callbacks we don't have a record for, ignore them.
            print(f"Received callback for unknown transaction: {merchant_request_id}")
            pass

        # Always return a 200 OK to Safaricom to acknowledge receipt
        return Response(status=status.HTTP_200_OK)
    
class LogCashPaymentView(APIView):
    """
    POST /api/v1/payments/log_cash/{job_id}/
    Allows a customer to confirm they have paid the provider in cash.
    """
    permission_classes = [IsAuthenticated, IsCustomer]

    def post(self, request, job_id, *args, **kwargs):
        service_request = get_object_or_404(ServiceRequest, pk=job_id, customer=request.user)

        if service_request.status != ServiceRequest.ServiceRequestStatus.COMPLETED:
            return Response({"error": "Payment can only be logged for completed jobs."}, status=status.HTTP_400_BAD_REQUEST)
        
        # Prevent logging multiple payments
        if Transaction.objects.filter(service_request=service_request, status=Transaction.Status.SUCCESSFUL).exists():
            return Response({"error": "This job has already been marked as paid."}, status=status.HTTP_400_BAD_REQUEST)

        # Get the amount from the job's final price, or fall back to base price
        amount = service_request.final_price or service_request.service.base_price or 0

        # Create a new transaction record for the cash payment
        Transaction.objects.create(
            service_request=service_request,
            customer=request.user,
            amount=amount,
            phone_number='CASH', # Use a special identifier for the phone number
            status=Transaction.Status.SUCCESSFUL, # Cash payments are considered successful immediately
            result_code='CASH',
            result_desc='Payment confirmed in cash by customer.'
        )

        # Here you could trigger a Pusher event to notify the provider they've been paid
        
        return Response({"message": "Cash payment has been successfully recorded. Thank you!"}, status=status.HTTP_201_CREATED)