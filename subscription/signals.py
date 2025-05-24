from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Payment, UserSubscription


@receiver(post_save, sender=Payment)
def update_subscription_on_payment(sender, instance, created, **kwargs):
    """Update subscription status based on payment status."""
    if instance.status == 'completed' and instance.subscription:
        # Activate the subscription if payment is completed
        instance.subscription.is_active = True
        instance.subscription.save(update_fields=['is_active'])


@receiver(post_save, sender=UserSubscription)
def check_subscription_status(sender, instance, **kwargs):
    """Check and update subscription status based on end date."""
    from django.utils import timezone
    
    # Update active status based on end date
    if instance.end_date and timezone.now() > instance.end_date and instance.is_active:
        instance.is_active = False
        instance.save(update_fields=['is_active'])