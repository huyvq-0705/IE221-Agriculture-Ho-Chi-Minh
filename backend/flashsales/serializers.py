from rest_framework import serializers
from .models import FlashSale, FlashSaleProduct
from products.models import Product
from django.utils.translation import gettext_lazy as _


class ProductSerializer(serializers.ModelSerializer):
    """Hiển thị thông tin cơ bản của sản phẩm trong flash sale"""
    class Meta:
        model = Product
        fields = ['id', 'name', 'price' """'image'"""]  # tuỳ bạn có các field nào


class FlashSaleProductSerializer(serializers.ModelSerializer):
    """Hiển thị chi tiết sản phẩm nằm trong flash sale"""
    product = ProductSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        source='product', queryset=Product.objects.all(), write_only=True
    )

    class Meta:
        model = FlashSaleProduct
        fields = ['flash_sale_id', 'product_id']
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
            'discount_percent',
            'start_date',
            'end_date',
            'is_active',
            'created_at',
            'updated_at',
            'products',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
        
    def validate_price(self, value):
        """Must have a name"""
        if len(value.replace(" ", "")) == 0:
            raise serializers.ValidationError(
                _('Flash sale must have a name.')
            )
        return value
    def validate_price(self, value):
        """Validate discount percent is positive"""
        if value <= 0:
            raise serializers.ValidationError(
                _('Percent must be greater than 0.')
            )
        return value
    
