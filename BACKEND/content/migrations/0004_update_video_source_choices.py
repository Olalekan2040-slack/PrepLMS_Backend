from django.db import migrations, models

class Migration(migrations.Migration):
    dependencies = [
        ('content', '0003_videolesson_video_id_videolesson_video_source_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='videolesson',
            name='video_source',
            field=models.CharField(
                choices=[('youtube', 'YouTube'), ('file', 'Uploaded File')],
                default='youtube',
                max_length=20
            ),
        ),
        migrations.AlterField(
            model_name='videolesson',
            name='video_id',
            field=models.CharField(
                blank=True,
                help_text='YouTube video ID',
                max_length=100,
                null=True
            ),
        ),
    ]
