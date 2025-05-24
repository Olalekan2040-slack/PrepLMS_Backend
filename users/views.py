from django.shortcuts import render
from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from .serializers import (
    UserRegistrationSerializer, UserLoginSerializer, PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer, OTPVerificationSerializer, UserProfileSerializer
)
from .otp import set_otp_for_user, verify_user_otp
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework.parsers import JSONParser, MultiPartParser, FormParser
from datetime import timedelta
from django.conf import settings
from .permissions import IsSuperAdmin, IsContentAdmin
from django.contrib.auth.models import Group

User = get_user_model()

@method_decorator(csrf_exempt, name='dispatch')
class UserRegistrationView(generics.CreateAPIView):
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    def perform_create(self, serializer):
        user = serializer.save()
        otp = set_otp_for_user(user)
        # Simulate sending OTP (print to console or log)
        print(f"OTP for {user.email or user.phone_number}: {otp}")
        return user

@method_decorator(csrf_exempt, name='dispatch')
class OTPVerificationView(APIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = OTPVerificationSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        email_or_phone = serializer.validated_data['email_or_phone']
        otp = serializer.validated_data['otp']
        if '@' in email_or_phone:
            user = User.objects.filter(email=email_or_phone).first()
        else:
            user = User.objects.filter(phone_number=email_or_phone).first()
        if not user:
            return Response({"detail": "User not found."}, status=404)
        if verify_user_otp(user, otp):
            return Response({"detail": "Account verified successfully."})
        return Response({"detail": "Invalid or expired OTP."}, status=400)

@method_decorator(csrf_exempt, name='dispatch')
class UserLoginView(APIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = UserLoginSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.user
        refresh = RefreshToken.for_user(user)
        # Get access token lifetime from settings or default to 1 hour
        access_lifetime = getattr(settings, 'SIMPLE_JWT', {}).get('ACCESS_TOKEN_LIFETIME', timedelta(hours=1))
        if isinstance(access_lifetime, timedelta):
            expires_in = int(access_lifetime.total_seconds())
        else:
            expires_in = 3600  # fallback
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'expires_in': expires_in,
            'message': f"Login successful. Your access token will expire in {expires_in // 60} minutes."
        })

@method_decorator(csrf_exempt, name='dispatch')
class PasswordResetRequestView(APIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = PasswordResetRequestSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.user
        otp = set_otp_for_user(user)
        # Simulate sending OTP (print to console or log)
        print(f"Password reset OTP for {user.email or user.phone_number}: {otp}")
        return Response({"detail": "OTP sent for password reset."})

@method_decorator(csrf_exempt, name='dispatch')
class PasswordResetConfirmView(APIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = PasswordResetConfirmSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        email_or_phone = request.data.get('email_or_phone')
        otp = serializer.validated_data['otp']
        new_password = serializer.validated_data['new_password']
        if '@' in email_or_phone:
            user = User.objects.filter(email=email_or_phone).first()
        else:
            user = User.objects.filter(phone_number=email_or_phone).first()
        if not user:
            return Response({"detail": "User not found."}, status=404)
        if not verify_user_otp(user, otp):
            return Response({"detail": "Invalid or expired OTP."}, status=400)
        user.set_password(new_password)
        user.save()
        return Response({"detail": "Password reset successful."})

from rest_framework import generics, permissions, status
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from .serializers import UserProfileSerializer

class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_object(self):
        return self.request.user

    def patch(self, request, *args, **kwargs):
        user = self.get_object()
        serializer = self.get_serializer(user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, *args, **kwargs):
        user = self.get_object()
        serializer = self.get_serializer(user, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)

class AdminListView(APIView):
    permission_classes = [IsSuperAdmin]
    def get(self, request):
        admins = User.objects.filter(groups__name__in=["Super Admin", "Content Admin"]).distinct()
        data = [
            {
                "id": u.id,
                "email": u.email,
                "role": "super_admin" if u.groups.filter(name="Super Admin").exists() or u.is_superuser else "content_admin",
                "is_active": u.is_active
            } for u in admins
        ]
        return Response(data)

class CreateContentAdminView(generics.CreateAPIView):
    serializer_class = UserRegistrationSerializer
    permission_classes = [IsSuperAdmin]
    def perform_create(self, serializer):
        user = serializer.save()
        group, _ = Group.objects.get_or_create(name="Content Admin")
        user.groups.add(group)
        user.is_active = True
        user.save()

class AdminStatusUpdateView(APIView):
    permission_classes = [IsSuperAdmin]
    def patch(self, request, id):
        user = User.objects.filter(id=id, groups__name__in=["Super Admin", "Content Admin"]).first()
        if not user:
            return Response({"detail": "Admin not found."}, status=404)
        is_active = request.data.get("is_active")
        if is_active is not None:
            user.is_active = bool(is_active)
            user.save()
        return Response({"id": user.id, "is_active": user.is_active})

class AdminRolesView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        return Response([
            {"key": "super_admin", "label": "Super Admin"},
            {"key": "content_admin", "label": "Content Admin"}
        ])
