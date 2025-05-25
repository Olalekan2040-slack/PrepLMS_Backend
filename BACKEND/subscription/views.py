from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status
from .models import SubscriptionPlan, UserSubscription, Payment
from .serializers import SubscriptionPlanSerializer, UserSubscriptionSerializer, PaymentSerializer
from .utils import initialize_paystack_payment, verify_paystack_payment
from django.conf import settings
from django.utils.crypto import get_random_string
from django.shortcuts import get_object_or_404
from users.permissions import IsSuperAdmin
from rest_framework import generics

class SubscriptionPlanListView(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        plans = SubscriptionPlan.objects.filter(is_active=True)
        serializer = SubscriptionPlanSerializer(plans, many=True)
        return Response(serializer.data)

class InitializePaymentView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        plan_id = request.data.get('plan_id')
        plan = get_object_or_404(SubscriptionPlan, id=plan_id, is_active=True)
        reference = get_random_string(16)
        amount = plan.price
        callback_url = request.build_absolute_uri('/api/subscription/verify-payment/')
        paystack_response = initialize_paystack_payment(request.user.email, amount, reference, callback_url)
        payment = Payment.objects.create(
            user=request.user,
            plan=plan,
            amount=amount,
            reference=reference,
            status='pending',
            paystack_response=paystack_response
        )
        return Response({
            'authorization_url': paystack_response.get('data', {}).get('authorization_url'),
            'reference': reference
        }, status=status.HTTP_201_CREATED)

class VerifyPaymentView(APIView):
    permission_classes = [AllowAny]  # Webhook or frontend can call
    def get(self, request):
        reference = request.query_params.get('reference')
        payment = get_object_or_404(Payment, reference=reference)
        paystack_result = verify_paystack_payment(reference)
        payment.paystack_response = paystack_result
        if paystack_result.get('data', {}).get('status') == 'success':
            payment.status = 'success'
            # Activate subscription
            plan = payment.plan
            user = payment.user
            UserSubscription.objects.create(
                user=user,
                plan=plan,
                start_date=payment.created_at,
                end_date=payment.created_at + plan.duration_days,
                is_active=True,
                payment_reference=reference
            )
        else:
            payment.status = 'failed'
        payment.save()
        return Response({'status': payment.status})

class AdminSubscriptionPlanListCreateView(generics.ListCreateAPIView):
    queryset = SubscriptionPlan.objects.all()
    serializer_class = SubscriptionPlanSerializer
    permission_classes = [IsSuperAdmin]

class AdminSubscriptionPlanDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = SubscriptionPlan.objects.all()
    serializer_class = SubscriptionPlanSerializer
    permission_classes = [IsSuperAdmin]
    lookup_field = 'id'

class AdminUserSubscriptionListView(generics.ListAPIView):
    queryset = UserSubscription.objects.all()
    serializer_class = UserSubscriptionSerializer
    permission_classes = [IsSuperAdmin]
