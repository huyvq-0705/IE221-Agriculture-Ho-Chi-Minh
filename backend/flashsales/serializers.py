from rest_framework import serializers
from .models import FlashSale, FlashSaleProduct
from products.models import Product


class ProductSerializer(serializers.ModelSerializer):
    """Hiển thị thông tin cơ bản của sản phẩm trong flash sale"""

    class Meta:
        model = Product
        fields = ['id', 'name', 'price', 'image']  # tuỳ bạn có các field nào


class FlashSaleProductSerializer(serializers.ModelSerializer):
    """Hiển thị chi tiết sản phẩm nằm trong flash sale"""
    product = ProductSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        source='product', queryset=Product.objects.all(), write_only=True
    )

    class Meta:
        model = FlashSaleProduct
        fields = ['id', 'product', 'product_id', 'discount_percent']
        extra_kwargs = {'id': {'read_only': True}}


class FlashSaleSerializer(serializers.ModelSerializer):
    """Serializer chính cho Flash Sale"""
    products = FlashSaleProductSerializer(
        many=True, source='flashsaleproduct_set', read_only=True
    )

    class Meta:
        model = FlashSale
        fields = [
            'id',
            'name',
            'start_time',
            'end_time',
            'is_active',
            'created_at',
            'updated_at',
            'products',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
