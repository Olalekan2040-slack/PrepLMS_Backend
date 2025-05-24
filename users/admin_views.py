from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from users.permissions import IsSuperAdmin
from users.models import User
from users.serializers import UserProfileSerializer

class AdminUserListView(APIView):
    permission_classes = [IsSuperAdmin]
    def get(self, request):
        users = User.objects.all()
        data = UserProfileSerializer(users, many=True).data
        return Response(data)

class AdminUserDetailView(APIView):
    permission_classes = [IsSuperAdmin]
    def get(self, request, id):
        user = User.objects.filter(id=id).first()
        if not user:
            return Response({"detail": "User not found."}, status=404)
        data = UserProfileSerializer(user).data
        return Response(data)
    def patch(self, request, id):
        user = User.objects.filter(id=id).first()
        if not user:
            return Response({"detail": "User not found."}, status=404)
        serializer = UserProfileSerializer(user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
    def delete(self, request, id):
        user = User.objects.filter(id=id).first()
        if not user:
            return Response({"detail": "User not found."}, status=404)
        user.delete()
        return Response({"detail": "User deleted."})

class AdminUserSearchView(APIView):
    permission_classes = [IsSuperAdmin]
    def get(self, request):
        q = request.query_params.get('q', '')
        users = User.objects.filter(email__icontains=q) | User.objects.filter(phone_number__icontains=q)
        data = UserProfileSerializer(users, many=True).data
        return Response(data)
