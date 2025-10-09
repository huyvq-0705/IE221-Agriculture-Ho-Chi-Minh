from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from django.shortcuts import get_object_or_404

from .models import FlashSale, FlashSaleProduct
from .serializers import FlashSaleSerializer, FlashSaleProductSerializer
from products.models import Product 


class FlashSaleViewSet(viewsets.ModelViewSet):
    """
    ViewSet cho admin quản lý Flash Sale.
    - Chỉ admin có thể truy cập.
    - Bao gồm CRUD cho FlashSale và API thêm/xóa sản phẩm trong từng sale.
    """
    queryset = FlashSale.objects.all().order_by('-created_at')
    serializer_class = FlashSaleSerializer
    permission_classes = [IsAdminUser]

    def create(self, request, *args, **kwargs):
        """Tạo flash sale mới"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        flash_sale = serializer.save()
        return Response(FlashSaleSerializer(flash_sale).data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        """Cập nhật thông tin flash sale (vd: thời gian, trạng thái, tên)"""
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    @action(detail=True, methods=["post"], url_path="add-product")
    def add_product(self, request, pk=None):
        """
        API thêm sản phẩm vào flash sale.
        Request body: { "product": <product_id>, "discount_percent": 30 }
        """
        flash_sale = self.get_object()
        product_id = request.data.get("product")
        discount_percent = request.data.get("discount_percent", 0)

        if not product_id:
            return Response({"error": "product_id là bắt buộc"}, status=status.HTTP_400_BAD_REQUEST)

        product = get_object_or_404(Product, id=product_id)

        # Nếu đã có sản phẩm trong sale thì không thêm lại
        if FlashSaleProduct.objects.filter(flash_sale=flash_sale, product=product).exists():
            return Response({"error": "Sản phẩm này đã có trong flash sale."}, status=status.HTTP_400_BAD_REQUEST)

        FlashSaleProduct.objects.create(
            flash_sale=flash_sale,
            product=product,
            discount_percent=discount_percent
        )

        return Response({"message": "Đã thêm sản phẩm vào flash sale."}, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"], url_path="remove-product")
    def remove_product(self, request, pk=None):
        """
        API xóa sản phẩm khỏi flash sale.
        Request body: { "product": <product_id> }
        """
        flash_sale = self.get_object()
        product_id = request.data.get("product")

        if not product_id:
            return Response({"error": "product_id là bắt buộc"}, status=status.HTTP_400_BAD_REQUEST)

        deleted, _ = FlashSaleProduct.objects.filter(
            flash_sale=flash_sale, product_id=product_id
        ).delete()

        if deleted:
            return Response({"message": "Đã xóa sản phẩm khỏi flash sale."})
        else:
            return Response({"error": "Không tìm thấy sản phẩm trong flash sale."}, status=status.HTTP_404_NOT_FOUND)
