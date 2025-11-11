from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import register_view, login_view, me_view, AdViewSet

router = DefaultRouter()
router.register(r'ads', AdViewSet, basename='ad')

urlpatterns = [
    path('auth/register', register_view, name='register'),
    path('auth/login', login_view, name='login'),
    path('members/me', me_view, name='me'),
]
urlpatterns += router.urls
