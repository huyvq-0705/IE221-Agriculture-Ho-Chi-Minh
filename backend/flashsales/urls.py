from rest_framework.routers import DefaultRouter
from .views import FlashSaleViewSet

router = DefaultRouter()
router.register(r'flashsales', FlashSaleViewSet, basename='flashsale')

urlpatterns = router.urls
