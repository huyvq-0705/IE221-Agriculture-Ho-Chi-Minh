from django.db import models
from django.conf import settings
from products.models import Product

# Create your models here.
#Flash Sale
class FlashSale(models.Model):
    name = models.CharField(max_length=255, null=False)
    discount_percent = models.DecimalField(max_digits=5, decimal_places=2)
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'flash_sales' 

    def __str__(self):
        return f"{self.name} ({self.discount_percent}%)"


class FlashSaleProduct(models.Model):
    flash_sale = models.ForeignKey(
        FlashSale, on_delete=models.CASCADE, related_name='flash_sale_products'
    )
    product = models.ForeignKey(
        Product, on_delete=models.CASCADE, related_name='product_flash_sales'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'flash_sales_products' 
        unique_together = ('flash_sale', 'product')

    def __str__(self):
        return f"{self.flash_sale.name} - {self.product.name}"