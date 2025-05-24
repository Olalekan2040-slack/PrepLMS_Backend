from rest_framework import serializers
from .models import EducationLevel, ClassLevel, Subject, VideoLesson, Bookmark, ViewHistory

class EducationLevelSerializer(serializers.ModelSerializer):
    class Meta:
        model = EducationLevel
        fields = ['id', 'name', 'slug', 'description', 'order']

class ClassLevelSerializer(serializers.ModelSerializer):
    education_level = EducationLevelSerializer(read_only=True)
    class Meta:
        model = ClassLevel
        fields = ['id', 'name', 'slug', 'education_level', 'description', 'order']

class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = ['id', 'name', 'slug', 'description', 'icon']

class VideoLessonSerializer(serializers.ModelSerializer):
    subject = SubjectSerializer(read_only=True)
    class_level = ClassLevelSerializer(read_only=True)
    class Meta:
        model = VideoLesson
        fields = [
            'id', 'title', 'slug', 'description', 'subject', 'class_level',
            'video_file', 'thumbnail', 'duration', 'is_free', 'order_in_subject',
            'created_at', 'updated_at'
        ]

class BookmarkSerializer(serializers.ModelSerializer):
    video = VideoLessonSerializer(read_only=True)
    class Meta:
        model = Bookmark
        fields = ['id', 'video', 'created_at']

class ViewHistorySerializer(serializers.ModelSerializer):
    video = VideoLessonSerializer(read_only=True)
    class Meta:
        model = ViewHistory
        fields = [
            'id', 'video', 'watched_duration', 'last_position', 'is_completed', 'created_at', 'updated_at'
        ]

class VideoProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = ViewHistory
        fields = ['id', 'video', 'watched_duration', 'last_position', 'is_completed', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']
