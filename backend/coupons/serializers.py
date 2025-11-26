from rest_framework import serializers
from .models import Coupon
from django.utils import timezone

class CouponSerializer(serializers.ModelSerializer):
    class Meta:
        model = Coupon
        fields = '__all__'

    def validate(self, attrs):
        """
        Cho phép bỏ trống (null) một số trường mang nghĩa 'không giới hạn'.
        """
        if 'usage_limit' in attrs and attrs['usage_limit'] is None:
            attrs['usage_limit'] = None

        if 'max_discount_amount' in attrs and attrs['max_discount_amount'] is None:
            attrs['max_discount_amount'] = None

        return attrs
    
    def create(self, validated_data):
        """Override create để xử lý is_active khi tạo mới"""
        instance = Coupon(**validated_data)
        if instance.expires_at and instance.expires_at < timezone.now():
            instance.is_active = False
        instance.save()
        return instance
    
    def update(self, instance, validated_data):
        """Override update để xử lý is_active khi cập nhật"""
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if instance.expires_at and instance.expires_at < timezone.now():
            instance.is_active = False
        instance.save()
        return instance

class CouponDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Coupon
        fields = '__all__'
        read_only_fields = ["id", "created_at"]

class PublicCouponDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Coupon
        fields = [
            "code", "discount_percent", "max_discount_amount", "min_purchase_amount",
            "is_active", 
        ]
        read_only_fields = ["id", "created_at", "updated_at"]