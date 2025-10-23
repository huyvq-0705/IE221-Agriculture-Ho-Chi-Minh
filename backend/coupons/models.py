from django.db import models

class Coupon(models.Model):
    code = models.CharField(max_length=255, unique=True)
    discount_percent = models.DecimalField(max_digits=5, decimal_places=2)
    max_discount_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)  # Không giới hạn nếu null
    min_purchase_amount = models.DecimalField(max_digits=10, decimal_places=2)
    is_active = models.BooleanField(default=True)
    expires_at = models.DateTimeField()
    usage_limit = models.IntegerField(null=True, blank=True)  # Không giới hạn nếu null
    times_used = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'coupons' 
    
    def __str__(self):
        return self.code
