from rest_framework import serializers

class PaymentInitiateSerializer(serializers.Serializer):
    phone_number = serializers.CharField(max_length=15)
    amount = serializers.IntegerField()