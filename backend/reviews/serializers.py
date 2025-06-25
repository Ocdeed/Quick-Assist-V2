from rest_framework import serializers
from .models import Review
from services.models import ServiceRequest

class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ['rating', 'comment']

    def create(self, validated_data):
        service_request_id = self.context['view'].kwargs['job_id']
        customer = self.context['request'].user
        
        try:
            service_request = ServiceRequest.objects.get(pk=service_request_id, customer=customer)
        except ServiceRequest.DoesNotExist:
            raise serializers.ValidationError("You can only review jobs you requested.")

        if service_request.status != ServiceRequest.ServiceRequestStatus.COMPLETED:
            raise serializers.ValidationError("You can only review completed jobs.")
            
        if hasattr(service_request, 'review'):
             raise serializers.ValidationError("You have already submitted a review for this job.")

        validated_data['service_request'] = service_request
        validated_data['customer'] = customer
        validated_data['provider'] = service_request.provider
        
        return Review.objects.create(**validated_data)

class PublicReviewSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.get_full_name', read_only=True)
    class Meta:
        model = Review
        fields = ['id', 'rating', 'comment', 'customer_name', 'created_at']