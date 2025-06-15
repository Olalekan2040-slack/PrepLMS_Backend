from rest_framework import serializers
from django.utils.text import slugify
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
    subject_id = serializers.IntegerField(write_only=True)
    class_level_id = serializers.IntegerField(write_only=True)
    video_url = serializers.SerializerMethodField()
    upload_progress = serializers.FloatField(read_only=True, default=0)
    
    def get_video_url(self, obj):
        return obj.video_url
        
    def validate(self, data):
        # Check required fields
        video_source = data.get('video_source')
        video_id = data.get('video_id')
        video_file = data.get('video_file')

        if video_source == 'youtube':
            if not video_id:
                raise serializers.ValidationError({
                    'video_id': 'YouTube video ID is required'
                })
            # Basic YouTube ID validation (11 characters)
            if len(video_id) != 11:
                raise serializers.ValidationError({
                    'video_id': 'Invalid YouTube video ID format'
                })

        elif video_source == 'drive':
            if not video_id:
                raise serializers.ValidationError({
                    'video_id': 'Google Drive file ID is required'
                })
            # Basic Drive ID validation (33 characters)
            if len(video_id) < 25:
                raise serializers.ValidationError({
                    'video_id': 'Invalid Google Drive file ID format'
                })

        elif video_source == 'upload':
            if not video_file and not self.instance:
                raise serializers.ValidationError({
                    'video_file': 'Video file is required for direct uploads'
                })
            # File type validation could be added here
            
        return data

    class Meta:
        model = VideoLesson
        fields = [
            'id', 'title', 'slug', 'description', 'subject', 'class_level',
            'subject_id', 'class_level_id', 'video_source', 'video_id',
            'video_file', 'video_url', 'thumbnail', 'duration', 'is_free', 
            'order_in_subject', 'created_at', 'updated_at'
        ]
        def validate(self, data):
        # Ensure required fields are present
            required_fields = ['title', 'description', 'subject_id', 'class_level_id', 'video_source']
            for field in required_fields:
                if field not in data:
                    raise serializers.ValidationError({field: 'This field is required.'})
            
            # Validate video source and required fields
            if data['video_source'] == 'youtube' and 'video_id' not in data:
                raise serializers.ValidationError({
                    'video_id': 'YouTube video ID is required when video source is YouTube.'
                })
            elif data['video_source'] == 'file' and 'video_file' not in data:
                raise serializers.ValidationError({
                    'video_file': 'Video file is required when video source is file.'
                })
            elif data['video_source'] not in ['youtube', 'file']:
                raise serializers.ValidationError({
                    'video_source': 'Video source must be either "youtube" or "file".'
                })
            
            # Set default values
            data['duration'] = data.get('duration', 0)
            data['order_in_subject'] = data.get('order_in_subject', 0)
            data['is_free'] = data.get('is_free', False)
            
            # Generate slug if not provided
            if 'slug' not in data:
                data['slug'] = slugify(data['title'])
                
            return data
        
    def create(self, validated_data):
        try:
            # Extract IDs from validated data
            subject_id = validated_data.pop('subject_id')
            class_level_id = validated_data.pop('class_level_id')
            
            # Get the related objects
            subject = Subject.objects.get(id=subject_id)
            class_level = ClassLevel.objects.get(id=class_level_id)
            
            # Create the video lesson
            video = VideoLesson.objects.create(
                subject=subject,
                class_level=class_level,
                **validated_data
            )
            return video
        except Subject.DoesNotExist:
            raise serializers.ValidationError({'subject_id': 'Invalid subject ID'})
        except ClassLevel.DoesNotExist:
            raise serializers.ValidationError({'class_level_id': 'Invalid class level ID'})

    def get_video_url(self, obj):
        if obj.video_source == 'youtube':
            return f"https://www.youtube.com/embed/{obj.video_id}"
        elif obj.video_source == 'drive':
            return f"https://drive.google.com/file/d/{obj.video_id}/preview"
        return None

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
