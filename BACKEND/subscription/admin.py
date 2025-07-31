from django.contrib import admin
from .models import SubscriptionPlan, UserSubscription, Payment, VoucherCode


@admin.register(SubscriptionPlan)
class SubscriptionPlanAdmin(admin.ModelAdmin):
    """Admin configuration for SubscriptionPlan model."""

    list_display = ('name', 'plan_type', 'price', 'duration_days', 'is_active')
    list_filter = ('plan_type', 'is_active')
    search_fields = ('name', 'description')
    ordering = ('price',)


@admin.register(UserSubscription)
class UserSubscriptionAdmin(admin.ModelAdmin):
    """Admin configuration for UserSubscription model."""

    list_display = ('user', 'plan', 'start_date', 'end_date', 'is_active')
    list_filter = ('is_active', 'plan')
    search_fields = ('user__email', 'payment_reference')
    raw_id_fields = ('user', 'plan', 'voucher')


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    """Admin configuration for Payment model."""

    list_display = ('reference', 'subscription', 'amount', 'status', 'created_at')
    list_filter = ('status', 'currency')
    search_fields = ('reference', 'subscription__user__email')
    raw_id_fields = ('subscription',)


@admin.register(VoucherCode)
class VoucherCodeAdmin(admin.ModelAdmin):
    """Admin configuration for VoucherCode model."""

    list_display = ('code', 'plan', 'is_used', 'used_by', 'used_at', 'expiry_date')
    list_filter = ('is_used', 'plan')
    search_fields = ('code', 'used_by__email')
    raw_id_fields = ('plan', 'used_by')