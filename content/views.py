from django.shortcuts import render, get_object_or_404
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .models import EducationLevel, ClassLevel, Subject, VideoLesson, ViewHistory
from .serializers import (
    EducationLevelSerializer, ClassLevelSerializer, SubjectSerializer, VideoLessonSerializer, VideoProgressSerializer
)
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

class EducationLevelListView(generics.ListAPIView):
    queryset = EducationLevel.objects.all()
    serializer_class = EducationLevelSerializer
    permission_classes = [permissions.AllowAny]

class ClassLevelListView(generics.ListAPIView):
    queryset = ClassLevel.objects.all()
    serializer_class = ClassLevelSerializer
    permission_classes = [permissions.AllowAny]

class SubjectListView(generics.ListAPIView):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer
    permission_classes = [permissions.AllowAny]

class VideoLessonListView(generics.ListAPIView):
    queryset = VideoLesson.objects.all()
    serializer_class = VideoLessonSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = super().get_queryset()
        subject = self.request.query_params.get('subject')
        class_level = self.request.query_params.get('class_level')
        education_level = self.request.query_params.get('education_level')
        if subject:
            queryset = queryset.filter(subject__slug=subject)
        if class_level:
            queryset = queryset.filter(class_level__slug=class_level)
        if education_level:
            queryset = queryset.filter(class_level__education_level__slug=education_level)
        return queryset

class VideoLessonDetailView(generics.RetrieveAPIView):
    queryset = VideoLesson.objects.all()
    serializer_class = VideoLessonSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'slug'

class CourseListView(generics.ListAPIView):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer

class CourseDetailView(generics.RetrieveAPIView):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer
    lookup_field = 'id'

class CourseBySubjectView(generics.ListAPIView):
    serializer_class = SubjectSerializer
    def get_queryset(self):
        subject = self.kwargs.get('subject')
        return Subject.objects.filter(slug=subject)

class CourseByClassView(generics.ListAPIView):
    serializer_class = SubjectSerializer
    def get_queryset(self):
        class_level = self.kwargs.get('class_level')
        return Subject.objects.filter(videos__class_level__slug=class_level).distinct()

class FeaturedCourseListView(generics.ListAPIView):
    serializer_class = SubjectSerializer
    def get_queryset(self):
        return Subject.objects.filter(videos__is_free=True).distinct()  # or use a 'featured' field if available

class VideoListView(generics.ListAPIView):
    queryset = VideoLesson.objects.all()
    serializer_class = VideoLessonSerializer

class VideoDetailView(generics.RetrieveAPIView):
    queryset = VideoLesson.objects.all()
    serializer_class = VideoLessonSerializer
    lookup_field = 'id'

class VideosByCourseView(generics.ListAPIView):
    serializer_class = VideoLessonSerializer
    def get_queryset(self):
        course_id = self.kwargs.get('course_id')
        return VideoLesson.objects.filter(subject_id=course_id)

class VideoProgressView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        video_id = request.data.get('video')
        position = request.data.get('last_position')
        duration = request.data.get('watched_duration')
        video = get_object_or_404(VideoLesson, id=video_id)
        history, _ = ViewHistory.objects.get_or_create(user=request.user, video=video)
        history.update_watch_progress(position, duration)
        serializer = VideoProgressSerializer(history)
        return Response(serializer.data, status=status.HTTP_200_OK)

class VideoProgressDetailView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, id):
        history = get_object_or_404(ViewHistory, user=request.user, video_id=id)
        serializer = VideoProgressSerializer(history)
        return Response(serializer.data)

from .models import Bookmark, VideoLesson
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.response import Response

class VideoBookmarkView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request, id):
        video = get_object_or_404(VideoLesson, id=id)
        Bookmark.objects.get_or_create(user=request.user, video=video)
        return Response({'detail': 'Bookmarked'}, status=status.HTTP_201_CREATED)
    def delete(self, request, id):
        video = get_object_or_404(VideoLesson, id=id)
        Bookmark.objects.filter(user=request.user, video=video).delete()
        return Response({'detail': 'Bookmark removed'}, status=status.HTTP_204_NO_CONTENT)

class VideoBookmarksListView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        bookmarks = Bookmark.objects.filter(user=request.user).select_related('video')
        videos = [b.video for b in bookmarks if b.video]
        data = VideoLessonSerializer(videos, many=True).data
        return Response(data)

class ProgressDashboardView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        # Returns overall learning progress (e.g., total videos watched, completed, etc.)
        total_watched = ViewHistory.objects.filter(user=request.user).count()
        total_completed = ViewHistory.objects.filter(user=request.user, is_completed=True).count()
        return Response({
            'total_watched': total_watched,
            'total_completed': total_completed
        })

class CourseProgressView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, course_id):
        # Returns progress for a specific course (subject)
        videos = VideoLesson.objects.filter(subject_id=course_id)
        total = videos.count()
        completed = ViewHistory.objects.filter(user=request.user, video__in=videos, is_completed=True).count()
        return Response({'course_id': course_id, 'total': total, 'completed': completed})

class SubjectProgressView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, subject_id):
        # Returns progress for a specific subject (alias for course)
        videos = VideoLesson.objects.filter(subject_id=subject_id)
        total = videos.count()
        completed = ViewHistory.objects.filter(user=request.user, video__in=videos, is_completed=True).count()
        return Response({'subject_id': subject_id, 'total': total, 'completed': completed})

class TrackLearningView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        # Update learning progress (same as video progress, but can be extended)
        video_id = request.data.get('video')
        position = request.data.get('last_position')
        duration = request.data.get('watched_duration')
        video = get_object_or_404(VideoLesson, id=video_id)
        history, _ = ViewHistory.objects.get_or_create(user=request.user, video=video)
        history.update_watch_progress(position, duration)
        serializer = VideoProgressSerializer(history)
        return Response(serializer.data)

class RecentActivityView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        # Get recent learning activity (last 10 videos)
        history = ViewHistory.objects.filter(user=request.user).order_by('-updated_at')[:10]
        serializer = VideoProgressSerializer(history, many=True)
        return Response(serializer.data)

from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import ViewHistory, VideoLesson, Subject
from django.db.models import Sum, Count, Avg

class AnalyticsPerformanceView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        # Example: total videos watched, completed, average watch time
        total_watched = ViewHistory.objects.filter(user=request.user).count()
        total_completed = ViewHistory.objects.filter(user=request.user, is_completed=True).count()
        avg_watch_time = ViewHistory.objects.filter(user=request.user).aggregate(avg=Avg('watched_duration'))['avg'] or 0
        return Response({
            'total_watched': total_watched,
            'total_completed': total_completed,
            'average_watch_time': avg_watch_time
        })

class AnalyticsTimeSpentView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        # Total time spent learning (sum of watched_duration)
        total_time = ViewHistory.objects.filter(user=request.user).aggregate(total=Sum('watched_duration'))['total'] or 0
        return Response({'total_time_spent': total_time})

class AnalyticsSubjectStrengthsView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        # Videos completed per subject
        data = (
            ViewHistory.objects.filter(user=request.user, is_completed=True)
            .values('video__subject__name')
            .annotate(completed=Count('id'))
            .order_by('-completed')
        )
        return Response({'subject_strengths': list(data)})

class AnalyticsRecommendationsView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        # Dummy recommendations (could be improved with ML)
        # Recommend subjects with least completed videos
        data = (
            ViewHistory.objects.filter(user=request.user, is_completed=True)
            .values('video__subject__id', 'video__subject__name')
            .annotate(completed=Count('id'))
        )
        completed_subject_ids = [d['video__subject__id'] for d in data]
        recommended = Subject.objects.exclude(id__in=completed_subject_ids)[:3]
        return Response({'recommendations': [s.name for s in recommended]})

from users.permissions import IsSuperAdmin, IsContentAdmin

# Admin endpoints for content management
class AdminCourseListCreateView(generics.ListCreateAPIView):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer
    permission_classes = [IsSuperAdmin|IsContentAdmin]

class AdminCourseDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer
    permission_classes = [IsSuperAdmin|IsContentAdmin]
    lookup_field = 'id'

class AdminVideoListCreateView(generics.ListCreateAPIView):
    queryset = VideoLesson.objects.all()
    serializer_class = VideoLessonSerializer
    permission_classes = [IsSuperAdmin|IsContentAdmin]

class AdminVideoDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = VideoLesson.objects.all()
    serializer_class = VideoLessonSerializer
    permission_classes = [IsSuperAdmin|IsContentAdmin]
    lookup_field = 'id'

class AdminSubjectListCreateView(generics.ListCreateAPIView):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer
    permission_classes = [IsSuperAdmin|IsContentAdmin]

class AdminSubjectDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer
    permission_classes = [IsSuperAdmin|IsContentAdmin]
    lookup_field = 'id'

class AdminClassLevelListView(generics.ListAPIView):
    queryset = ClassLevel.objects.all()
    serializer_class = ClassLevelSerializer
    permission_classes = [IsSuperAdmin|IsContentAdmin]

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import VideoLesson
from .serializers import VideoLessonSerializer
import random

class FreeSampleVideoListView(APIView):
    def get(self, request):
        free_videos = VideoLesson.objects.filter(is_free=True)
        sample = random.sample(list(free_videos), min(12, free_videos.count()))
        # Map to required structure
        data = [
            {
                "id": str(video.id),
                "title": video.title,
                "thumbnail": video.thumbnail.url if video.thumbnail else "",
                "subject": video.subject.name if video.subject else "",
                "duration": str(video.duration) if hasattr(video, 'duration') else "",
                "courseId": str(video.subject.id) if video.subject else ""
            }
            for video in sample
        ]
        return Response(data, status=status.HTTP_200_OK)

class VideoCurrentView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        # Return the most recently watched video for the user
        last_history = ViewHistory.objects.filter(user=request.user).order_by('-updated_at').first()
        if last_history and last_history.video:
            data = VideoLessonSerializer(last_history.video).data
            return Response(data)
        return Response({}, status=204)
