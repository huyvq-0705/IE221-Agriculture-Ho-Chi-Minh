from __future__ import annotations

from django.shortcuts import get_object_or_404
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework import generics, status
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework import viewsets

from .models import FlashSale, FlashSaleProduct
from .serializers import FlashSaleSerializer, FlashSaleProductSerializer
from products.models import Product


# --------- Pagination ---------
class FlashSalePagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 50


# --------- Base class để bỏ qua CSRF ---------
@method_decorator(csrf_exempt, name="dispatch")
class CsrfExemptAPIView(APIView):
    pass


# --------- FlashSale API ---------
class FlashSaleListAPIView(CsrfExemptAPIView, generics.ListAPIView):
    """Danh sách flash sale, chỉ admin xem được"""
    serializer_class = FlashSaleSerializer
    pagination_class = FlashSalePagination
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        queryset = FlashSale.objects.all().order_by("-created_at")

        # Optional: filter by active status
        active_only = self.request.query_params.get("active")
        if active_only == "true":
            queryset = queryset.filter(is_active=True)

        # Ordering
        ordering = self.request.query_params.get("ordering", "-created_at")
        valid_orderings = ["name", "-name", "start_date", "-start_date", "created_at", "-created_at"]
        if ordering in valid_orderings:
            queryset = queryset.order_by(ordering)

        return queryset


class FlashSaleDetailAPIView(CsrfExemptAPIView, generics.RetrieveAPIView):
    """Chi tiết flash sale, chỉ admin xem"""
    serializer_class = FlashSaleSerializer
    permission_classes = [IsAdminUser]
    lookup_field = "id"

    def get_queryset(self):
        return FlashSale.objects.all()


class FlashSaleCreateAPIView(CsrfExemptAPIView, generics.CreateAPIView):
    """Tạo flash sale mới, chỉ admin"""
    serializer_class = FlashSaleSerializer
    permission_classes = [IsAdminUser]
    queryset = FlashSale.objects.all()


class FlashSaleUpdateAPIView(CsrfExemptAPIView, generics.UpdateAPIView):
    """Cập nhật flash sale, chỉ admin"""
    serializer_class = FlashSaleSerializer
    permission_classes = [IsAdminUser]
    queryset = FlashSale.objects.all()
    lookup_field = "id"


# --------- Add/Remove product trong flash sale ---------
class FlashSaleAddProductAPIView(CsrfExemptAPIView, APIView):
    permission_classes = [IsAdminUser]

    def post(self, request, id=None):
        flash_sale = get_object_or_404(FlashSale, id=id)
        product_id = request.data.get("product")
        discount_percent = request.data.get("discount_percent", 0)

        if not product_id:
            return Response({"error": "product_id là bắt buộc"}, status=status.HTTP_400_BAD_REQUEST)

        product = get_object_or_404(Product, id=product_id)

        if FlashSaleProduct.objects.filter(flash_sale=flash_sale, product=product).exists():
            return Response({"error": "Sản phẩm đã có trong flash sale"}, status=status.HTTP_400_BAD_REQUEST)

        FlashSaleProduct.objects.create(
            flash_sale=flash_sale,
            product=product,
            discount_percent=discount_percent
        )
        return Response({"message": "Đã thêm sản phẩm"}, status=status.HTTP_201_CREATED)


class FlashSaleRemoveProductAPIView(CsrfExemptAPIView, APIView):
    permission_classes = [IsAdminUser]

    def post(self, request, id=None):
        flash_sale = get_object_or_404(FlashSale, id=id)
        product_id = request.data.get("product")

        if not product_id:
            return Response({"error": "product_id là bắt buộc"}, status=status.HTTP_400_BAD_REQUEST)

        deleted, _ = FlashSaleProduct.objects.filter(flash_sale=flash_sale, product_id=product_id).delete()
        if deleted:
            return Response({"message": "Đã xóa sản phẩm"})
        else:
            return Response({"error": "Không tìm thấy sản phẩm trong flash sale"}, status=status.HTTP_404_NOT_FOUND)
