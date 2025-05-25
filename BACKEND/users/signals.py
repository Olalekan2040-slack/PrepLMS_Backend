from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.signals import user_logged_in
from django.utils import timezone
from .models import User, LoginHistory
from rewards.models import UserStreak, UserPoints


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """Create user profiles when a new user is created."""
    if created:
        # Create user streak
        UserStreak.objects.create(user=instance)
        
        # Create user points
        UserPoints.objects.create(user=instance)


@receiver(user_logged_in)
def update_user_login_info(sender, user, request, **kwargs):
    """Update user login information and streak."""
    # Update last login IP and date
    if request:
        user.last_login_ip = request.META.get('REMOTE_ADDR')
        user.last_login_date = timezone.now()
        user.save()  # Removed update_fields parameter

        # Ensure the user is an instance of the custom User model
        try:
            if not isinstance(user, User):
                user = User.objects.get(pk=user.pk)
        except User.DoesNotExist:
            # Log the error or handle it gracefully
            return

        # Create login history entry
        LoginHistory.objects.create(
            user=user,
            ip_address=request.META.get('REMOTE_ADDR'),
            device_info=request.META.get('HTTP_USER_AGENT', '')[:255]
        )
    
    # Update user streak
    try:
        streak = UserStreak.objects.get(user=user)
        streak.update_streak()
        
        # Add points for daily login if applicable
        current_date = timezone.now().date()
        if not streak.last_activity_date or streak.last_activity_date != current_date:
            from rewards.models import PointsRule
            try:
                login_rule = PointsRule.objects.get(action_type='login', is_active=True)
                user_points = UserPoints.objects.get(user=user)
                user_points.add_points(login_rule.points, 'Daily login reward')
            except PointsRule.DoesNotExist:
                pass
    except UserStreak.DoesNotExist:
        pass