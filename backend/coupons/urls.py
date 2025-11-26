from django.urls import path
from . import views

urlpatterns = [
    # Public routes
    path('api/coupons/<str:code>/', views.CouponDetailAPIView.as_view(), name='coupon-detail'),

    # Admin routes
    path('api/admin/coupons/', views.AdminCouponCreateAPIView.as_view(), name='admin-coupon-create'),
    path('api/admin/coupons/<int:pk>/', views.AdminCouponUpdateDeleteAPIView.as_view(), name='admin-coupon-manage'),
]
