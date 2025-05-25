from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from users.permissions import IsSuperAdmin
from rest_framework.permissions import IsAuthenticated
from rewards.models import UserStreak, UserPoints
from rewards.serializers import UserStreakSerializer, UserPointsSerializer
from content.models import Bookmark, ViewHistory, VideoLesson
from content.serializers import BookmarkSerializer, VideoLessonSerializer
from subscription.models import UserSubscription
from subscription.serializers import UserSubscriptionSerializer

class PlatformSettingsView(APIView):
    permission_classes = [IsSuperAdmin]
    def get(self, request):
        # Dummy settings, replace with actual settings model if needed
        return Response({
            "site_name": "Prep Platform",
            "maintenance_mode": False,
            "support_email": "support@example.com"
        })
    def patch(self, request):
        # Update settings logic here
        return Response({"detail": "Settings updated."})

class DashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        user = request.user
        total_watched = ViewHistory.objects.filter(user=user).count()
        total_completed = ViewHistory.objects.filter(user=user, is_completed=True).count()
        streak, _ = UserStreak.objects.get_or_create(user=user)
        points, _ = UserPoints.objects.get_or_create(user=user)
        bookmarks = Bookmark.objects.filter(user=user).order_by('-created_at')[:10]
        bookmarks_data = BookmarkSerializer(bookmarks, many=True).data
        history = ViewHistory.objects.filter(user=user).order_by('-updated_at')[:10]
        history_data = VideoLessonSerializer([h.video for h in history if h.video], many=True).data
        subscription = UserSubscription.objects.filter(user=user, is_active=True).order_by('-end_date').first()
        subscription_data = UserSubscriptionSerializer(subscription).data if subscription else None
        return Response({
            'total_watched': total_watched,
            'total_completed': total_completed,
            'streak': UserStreakSerializer(streak).data,
            'points': UserPointsSerializer(points).data,
            'bookmarks': bookmarks_data,
            'history': history_data,
            'subscription': subscription_data,
        })

# Create your views here.
