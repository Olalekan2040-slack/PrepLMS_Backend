from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import UserStreak, PointsRule, UserPoints, RewardRedemption


@receiver(post_save, sender=UserStreak)
def award_streak_milestone_points(sender, instance, **kwargs):
    """Award points for streak milestones."""
    # Check for streak milestones (e.g., 7, 14, 30 days)
    streak_milestones = [7, 14, 30, 60, 90, 180, 365]
    
    if instance.current_streak_days in streak_milestones:
        try:
            streak_rule = PointsRule.objects.get(action_type='streak_milestone', is_active=True)
            user_points = UserPoints.objects.get(user=instance.user)
            
            # Bonus multiplier based on milestone level
            multiplier = streak_milestones.index(instance.current_streak_days) + 1
            bonus_points = streak_rule.points * multiplier
            
            user_points.add_points(
                bonus_points,
                f'{instance.current_streak_days}-day streak milestone bonus'
            )
        except (PointsRule.DoesNotExist, UserPoints.DoesNotExist):
            pass


@receiver(post_save, sender=RewardRedemption)
def process_reward_redemption(sender, instance, created, **kwargs):
    """Process reward redemption status changes."""
    if not created and instance.status == 'rejected':
        # Refund points if redemption is rejected
        try:
            user_points = UserPoints.objects.get(user=instance.user)
            user_points.add_points(
                instance.points_spent,
                f'Refund for rejected redemption: {instance.reward.name}'
            )
        except UserPoints.DoesNotExist:
            pass