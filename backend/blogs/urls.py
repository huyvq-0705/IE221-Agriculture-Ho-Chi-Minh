from django.urls import path
from .views import (
    PublicBlogListAPIView,
    PublicBlogDetailAPIView,
    AdminBlogListCreateAPIView,
    AdminBlogDetailAPIView,
)

app_name = "blog"

urlpatterns = [
    path("api/blogs/", PublicBlogListAPIView.as_view(), name="api_blog_list"),
    path("api/blogs/<slug:slug>/", PublicBlogDetailAPIView.as_view(), name="api_blog_detail"),

    path("api/admin/blogs/", AdminBlogListCreateAPIView.as_view(), name="admin_blog_list_create"),
    path("api/admin/blogs/<slug:slug>/", AdminBlogDetailAPIView.as_view(), name="admin_blog_detail"),
]
