# Generated by Django 5.2.1 on 2025-05-12 18:41

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='avatar',
            field=models.ImageField(blank=True, null=True, upload_to='avatars/'),
        ),
        migrations.AddField(
            model_name='user',
            name='contact_details',
            field=models.TextField(blank=True, null=True, verbose_name='contact details'),
        ),
        migrations.AddField(
            model_name='user',
            name='phone_number',
            field=models.CharField(blank=True, max_length=15, null=True, unique=True, verbose_name='phone number'),
        ),
    ]
