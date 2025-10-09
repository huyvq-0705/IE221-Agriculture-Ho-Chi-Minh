from django.urls import path
from .views import UserView

urlpatterns = [
    path("api/users/me/", UserView.as_view(), name="current_user_info")
]
