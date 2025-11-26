# orders/views.py
from decimal import Decimal
from django.db import transaction
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from coupons.models import Coupon
from django.utils import timezone

# Cookie-aware auth (reads httpOnly accessToken from cookies)
from accounts.authentication import CookieJWTAuthentication
from rest_framework_simplejwt.authentication import JWTAuthentication

from products.models import Product
from .models import Order, OrderItem, OrderStatus
from .serializers import (
    OrderCreateSerializer,
    OrderSerializer,
    OrderCancelSerializer,
    AdminOrderUpdateSerializer,
)

# Cart models as in your app
from carts.models import Cart, CartItem


def get_unit_price(product: Product) -> Decimal:
    # adjust if you have discounts/pricing logic
    return product.price


class OrderListCreateAPIView(generics.ListCreateAPIView):
    authentication_classes = [CookieJWTAuthentication, JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).order_by("-created_at")

    def get_serializer_class(self):
        return OrderSerializer if self.request.method == "GET" else OrderCreateSerializer

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        # 1. Validate data
        serializer = OrderCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        validated = serializer.validated_data

        try:
            cart = Cart.objects.select_for_update().get(user=request.user)
        except Cart.DoesNotExist:
            return Response({"detail": "Cart is empty."}, status=status.HTTP_400_BAD_REQUEST)

        cart_items_qs = CartItem.objects.select_for_update().filter(cart=cart).select_related("product")
        cart_items = list(cart_items_qs)

        if not cart_items:
            return Response({"detail": "Cart is empty."}, status=status.HTTP_400_BAD_REQUEST)

    
        order = Order.objects.create(
            user=request.user,
            customer_name=validated.get("customer_name", ""),
            customer_phone=validated.get("customer_phone", ""),
            customer_email=validated.get("customer_email"),
            customer_address=validated.get("customer_address", ""),
            payment_method=validated.get("payment_method"),
            status=OrderStatus.PENDING,
        )

        subtotal = Decimal("0.00")
        snapshot_items = []

        for ci in cart_items:
            product = Product.objects.select_for_update().get(pk=ci.product.pk)
            qty = int(ci.quantity)
            unit = Decimal(get_unit_price(product))
            line = unit * qty

            OrderItem.objects.create(
                order=order,
                product=product,
                product_name=product.name,
                quantity=qty,
                price_at_order=unit,
                line_total=line,
            )

            subtotal += line
            snapshot_items.append({
                "product_id": product.id,
                "name": product.name,
                "qty": qty,
                "unit": str(unit),
            })
            
            if getattr(product, "stock_quantity", None) is not None:
                new_stock = max(0, int(product.stock_quantity) - qty)
                product.stock_quantity = new_stock
                product.is_in_stock = new_stock > 0
                product.save(update_fields=["stock_quantity", "is_in_stock"])

        discount_amount = Decimal("0.00")
        coupon_code = validated.get("coupon_code")
        applied_coupon = None

        if coupon_code:
            try:
               
                coupon = Coupon.objects.select_for_update().get(code=coupon_code)
                
                
                now = timezone.now()
                if not coupon.is_active or coupon.expires_at < now:
                    raise ValueError("Coupon expired")
                if coupon.usage_limit is not None and coupon.times_used >= coupon.usage_limit:
                    raise ValueError("Coupon usage limit reached")
                if subtotal < coupon.min_purchase_amount:
                    raise ValueError("Minimum purchase requirement not met")
                
                # Calculate Discount
                calc_discount = (subtotal * coupon.discount_percent) / 100
                if coupon.max_discount_amount:
                    calc_discount = min(calc_discount, coupon.max_discount_amount)
                
                discount_amount = calc_discount
                
                # Update Coupon usage
                coupon.times_used += 1
                coupon.save()
                applied_coupon = coupon

            except Coupon.DoesNotExist:
                # Optional: Fail the order OR just ignore the invalid code
                pass 
            except ValueError:
                pass

        # 6. Finalize Order
        order.subtotal_amount = subtotal
        order.discount_amount = discount_amount
        order.final_amount = max(Decimal("0.00"), subtotal - discount_amount)
        order.pricing_snapshot = {"version": 1, "items": snapshot_items}
        if applied_coupon:
            order.coupon = applied_coupon # Save the relation
        
        order.save()

        # 7. Clear Cart
        cart_items_qs.delete()

        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)


class OrderRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    authentication_classes = [CookieJWTAuthentication, JWTAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = OrderSerializer

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        s = OrderCancelSerializer(data=request.data)
        s.is_valid(raise_exception=True)

        if instance.status != OrderStatus.PENDING:
            return Response({"detail": "This order cannot be cancelled."}, status=status.HTTP_403_FORBIDDEN)

        instance.status = OrderStatus.CANCELLED
        instance.cancel_reason = s.validated_data["cancel_reason"]
        instance.save(update_fields=["status", "cancel_reason"])
        return Response(OrderSerializer(instance).data)

    def destroy(self, request, *args, **kwargs):
        return Response({"detail": "Deleting orders is not allowed."}, status=status.HTTP_405_METHOD_NOT_ALLOWED)


class AdminOrderListAPIView(generics.ListAPIView):
    authentication_classes = [CookieJWTAuthentication, JWTAuthentication]
    permission_classes = [IsAuthenticated, IsAdminUser]
    serializer_class = OrderSerializer
    queryset = Order.objects.all().order_by("-created_at")


class AdminOrderDetailAPIView(generics.RetrieveUpdateAPIView):
    authentication_classes = [CookieJWTAuthentication, JWTAuthentication]
    permission_classes = [IsAuthenticated, IsAdminUser]
    queryset = Order.objects.all()

    def get_serializer_class(self):
        return AdminOrderUpdateSerializer if self.request.method in ["PUT", "PATCH"] else OrderSerializer

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        s = AdminOrderUpdateSerializer(instance, data=request.data, partial=True)
        s.is_valid(raise_exception=True)
        s.save()
        return Response(OrderSerializer(instance).data)
