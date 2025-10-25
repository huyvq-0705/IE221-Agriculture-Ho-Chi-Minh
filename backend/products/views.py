from __future__ import annotations
from time import timezone
from django.db.models import Q
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.pagination import PageNumberPagination
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Category, Product
from .serializers import (
    CategorySerializer,
    ProductListSerializer,
    ProductDetailSerializer,
    ProductCreateUpdateSerializer,
    ProductSoftDeleteSerializer,
)

class ProductPagination(PageNumberPagination):
    page_size = 12
    page_size_query_param = "page_size"
    max_page_size = 50

# --------- Base class để bỏ qua CSRF ---------
@method_decorator(csrf_exempt, name="dispatch")
class CsrfExemptAPIView(APIView):
    pass


# --------- Category API ---------
class CategoryListAPIView(generics.ListAPIView):
    """Chỉ dùng để GET tất cả category"""
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]
    queryset = Category.objects.all().order_by("name")


class CategoryListCreateView(CsrfExemptAPIView, generics.ListCreateAPIView):
    """GET toàn bộ category hoặc POST tạo mới"""
    queryset = Category.objects.all().order_by("name")
    serializer_class = CategorySerializer
    permission_classes = [IsAdminUser]


class CategoryDetailView(CsrfExemptAPIView, generics.RetrieveUpdateDestroyAPIView):
    """GET 1 category, PUT/PATCH update, DELETE"""
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAdminUser]
    lookup_field = "slug"


# --------- Product API ---------
class ProductListAPIView(CsrfExemptAPIView, generics.ListAPIView):
    """Danh sách sản phẩm, có filter, search, ordering"""
    serializer_class = ProductListSerializer
    pagination_class = ProductPagination
    permission_classes = [AllowAny]


    def get_queryset(self):
            queryset = Product.objects.select_related("category").filter(
                is_in_stock=True, is_deleted=False
            )

            # Filter by category - HỖ TRỢ CẢ SLUG VÀ ID
            category_param = self.request.query_params.get("category")
            if category_param:
                # Thử filter theo slug trước
                category_filtered = queryset.filter(category__slug=category_param)
                
                # Nếu không có kết quả, thử filter theo ID
                if not category_filtered.exists():
                    try:
                        category_filtered = queryset.filter(category_id=int(category_param))
                    except (ValueError, TypeError):
                        pass
                
                # Nếu có kết quả từ bất kỳ cách nào, dùng nó
                if category_filtered.exists():
                    queryset = category_filtered
                else:
                    # Không tìm thấy category -> trả về empty queryset
                    queryset = queryset.none()

            # Search by name or description
            search = self.request.query_params.get("search")
            if search:
                queryset = queryset.filter(
                    Q(name__icontains=search) | Q(description__icontains=search)
                )

            # Price range filter
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

            # Ordering
            ordering = self.request.query_params.get("ordering", "-created_at")
            valid_orderings = [
                "name", "-name",
                "price", "-price",
                "created_at", "-created_at",
            ]
            if ordering in valid_orderings:
                queryset = queryset.order_by(ordering)
            else:
                queryset = queryset.order_by("-created_at")

            return queryset


class ProductDetailAPIView(CsrfExemptAPIView, generics.RetrieveAPIView):
    """Chi tiết 1 sản phẩm"""
    serializer_class = ProductDetailSerializer
    permission_classes = [AllowAny]
    lookup_field = "slug"

    def get_queryset(self):
        return Product.objects.select_related("category").filter(is_deleted=False)

class InstantProductSearchAPIView(CsrfExemptAPIView, APIView):
    """
    API cho tìm kiếm instant products
    Query params:
    - q: từ khóa tìm kiếm (required)
    - limit: số lượng kết quả (default: 10, max: 50)
    """
    permission_classes = [AllowAny]

    def get(self, request):
        # Lấy từ khóa tìm kiếm
        query = request.query_params.get('q', '').strip()
        limit = request.query_params.get('limit', 10)
        
        # Validate query
        if not query or len(query) < 2:
            return Response(
                {
                    'error': 'Vui lòng nhập ít nhất 2 ký tự',
                    'results': []
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate limit
        try:
            limit = int(limit)
            if limit < 1:
                limit = 10
            elif limit > 50:
                limit = 50
        except (ValueError, TypeError):
            limit = 10

        try:
            # Tìm kiếm trong name, description, category name
            products = Product.objects.select_related('category').filter(
                Q(name__icontains=query) |
                Q(description__icontains=query) |
                Q(category__name__icontains=query),
                is_in_stock=True,
                is_deleted=False
            )[:limit]

            # Serialize data
            serializer = ProductListSerializer(products, many=True)

            return Response(
                {
                    'count': len(products),
                    'query': query,
                    'results': serializer.data
                },
                status=status.HTTP_200_OK
            )

        except Exception as e:
            print(f"Error in search: {str(e)}")
            return Response(
                {
                    'error': 'Có lỗi xảy ra khi tìm kiếm',
                    'results': []
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class AdminProductListCreateView(generics.ListCreateAPIView):
    """
    API cho admin: xem danh sách sản phẩm và thêm mới
    GET  → Danh sách sản phẩm (đầy đủ thông tin)
    POST → Tạo sản phẩm mới
    """
    queryset = Product.objects.filter(is_deleted=False).order_by('-created_at')
    permission_classes = [IsAdminUser]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ProductCreateUpdateSerializer
        return ProductListSerializer


# -------- DETAIL + UPDATE + SOFT DELETE (admin/products/<pk>/) --------
class AdminProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    API cho admin: xem chi tiết, cập nhật hoặc xóa mềm sản phẩm
    GET    → xem chi tiết
    PUT    → cập nhật toàn bộ
    PATCH  → cập nhật 1 phần
    DELETE → xóa mềm sản phẩm
    """
    queryset = Product.objects.all()
    permission_classes = [IsAdminUser]
    lookup_field = "slug"

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return ProductCreateUpdateSerializer
        return ProductDetailSerializer

    def perform_destroy(self, instance):
        """
        Ghi đè DELETE để thực hiện 'soft delete' thay vì xóa cứng.
        """
        instance.is_deleted = True
        instance.deleted_at = timezone.now()
        instance.save()


# -------- RESTORE sản phẩm đã xóa (tuỳ chọn thêm API này) --------

class AdminProductRestoreView(CsrfExemptAPIView, APIView):
    """
    POST /api/admin/products/<pk>/restore/
    → Khôi phục sản phẩm bị xóa mềm
    """
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
