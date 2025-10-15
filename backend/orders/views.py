from decimal import Decimal
from django.db import transaction
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication

from products.models import Product
from .models import Order, OrderItem, OrderStatus
from .serializers import (
    OrderCreateSerializer,
    OrderSerializer,
    OrderCancelSerializer,
    AdminOrderUpdateSerializer,
)

def get_unit_price(product: Product) -> Decimal:
    return product.price

class OrderListCreateAPIView(generics.ListCreateAPIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).order_by("-created_at")

    def get_serializer_class(self):
        return OrderSerializer if self.request.method == "GET" else OrderCreateSerializer

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        s = OrderCreateSerializer(data=request.data)
        s.is_valid(raise_exception=True)
        data = s.validated_data

        order = Order.objects.create(
            user=request.user,
            customer_name=data["customer_name"],
            customer_phone=data["customer_phone"],
            customer_email=data.get("customer_email"),
            customer_address=data["customer_address"],
            payment_method=data.get("payment_method"),
            status=OrderStatus.PENDING,
        )

        subtotal = Decimal("0.00")
        snapshot_items = []

        for item in data["items"]:
            product = Product.objects.select_for_update().get(pk=item["product_id"])
            qty = int(item["quantity"])
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
            snapshot_items.append({"product_id": product.id, "name": product.name, "qty": qty, "unit": str(unit)})

            if product.stock_quantity is not None:
                new_stock = max(0, int(product.stock_quantity) - qty)
                product.stock_quantity = new_stock
                product.is_in_stock = new_stock > 0
                product.save(update_fields=["stock_quantity", "is_in_stock"])

        order.subtotal_amount = subtotal
        order.discount_amount = Decimal("0.00")
        order.final_amount = subtotal
        order.pricing_snapshot = {"version": 1, "items": snapshot_items}
        order.save()

        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)

class OrderRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    authentication_classes = [JWTAuthentication]
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
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsAdminUser]
    serializer_class = OrderSerializer
    queryset = Order.objects.all().order_by("-created_at")

class AdminOrderDetailAPIView(generics.RetrieveUpdateAPIView):
    authentication_classes = [JWTAuthentication]
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
