from rest_framework import serializers
from .models import UserSubscription, SubscriptionPlan, Payment

class SubscriptionPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubscriptionPlan
        fields = ['name', 'plan_type', 'description', 'price', 'duration_days', 'video_limit']

class UserSubscriptionSerializer(serializers.ModelSerializer):
    plan = SubscriptionPlanSerializer()
    class Meta:
        model = UserSubscription
        fields = ['plan', 'start_date', 'end_date', 'is_active']

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ['id', 'user', 'plan', 'amount', 'reference', 'status', 'paystack_response', 'created_at', 'updated_at']
        read_only_fields = ['status', 'paystack_response', 'created_at', 'updated_at']
