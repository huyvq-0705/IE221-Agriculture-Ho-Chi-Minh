from __future__ import annotations
from django.urls import path
from products.views import CategoryListAPIView, CategoryDetailView, CategoryListCreateView, ProductListAPIView, ProductDetailAPIView, InstantProductSearchAPIView, AdminProductListCreateView, AdminProductDetailView

app_name = 'products'

urlpatterns = [
    path(
        'api/products/', ProductListAPIView.as_view(),
        name='api_product_list',
    ),
    path(
        'api/products/<slug:slug>/', ProductDetailAPIView.as_view(),
        name='api_product_detail',
    ),
    # # Product Reviews
    # path(
    #     'api/products/<int:product_id>/reviews/',
    #     views.ProductReviewListCreateAPIView.as_view(),
    #     name='api_product_reviews',
    # ),
    # path(
    #     'api/products/<int:product_id>/reviews/<int:pk>/',
    #     views.ProductReviewDetailAPIView.as_view(),
    #     name='api_product_review_detail',
    # ),
    # path(
    #     'api/my-reviews/',
    #     views.UserReviewsAPIView.as_view(),
    #     name='api_user_reviews',
    # ),
    path(
        'api/categories/', CategoryListAPIView.as_view(),
        name='api_category_list',
    ),
    path(
        'api/admin/categories/', CategoryListCreateView.as_view(),
        name='admin_category_list_create',
    ),
    path(
        'api/admin/categories/<slug:slug>/', CategoryDetailView.as_view(),
        name='admin_category_detail',
    ),
    path(
        'api/admin/products/', AdminProductListCreateView.as_view(),
        name='admin_product_list_create',
    ),
    path(
        'api/admin/products/<slug:slug>/', AdminProductDetailView.as_view(),
        name='admin_product_detail',
    ),
    path(
        'api/search/products/',
        InstantProductSearchAPIView.as_view(),
        name='instant_product_search',
    ),
]
