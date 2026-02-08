from rest_framework import viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth.models import User
from django.utils.dateparse import parse_datetime
from .models import Group, Expense
from .serializers import GroupSerializer, ExpenseSerializer, UserSerializer

class SyncMixin:
    def filter_for_sync(self, queryset):
        last_sync = self.request.query_params.get('last_sync')
        if last_sync:
            date = parse_datetime(last_sync)
            if date:
                queryset = queryset.filter(updated_at__gt=date)
        return queryset

    def perform_destroy(self, instance):
        instance.is_deleted = True
        instance.save()


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]


class GroupViewSet(SyncMixin, viewsets.ModelViewSet):
    serializer_class = GroupSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Group.objects.filter(members=self.request.user)
        
        return self.filter_for_sync(queryset)

    def perform_create(self, serializer):
        group = serializer.save()
        group.members.add(self.request.user)


class ExpenseViewSet(SyncMixin, viewsets.ModelViewSet):
    serializer_class = ExpenseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Expense.objects.filter(group__members=self.request.user)
        return self.filter_for_sync(queryset)

    def perform_create(self, serializer):
        serializer.save(person_paying=self.request.user)