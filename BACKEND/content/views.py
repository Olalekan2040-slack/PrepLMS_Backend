from django.shortcuts import render, get_object_or_404
import random
import re
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.core.files.storage import default_storage
from django.conf import settings
import os
from .models import EducationLevel, ClassLevel, Subject, VideoLesson, ViewHistory
from .serializers import (
    EducationLevelSerializer, ClassLevelSerializer, SubjectSerializer, 
    VideoLessonSerializer, VideoProgressSerializer
)
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.views import APIView

class IsContentAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_staff and request.user.has_perm('content.can_manage_content')

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
    permission_classes = [IsAuthenticated]

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
    permission_classes = [IsAuthenticated]
    lookup_field = 'slug'

class VideoLessonCreateView(generics.CreateAPIView):
    queryset = VideoLesson.objects.all()
    serializer_class = VideoLessonSerializer
    permission_classes = [IsContentAdmin]
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    def create(self, request, *args, **kwargs):
        try:
            # Get video source from request
            video_source = request.data.get('video_source')
            
            if video_source == 'upload':
                # Handle direct file upload
                if 'video_file' not in request.FILES:
                    return Response(
                        {'error': 'No video file provided'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                video_file = request.FILES['video_file']
                # Validate file size (2GB limit)
                if video_file.size > 2 * 1024 * 1024 * 1024:  # 2GB in bytes
                    return Response(
                        {'error': 'File size cannot exceed 2GB'},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                # Save file with unique name
                file_name = default_storage.save(
                    f'videos/{video_file.name}',
                    video_file
                )
                request.data['video_id'] = file_name

            elif video_source == 'drive':
                # Handle Google Drive link
                video_id = request.data.get('video_id')
                if not video_id:
                    return Response(
                        {'error': 'No Google Drive link provided'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                # Extract file ID from Google Drive link if full URL is provided
                drive_patterns = [
                    r'drive\.google\.com/file/d/([\w-]+)',
                    r'drive\.google\.com/open\?id=([\w-]+)'
                ]
                
                for pattern in drive_patterns:
                    match = re.search(pattern, video_id)
                    if match:
                        video_id = match.group(1)
                        break
                
                request.data['video_id'] = video_id

            elif video_source == 'youtube':
                # Handle YouTube link
                video_id = request.data.get('video_id')
                if not video_id:
                    return Response(
                        {'error': 'No YouTube URL provided'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                # Extract video ID from YouTube URL if full URL is provided
                youtube_patterns = [
                    r'youtube\.com/watch\?v=([\w-]+)',
                    r'youtu\.be/([\w-]+)'
                ]
                
                for pattern in youtube_patterns:
                    match = re.search(pattern, video_id)
                    if match:
                        video_id = match.group(1)
                        break
                
                request.data['video_id'] = video_id

            else:
                return Response(
                    {'error': 'Invalid video source'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Create the video lesson
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)

            headers = self.get_success_headers(serializer.data)
            return Response(
                serializer.data,
                status=status.HTTP_201_CREATED,
                headers=headers
            )

        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

class VideoLessonUpdateView(generics.UpdateAPIView):
    queryset = VideoLesson.objects.all()
    serializer_class = VideoLessonSerializer
    permission_classes = [IsContentAdmin]
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    def update(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            video_source = request.data.get('video_source', instance.video_source)

            if video_source == 'upload' and 'video_file' in request.FILES:
                # Delete old video file if it exists
                if instance.video_id and default_storage.exists(instance.video_id):
                    default_storage.delete(instance.video_id)

                # Save new video file
                video_file = request.FILES['video_file']
                if video_file.size > 2 * 1024 * 1024 * 1024:  # 2GB limit
                    return Response(
                        {'error': 'File size cannot exceed 2GB'},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                file_name = default_storage.save(
                    f'videos/{video_file.name}',
                    video_file
                )
                request.data['video_id'] = file_name

            elif video_source == 'drive':
                video_id = request.data.get('video_id', instance.video_id)
                if video_id:
                    # Extract file ID from Google Drive link if full URL is provided
                    drive_patterns = [
                        r'drive\.google\.com/file/d/([\w-]+)',
                        r'drive\.google\.com/open\?id=([\w-]+)'
                    ]
                    
                    for pattern in drive_patterns:
                        match = re.search(pattern, video_id)
                        if match:
                            video_id = match.group(1)
                            break
                    
                    request.data['video_id'] = video_id

            elif video_source == 'youtube':
                video_id = request.data.get('video_id', instance.video_id)
                if video_id:
                    # Extract video ID from YouTube URL if full URL is provided
                    youtube_patterns = [
                        r'youtube\.com/watch\?v=([\w-]+)',
                        r'youtu\.be/([\w-]+)'
                    ]
                    
                    for pattern in youtube_patterns:
                        match = re.search(pattern, video_id)
                        if match:
                            video_id = match.group(1)
                            break
                    
                    request.data['video_id'] = video_id

            # Update the video lesson
            serializer = self.get_serializer(instance, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)

            return Response(serializer.data)

        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    def perform_destroy(self, instance):
        # Delete the video file if it exists
        if instance.video_source == 'upload' and instance.video_id:
            if default_storage.exists(instance.video_id):
                default_storage.delete(instance.video_id)
        super().perform_destroy(instance)

class VideoLessonDeleteView(generics.DestroyAPIView):
    queryset = VideoLesson.objects.all()
    serializer_class = VideoLessonSerializer
    permission_classes = [IsContentAdmin]

class CourseListView(generics.ListAPIView):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer
    permission_classes = [IsAuthenticated]

class CourseDetailView(generics.RetrieveAPIView):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'

class CourseBySubjectView(generics.ListAPIView):
    serializer_class = SubjectSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        subject = self.kwargs.get('subject')
        return Subject.objects.filter(slug=subject)

class CourseByClassView(generics.ListAPIView):
    serializer_class = SubjectSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        class_level = self.kwargs.get('class_level')
        return Subject.objects.filter(videos__class_level__slug=class_level).distinct()

class FeaturedCourseListView(generics.ListAPIView):
    serializer_class = SubjectSerializer
    permission_classes = [permissions.AllowAny]  # Allow public access to featured courses
    def get_queryset(self):
        return Subject.objects.filter(videos__is_free=True).distinct()

class VideoListView(generics.ListAPIView):
    queryset = VideoLesson.objects.all()
    serializer_class = VideoLessonSerializer
    permission_classes = [IsAuthenticated]

class VideoDetailView(generics.RetrieveAPIView):
    queryset = VideoLesson.objects.all()
    serializer_class = VideoLessonSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'

class VideosByCourseView(generics.ListAPIView):
    serializer_class = VideoLessonSerializer
    permission_classes = [IsAuthenticated]
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
    parser_classes = (MultiPartParser, FormParser)
    
    def create(self, request, *args, **kwargs):
        try:
            print("Received video data:", request.data)
            
            # Handle file upload
            video_file = request.FILES.get('video_file')
            if video_file:
                request.data['video_source'] = 'local'
                request.data['video_id'] = ''
            
            # Handle YouTube URL
            youtube_url = request.data.get('youtube_url')
            if youtube_url:
                # Extract video ID from YouTube URL
                video_id = self.extract_youtube_id(youtube_url)
                if not video_id:
                    return Response(
                        {'detail': 'Invalid YouTube URL'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                request.data['video_source'] = 'youtube'
                request.data['video_id'] = video_id
            
            serializer = self.get_serializer(data=request.data)
            if not serializer.is_valid():
                print("Validation errors:", serializer.errors)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
                
            video = serializer.save()
            print("Video created successfully:", video)
            return Response(
                VideoLessonSerializer(video).data,
                status=status.HTTP_201_CREATED
            )
        except Exception as e:
            print("Error creating video:", str(e))
            return Response(
                {'detail': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    def extract_youtube_id(self, url):
        import re
        # Extract video ID from various YouTube URL formats
        youtube_regex = (
            r'(https?://)?(www\.)?(youtube|youtu|youtube-nocookie)\.(com|be)/'
            r'(watch\?v=|embed/|v/|.+\?v=)?([^&=%\?]{11})')
        match = re.match(youtube_regex, url)
        return match.group(6) if match else None

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

class AdminVideoUploadView(generics.CreateAPIView):
    queryset = VideoLesson.objects.all()
    serializer_class = VideoLessonSerializer
    permission_classes = [IsSuperAdmin|IsContentAdmin]
    parser_classes = (MultiPartParser, FormParser)

    def create(self, request, *args, **kwargs):
        try:
            # Create a mutable copy of request.data
            data = request.data.copy()
            
            # Handle file upload
            if data.get('video_source') == 'file':
                if 'video_file' not in request.FILES:
                    return Response(
                        {'video_file': 'No video file uploaded.'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                data['video_file'] = request.FILES['video_file']
            
            # Create serializer with the data
            serializer = self.get_serializer(data=data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            
            headers = self.get_success_headers(serializer.data)
            return Response(
                serializer.data,
                status=status.HTTP_201_CREATED,
                headers=headers
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
