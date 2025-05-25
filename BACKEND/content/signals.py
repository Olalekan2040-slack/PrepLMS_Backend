from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import ViewHistory
from rewards.models import UserPoints, PointsRule


@receiver(post_save, sender=ViewHistory)
def update_points_on_video_progress(sender, instance, created, **kwargs):
    """Award points for watching videos."""
    # Check if video is completed
    if instance.is_completed:
        # Give points for completing a video
        try:
            complete_rule = PointsRule.objects.get(action_type='complete_video', is_active=True)
            user_points = UserPoints.objects.get(user=instance.user)
            
            # Check if points already given for this completion
            from rewards.models import PointsTransaction
            existing_transaction = PointsTransaction.objects.filter(
                user_points=user_points,
                video=instance.video,
                reason__contains='Completed video',
                transaction_type='earned'
            ).exists()
            
            if not existing_transaction:
                user_points.add_points(
                    complete_rule.points, 
                    f'Completed video: {instance.video.title}',
                )
        except (PointsRule.DoesNotExist, UserPoints.DoesNotExist):
            pass
    # For non-completed videos that have some progress
    elif not created and instance.watched_duration > 0:
        # Give points for watching videos (if not already given)
        try:
            watch_rule = PointsRule.objects.get(action_type='video_watch', is_active=True)
            user_points = UserPoints.objects.get(user=instance.user)
            
            # Check if points already given for watching this video
            from rewards.models import PointsTransaction
            existing_transaction = PointsTransaction.objects.filter(
                user_points=user_points,
                video=instance.video,
                reason__contains='Watched video',
                transaction_type='earned'
            ).exists()
            
            if not existing_transaction:
                user_points.add_points(
                    watch_rule.points, 
                    f'Watched video: {instance.video.title}',
                )
        except (PointsRule.DoesNotExist, UserPoints.DoesNotExist):
            pass