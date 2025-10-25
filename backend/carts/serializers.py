from rest_framework import serializers
from .models import Cart, CartItem
from products.models import Product


class CartItemProductSerializer(serializers.ModelSerializer):
    """Minimal product info for cart items"""
    class Meta:
        model = Product
        fields = ['id', 'slug', 'name', 'price', 'primary_image', 'is_in_stock', 'stock_quantity']


class CartItemSerializer(serializers.ModelSerializer):
    """Cart item with product details"""
    product = CartItemProductSerializer(read_only=True)
    subtotal = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = ['id', 'product', 'quantity', 'subtotal', 'created_at']

    def get_subtotal(self, obj):
        return float(obj.product.price) * obj.quantity


class CartSerializer(serializers.ModelSerializer):
    """Full cart with items and totals"""
    items = CartItemSerializer(many=True, read_only=True)
    total_items = serializers.SerializerMethodField()
    total_price = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = ['id', 'items', 'total_items', 'total_price', 'updated_at']

    def get_total_items(self, obj):
        return sum(item.quantity for item in obj.items.all())

    def get_total_price(self, obj):
        return sum(float(item.product.price) * item.quantity for item in obj.items.all())


class AddToCartSerializer(serializers.Serializer):
    """Add product to cart"""
    product_id = serializers.IntegerField()
    quantity = serializers.IntegerField(default=1, min_value=1)


class UpdateCartItemSerializer(serializers.Serializer):
    """Update cart item quantity"""
    product_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1)


class RemoveFromCartSerializer(serializers.Serializer):
    """Remove product from cart"""
    product_id = serializers.IntegerField()
