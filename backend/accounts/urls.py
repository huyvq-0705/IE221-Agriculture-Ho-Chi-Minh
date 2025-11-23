from django.urls import path
from .views import RegisterView, LoginView, LogoutView, AdminLoginView, VerifyOTPView, ResendOTPView, RequestOTPView, ResetPasswordView

urlpatterns = [
    path("api/register/", RegisterView.as_view(), name="register"),
    path("api/verify-otp/", VerifyOTPView.as_view(), name="verify_otp"),
    path("api/resend-otp/", ResendOTPView.as_view(), name="resend_otp"),
    path("api/login/", LoginView.as_view(), name="login"),
    path("api/logout/", LogoutView.as_view(), name="logout"),
    path("api/agrihcmAdmin/login/", AdminLoginView.as_view(), name="admin_login"),
    path("api/request-otp/", RequestOTPView.as_view(), name="request_otp"),
    path("api/reset-password/", ResetPasswordView.as_view(), name="reset_password"),
]
