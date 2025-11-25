from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator
# Create your models here.
#-------- Cart --------
class Cart(models.Model):
    """Giỏ hàng của người dùng"""
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='cart'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'carts'
        indexes = [
            models.Index(fields=['user'], name='idx_cart_user'),
        ]

    def __str__(self):
        return f'Cart of {self.user.username}'


#-------- Cart Item --------

class CartItem(models.Model):
    """Sản phẩm trong giỏ hàng"""
    cart = models.ForeignKey(
        'Cart',
        on_delete=models.CASCADE,
        related_name='items'
    )
    product = models.ForeignKey(
        'products.Product',
        on_delete=models.CASCADE,
        related_name='cart_items'
    )
    quantity = models.PositiveIntegerField(
        default=1,
        validators=[MinValueValidator(1)]
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'cart_items'
        unique_together = [['cart', 'product']]
        indexes = [
            models.Index(fields=['cart'], name='idx_cartitem_cart'),
            models.Index(fields=['product'], name='idx_cartitem_product'),
        ]

    def __str__(self):
        return f'{self.quantity}x {self.product.name}'
