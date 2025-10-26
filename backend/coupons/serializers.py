from rest_framework import serializers
from .models import Coupon

class CouponSerializer(serializers.ModelSerializer):
    class Meta:
        model = Coupon
        fields = '__all__'

    def validate(self, attrs):
        """
        Cho phép bỏ trống (null) một số trường mang nghĩa 'không giới hạn'.
        """
        # Nếu không có usage_limit, hiểu là không giới hạn lượt dùng
        if 'usage_limit' in attrs and attrs['usage_limit'] is None:
            attrs['usage_limit'] = None

        # Nếu không có max_discount_amount, hiểu là không giới hạn giảm giá tối đa
        if 'max_discount_amount' in attrs and attrs['max_discount_amount'] is None:
            attrs['max_discount_amount'] = None

        return attrs

class CouponDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Coupon
        fields = '__all__'
        read_only_fields = ["id", "created_at", "updated_at"]

class PublicCouponDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Coupon
        fields = [
            "code", "discount_percent", "max_discount_amount", "min_purchase_amount",
            "is_active", 
        ]
        read_only_fields = ["id", "created_at", "updated_at"]