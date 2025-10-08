from rest_framework import generics, filters
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.pagination import PageNumberPagination
from rest_framework_simplejwt.authentication import JWTAuthentication

from .models import Blog
from .serializers import BlogListSerializer, BlogDetailSerializer, BlogListSerializer

class BlogPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 50


# -------- Public endpoints (read-only) --------
class PublicBlogListAPIView(generics.ListAPIView):
    """
    GET /api/blogs/?search=...&ordering=-created_at&page=1&page_size=12
    """
    queryset = Blog.objects.all().order_by("-created_at")
    serializer_class = BlogListSerializer
    permission_classes = [AllowAny]
    pagination_class = BlogPagination

    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["title", "excerpt", "content"]
    ordering_fields = ["created_at", "updated_at", "title"]
    ordering = ["-created_at"]


class PublicBlogDetailAPIView(generics.RetrieveAPIView):
    """
    GET /api/blogs/<slug:slug>/
    """
    queryset = Blog.objects.all()
    serializer_class = BlogDetailSerializer
    permission_classes = [AllowAny]
    lookup_field = "slug"


# -------- Admin endpoints (CRUD) --------
class AdminBlogListCreateAPIView(generics.ListCreateAPIView):
    """
    GET/POST /api/admin/blogs/
    """
    queryset = Blog.objects.all().order_by("-created_at")
    serializer_class = BlogDetailSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsAdminUser]
    pagination_class = BlogPagination

    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["title", "excerpt", "content"]
    ordering_fields = ["created_at", "updated_at", "title"]
    ordering = ["-created_at"]


class AdminBlogDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET/PATCH/DELETE /api/admin/blogs/<slug:slug>/
    """
    queryset = Blog.objects.all()
    serializer_class = BlogDetailSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsAdminUser]
    lookup_field = "slug"
