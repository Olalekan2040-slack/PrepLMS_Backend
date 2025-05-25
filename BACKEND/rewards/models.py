from django.db import models
from django.utils import timezone
from users.models import User
from content.models import VideoLesson


class UserStreak(models.Model):
    """Track user's learning streak."""
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='streak')
    current_streak_days = models.PositiveIntegerField(default=0)
    longest_streak_days = models.PositiveIntegerField(default=0)
    last_activity_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.email} - {self.current_streak_days} days"
    
    def update_streak(self):
        """Update user streak based on activity."""
        today = timezone.now().date()
        
        if not self.last_activity_date:
            # First activity
            self.current_streak_days = 1
            self.longest_streak_days = 1
            self.last_activity_date = today
        elif self.last_activity_date == today:
            # Already counted for today
            pass
        elif self.last_activity_date == today - timezone.timedelta(days=1):
            # Consecutive day
            self.current_streak_days += 1
            self.longest_streak_days = max(self.longest_streak_days, self.current_streak_days)
            self.last_activity_date = today
        elif self.last_activity_date < today:
            # Streak broken
            self.current_streak_days = 1
            self.last_activity_date = today
        
        self.save(update_fields=['current_streak_days', 'longest_streak_days', 'last_activity_date', 'updated_at'])
        return self.current_streak_days


class PointsRule(models.Model):
    """Rules for earning points."""
    
    ACTION_CHOICES = (
        ('login', 'Daily Login'),
        ('video_watch', 'Watch Video'),
        ('complete_video', 'Complete Video'),
        ('streak_milestone', 'Streak Milestone'),
    )
    
    name = models.CharField(max_length=100)
    action_type = models.CharField(max_length=20, choices=ACTION_CHOICES)
    points = models.PositiveIntegerField()
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.name} - {self.points} points"


class UserPoints(models.Model):
    """User points balance and history."""
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='points')
    total_points = models.PositiveIntegerField(default=0)
    redeemed_points = models.PositiveIntegerField(default=0)
    available_points = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name_plural = 'User points'
    
    def __str__(self):
        return f"{self.user.email} - {self.available_points} points"
    
    def add_points(self, points, reason=None):
        """Add points to user balance."""
        self.total_points += points
        self.available_points += points
        self.save(update_fields=['total_points', 'available_points', 'updated_at'])
        
        # Create transaction record
        PointsTransaction.objects.create(
            user_points=self,
            points=points,
            transaction_type='earned',
            reason=reason or 'Points earned'
        )
        
        return self.available_points
    
    def redeem_points(self, points, reason=None):
        """Redeem points from user balance."""
        if points > self.available_points:
            return False
        
        self.redeemed_points += points
        self.available_points -= points
        self.save(update_fields=['redeemed_points', 'available_points', 'updated_at'])
        
        # Create transaction record
        PointsTransaction.objects.create(
            user_points=self,
            points=points,
            transaction_type='redeemed',
            reason=reason or 'Points redeemed'
        )
        
        return True


class PointsTransaction(models.Model):
    """Track points transactions."""
    
    TRANSACTION_TYPES = (
        ('earned', 'Earned'),
        ('redeemed', 'Redeemed'),
    )
    
    user_points = models.ForeignKey(UserPoints, on_delete=models.CASCADE, related_name='transactions')
    points = models.PositiveIntegerField()
    transaction_type = models.CharField(max_length=10, choices=TRANSACTION_TYPES)
    reason = models.CharField(max_length=255)
    video = models.ForeignKey(VideoLesson, on_delete=models.SET_NULL, null=True, blank=True, related_name='point_transactions')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user_points.user.email} - {self.points} points ({self.transaction_type})"


class Reward(models.Model):
    """Rewards that can be redeemed with points."""
    
    REWARD_TYPES = (
        ('data', 'Mobile Data'),
        ('subscription', 'Free Subscription'),
        ('other', 'Other'),
    )
    
    name = models.CharField(max_length=100)
    reward_type = models.CharField(max_length=20, choices=REWARD_TYPES)
    description = models.TextField()
    points_required = models.PositiveIntegerField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.name} - {self.points_required} points"


class RewardRedemption(models.Model):
    """Track reward redemptions."""
    
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('delivered', 'Delivered'),
        ('rejected', 'Rejected'),
    )
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='redemptions')
    reward = models.ForeignKey(Reward, on_delete=models.CASCADE, related_name='redemptions')
    points_spent = models.PositiveIntegerField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    recipient_info = models.CharField(max_length=255, help_text="Phone number or other info needed for reward delivery")
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.email} - {self.reward.name} - {self.status}"