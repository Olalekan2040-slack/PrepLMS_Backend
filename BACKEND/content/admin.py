from django.contrib import admin
from .models import EducationLevel, ClassLevel, Subject, VideoLesson, Bookmark, ViewHistory


@admin.register(EducationLevel)
class EducationLevelAdmin(admin.ModelAdmin):
    """Admin configuration for EducationLevel model."""
    
    list_display = ('name', 'slug', 'order')
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ('name',)
    ordering = ('order',)


@admin.register(ClassLevel)
class ClassLevelAdmin(admin.ModelAdmin):
    """Admin configuration for ClassLevel model."""
    
    list_display = ('name', 'education_level', 'order')
    list_filter = ('education_level',)
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ('name',)
    ordering = ('education_level__order', 'order')


@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
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
class VideoLessonAdmin(admin.ModelAdmin):
    """Admin configuration for VideoLesson model."""
    
    list_display = ('title', 'subject', 'class_level', 'duration', 'is_free', 'created_at')
    list_filter = ('subject', 'class_level', 'is_free')
    prepopulated_fields = {'slug': ('title',)}
    search_fields = ('title', 'description')
    ordering = ('subject__name', 'class_level__order', 'order_in_subject')
    inlines = [ViewHistoryInline, BookmarkInline]


@admin.register(Bookmark)
class BookmarkAdmin(admin.ModelAdmin):
    """Admin configuration for Bookmark model."""
    
    list_display = ('user', 'video', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('user__email', 'video__title')
    date_hierarchy = 'created_at'


@admin.register(ViewHistory)
class ViewHistoryAdmin(admin.ModelAdmin):
    """Admin configuration for ViewHistory model."""
    
    list_display = ('user', 'video', 'watched_duration', 'is_completed', 'updated_at')
    list_filter = ('is_completed', 'updated_at')
    search_fields = ('user__email', 'video__title')
    date_hierarchy = 'updated_at'