# products/views.py
from __future__ import annotations
from time import timezone as _timezone  # not used for DB operations; keep timezone from django.utils below
from django.utils import timezone
from django.db.models import Q, Avg, Count, OuterRef, Subquery
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.pagination import PageNumberPagination
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError, PermissionDenied
import logging
from django.db import IntegrityError, transaction

from .models import Category, Product, ProductRating, ProductImage, ProductQuestion
from .serializers import (
    CategorySerializer,
    ProductListSerializer,
    ProductDetailSerializer,
    ProductCreateUpdateSerializer,
    ProductSoftDeleteSerializer,
    ProductRatingSerializer,
    ProductRatingDetailSerializer,
    ProductQuestionSerializer,
    AdminProductQuestionSerializer
)

logger = logging.getLogger(__name__)

# Pagination
class ProductPagination(PageNumberPagination):
    page_size = 12
    page_size_query_param = "page_size"
    max_page_size = 50


# CSRF exempt base
@method_decorator(csrf_exempt, name="dispatch")
class CsrfExemptAPIView(APIView):
    pass


# Category APIs
class CategoryListAPIView(generics.ListAPIView):
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]
    queryset = Category.objects.all().order_by("name")


class CategoryListCreateView(CsrfExemptAPIView, generics.ListCreateAPIView):
    queryset = Category.objects.all().order_by("name")
    serializer_class = CategorySerializer
    permission_classes = [IsAdminUser]


class CategoryDetailView(CsrfExemptAPIView, generics.RetrieveUpdateDestroyAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAdminUser]
    lookup_field = "slug"


class ProductListAPIView(CsrfExemptAPIView, generics.ListAPIView):
    serializer_class = ProductListSerializer
    pagination_class = ProductPagination
    permission_classes = [AllowAny]

    def get_queryset(self):
        # Subquery: latest image_url per product (primary_image)
        primary_image_subq = Subquery(
            ProductImage.objects
                .filter(product=OuterRef('pk'))
                .order_by('-created_at')
                .values('image_url')[:1]
        )

        queryset = (
            Product.objects
                .select_related("category")
                .filter(is_in_stock=True, is_deleted=False)
                .annotate(
                    average_rating=Avg('reviews__rating'),
                    review_count=Count('reviews'),
                    primary_image=primary_image_subq
                )
        )

        # category filter (slug or id)
        category_param = self.request.query_params.get("category")
        if category_param:
            category_filtered = queryset.filter(category__slug=category_param)
            if not category_filtered.exists():
                try:
                    category_filtered = queryset.filter(category_id=int(category_param))
                except (ValueError, TypeError):
                    pass
            if category_filtered.exists():
                queryset = category_filtered
            else:
                queryset = queryset.none()

        # search
        search = self.request.query_params.get("search")
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) | Q(description__icontains=search) | Q(category__name__icontains=search)
            )

        # price range
        min_price = self.request.query_params.get("min_price")
        max_price = self.request.query_params.get("max_price")
        if min_price:
            try:
                queryset = queryset.filter(price__gte=float(min_price))
            except (ValueError, TypeError):
                pass
        if max_price:
            try:
                queryset = queryset.filter(price__lte=float(max_price))
            except (ValueError, TypeError):
                pass

        ordering = self.request.query_params.get("ordering", "-created_at")
        valid_orderings = ["name", "-name", "price", "-price", "created_at", "-created_at"]
        if ordering in valid_orderings:
            queryset = queryset.order_by(ordering)
        else:
            queryset = queryset.order_by("-created_at")

        return queryset


class ProductDetailAPIView(CsrfExemptAPIView, generics.RetrieveAPIView):
    serializer_class = ProductDetailSerializer
    permission_classes = [AllowAny]
    lookup_field = "slug"

    def get_queryset(self):
        # select_related for category; detail will evaluate reviews/images lazily
        return Product.objects.select_related("category").filter(is_deleted=False)


class InstantProductSearchAPIView(CsrfExemptAPIView, APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        query = request.query_params.get('q', '').strip()
        limit = request.query_params.get('limit', 10)

        if not query or len(query) < 2:
            return Response({'error': 'Vui lòng nhập ít nhất 2 ký tự', 'results': []},
                            status=status.HTTP_400_BAD_REQUEST)

        try:
            limit = int(limit)
            if limit < 1:
                limit = 10
            elif limit > 50:
                limit = 50
        except (ValueError, TypeError):
            limit = 10

        try:
            products = Product.objects.select_related('category').filter(
                Q(name__icontains=query) |
                Q(description__icontains=query) |
                Q(category__name__icontains=query),
                is_in_stock=True,
                is_deleted=False
            )[:limit]

            serializer = ProductListSerializer(products, many=True)
            return Response({'count': len(products), 'query': query, 'results': serializer.data})
        except Exception as e:
            print(f"Error in search: {str(e)}")
            return Response({'error': 'Có lỗi xảy ra khi tìm kiếm', 'results': []},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ---------- Admin product list/create with annotations ----------
class AdminProductListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        # Subquery to fetch latest image_url per product
        primary_image_subq = Subquery(
            ProductImage.objects
                .filter(product=OuterRef('pk'))
                .order_by('-created_at')
                .values('image_url')[:1]
        )

        qs = (
            Product.objects
                .filter(is_deleted=False)
                .select_related('category')
                .annotate(
                    average_rating=Avg('reviews__rating'),
                    review_count=Count('reviews'),
                    primary_image=primary_image_subq
                )
                .order_by('-created_at')
        )
        return qs

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={'request': request})
        if not serializer.is_valid():
            logger.warning("Admin product create validation error: %s", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        try:
            with transaction.atomic():
                instance = serializer.save()
        except IntegrityError as e:
            logger.exception("IntegrityError creating product: %s", e)
            return Response({'detail': 'Database error: duplicate or invalid field', 'error': str(e)},
                            status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.exception("Unexpected error creating product: %s", e)
            return Response({'detail': 'Unexpected server error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        out = ProductListSerializer(instance, context={'request': request})
        return Response(out.data, status=status.HTTP_201_CREATED)
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ProductCreateUpdateSerializer
        return ProductListSerializer


class AdminProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Product.objects.all()
    permission_classes = [IsAdminUser]
    lookup_field = "slug"

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return ProductCreateUpdateSerializer
        return ProductDetailSerializer

    def perform_destroy(self, instance):
        instance.is_deleted = True
        instance.deleted_at = timezone.now()
        instance.save()


class AdminProductRestoreView(CsrfExemptAPIView, APIView):
    permission_classes = [IsAdminUser]

    def post(self, request, pk):
        try:
            product = Product.objects.get(pk=pk)
        except Product.DoesNotExist:
            return Response({'detail': 'Không tìm thấy sản phẩm.'}, status=status.HTTP_404_NOT_FOUND)

        if not product.is_deleted:
            return Response({'detail': 'Sản phẩm này chưa bị xóa.'}, status=status.HTTP_400_BAD_REQUEST)

        product.is_deleted = False
        product.deleted_at = None
        product.save()
        return Response({'detail': 'Khôi phục sản phẩm thành công!'}, status=status.HTTP_200_OK)


# --------- Product Rating API ---------
class ProductRatingListCreateView(generics.ListCreateAPIView):
    serializer_class = ProductRatingSerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_queryset(self):
        return ProductRating.objects.filter(product_id=self.kwargs['product_id'])

    def perform_create(self, serializer):
        product = Product.objects.get(pk=self.kwargs['product_id'])
        user = self.request.user
        if ProductRating.objects.filter(product=product, user=user).exists():
            raise ValidationError("Bạn đã đánh giá sản phẩm này rồi.")
        serializer.save(user=user, product=product)


class ProductRatingDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ProductRatingDetailSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ProductRating.objects.filter(
            product_id=self.kwargs['product_id'],
            user=self.request.user
        )

    def perform_update(self, serializer):
        if serializer.instance.user != self.request.user:
            raise PermissionDenied("Bạn chỉ có thể sửa đánh giá của chính mình.")
        serializer.save()


class ProductQuestionListCreateView(CsrfExemptAPIView, generics.ListCreateAPIView):
    """
    Public Endpoint:
    GET: List questions for a product (slug)
    POST: Ask a question (no login required)
    """
    serializer_class = ProductQuestionSerializer
    permission_classes = [AllowAny]
    pagination_class = ProductPagination # Reuse existing pagination

    def get_queryset(self):
        slug = self.kwargs.get('slug')
        # Return questions for this product, ordered by newest
        return ProductQuestion.objects.filter(product__slug=slug).order_by('-created_at')

    def perform_create(self, serializer):
        slug = self.kwargs.get('slug')
        try:
            product = Product.objects.get(slug=slug)
            serializer.save(product=product)
        except Product.DoesNotExist:
            raise ValidationError("Product not found.")

class AdminQuestionListView(generics.ListAPIView):
    """
    Admin Endpoint:
    GET: List ALL questions from ALL products. 
    Can filter by status=unanswered
    """
    queryset = ProductQuestion.objects.select_related('product', 'product__category').all().order_by('answer', '-created_at')
    serializer_class = AdminProductQuestionSerializer
    permission_classes = [IsAdminUser]
    pagination_class = ProductPagination

    def get_queryset(self):
        qs = super().get_queryset()
        # Filter: ?status=unanswered
        status_param = self.request.query_params.get('status')
        if status_param == 'unanswered':
            qs = qs.filter(Q(answer__isnull=True) | Q(answer=''))
        
        # Search: ?search=keyword
        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(
                Q(content__icontains=search) | 
                Q(author_name__icontains=search) |
                Q(product__name__icontains=search)
            )
        
        return qs

class AdminQuestionDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Admin Endpoint:
    PATCH: Reply to a question (update 'answer' field)
    DELETE: Remove a spam question
    """
    queryset = ProductQuestion.objects.all()
    serializer_class = AdminProductQuestionSerializer
    permission_classes = [IsAdminUser]