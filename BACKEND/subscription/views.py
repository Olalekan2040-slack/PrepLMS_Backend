from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status, generics, permissions
from .models import SubscriptionPlan, UserSubscription, Payment, VoucherCode
from .serializers import (
    SubscriptionPlanSerializer,
    UserSubscriptionSerializer,
    PaymentSerializer,
    SubscriptionCreateSerializer,
    VoucherCodeSerializer
)
from django.conf import settings
from django.utils import timezone
from django.shortcuts import get_object_or_404
import requests
import hmac
import hashlib
import json
from uuid import uuid4

class SubscriptionPlanListView(generics.ListAPIView):
    queryset = SubscriptionPlan.objects.filter(is_active=True)
    serializer_class = SubscriptionPlanSerializer
    permission_classes = [permissions.IsAuthenticated]

class InitiateSubscriptionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = SubscriptionCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        plan = get_object_or_404(SubscriptionPlan, id=serializer.validated_data['plan_id'])
        voucher_code = serializer.validated_data.get('voucher_code')
        redirect_url = serializer.validated_data.get('redirect_url')

        # Handle voucher code if provided
        if voucher_code:
            try:
                voucher = VoucherCode.objects.get(code=voucher_code, plan=plan)
                if not voucher.is_valid():
                    return Response(
                        {"error": "Invalid or expired voucher code"},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            except VoucherCode.DoesNotExist:
                return Response(
                    {"error": "Invalid voucher code"},
                    status=status.HTTP_400_BAD_REQUEST
                )

        # Generate payment reference
        tx_ref = f"sub_{uuid4().hex[:16]}"

        # Create subscription
        subscription = UserSubscription.objects.create(
            user=request.user,
            plan=plan,
            payment_reference=tx_ref,
            start_date=timezone.now(),
            is_active=False  # Will be activated after payment
        )

        # If it's a voucher-based subscription, process it directly
        if voucher_code and voucher.is_valid():
            voucher.use_voucher(request.user)
            subscription.voucher = voucher
            subscription.is_active = True
            subscription.save()
            return Response({
                "status": "success",
                "message": "Subscription activated with voucher",
                "subscription": UserSubscriptionSerializer(subscription).data
            })

        # Initialize Flutterwave payment
        try:
            payment_data = {
                "tx_ref": tx_ref,
                "amount": str(plan.price),
                "currency": "USD",  # or your preferred currency
                "payment_options": "card",
                "redirect_url": redirect_url,
                "customer": {
                    "email": request.user.email,
                    "name": f"{request.user.first_name} {request.user.last_name}",
                },
                "customizations": {
                    "title": f"Subscription - {plan.name}",
                    "description": f"{plan.duration_days} days subscription",
                    "logo": "YOUR_LOGO_URL",
                },
                "meta": {
                    "subscription_id": subscription.id
                }
            }

            headers = {
                "Authorization": f"Bearer {settings.FLUTTERWAVE_SECRET_KEY}",
                "Content-Type": "application/json",
            }

            response = requests.post(
                "https://api.flutterwave.com/v3/payments",
                json=payment_data,
                headers=headers
            )
            response_data = response.json()

            if response.status_code == 200 and response_data.get('status') == 'success':
                # Create payment record
                payment = Payment.objects.create(
                    amount=plan.price,
                    currency="USD",
                    reference=tx_ref,
                    subscription=subscription
                )
                
                return Response({
                    "status": "success",
                    "payment_url": response_data['data']['link'],
                    "tx_ref": tx_ref
                })
            else:
                subscription.delete()  # Clean up if payment initialization fails
                return Response({
                    "error": "Failed to initialize payment",
                    "detail": response_data.get('message', 'Unknown error')
                }, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            subscription.delete()  # Clean up on error
            return Response({
                "error": "Payment initialization failed",
                "detail": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class VerifySubscriptionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        tx_ref = request.data.get('tx_ref')
        if not tx_ref:
            return Response({"error": "Transaction reference required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            subscription = get_object_or_404(UserSubscription, payment_reference=tx_ref, user=request.user)
            payment = get_object_or_404(Payment, reference=tx_ref)

            # Verify with Flutterwave
            headers = {
                "Authorization": f"Bearer {settings.FLUTTERWAVE_SECRET_KEY}",
                "Content-Type": "application/json",
            }
            response = requests.get(
                f"https://api.flutterwave.com/v3/transactions/verify_by_reference?tx_ref={tx_ref}",
                headers=headers
            )
            response_data = response.json()

            if response.status_code == 200 and response_data.get('status') == 'success':
                data = response_data.get('data', {})
                if data.get('status') == 'successful':
                    # Update payment status
                    payment.status = 'successful'
                    payment.payment_response = response_data
                    payment.save()

                    # Activate subscription
                    subscription.is_active = True
                    subscription.save()

                    return Response({
                        "status": "success",
                        "message": "Payment verified and subscription activated",
                        "subscription": UserSubscriptionSerializer(subscription).data
                    })

            return Response({
                "error": "Payment verification failed",
                "detail": response_data.get('message', 'Unknown error')
            }, status=status.HTTP_400_BAD_REQUEST)

        except UserSubscription.DoesNotExist:
            return Response({
                "error": "Subscription not found"
            }, status=status.HTTP_404_NOT_FOUND)

class FlutterwaveWebhookView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        # Verify webhook signature
        signature = request.headers.get('verif-hash')
        if not signature or signature != settings.FLUTTERWAVE_WEBHOOK_HASH:
            return Response({"error": "Invalid signature"}, status=status.HTTP_400_BAD_REQUEST)

        event_data = request.data
        if event_data.get('event') == 'charge.completed':
            tx_ref = event_data.get('data', {}).get('tx_ref')
            if not tx_ref:
                return Response({"error": "Missing tx_ref"}, status=status.HTTP_400_BAD_REQUEST)

            try:
                subscription = UserSubscription.objects.get(payment_reference=tx_ref)
                payment = Payment.objects.get(reference=tx_ref)

                # Update payment status
                payment.status = 'successful'
                payment.payment_response = event_data
                payment.save()

                # Activate subscription
                subscription.is_active = True
                subscription.save()

                return Response({"status": "success"})

            except (UserSubscription.DoesNotExist, Payment.DoesNotExist):
                return Response({
                    "error": "Subscription or payment not found"
                }, status=status.HTTP_404_NOT_FOUND)

        return Response({"status": "ignored"})

class UserSubscriptionView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserSubscriptionSerializer

    def get_object(self):
        return UserSubscription.objects.filter(
            user=self.request.user,
            is_active=True
        ).first()
