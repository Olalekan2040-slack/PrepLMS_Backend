from django.urls import path
from .views import DashboardSummaryView, AdminRewardListCreateView, AdminRewardDetailView, AdminRewardRedemptionListView

urlpatterns = [
    path('dashboard/', DashboardSummaryView.as_view(), name='dashboard-summary'),
    path('admin/available-rewards/', AdminRewardListCreateView.as_view(), name='admin-reward-list-create'),
    path('admin/available-rewards/<int:id>/', AdminRewardDetailView.as_view(), name='admin-reward-detail'),
    path('admin/redemptions/', AdminRewardRedemptionListView.as_view(), name='admin-reward-redemptions'),
    # Add your URL patterns here
]