from django.db import models
from django.utils import timezone
from django.conf import settings
from datetime import timedelta

# Import User model from settings
User = settings.AUTH_USER_MODEL


class SubscriptionPlan(models.Model):
    """Subscription plan model."""
    
    PLAN_TYPES = (
        ('free', 'Free Preview'),
        ('standard', 'Standard'),
        ('scholar', 'Scholar'),
    )
    
    name = models.CharField(max_length=100)
    plan_type = models.CharField(max_length=20, choices=PLAN_TYPES)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    duration_days = models.PositiveIntegerField(default=30)
    video_limit = models.PositiveIntegerField(default=5, help_text="Number of videos allowed for free plans")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['price']
    
    def __str__(self):
        return f"{self.name} ({self.get_plan_type_display()})"


class VoucherCode(models.Model):
    """Voucher code model for scholar plans."""
    
    code = models.CharField(max_length=20, unique=True)
    plan = models.ForeignKey(SubscriptionPlan, on_delete=models.CASCADE, related_name='vouchers')
    is_used = models.BooleanField(default=False)
    used_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='used_vouchers')
    used_at = models.DateTimeField(null=True, blank=True)
    expiry_date = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.code} - {self.plan.name}"
    
    def is_valid(self):
        """Check if voucher is valid."""
        if self.is_used:
            return False
        if self.expiry_date and timezone.now() > self.expiry_date:
            return False
        return True
    
    def use_voucher(self, user):
        """Mark voucher as used."""
        if self.is_valid():
            self.is_used = True
            self.used_by = user
            self.used_at = timezone.now()
            self.save(update_fields=['is_used', 'used_by', 'used_at'])
            return True
        return False


class UserSubscription(models.Model):
    """User subscription model."""
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='subscriptions')
    plan = models.ForeignKey(SubscriptionPlan, on_delete=models.CASCADE, related_name='user_subscriptions')
    start_date = models.DateTimeField(default=timezone.now)
    end_date = models.DateTimeField()
    is_active = models.BooleanField(default=True)
    payment_reference = models.CharField(max_length=255, blank=True, null=True)
    voucher = models.ForeignKey(VoucherCode, on_delete=models.SET_NULL, null=True, blank=True, related_name='user_subscriptions')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-end_date']
    
    def __str__(self):
        return f"{self.user.email} - {self.plan.name}"
    
    def save(self, *args, **kwargs):
        # Set end date if not provided
        if not self.end_date and self.start_date:
            self.end_date = self.start_date + timezone.timedelta(days=self.plan.duration_days)
        
        # Check if subscription is still active
        if self.end_date and timezone.now() > self.end_date:
            self.is_active = False
        
        super().save(*args, **kwargs)


class Payment(models.Model):
    """Payment model for tracking transactions."""
    
    PAYMENT_STATUS = (
        ('pending', 'Pending'),
        ('successful', 'Successful'),
        ('failed', 'Failed'),
    )

    subscription = models.OneToOneField(UserSubscription, on_delete=models.CASCADE, related_name='payment')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='USD')
    reference = models.CharField(max_length=255, unique=True)
    status = models.CharField(max_length=20, choices=PAYMENT_STATUS, default='pending')
    payment_response = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.reference} - {self.amount} {self.currency}"