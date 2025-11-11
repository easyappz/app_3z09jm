from django.db.models import Q
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes, authentication_classes, action
from rest_framework.response import Response
from rest_framework import status, permissions, viewsets
from rest_framework.pagination import PageNumberPagination
from django.http import HttpResponse, Http404
from django.conf import settings
import os

from .models import Member, Ad
from .serializers import (
    RegisterSerializer, LoginSerializer,
    MemberPublicSerializer, MemberUpdateSerializer,
    AdSerializer, AdCreateUpdateSerializer,
)
from .authentication import generate_jwt, JWTAuthentication

# Serve openapi.yml
@api_view(['GET'])
def openapi_spec_view(request):
    base_dir = settings.BASE_DIR if hasattr(settings, 'BASE_DIR') else os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    path = os.path.join(base_dir, 'openapi.yml')
    if not os.path.exists(path):
        raise Http404('Spec not found')
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    return HttpResponse(content, content_type='text/yaml')

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register_view(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
      member = serializer.save()
      return Response(MemberPublicSerializer(member).data, status=status.HTTP_201_CREATED)
    return Response({'detail': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login_view(request):
    serializer = LoginSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    email = serializer.validated_data['email']
    password = serializer.validated_data['password']
    try:
        member = Member.objects.get(email=email)
    except Member.DoesNotExist:
        return Response({'detail': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
    if not member.check_password(password):
        return Response({'detail': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
    token = generate_jwt({'member_id': member.id})
    return Response({'access': token})

@api_view(['GET', 'PUT'])
@authentication_classes([JWTAuthentication])
@permission_classes([permissions.IsAuthenticated])
def me_view(request):
    if request.method == 'GET':
        return Response(MemberPublicSerializer(request.user).data)
    else:
        serializer = MemberUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        member = serializer.update(request.user, serializer.validated_data)
        return Response(MemberPublicSerializer(member).data)

class AdsPagination(PageNumberPagination):
    page_size = 10

class AdViewSet(viewsets.ViewSet):
    authentication_classes = [JWTAuthentication]

    def list(self, request):
        # Only approved ads
        qs = Ad.objects.filter(status=Ad.STATUS_APPROVED)
        q = request.query_params.get('q')
        if q:
            qs = qs.filter(Q(title__icontains=q) | Q(description__icontains=q))
        min_price = request.query_params.get('min_price')
        max_price = request.query_params.get('max_price')
        if min_price is not None:
            try:
                qs = qs.filter(price__gte=float(min_price))
            except ValueError:
                pass
        if max_price is not None:
            try:
                qs = qs.filter(price__lte=float(max_price))
            except ValueError:
                pass
        ordering = request.query_params.get('ordering')
        if ordering in ['price', '-price', 'created_at', '-created_at']:
            qs = qs.order_by(ordering)
        paginator = AdsPagination()
        page = paginator.paginate_queryset(qs, request)
        data = AdSerializer(page, many=True).data
        return paginator.get_paginated_response(data)

    def create(self, request):
        if not request.user or not isinstance(request.user, Member):
            return Response({'detail': 'Authentication credentials were not provided.'}, status=401)
        serializer = AdCreateUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        ad = Ad(owner=request.user, **serializer.validated_data)
        # New ads are pending
        ad.status = Ad.STATUS_PENDING
        ad.save()
        return Response(AdSerializer(ad).data, status=201)

    def retrieve(self, request, pk=None):
        ad = get_object_or_404(Ad, pk=pk)
        # Allow view if approved or owner
        if ad.status != Ad.STATUS_APPROVED:
            user = request.user if hasattr(request, 'user') else None
            if not user or not isinstance(user, Member) or ad.owner_id != user.id:
                return Response({'detail': 'Not found'}, status=404)
        return Response(AdSerializer(ad).data)

    def update(self, request, pk=None):
        if not request.user or not isinstance(request.user, Member):
            return Response({'detail': 'Authentication credentials were not provided.'}, status=401)
        ad = get_object_or_404(Ad, pk=pk)
        if ad.owner_id != request.user.id:
            return Response({'detail': 'Forbidden'}, status=403)
        serializer = AdCreateUpdateSerializer(ad, data=request.data, partial=False)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        # Reset to pending on edit
        ad.status = Ad.STATUS_PENDING
        ad.save(update_fields=['status'])
        return Response(AdSerializer(ad).data)

    def destroy(self, request, pk=None):
        if not request.user or not isinstance(request.user, Member):
            return Response({'detail': 'Authentication credentials were not provided.'}, status=401)
        ad = get_object_or_404(Ad, pk=pk)
        if ad.owner_id != request.user.id:
            return Response({'detail': 'Forbidden'}, status=403)
        ad.delete()
        return Response(status=204)

    @action(detail=False, methods=['get'], url_path='my')
    def my_ads(self, request):
        if not request.user or not isinstance(request.user, Member):
            return Response({'detail': 'Authentication credentials were not provided.'}, status=401)
        qs = Ad.objects.filter(owner=request.user).order_by('-created_at')
        paginator = AdsPagination()
        page = paginator.paginate_queryset(qs, request)
        data = AdSerializer(page, many=True).data
        return paginator.get_paginated_response(data)

    @action(detail=True, methods=['post'], url_path='moderate')
    def moderate(self, request, pk=None):
        if not request.user or not isinstance(request.user, Member):
            return Response({'detail': 'Authentication credentials were not provided.'}, status=401)
        if not request.user.is_moderator:
            return Response({'detail': 'Forbidden'}, status=403)
        ad = get_object_or_404(Ad, pk=pk)
        status_value = request.data.get('status')
        if status_value not in [Ad.STATUS_APPROVED, Ad.STATUS_REJECTED]:
            return Response({'detail': 'Invalid status'}, status=400)
        ad.status = status_value
        ad.save(update_fields=['status'])
        return Response(AdSerializer(ad).data)
