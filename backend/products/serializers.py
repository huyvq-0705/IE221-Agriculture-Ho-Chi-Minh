from __future__ import annotations

from decimal import Decimal

from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from rest_framework import serializers
from django.db.models import Avg
from .models import Category, Product, ProductReview, ProductImage, ProductRating 


# -------- Category Serializers --------

class CategorySerializer(serializers.ModelSerializer):
    """Serializer for Category model"""
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'created_at', 'updated_at']
        read_only_fields = ['id', 'slug', 'created_at', 'updated_at']
    
    def validate_name(self, value):
        """Validate category name uniqueness"""
        if self.instance:
            # Khi update, loại trừ instance hiện tại
            if Category.objects.exclude(pk=self.instance.pk).filter(name=value).exists():
                raise serializers.ValidationError(
                    _('Category with this name already exists.')
                )
        else:
            # Khi create
            if Category.objects.filter(name=value).exists():
                raise serializers.ValidationError(
                    _('Category with this name already exists.')
                )
        return value


class CategoryListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for category listing"""
    product_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'product_count']
    
    def get_product_count(self, obj):
        """Get number of products in category"""
        return obj.products.filter(is_deleted=False).count()


# -------- Product Image Serializers --------

class ProductImageSerializer(serializers.ModelSerializer):
    """Serializer for ProductImage model"""
    
    class Meta:
        model = ProductImage
        fields = ['id', 'image_url', 'created_at']
        read_only_fields = ['id', 'created_at']


# -------- Product Review Serializers --------

class ProductReviewSerializer(serializers.ModelSerializer):
    """Serializer for ProductReview model"""
    user_name = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = ProductReview
        fields = [
            'id',
            'user',
            'user_name',
            'product',
            'rating',
            'title',
            'comment',
            'is_verified_purchase',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'user', 'user_name', 'created_at', 'updated_at']
    
    def validate_rating(self, value):
        """Validate rating is between 1 and 5"""
        if value < 1 or value > 5:
            raise serializers.ValidationError(
                _('Rating must be between 1 and 5.')
            )
        return value


class ProductReviewListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for review listing"""
    user_name = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = ProductReview
        fields = [
            'id',
            'user_name',
            'rating',
            'title',
            'comment',
            'is_verified_purchase',
            'created_at'
        ]


# -------- Product Serializers --------

class ProductListSerializer(serializers.ModelSerializer):
    """Serializer for product listing"""
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        source='category',
        write_only=True
    )
    primary_image = serializers.SerializerMethodField()
    average_rating = serializers.SerializerMethodField()
    review_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = [
            'id',
            'name',
            'slug',
            'description',
            'price',
            'category',
            'category_id',
            'primary_image',
            'is_in_stock',
            'stock_quantity',
            'average_rating',
            'review_count',
            'created_at',
        ]
        read_only_fields = ['id', 'slug', 'created_at']
    
    def get_primary_image(self, obj):
        """Get first product image"""
        first_image = obj.images.first()
        return first_image.image_url if first_image else None
    
    def get_average_rating(self, obj):
        """Calculate average rating"""
        reviews = obj.reviews.all()
        if not reviews:
            return None
        
        total = sum(review.rating for review in reviews)
        return round(total / len(reviews), 1)
    
    def get_review_count(self, obj):
        """Get number of reviews"""
        return obj.reviews.count()


class ProductDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for product detail view"""
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        source='category',
        write_only=True
    )
    images = ProductImageSerializer(many=True, read_only=True)
    reviews = ProductReviewListSerializer(many=True, read_only=True)
    average_rating = serializers.SerializerMethodField()
    review_count = serializers.SerializerMethodField()
    rating_distribution = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = [
            'id',
            'name',
            'slug',
            'description',
            'price',
            'category',
            'category_id',
            'images',
            'is_in_stock',
            'stock_quantity',
            'average_rating',
            'review_count',
            'rating_distribution',
            'reviews',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'slug', 'created_at', 'updated_at']
    
    def get_average_rating(self, obj):
        """Calculate average rating"""
        reviews = obj.reviews.all()
        if not reviews:
            return None
        
        total = sum(review.rating for review in reviews)
        return round(total / len(reviews), 1)
    
    def get_review_count(self, obj):
        """Get number of reviews"""
        return obj.reviews.count()
    
    def get_rating_distribution(self, obj):
        """Get distribution of ratings (1-5 stars)"""
        reviews = obj.reviews.all()
        distribution = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
        
        for review in reviews:
            distribution[review.rating] += 1
        
        return distribution
    
    def get_related_products(self, obj):
        related = Product.objects.filter(category=obj.category).exclude(id=obj.id)[:6]
        return ProductListSerializer(related, many=True).data


class ProductCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating products"""
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        source='category'
    )
    
    class Meta:
        model = Product
        fields = [
            'id',
            'name',
            'slug',
            'description',
            'price',
            'category_id',
            'is_in_stock',
            'stock_quantity',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'slug', 'created_at', 'updated_at']
    
    def validate_price(self, value):
        """Validate price is positive"""
        if value <= 0:
            raise serializers.ValidationError(
                _('Price must be greater than 0.')
            )
        return value
    
    def validate_stock_quantity(self, value):
        """Validate stock quantity"""
        if value < 0:
            raise serializers.ValidationError(
                _('Stock quantity cannot be negative.')
            )
        return value
    
    def validate(self, attrs):
        """Cross-field validation"""
        stock_quantity = attrs.get('stock_quantity', getattr(self.instance, 'stock_quantity', 0))
        is_in_stock = attrs.get('is_in_stock', getattr(self.instance, 'is_in_stock', True))
        
        # Tự động set is_in_stock dựa trên stock_quantity
        if stock_quantity == 0:
            attrs['is_in_stock'] = False
        
        return attrs


class ProductSoftDeleteSerializer(serializers.ModelSerializer):
    """Serializer for soft deleting products"""
    
    class Meta:
        model = Product
        fields = ['id', 'is_deleted', 'deleted_at']
        read_only_fields = ['id', 'deleted_at']
    
    def update(self, instance, validated_data):
        """Handle soft delete logic"""
        if validated_data.get('is_deleted'):
            instance.is_deleted = True
            instance.deleted_at = timezone.now()
        else:
            instance.is_deleted = False
            instance.deleted_at = None
        
        instance.save()
        return instance

# -------- Rating Serializers --------
class ProductRatingSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    
    class Meta:
        model = ProductRating
        fields = ['id', 'product', 'user', 'rating', 'comment', 'created_at', 'updated_at']
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

class ProductRatingDetailSerializer(ProductRatingSerializer):
    class Meta(ProductRatingSerializer.Meta):
        fields = ['id', 'rating', 'comment', 'user', 'created_at']
