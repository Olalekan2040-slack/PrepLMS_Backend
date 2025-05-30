# Generated by Django 5.2.1 on 2025-05-17 06:12

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('subscription', '0002_initial'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='payment',
            options={},
        ),
        migrations.RemoveField(
            model_name='payment',
            name='metadata',
        ),
        migrations.RemoveField(
            model_name='payment',
            name='paystack_reference',
        ),
        migrations.RemoveField(
            model_name='payment',
            name='subscription',
        ),
        migrations.AddField(
            model_name='payment',
            name='paystack_response',
            field=models.JSONField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='payment',
            name='plan',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='payments', to='subscription.subscriptionplan'),
        ),
        migrations.AlterField(
            model_name='payment',
            name='reference',
            field=models.CharField(max_length=100, unique=True),
        ),
        migrations.AlterField(
            model_name='payment',
            name='status',
            field=models.CharField(default='pending', max_length=20),
        ),
    ]
