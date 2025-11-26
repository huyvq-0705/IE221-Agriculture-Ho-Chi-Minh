from celery import shared_task
from django.core.management import call_command

@shared_task
def update_expired_coupons():
    call_command('update_expired_coupons')