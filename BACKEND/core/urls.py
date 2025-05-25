from django.urls import path
from .views import PlatformSettingsView, DashboardStatsView

urlpatterns = [
    path('admin/settings/', PlatformSettingsView.as_view(), name='admin-settings'),
    path('dashboard/stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
    # Add your URL patterns here
]