from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils import timezone
from drf_spectacular.utils import extend_schema
from .serializers import MessageSerializer
from django.http import HttpResponse, Http404
from django.conf import settings
import os


class HelloView(APIView):
    """
    A simple API endpoint that returns a greeting message.
    """

    @extend_schema(
        responses={200: MessageSerializer}, description="Get a hello world message"
    )
    def get(self, request):
        data = {"message": "Hello!", "timestamp": timezone.now()}
        serializer = MessageSerializer(data)
        return Response(serializer.data)


def openapi_spec_view(request):
    """Serve the root openapi.yml file content as text/yaml."""
    base_dir = settings.BASE_DIR if hasattr(settings, "BASE_DIR") else os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    path = os.path.join(base_dir, "openapi.yml")
    if not os.path.exists(path):
        raise Http404("Spec not found")
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
    return HttpResponse(content, content_type="text/yaml")
