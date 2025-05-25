from rest_framework import serializers
from .models import UserStreak, UserPoints, Reward, RewardRedemption

class UserStreakSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserStreak
        fields = ['current_streak_days', 'longest_streak_days', 'last_activity_date']

class UserPointsSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserPoints
        fields = ['total_points', 'redeemed_points', 'available_points']

class RewardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reward
        fields = ['id', 'name', 'reward_type', 'description', 'points_required', 'is_active', 'created_at']

class RewardRedemptionSerializer(serializers.ModelSerializer):
    reward = RewardSerializer(read_only=True)
    class Meta:
        model = RewardRedemption
        fields = ['id', 'user', 'reward', 'points_spent', 'status', 'recipient_info', 'notes', 'created_at', 'updated_at']
        read_only_fields = ['user', 'created_at', 'updated_at']
