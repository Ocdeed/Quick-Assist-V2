# backend/reviews/models.py
from django.db import models
from django.conf import settings
from services.models import ServiceRequest
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.db.models import Avg

class Review(models.Model):
    service_request = models.OneToOneField(ServiceRequest, on_delete=models.CASCADE, related_name='review')
    customer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reviews_given')
    provider = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reviews_received')
    rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Review by {self.customer.email} for Provider {self.provider.email}"


@receiver(post_save, sender=Review)
def update_provider_average_rating(sender, instance, created, **kwargs):
    """
    A signal that automatically recalculates and updates a provider's average
    rating and rating count every time a new review is saved for them.
    """
    if created:
        provider_profile = instance.provider.profile.provider_profile
        # Calculate the new average rating from all reviews for this provider
        new_average = Review.objects.filter(provider=instance.provider).aggregate(avg_rating=Avg('rating'))['avg_rating']
        
        provider_profile.average_rating = round(new_average, 2)
        provider_profile.rating_count = Review.objects.filter(provider=instance.provider).count()
        provider_profile.save()