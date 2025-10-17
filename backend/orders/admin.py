from django.contrib import admin
from .models import Order, OrderItem

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ("product", "product_name", "quantity", "price_at_order", "line_total")
    can_delete = False

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ("id", "customer_name", "status", "payment_method", "final_amount", "created_at")
    list_filter = ("status", "payment_method", "created_at")
    search_fields = ("customer_name", "customer_phone", "customer_email")
    inlines = [OrderItemInline]
    readonly_fields = ("created_at", "subtotal_amount", "discount_amount", "final_amount", "pricing_snapshot")

@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ("id", "order", "product_name", "quantity", "price_at_order", "line_total")
    list_filter = ("product",)
    search_fields = ("product_name",)
