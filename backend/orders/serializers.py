# orders/serializers.py
from decimal import Decimal
from rest_framework import serializers
from .models import Order, OrderItem, OrderStatus, CancelReason, RejectReason, PaymentMethod
from products.models import Product

# --- Output serializers ---

class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ["id", "product", "product_name", "quantity", "price_at_order", "line_total"]


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            "id", "status",
            "customer_name", "customer_phone", "customer_email", "customer_address",
            "payment_method",
            "subtotal_amount", "discount_amount", "final_amount",
            "pricing_snapshot",
            "cancel_reason", "reject_reason",
            "items",
            "created_at",
        ]
        read_only_fields = ["id", "subtotal_amount", "discount_amount", "final_amount", "pricing_snapshot", "created_at", "status"]


# --- Input validators (client sends only order info; items come from cart) ---

class OrderCreateSerializer(serializers.Serializer):
    """
    Client should POST only customer details and payment method.
    Items are taken from the user's cart server-side.
    """
    customer_name = serializers.CharField()
    customer_phone = serializers.CharField()
    customer_email = serializers.EmailField(required=False, allow_blank=True, allow_null=True)
    customer_address = serializers.CharField()
    payment_method = serializers.ChoiceField(choices=PaymentMethod.choices, default=PaymentMethod.COD)


class OrderCancelSerializer(serializers.Serializer):
    cancel_reason = serializers.ChoiceField(choices=CancelReason.choices)


class AdminOrderUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ["status", "reject_reason", "payment_method"]

    def validate(self, attrs):
        status = attrs.get("status")
        reject_reason = attrs.get("reject_reason")
        if status == OrderStatus.REJECTED and not reject_reason:
            raise serializers.ValidationError({"reject_reason": "This field is required when rejecting an order."})
        if status == OrderStatus.CANCELLED:
            raise serializers.ValidationError({"status": "Admin cannot set status to CANCELLED. Use REJECTED."})
        return attrs
