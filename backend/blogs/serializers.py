# blogs/serializers.py
from rest_framework import serializers
from django.utils.html import strip_tags
import bleach
from bleach.sanitizer import (
    ALLOWED_TAGS as BLEACH_TAGS,
    ALLOWED_ATTRIBUTES as BLEACH_ATTRS,
    ALLOWED_PROTOCOLS as BLEACH_PROTOCOLS,
)
from bleach.css_sanitizer import CSSSanitizer
from .models import Blog

ALLOWED_TAGS = sorted(
    set(BLEACH_TAGS)
    | {
        "p", "h1", "h2", "h3",
        "blockquote", "pre", "code",
        "ul", "ol", "li",
        "hr", "br",
        "a", "strong", "em", "u",
        "img", "figure", "figcaption",
    }
)

ALLOWED_ATTRS = {
    **BLEACH_ATTRS,
    "*": ["class", "style"],
    "a": ["href", "title", "rel", "target"],
    "img": ["src", "alt", "title", "width", "height", "loading", "decoding"],
    "figure": ["class"],
    "figcaption": ["class"],
}

ALLOWED_PROTOCOLS = set(BLEACH_PROTOCOLS) | {"http", "https", "mailto"}

CSS_SANITIZER = CSSSanitizer(allowed_css_properties=["text-align"])


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
        # backend enforces ~160 even if editors type more
        return strip_tags(value or "")[:160]

    def validate_content(self, value):
        # sanitize TipTap HTML but keep headings/lists/quotes/hr/code/links + text-align
        return bleach.clean(
            value or "",
            tags=ALLOWED_TAGS,
            attributes=ALLOWED_ATTRS,
            protocols=ALLOWED_PROTOCOLS,
            strip=True,
            css_sanitizer=CSS_SANITIZER,
        )
