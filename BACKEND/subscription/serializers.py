from rest_framework import serializers
from .models import UserSubscription, SubscriptionPlan, Payment, VoucherCode
import uuid

class SubscriptionPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubscriptionPlan
        fields = ['id', 'name', 'plan_type', 'description', 'price', 'duration_days', 'video_limit', 'is_active']

class VoucherCodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = VoucherCode
        fields = ['code', 'expiry_date', 'is_used']

class UserSubscriptionSerializer(serializers.ModelSerializer):
    plan = SubscriptionPlanSerializer()
    voucher = VoucherCodeSerializer()
    
    class Meta:
        model = UserSubscription
        fields = ['id', 'plan', 'start_date', 'end_date', 'is_active', 'payment_reference', 'voucher', 'created_at']
        read_only_fields = ['created_at', 'updated_at']

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ['id', 'amount', 'currency', 'reference', 'status', 'payment_response']
        read_only_fields = ['status', 'payment_response', 'created_at', 'updated_at']

class SubscriptionCreateSerializer(serializers.Serializer):
    plan_id = serializers.IntegerField()
    voucher_code = serializers.CharField(required=False, allow_blank=True)
    redirect_url = serializers.URLField()
