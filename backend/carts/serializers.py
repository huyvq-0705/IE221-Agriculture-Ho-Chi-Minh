from rest_framework import serializers
from .models import Cart, CartItem
from products.models import Product


class CartItemProductSerializer(serializers.Serializer):
    """
    Safe product representation for cart responses.
    Uses a plain Serializer (not ModelSerializer) to avoid DRF complaining
    if the Product model lacks optional fields like `primary_image`.
    """
    id = serializers.IntegerField()
    slug = serializers.CharField()
    name = serializers.CharField()
    price = serializers.DecimalField(max_digits=12, decimal_places=2)
    primary_image = serializers.SerializerMethodField()
    is_in_stock = serializers.BooleanField()
    stock_quantity = serializers.IntegerField(allow_null=True)

    def get_primary_image(self, obj: Product):
        if hasattr(obj, "primary_image") and obj.primary_image:
            try:
                return getattr(obj.primary_image, "url", str(obj.primary_image))
            except Exception:
                return str(obj.primary_image)

        if hasattr(obj, "images"):
            try:
                first = obj.images.all().first()
                if first:
                    return getattr(first, "image_url", None) or getattr(first, "image", None) or getattr(first, "file", None) or None
            except Exception:
                pass

        for attr in ("primary_image_url", "image_url", "image"):
            if hasattr(obj, attr):
                val = getattr(obj, attr)
                if val:
                    return getattr(val, "url", str(val)) if hasattr(val, "url") else str(val)

        return None

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
