from django.contrib import admin
from .models import (
    UserStreak, PointsRule, UserPoints, PointsTransaction,
    Reward, RewardRedemption
)


@admin.register(UserStreak)
class UserStreakAdmin(admin.ModelAdmin):
    """Admin configuration for UserStreak model."""
    
    list_display = ('user', 'current_streak_days', 'longest_streak_days', 'last_activity_date')
    list_filter = ('last_activity_date',)
    search_fields = ('user__email',)
    readonly_fields = ('created_at', 'updated_at')


@admin.register(PointsRule)
class PointsRuleAdmin(admin.ModelAdmin):
    """Admin configuration for PointsRule model."""
    
    list_display = ('name', 'action_type', 'points', 'is_active')
    list_filter = ('action_type', 'is_active')
    search_fields = ('name', 'description')


class PointsTransactionInline(admin.TabularInline):
    """Inline admin for PointsTransaction model."""
    
    model = PointsTransaction
    extra = 0
    readonly_fields = ('points', 'transaction_type', 'reason', 'video', 'created_at')
    can_delete = False
    max_num = 0
    ordering = ('-created_at',)


@admin.register(UserPoints)
class UserPointsAdmin(admin.ModelAdmin):
    """Admin configuration for UserPoints model."""
    
    list_display = ('user', 'total_points', 'redeemed_points', 'available_points')
    search_fields = ('user__email',)
    readonly_fields = ('total_points', 'redeemed_points', 'available_points', 'created_at', 'updated_at')
    inlines = [PointsTransactionInline]


@admin.register(PointsTransaction)
class PointsTransactionAdmin(admin.ModelAdmin):
    """Admin configuration for PointsTransaction model."""
    
    list_display = ('user_points', 'points', 'transaction_type', 'reason', 'created_at')
    list_filter = ('transaction_type', 'created_at')
    search_fields = ('user_points__user__email', 'reason')
    date_hierarchy = 'created_at'
    readonly_fields = ('created_at',)


@admin.register(Reward)
class RewardAdmin(admin.ModelAdmin):
    """Admin configuration for Reward model."""
    
    list_display = ('name', 'reward_type', 'points_required', 'is_active')
    list_filter = ('reward_type', 'is_active')
    search_fields = ('name', 'description')


@admin.register(RewardRedemption)
class RewardRedemptionAdmin(admin.ModelAdmin):
    """Admin configuration for RewardRedemption model."""
    
    list_display = ('user', 'reward', 'points_spent', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('user__email', 'reward__name', 'recipient_info')
    date_hierarchy = 'created_at'
    readonly_fields = ('created_at', 'updated_at')
    
    actions = ['approve_redemptions', 'mark_as_delivered', 'reject_redemptions']
    
    def approve_redemptions(self, request, queryset):
        """Approve selected redemption requests."""
        queryset.update(status='approved')
        self.message_user(request, f"{queryset.count()} redemption requests were approved.")
    
    approve_redemptions.short_description = "Approve selected redemption requests"
    
    def mark_as_delivered(self, request, queryset):
        """Mark selected redemption requests as delivered."""
        queryset.update(status='delivered')
        self.message_user(request, f"{queryset.count()} redemption requests were marked as delivered.")
    
    mark_as_delivered.short_description = "Mark selected requests as delivered"
    
    def reject_redemptions(self, request, queryset):
        """Reject selected redemption requests."""
        # This would include logic to refund points
        queryset.update(status='rejected')
        self.message_user(request, f"{queryset.count()} redemption requests were rejected.")
    
    reject_redemptions.short_description = "Reject selected redemption requests"