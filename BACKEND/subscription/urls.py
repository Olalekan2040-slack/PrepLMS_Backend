from django.urls import path
from .views import SubscriptionPlanListView, InitializePaymentView, VerifyPaymentView, AdminSubscriptionPlanListCreateView, AdminSubscriptionPlanDetailView, AdminUserSubscriptionListView

urlpatterns = [
    path('plans/', SubscriptionPlanListView.as_view(), name='subscription-plans'),
    path('initialize-payment/', InitializePaymentView.as_view(), name='initialize-payment'),
    path('verify-payment/', VerifyPaymentView.as_view(), name='verify-payment'),
    path('admin/plans/', AdminSubscriptionPlanListCreateView.as_view(), name='admin-plan-list-create'),
    path('admin/plans/<int:id>/', AdminSubscriptionPlanDetailView.as_view(), name='admin-plan-detail'),
    path('admin/user-subscriptions/', AdminUserSubscriptionListView.as_view(), name='admin-user-subscriptions'),
]