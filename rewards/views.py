from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import UserStreak, UserPoints
from .serializers import UserStreakSerializer, UserPointsSerializer
from django.utils import timezone
from content.models import Bookmark, ViewHistory
from content.serializers import BookmarkSerializer, ViewHistorySerializer
from subscription.models import UserSubscription
from subscription.serializers import UserSubscriptionSerializer
from users.permissions import IsSuperAdmin
from rest_framework import generics
from .models import Reward, RewardRedemption
from .serializers import RewardSerializer, RewardRedemptionSerializer

class DashboardSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        # Ensure streak exists
        streak, _ = UserStreak.objects.get_or_create(user=user)
        # Ensure points exists
        points, _ = UserPoints.objects.get_or_create(user=user)
        # Bookmarks (latest 10)
        bookmarks = Bookmark.objects.filter(user=user).order_by('-created_at')[:10]
        bookmarks_data = BookmarkSerializer(bookmarks, many=True).data
        # History (latest 10)
        history = ViewHistory.objects.filter(user=user).order_by('-updated_at')[:10]
        history_data = ViewHistorySerializer(history, many=True).data
        # Subscription (latest active)
        subscription = UserSubscription.objects.filter(user=user, is_active=True).order_by('-end_date').first()
        subscription_data = UserSubscriptionSerializer(subscription).data if subscription else None
        streak_data = UserStreakSerializer(streak).data
        points_data = UserPointsSerializer(points).data
        return Response({
            'streak': streak_data,
            'points': points_data,
            'bookmarks': bookmarks_data,
            'history': history_data,
            'subscription': subscription_data,
        })

class AdminRewardListCreateView(generics.ListCreateAPIView):
    queryset = Reward.objects.all()
    serializer_class = RewardSerializer
    permission_classes = [IsSuperAdmin]

class AdminRewardDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Reward.objects.all()
    serializer_class = RewardSerializer
    permission_classes = [IsSuperAdmin]
    lookup_field = 'id'

class AdminRewardRedemptionListView(generics.ListAPIView):
    queryset = RewardRedemption.objects.all()
    serializer_class = RewardRedemptionSerializer
    permission_classes = [IsSuperAdmin]
