# apps/blog/models.py
from django.db import models
from django.urls import reverse
from django.utils.text import slugify, Truncator
from django.utils.html import strip_tags
from django.conf import settings


# -------- helpers --------
def unique_slugify(instance, value, slug_field_name="slug", max_length=255):
    """
    Create a unique slug from `value` for the given model instance.
    Appends -2, -3, ... if needed. Trims to `max_length`.
    """
    base = slugify(value)[:max_length].rstrip("-")
    slug = base or "post"
    Model = instance.__class__
    n = 2
    while Model.objects.filter(**{slug_field_name: slug}).exclude(pk=instance.pk).exists():
        suffix = f"-{n}"
        slug = (base[: max_length - len(suffix)] + suffix).rstrip("-")
        n += 1
    return slug


# -------- blog --------
class Blog(models.Model):
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True, blank=True, db_index=True)
    meta_description = models.CharField(max_length=160, blank=True)  # SEO snippet
    excerpt = models.TextField(blank=True)                           # short preview
    cover_image_url = models.URLField(blank=True)                    # hero / OG image
    cover_image_alt = models.CharField(max_length=125, blank=True)   # accessible alt for hero image
    content = models.TextField(blank=True)                           # full article
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    DEFAULT_SOCIAL_IMAGE_URL = "https://images.unsplash.com/photo-1620200423727-8127f75d7f53?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"

    class Meta:
        db_table = "blogs"
        indexes = [
            models.Index(fields=["slug"], name="idx_blogs_slug"),
            models.Index(fields=["created_at"], name="idx_blogs_created"),
        ]
        ordering = ["-created_at"]

    def save(self, *args, **kwargs):
        if not self.slug and self.title:
            self.slug = unique_slugify(self, self.title)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title

    def get_absolute_url(self):
        return reverse("blog:detail", args=[self.slug])

    @property
    def seo_title(self) -> str:
        return self.title

    @property
    def seo_description(self) -> str:
        """
        Always returns a clean ~160-char description for meta tags.
        Priority: meta_description > excerpt > content (all stripped of HTML).
        """
        if self.meta_description:
            return self.meta_description
        if self.excerpt:
            return strip_tags(self.excerpt)[:160]
        return strip_tags(self.content or "")[:160]

    @property
    def social_image_url(self) -> str:
        """
        Social/OG image to use on the frontend.
        Priority:
          1) cover_image_url (per-post)
          2) settings.SEO_DEFAULT_OG_IMAGE_URL (project-wide)
          3) DEFAULT_SOCIAL_IMAGE_URL (code fallback)
        """
        return (
            self.cover_image_url
            or getattr(settings, "SEO_DEFAULT_OG_IMAGE_URL", "")
            or self.DEFAULT_SOCIAL_IMAGE_URL
        )

    @property
    def social_image_alt(self) -> str:
        """
        Alt text for the hero/social image.
        Priority:
          1) cover_image_alt (author-provided; best)
          2) Derived from title, trimmed to ~125 chars
        """
        if self.cover_image_alt:
            return self.cover_image_alt
        return Truncator(self.title or "").chars(125)

