from django.core.management.base import BaseCommand
from django.utils import timezone
from coupons.models import Coupon

class Command(BaseCommand):
    help = 'Cập nhật trạng thái coupon hết hạn'

    def handle(self, *args, **options):
        expired_coupons = Coupon.objects.filter(
            expires_at__lt=timezone.now(),
            is_active=True
        )
        count = expired_coupons.update(is_active=False)
        self.stdout.write(
            self.style.SUCCESS(f'Đã cập nhật {count} coupon')
        )