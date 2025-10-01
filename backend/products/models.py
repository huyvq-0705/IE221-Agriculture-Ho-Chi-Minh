from django.db import models
from django.utils.text import slugify
from django.urls import reverse
from .constants import FieldLengths
from django.conf import settings


#-------- category --------
class Category(models.Model):
    name = models.CharField(max_length = FieldLengths.MAX_LENGTH)
    slug = models.SlugField(max_length = FieldLengths.MAX_LENGTH, unique=True, blank=True, db_index=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'categories'
        indexes = [
            models.Index(fields=['slug'], name='idx_categories_slug'),
            models.Index(fields=['created_at'], name='idx_categories_created'),
        ]
        ordering = ['-created_at']

#-------- product --------

class Product(models.Model):
    name = models.CharField(max_length=FieldLengths.MAX_LENGTH)
    slug = models.SlugField(max_length=FieldLengths.MAX_LENGTH, unique=True, blank=True, db_index=True)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=FieldLengths.DECIMAL_MAX_DIGITS, decimal_places=FieldLengths.DECIMAL_PLACES)
    category = models.ForeignKey(
        'Category', on_delete=models.CASCADE, related_name='products'
    )
    is_in_stock = models.BooleanField(default=True)
    stock_quantity = models.PositiveIntegerField(default=0)
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'products'
        indexes = [
            models.Index(fields=['slug'], name='idx_products_slug'),
            models.Index(fields=['created_at'], name='idx_products_created'),
        ]
        ordering = ['-created_at']

#-------- product review --------

class ProductReview(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='product_reviews'
    )
    product = models.ForeignKey(
        'Product', on_delete=models.CASCADE, related_name='reviews'
    )
    rating = models.PositiveSmallIntegerField()
    title = models.CharField(max_length=FieldLengths.MAX_LENGTH, blank=True)
    comment = models.TextField(blank=True)
    is_verified_purchase = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'product_reviews'
        indexes = [
            models.Index(fields=['product'], name='idx_review_product'),
            models.Index(fields=['user'], name='idx_review_user'),
            models.Index(fields=['created_at'], name='idx_review_created'),
        ]
        ordering = ['-created_at']

    def __str__(self):
        return f'Review by {self.user.username} for {self.product.name}'

#-------- product image --------

class ProductImage(models.Model):
    product = models.ForeignKey(
        'Product', on_delete=models.CASCADE, related_name='images'
    )
    image_url = models.URLField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'product_images'
        indexes = [
            models.Index(fields=['product'], name='idx_image_product'),
            models.Index(fields=['created_at'], name='idx_image_created'),
        ]
        ordering = ['-created_at']

    def __str__(self):
        return self.image_url
