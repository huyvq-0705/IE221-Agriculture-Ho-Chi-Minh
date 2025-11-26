from decimal import Decimal
from django.conf import settings
from django.db import models
from products.models import Product
from coupons.models import Coupon

class OrderStatus(models.TextChoices):
    PENDING = "PENDING", "Pending"
    CONFIRMED = "CONFIRMED", "Confirmed"
    SHIPPED = "SHIPPED", "Shipped"
    DELIVERED = "DELIVERED", "Delivered"
    CANCELLED = "CANCELLED", "Cancelled"
    REJECTED = "REJECTED", "Rejected"

class PaymentMethod(models.TextChoices):
    COD = "COD", "Cash on Delivery"
    BANK_TRANSFER = "BANK_TRANSFER", "Bank Transfer"

class CancelReason(models.TextChoices):
    CHANGED_MIND = "CHANGED_MIND", "Changed mind"
    ORDERED_BY_MISTAKE = "ORDERED_BY_MISTAKE", "Ordered by mistake"
    OTHER = "OTHER", "Other"

class RejectReason(models.TextChoices):
    OUT_OF_STOCK = "OUT_OF_STOCK", "Out of stock"
    INVALID_ADDRESS = "INVALID_ADDRESS", "Invalid address"
    SUSPECTED_FRAUD = "SUSPECTED_FRAUD", "Suspected fraud"
    OTHER = "OTHER", "Other"

class Order(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="orders")

    customer_name = models.CharField(max_length=255)
    customer_phone = models.CharField(max_length=32)
    customer_email = models.EmailField(blank=True, null=True)
    customer_address = models.TextField()

    coupon = models.ForeignKey(Coupon, on_delete=models.SET_NULL, null=True, blank=True, related_name="orders")


    payment_method = models.CharField(max_length=32, choices=PaymentMethod.choices, default=PaymentMethod.COD)
    status = models.CharField(max_length=32, choices=OrderStatus.choices, default=OrderStatus.PENDING)

    subtotal_amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    discount_amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    final_amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))

    pricing_snapshot = models.JSONField(blank=True, null=True)

    cancel_reason = models.CharField(max_length=64, choices=CancelReason.choices, blank=True, null=True)
    reject_reason = models.CharField(max_length=64, choices=RejectReason.choices, blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "orders"
        indexes = [
            models.Index(fields=["user"], name="idx_orders_user"),
            models.Index(fields=["status"], name="idx_orders_status"),
            models.Index(fields=["created_at"], name="idx_orders_created_at"),
        ]
        ordering = ["-created_at"]

    def __str__(self):
        return f"Order #{self.id}"

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    product_name = models.CharField(max_length=255)
    quantity = models.PositiveIntegerField()
    price_at_order = models.DecimalField(max_digits=12, decimal_places=2)
    line_total = models.DecimalField(max_digits=12, decimal_places=2)

    class Meta:
        db_table = "order_items"
        indexes = [
            models.Index(fields=["order"], name="idx_order_items_order"),
            models.Index(fields=["product"], name="idx_order_items_product"),
        ]

    def __str__(self):
        return f"{self.product_name} × {self.quantity}"
