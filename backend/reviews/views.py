from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Review
from .serializers import ReviewSerializer, PublicReviewSerializer
from users.permissions import IsCustomer
from users.models import User

class ReviewCreateView(generics.CreateAPIView):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticated, IsCustomer]

class ProviderReviewsListView(generics.ListAPIView):
    serializer_class = PublicReviewSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        provider_id = self.kwargs['provider_id']
        return Review.objects.filter(provider_id=provider_id)
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        # Add the provider's average rating to the response
        provider = User.objects.get(pk=self.kwargs['provider_id'])
        average_rating = provider.profile.provider_profile.average_rating
        return Response({
            'average_rating': average_rating,
            'reviews': serializer.data
        })