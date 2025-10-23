from django.shortcuts import render
from rest_framework import generics
from rest_framework.permissions import IsAdminUser, AllowAny, IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from .models import Coupon
from .serializers import CouponSerializer

class CouponPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 50

# --- PUBLIC API ---
class CouponListAPIView(generics.ListAPIView):
    """
    GET /api/coupons/
    Ai cũng có thể xem danh sách coupon.
    """
    queryset = Coupon.objects.filter(is_active=True)
    serializer_class = CouponSerializer
    permission_classes = [AllowAny]


class CouponDetailAPIView(generics.RetrieveAPIView):
    """
    GET /api/coupons/<id>/
    Ai cũng có thể xem chi tiết 1 coupon cụ thể.
    """
    queryset = Coupon.objects.all()
    serializer_class = CouponSerializer
    permission_classes = [AllowAny]


# --- ADMIN API ---
class AdminCouponCreateAPIView(generics.CreateAPIView):
    """
    POST /api/admin/coupons/
    Chỉ admin được thêm coupon mới.
    """
    queryset = Coupon.objects.all()
    serializer_class = CouponSerializer
    permission_classes = [IsAdminUser]


class AdminCouponUpdateDeleteAPIView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET/PUT/PATCH/DELETE /api/admin/coupons/<id>/
    Admin có thể xem, cập nhật hoặc xóa coupon.
    """
    queryset = Coupon.objects.all()
    serializer_class = CouponSerializer
    permission_classes = [IsAdminUser]

