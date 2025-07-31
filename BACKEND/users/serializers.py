from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _

User = get_user_model()

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True)
    avatar = serializers.ImageField(required=False, allow_null=True)
    contact_details = serializers.CharField(required=False, allow_blank=True)
    phone_number = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ['email', 'phone_number', 'password', 'confirm_password', 'avatar', 'contact_details']
        extra_kwargs = {
            'email': {'required': False},
            'phone_number': {'required': False},
        }

    def validate(self, data):
        if not data.get('email') and not data.get('phone_number'):
            raise serializers.ValidationError(
                _("Either email or phone number must be provided.")
            )
        if data.get('email'):
            try:
                validate_email(data['email'])
            except ValidationError:
                raise serializers.ValidationError(
                    {"email": _("Enter a valid email address.")}
                )
        if data.get('phone_number'):
            if not data['phone_number'].isdigit():
                raise serializers.ValidationError(
                    {"phone_number": _("Phone number must contain only digits.")}
                )
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError(
                {"password": _("Passwords do not match.")}
            )
        return data

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        
        # Handle phone_number to avoid unique constraint issues
        phone_number = validated_data.get('phone_number', '')
        if not phone_number or phone_number.strip() == '':
            phone_number = None
        
        user = User(
            email=validated_data.get('email', ''),
            phone_number=phone_number,
            avatar=validated_data.get('avatar', None),
            contact_details=validated_data.get('contact_details', ''),
            is_active=False
        )
        user.set_password(validated_data['password'])
        user.save()
        return user

class UserLoginSerializer(serializers.Serializer):
    email_or_phone = serializers.CharField()
    password = serializers.CharField()

    def validate(self, data):
        email_or_phone = data.get('email_or_phone')
        password = data.get('password')
        
        if '@' in email_or_phone:
            self.user = User.objects.filter(email=email_or_phone).first()
        else:
            self.user = User.objects.filter(phone_number=email_or_phone).first()
            
        if not self.user or not self.user.check_password(password):
            raise serializers.ValidationError(
                _("Invalid email/phone or password. Please try again.")
            )
        if not self.user.is_active:
            raise serializers.ValidationError(
                _("Account is not activated. Please verify your account first.")
            )
        return data

class PasswordResetRequestSerializer(serializers.Serializer):
    email_or_phone = serializers.CharField()
    def validate(self, data):
        email_or_phone = data.get('email_or_phone')
        if '@' in email_or_phone:
            user = User.objects.filter(email=email_or_phone).first()
        else:
            user = User.objects.filter(phone_number=email_or_phone).first()
        if not user:
            raise serializers.ValidationError(
                _("No user found with this email or phone number.")
            )
        self.user = user
        return data

class PasswordResetConfirmSerializer(serializers.Serializer):
    otp = serializers.CharField()
    new_password = serializers.CharField(min_length=8)
    confirm_password = serializers.CharField()

    def validate(self, data):
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError(
                {"new_password": _("Passwords do not match.")}
            )
        return data

class OTPVerificationSerializer(serializers.Serializer):
    email_or_phone = serializers.CharField()
    otp = serializers.CharField()

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['email', 'phone_number', 'avatar', 'contact_details', 'is_email_verified']
        read_only_fields = ['email', 'is_email_verified']
