from django.contrib import admin
from .models import Blog

@admin.register(Blog)
class BlogAdmin(admin.ModelAdmin):
    list_display = ("title", "slug", "created_at", "updated_at")
    list_display_links = ("title",)
    search_fields = ("title", "excerpt", "content")
    list_filter = ("created_at", "updated_at")
    readonly_fields = ("created_at", "updated_at")
    prepopulated_fields = {"slug": ("title",)}  # still overridden by your save() if empty
    fieldsets = (
        ("Main", {
            "fields": ("title", "slug", "content")
        }),
        ("Preview / SEO", {
            "fields": ("meta_description", "excerpt")
        }),
        ("Cover Image", {
            "fields": ("cover_image_url", "cover_image_alt")
        }),
        ("Timestamps", {
            "fields": ("created_at", "updated_at")
        }),
    )
