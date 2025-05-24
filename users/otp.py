import random
import string
from django.utils import timezone
from datetime import timedelta
from .utils import send_otp_email


def generate_otp(length=6):
    """Generate a random OTP code."""
    return ''.join(random.choices(string.digits, k=length))


def set_otp_for_user(user, expiry_minutes=10):
    """Set OTP code for user with expiry time and send via email only."""
    otp = generate_otp()
    user.otp_code = otp
    user.otp_expiry = timezone.now() + timedelta(minutes=expiry_minutes)
    user.save(update_fields=['otp_code', 'otp_expiry'])
    if user.email:
        send_otp_email(user.email, otp)
    return otp


def verify_user_otp(user, otp):
    """Verify OTP code for user."""
    if not user.otp_code or not user.otp_expiry:
        return False
    if user.otp_expiry < timezone.now():
        return False
    if user.otp_code != otp:
        return False
    # Clear OTP after successful verification
    user.otp_code = None
    user.otp_expiry = None
    user.is_active = True
    if user.email:
        user.is_email_verified = True
    user.save()
    return True