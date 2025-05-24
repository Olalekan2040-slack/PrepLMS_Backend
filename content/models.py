from django.db import models
from django.utils.text import slugify
from users.models import User


class EducationLevel(models.Model):
    """Education level model (e.g., Primary, JSS, SSS)."""
    
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)
    order = models.PositiveIntegerField(default=0)
    
    class Meta:
        ordering = ['order']
    
    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class ClassLevel(models.Model):
    """Class level model (e.g., JSS1, JSS2, SS1, Primary 1)."""
    
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    education_level = models.ForeignKey(EducationLevel, on_delete=models.CASCADE, related_name='class_levels')
    description = models.TextField(blank=True)
    order = models.PositiveIntegerField(default=0)
    
    class Meta:
        ordering = ['education_level__order', 'order']
    
    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class Subject(models.Model):
    """Subject model (e.g., Mathematics, English, Science)."""
    
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)
    icon = models.ImageField(upload_to='subject_icons/', blank=True, null=True)
    
    class Meta:
        ordering = ['name']
    
    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class VideoLesson(models.Model):
    """Video lesson model."""
    
    title = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    description = models.TextField()
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='videos')
    class_level = models.ForeignKey(ClassLevel, on_delete=models.CASCADE, related_name='videos')
    video_file = models.FileField(upload_to='videos/')
    thumbnail = models.ImageField(upload_to='thumbnails/', blank=True, null=True)
    duration = models.PositiveIntegerField(help_text="Duration in seconds", default=0)
    is_free = models.BooleanField(default=False)
    order_in_subject = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['subject__name', 'class_level__order', 'order_in_subject']
        unique_together = ('subject', 'class_level', 'order_in_subject')
    
    def __str__(self):
        return f"{self.title} - {self.subject} ({self.class_level})"
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)


class Bookmark(models.Model):
    """Bookmark model for saving favorite lessons."""
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookmarks')
    video = models.ForeignKey(VideoLesson, on_delete=models.CASCADE, related_name='bookmarks')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('user', 'video')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.email} - {self.video.title}"


class ViewHistory(models.Model):
    """Track user video view history."""
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='view_history')
    video = models.ForeignKey(VideoLesson, on_delete=models.CASCADE, related_name='views')
    watched_duration = models.PositiveIntegerField(default=0, help_text="Watched duration in seconds")
    last_position = models.PositiveIntegerField(default=0, help_text="Last position in seconds")
    is_completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('user', 'video')
        ordering = ['-updated_at']
        verbose_name_plural = 'View histories'
    
    def __str__(self):
        return f"{self.user.email} - {self.video.title}"
    
    def update_watch_progress(self, position, duration):
        """Update watch progress."""
        self.last_position = position
        self.watched_duration = max(self.watched_duration, position)
        
        # Mark as completed if watched 90% of the video
        if position >= duration * 0.9:
            self.is_completed = True
        
        self.save(update_fields=['last_position', 'watched_duration', 'is_completed', 'updated_at'])