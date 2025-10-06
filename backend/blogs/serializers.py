from rest_framework import serializers
from django.utils.html import strip_tags
from .models import Blog

class BlogListSerializer(serializers.ModelSerializer):
    seo_title = serializers.ReadOnlyField()
    seo_description = serializers.ReadOnlyField()
    social_image_url = serializers.ReadOnlyField()
    social_image_alt = serializers.ReadOnlyField()

    class Meta:
        model = Blog
        fields = [
            "id", "title", "slug",
            "excerpt",
            "cover_image_url", "cover_image_alt",
            "seo_title", "seo_description",
            "social_image_url", "social_image_alt",
            "created_at", "updated_at",
        ]
        read_only_fields = ["id", "slug", "created_at", "updated_at"]


class BlogDetailSerializer(serializers.ModelSerializer):
    # full detail + computed helpers
    seo_title = serializers.ReadOnlyField()
    seo_description = serializers.ReadOnlyField()
    social_image_url = serializers.ReadOnlyField()
    social_image_alt = serializers.ReadOnlyField()

    class Meta:
        model = Blog
        fields = [
            "id", "title", "slug",
            "meta_description", "excerpt",
            "cover_image_url", "cover_image_alt",
            "content",
            "created_at", "updated_at",
            "seo_title", "seo_description",
            "social_image_url", "social_image_alt",
        ]
        read_only_fields = ["id", "slug", "created_at", "updated_at"]

    def validate_meta_description(self, value):
        return strip_tags(value or "")[:160]
    