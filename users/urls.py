from django.urls import path
from .views import (
    UserRegistrationView, OTPVerificationView, UserLoginView,
    PasswordResetRequestView, PasswordResetConfirmView, UserProfileView,
    AdminListView, CreateContentAdminView, AdminStatusUpdateView, AdminRolesView
)
from .admin_views import AdminUserListView, AdminUserDetailView, AdminUserSearchView

urlpatterns = [
    path('register/', UserRegistrationView.as_view(), name='user-register'),
    path('verify-otp/', OTPVerificationView.as_view(), name='verify-otp'),
    path('login/', UserLoginView.as_view(), name='user-login'),
    path('password-reset/request/', PasswordResetRequestView.as_view(), name='password-reset-request'),
    path('password-reset/confirm/', PasswordResetConfirmView.as_view(), name='password-reset-confirm'),
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('admins/', AdminListView.as_view(), name='admin-list'),
    path('admins/create-content-admin/', CreateContentAdminView.as_view(), name='create-content-admin'),
    path('admins/<int:id>/status/', AdminStatusUpdateView.as_view(), name='admin-status-update'),
    path('admins/roles/', AdminRolesView.as_view(), name='admin-roles'),
    path('admins/users/', AdminUserListView.as_view(), name='admin-user-list'),
    path('admins/users/<int:id>/', AdminUserDetailView.as_view(), name='admin-user-detail'),
    path('admins/users/search/', AdminUserSearchView.as_view(), name='admin-user-search'),
]