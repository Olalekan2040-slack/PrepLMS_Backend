from django.urls import path
from .views import (
    SubscriptionPlanListView,
    InitiateSubscriptionView,
    VerifySubscriptionView,
    FlutterwaveWebhookView,
    UserSubscriptionView
)

urlpatterns = [
    path('plans/', SubscriptionPlanListView.as_view(), name='subscription-plans'),
    path('subscribe/', InitiateSubscriptionView.as_view(), name='initiate-subscription'),
    path('verify/', VerifySubscriptionView.as_view(), name='verify-subscription'),
    path('webhook/', FlutterwaveWebhookView.as_view(), name='flutterwave-webhook'),
    path('current/', UserSubscriptionView.as_view(), name='user-subscription'),
]