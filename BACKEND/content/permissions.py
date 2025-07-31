from rest_framework import permissions
from django.utils import timezone
from subscription.models import UserSubscription

class HasActiveSubscriptionOrIsFree(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        # Allow if video is free
        if obj.is_free:
            return True

        # Check for active subscription
        return UserSubscription.objects.filter(
            user=request.user,
            is_active=True,
            start_date__lte=timezone.now(),
            end_date__gte=timezone.now()
        ).exists()