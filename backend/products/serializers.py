# products/serializers.py
from __future__ import annotations
from decimal import Decimal
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from rest_framework import serializers
from django.db.models import Avg
from django.db import transaction
from .models import Category, Product, ProductReview, ProductImage, ProductRating, ProductQuestion


# -------- Category Serializers --------
class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'created_at', 'updated_at']
        read_only_fields = ['id', 'slug', 'created_at', 'updated_at']

    def validate_name(self, value):
        if self.instance:
            if Category.objects.exclude(pk=self.instance.pk).filter(name=value).exists():
                raise serializers.ValidationError(_('Category with this name already exists.'))
        else:
            if Category.objects.filter(name=value).exists():
                raise serializers.ValidationError(_('Category with this name already exists.'))
        return value


class CategoryListSerializer(serializers.ModelSerializer):
    product_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'product_count']

    def get_product_count(self, obj):
        return obj.products.filter(is_deleted=False).count()


# -------- Product Image Serializers --------
class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image_url', 'created_at']
        read_only_fields = ['id', 'created_at']


# -------- Product Review Serializers --------
class ProductReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = ProductReview
        fields = [
            'id', 'user', 'user_name', 'product', 'rating', 'title',
            'comment', 'is_verified_purchase', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'user_name', 'created_at', 'updated_at']

    def validate_rating(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError(_('Rating must be between 1 and 5.'))
        return value


class ProductReviewListSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = ProductReview
        fields = [
            'id', 'user_name', 'rating', 'title', 'comment',
            'is_verified_purchase', 'created_at'
        ]


# -------- Product Serializers --------
class ProductListSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        source='category',
        write_only=True
    )

    # These fields are expected to be provided by queryset annotations
    primary_image = serializers.CharField(read_only=True, allow_null=True)
    average_rating = serializers.SerializerMethodField()
    review_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'description', 'price',
            'category', 'category_id', 'primary_image',
            'is_in_stock', 'stock_quantity', 'average_rating',
            'review_count', 'created_at',
        ]
        read_only_fields = ['id', 'slug', 'created_at']

    def get_average_rating(self, obj):
        # Use annotated value if present (DB does the aggregation)
        avg = getattr(obj, 'average_rating', None)
        if avg is None:
            return None
        try:
            return round(float(avg), 1)
        except (TypeError, ValueError):
            return None


class ProductDetailSerializer(serializers.ModelSerializer):
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
            'id', 'name', 'slug', 'description', 'price',
            'category', 'category_id', 'images', 'is_in_stock',
            'stock_quantity', 'average_rating', 'review_count',
            'rating_distribution', 'reviews', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'slug', 'created_at', 'updated_at']

    def get_average_rating(self, obj):
        # For detail view fallback to DB aggregation if not annotated
        avg = getattr(obj, 'average_rating', None)
        if avg is None:
            avg = obj.reviews.aggregate(avg=Avg('rating')).get('avg')
        if avg is None:
            return None
        return round(float(avg), 1)

    def get_review_count(self, obj):
        count = getattr(obj, 'review_count', None)
        if count is None:
            return obj.reviews.count()
        return count

    def get_rating_distribution(self, obj):
        # Avoid iterating .reviews in list view; detail view can compute it
        qs = obj.reviews.all()
        distribution = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
        for r in qs:
            distribution[r.rating] = distribution.get(r.rating, 0) + 1
        return distribution


class ProductCreateUpdateSerializer(serializers.ModelSerializer):
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        source='category'
    )

    image_url = serializers.URLField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'description', 'price',
            'category_id', 'is_in_stock', 'stock_quantity',
            'created_at', 'updated_at', 'image_url',
        ]
        read_only_fields = ['id', 'slug', 'created_at', 'updated_at']

    def validate_price(self, value):
        if value <= 0:
            raise serializers.ValidationError(_('Price must be greater than 0.'))
        return value

    def validate_stock_quantity(self, value):
        if value < 0:
            raise serializers.ValidationError(_('Stock quantity cannot be negative.'))
        return value

    def validate(self, attrs):
        stock_quantity = attrs.get('stock_quantity', getattr(self.instance, 'stock_quantity', 0))
        if stock_quantity == 0:
            attrs['is_in_stock'] = False
        return attrs

    def create(self, validated_data):
        image_url = validated_data.pop('image_url', None)
        with transaction.atomic():
            product = super().create(validated_data)
            if image_url:
                ProductImage.objects.create(product=product, image_url=image_url)
        return product

    def update(self, instance, validated_data):
        image_url = validated_data.pop('image_url', None)
        with transaction.atomic():
            product = super().update(instance, validated_data)
            if image_url:
                ProductImage.objects.create(product=product, image_url=image_url)
        return product


class ProductSoftDeleteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['id', 'is_deleted', 'deleted_at']
        read_only_fields = ['id', 'deleted_at']

    def update(self, instance, validated_data):
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


class ProductQuestionSerializer(serializers.ModelSerializer):
    """ Public serializer: Ask question & See list """
    class Meta:
        model = ProductQuestion
        fields = ['id', 'author_name', 'content', 'answer', 'created_at']
        read_only_fields = ['id', 'answer', 'created_at']

class AdminProductQuestionSerializer(serializers.ModelSerializer):
    """ Admin serializer: See product details & Reply """
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_slug = serializers.CharField(source='product.slug', read_only=True)
    product_image = serializers.SerializerMethodField()
    
    class Meta:
        model = ProductQuestion
        fields = [
            'id', 'product', 'product_name', 'product_slug', 'product_image', 
            'author_name', 'content', 'answer', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'product', 'product_name', 'product_slug', 'product_image', 
            'author_name', 'content', 'created_at', 'updated_at'
        ]

    def get_product_image(self, obj):
        # Fetch the first image URL if it exists
        img = obj.product.images.first()
        return img.image_url if img else None
