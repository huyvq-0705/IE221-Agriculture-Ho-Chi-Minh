from django.urls import path
from .views import RegisterView, LoginView, LogoutView, AdminLoginView

urlpatterns = [
    path("api/register/", RegisterView.as_view(), name="register"),
    path("api/login/", LoginView.as_view(), name="login"),
    path("api/logout/", LogoutView.as_view(), name="logout"),
    path("api/agrihcmAdmin/login/", AdminLoginView.as_view(), name="admin_login"),
]
