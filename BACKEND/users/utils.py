from django.core.mail import send_mail
from django.conf import settings
import logging

def send_otp_email(email, otp):
    subject = 'Your Prep Platform OTP Code'
    message = f'Your OTP code is: {otp}'
    from_email = settings.DEFAULT_FROM_EMAIL if hasattr(settings, 'DEFAULT_FROM_EMAIL') else None
    try:
        send_mail(subject, message, from_email, [email], fail_silently=False)
        return True
    except Exception as e:
        logging.error(f"Failed to send OTP email: {e}")
        return False
