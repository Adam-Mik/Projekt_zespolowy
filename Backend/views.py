from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from django.contrib.auth.models import User
from django.utils.dateparse import parse_datetime
from .models import Group, Expense
from .serializers import GroupSerializer, ExpenseSerializer, UserSerializer

class SyncMixin:
    """
    Klasa dodająca logikę synchronizacji (last_sync) i miękkiego usuwania.
    """
    def get_queryset(self):

        queryset = super().get_queryset()

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
    """
    Widok Grup z obsługą synchronizacji.
    """
    queryset = Group.objects.all()
    serializer_class = GroupSerializer

    def perform_create(self, serializer):
        group = serializer.save()
        group.members.add(self.request.user)

class ExpenseViewSet(SyncMixin, viewsets.ModelViewSet):
    """
    Widok Wydatków z obsługą synchronizacji.
    """
    queryset = Expense.objects.all()
    serializer_class = ExpenseSerializer

    def perform_create(self, serializer):
        serializer.save(person_paying=self.request.user)