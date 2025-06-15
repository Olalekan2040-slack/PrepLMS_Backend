from django.contrib import admin
from django.contrib.auth.models import Permission, ContentType
from django.db import IntegrityError
from .models import EducationLevel, ClassLevel, Subject, VideoLesson, Bookmark, ViewHistory


class ContentAdminSite(admin.ModelAdmin):
    """Base admin class for content management."""
    def has_module_permission(self, request):
        """Check if user has content management permission."""
        return request.user.is_authenticated and (
            request.user.is_superuser or 
            request.user.has_perm('content.can_manage_content')
        )


@admin.register(EducationLevel)
class EducationLevelAdmin(ContentAdminSite):
    """Admin configuration for EducationLevel model."""
    
    list_display = ('name', 'slug', 'order')
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ('name',)
    ordering = ('order',)


@admin.register(ClassLevel)
class ClassLevelAdmin(ContentAdminSite):
    """Admin configuration for ClassLevel model."""
    
    list_display = ('name', 'education_level', 'order')
    list_filter = ('education_level',)
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ('name',)
    ordering = ('education_level__order', 'order')


@admin.register(Subject)
class SubjectAdmin(ContentAdminSite):
    """Admin configuration for Subject model."""
    
    list_display = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ('name',)


class ViewHistoryInline(admin.TabularInline):
    """Inline admin for ViewHistory model."""
    
    model = ViewHistory
    extra = 0
    readonly_fields = ('user', 'watched_duration', 'last_position', 'is_completed', 'created_at', 'updated_at')
    can_delete = False
    max_num = 0


class BookmarkInline(admin.TabularInline):
    """Inline admin for Bookmark model."""
    
    model = Bookmark
    extra = 0
    readonly_fields = ('user', 'created_at')


@admin.register(VideoLesson)
class VideoLessonAdmin(ContentAdminSite):
    """Admin configuration for VideoLesson model."""
    
    list_display = ('title', 'subject', 'class_level', 'video_source', 'processing_status', 'created_at')
    list_filter = ('video_source', 'processing_status', 'subject', 'class_level', 'created_at')
    search_fields = ('title', 'description')
    readonly_fields = ('processing_status', 'error_message', 'created_at', 'updated_at')
    inlines = [ViewHistoryInline, BookmarkInline]
    fieldsets = (
        (None, {
            'fields': ('title', 'description', 'subject', 'class_level')
        }),
        ('Video Source', {
            'fields': ('video_source', 'video_id', 'video_file', 'access_token', 'thumbnail')
        }),
        ('Status', {
            'fields': ('processing_status', 'error_message', 'created_at', 'updated_at')
        }),
    )

    def save_model(self, request, obj, form, change):
        """Override save method to set initial processing status."""
        if not change:  # Only for new objects
            obj.processing_status = 'pending'
        super().save_model(request, obj, form, change)


def create_content_management_permission():
    """Create the content management permission if it doesn't exist."""
    try:
        content_type = ContentType.objects.get_for_model(VideoLesson)
        Permission.objects.get_or_create(
            codename='can_manage_content',
            name='Can manage content',
            content_type=content_type,
        )
    except IntegrityError:
        # Permission already exists, nothing to do
        pass