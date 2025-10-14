from django.urls import path
from .views import (
    FlashSaleListAPIView,
    FlashSaleDetailAPIView,
    FlashSaleCreateAPIView,
    FlashSaleUpdateAPIView,
    FlashSaleAddProductAPIView,
    FlashSaleRemoveProductAPIView,
)

urlpatterns = [
    # danh sách flash sale (GET) - admin only
    path("api/flashsales/", FlashSaleListAPIView.as_view(), name="flashsale_list"),

    # chi tiết flash sale (GET) - admin only
    path("<int:id>/", FlashSaleDetailAPIView.as_view(), name="flashsale_detail"),

    # tạo flash sale (POST) - admin only
    path("create/", FlashSaleCreateAPIView.as_view(), name="flashsale_create"),

    # cập nhật flash sale (PUT/PATCH) - admin only
    path("<int:id>/update/", FlashSaleUpdateAPIView.as_view(), name="flashsale_update"),

    # thêm sản phẩm vào flash sale (POST) - admin only
    path("<int:id>/add-product/", FlashSaleAddProductAPIView.as_view(), name="flashsale_add_product"),

    # xóa sản phẩm khỏi flash sale (POST) - admin only
    path("<int:id>/remove-product/", FlashSaleRemoveProductAPIView.as_view(), name="flashsale_remove_product"),
]
