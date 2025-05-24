from django.db import models
from django.contrib.auth.models import Group, Permission
from django.contrib.contenttypes.models import ContentType
from users.models import User
from django.db.models.signals import post_migrate
from django.dispatch import receiver

# Create your models here.

@receiver(post_migrate)
def create_lms_admin_groups(sender, **kwargs):
    # Super Admin: can do everything (already exists as is_superuser)
    # Content Admin: can upload content, view analytics, but not manage users or other admins
    content_admin_group, _ = Group.objects.get_or_create(name='Content Admin')
    # Assign permissions for content and analytics
    content_models = ['videolesson', 'subject', 'classlevel', 'educationlevel', 'viewhistory']
    for model_name in content_models:
        ct = ContentType.objects.get(app_label='content', model=model_name)
        perms = Permission.objects.filter(content_type=ct)
        content_admin_group.permissions.add(*perms)
    # Optionally add analytics/rewards permissions
    for model_name in ['userstreak', 'userpoints']:
        ct = ContentType.objects.get(app_label='rewards', model=model_name)
        perms = Permission.objects.filter(content_type=ct)
        content_admin_group.permissions.add(*perms)
    # Optionally add view permissions for users
    user_ct = ContentType.objects.get(app_label='users', model='user')
    view_user_perm = Permission.objects.get(content_type=user_ct, codename='view_user')
    content_admin_group.permissions.add(view_user_perm)
    # Super Admin can create Content Admins via Django admin (add user, assign to group)
