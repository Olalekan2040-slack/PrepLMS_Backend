from django.contrib import admin
from .models import SubscriptionPlan, VoucherCode, UserSubscription, Payment


@admin.register(SubscriptionPlan)
class SubscriptionPlanAdmin(admin.ModelAdmin):
    """Admin configuration for SubscriptionPlan model."""
    
    list_display = ('name', 'plan_type', 'price', 'duration_days', 'video_limit', 'is_active')
    list_filter = ('plan_type', 'is_active')
    search_fields = ('name', 'description')
    ordering = ('price',)


class UserSubscriptionInline(admin.TabularInline):
    """Inline admin for UserSubscription model."""
    
    model = UserSubscription
    extra = 0
    fields = ('user', 'start_date', 'end_date', 'is_active')
    readonly_fields = ('created_at',)


@admin.register(VoucherCode)
class VoucherCodeAdmin(admin.ModelAdmin):
    """Admin configuration for VoucherCode model."""
    
    list_display = ('code', 'plan', 'is_used', 'used_by', 'used_at', 'expiry_date')
    list_filter = ('is_used', 'plan', 'expiry_date')
    search_fields = ('code', 'used_by__email')
    ordering = ('-created_at',)
    date_hierarchy = 'created_at'
    inlines = [UserSubscriptionInline]
    
    actions = ['generate_multiple_vouchers']
    
    def generate_multiple_vouchers(self, request, queryset):
        """Generate multiple voucher codes for a plan."""
        # This would be implemented to generate batch vouchers
        self.message_user(request, 'Voucher code generation feature will be implemented.')
    
    generate_multiple_vouchers.short_description = "Generate multiple voucher codes"


# class PaymentInline(admin.TabularInline):
#     """Inline admin for Payment model."""
#     model = Payment
#     extra = 0
#     fields = ('amount', 'reference', 'status', 'created_at')
#     readonly_fields = ('created_at',)


@admin.register(UserSubscription)
class UserSubscriptionAdmin(admin.ModelAdmin):
    """Admin configuration for UserSubscription model."""
    
    list_display = ('user', 'plan', 'start_date', 'end_date', 'is_active')
    list_filter = ('is_active', 'plan', 'start_date', 'end_date')
    search_fields = ('user__email', 'payment_reference')
    date_hierarchy = 'start_date'
    # inlines = [PaymentInline]


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    """Admin configuration for Payment model."""
    
    list_display = ('user', 'amount', 'reference', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('user__email', 'reference', 'paystack_reference')
    date_hierarchy = 'created_at'
    readonly_fields = ('created_at', 'updated_at')