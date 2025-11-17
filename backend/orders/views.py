# orders/views.py
from decimal import Decimal
from django.db import transaction
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

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
    @transaction.atomic
    def create(self, request, *args, **kwargs):
        """
        Create an order from the authenticated user's cart stored in DB.
        Client sends only customer details and payment_method.
        This method will CLEAR the cart items upon successful order creation.
        """
        # Validate incoming customer fields
        serializer = OrderCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        validated = serializer.validated_data

        # Lock the user's cart & cart items for update
        try:
            cart = Cart.objects.select_for_update().get(user=request.user)
        except Cart.DoesNotExist:
            return Response({"detail": "Cart is empty."}, status=status.HTTP_400_BAD_REQUEST)

        # Fetch and lock cart items and their products
        cart_items_qs = CartItem.objects.select_for_update().filter(cart=cart).select_related("product")
        cart_items = list(cart_items_qs)

        if not cart_items:
            return Response({"detail": "Cart is empty."}, status=status.HTTP_400_BAD_REQUEST)

        # Pre-check inventory
        shortages = []
        for ci in cart_items:
            prod = ci.product
            if getattr(prod, "stock_quantity", None) is not None:
                if prod.stock_quantity < ci.quantity:
                    shortages.append({
                        "product_id": prod.id,
                        "product_name": prod.name,
                        "requested": ci.quantity,
                        "available": prod.stock_quantity,
                    })

        if shortages:
            return Response({
                "detail": "Some items are out of stock or insufficient quantity.",
                "shortages": shortages
            }, status=status.HTTP_400_BAD_REQUEST)

        # Create the order
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

        # Build OrderItem from cart items; update stock
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

            # decrease stock if tracked
            if getattr(product, "stock_quantity", None) is not None:
                new_stock = max(0, int(product.stock_quantity) - qty)
                product.stock_quantity = new_stock
                product.is_in_stock = new_stock > 0
                product.save(update_fields=["stock_quantity", "is_in_stock"])

        # Finalize order totals and snapshot
        order.subtotal_amount = subtotal
        order.discount_amount = Decimal("0.00")
        order.final_amount = subtotal
        order.pricing_snapshot = {"version": 1, "items": snapshot_items}
        order.save()

        # CLEAR the cart items (inside same transaction)
        cart_items_qs.delete()
        # Optionally delete the cart row:
        # cart.delete()

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
