from __future__ import annotations

from django.db.models import Q
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.pagination import PageNumberPagination
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework import generics, permissions
from rest_framework.views import APIView

from .models import Category, Product
from .serializers import (
    CategorySerializer,
    ProductListSerializer,
    ProductDetailSerializer
)

class ProductPagination(PageNumberPagination):
    page_size = 12
    page_size_query_param = "page_size"
    max_page_size = 50

# --------- Base class để bỏ qua CSRF ---------
@method_decorator(csrf_exempt, name="dispatch")
class CsrfExemptAPIView(APIView):
    pass


# --------- Category API ---------
class CategoryListAPIView(generics.ListAPIView):
    """Chỉ dùng để GET tất cả category"""
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]
    queryset = Category.objects.all().order_by("name")


class CategoryListCreateView(CsrfExemptAPIView, generics.ListCreateAPIView):
    """GET toàn bộ category hoặc POST tạo mới"""
    queryset = Category.objects.all().order_by("name")
    serializer_class = CategorySerializer
    permission_classes = [IsAdminUser]


class CategoryDetailView(CsrfExemptAPIView, generics.RetrieveUpdateDestroyAPIView):
    """GET 1 category, PUT/PATCH update, DELETE"""
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]
    lookup_field = "slug"


# --------- Product API ---------
class ProductListAPIView(CsrfExemptAPIView, generics.ListAPIView):
    """Danh sách sản phẩm, có filter, search, ordering"""
    serializer_class = ProductListSerializer
    pagination_class = ProductPagination
    permission_classes = [AllowAny]


    def get_queryset(self):
        queryset = Product.objects.select_related("category").filter(
            is_in_stock=True, is_deleted=False
        )

        # Filter by category
        category_id = self.request.query_params.get("category")
        if category_id:
            try:
                queryset = queryset.filter(category_id=int(category_id))
            except (ValueError, TypeError):
                pass

        # Search by name or description
        search = self.request.query_params.get("search")
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) | Q(description__icontains=search)
            )

        # Price range filter
        min_price = self.request.query_params.get("min_price")
        max_price = self.request.query_params.get("max_price")

        if min_price:
            try:
                queryset = queryset.filter(price__gte=float(min_price))
            except (ValueError, TypeError):
                pass

        if max_price:
            try:
                queryset = queryset.filter(price__lte=float(max_price))
            except (ValueError, TypeError):
                pass

        # Ordering
        ordering = self.request.query_params.get("ordering", "-created_at")
        valid_orderings = [
            "name", "-name",
            "price", "-price",
            "created_at", "-created_at",
        ]
        if ordering in valid_orderings:
            queryset = queryset.order_by(ordering)
        else:
            queryset = queryset.order_by("-created_at")

        return queryset


class ProductDetailAPIView(CsrfExemptAPIView, generics.RetrieveAPIView):
    """Chi tiết 1 sản phẩm"""
    serializer_class = ProductDetailSerializer
    permission_classes = [AllowAny]
    lookup_field = "slug"

    def get_queryset(self):
        return Product.objects.select_related("category").filter(is_deleted=False)
