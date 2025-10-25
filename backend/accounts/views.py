from rest_framework import generics, status
from django.db import transaction
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import RegisterSerializer, LoginSerializer, AdminLoginSerializer, OTPVerifySerializer, OTPResendSerializer
from django.contrib.auth import authenticate, get_user_model
from backend import settings
import requests, random, string

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    USERNAME_SUFFIX_LEN = 4
    OTP_SEND_TIMEOUT = 10  # seconds

    def _unique_suffix(self, n=USERNAME_SUFFIX_LEN):
        return ''.join(random.choices(string.ascii_lowercase + string.digits, k=n))

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        email = data['email'].lower()
        username = data['username']
        raw_password = data['password']

        # optional profile fields
        first_name = data.get("first_name", "")
        last_name = data.get("last_name", "")
        phone_number = data.get("phone_number", "")

        # Defensive: reject if ACTIVE user already exists
        if User.objects.filter(email=email, is_active=True).exists():
            return Response({"error": "Email này đã được sử dụng."}, status=status.HTTP_400_BAD_REQUEST)
        if User.objects.filter(username=username, is_active=True).exists():
            return Response({"error": "Username này đã tồn tại."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            with transaction.atomic():
                try:
                    # update existing inactive user with same email
                    user = User.objects.get(email=email, is_active=False)

                    # attempt to set requested username (handle collision)
                    if user.username != username:
                        if User.objects.filter(username=username).exclude(pk=user.pk).exists():
                            username = f"{username}_{self._unique_suffix()}"
                        user.username = username

                    user.first_name = first_name or user.first_name
                    user.last_name = last_name or user.last_name
                    if phone_number:
                        try:
                            setattr(user, "phone_number", phone_number)
                        except Exception:
                            pass

                    user.set_password(raw_password)  # securely hash
                    # keep is_active False until OTP verification
                    user.save()

                except User.DoesNotExist:
                    # create new inactive user (ensure username unique)
                    if User.objects.filter(username=username).exists():
                        username = f"{username}_{self._unique_suffix()}"

                    user = User.objects.create_user(
                        username=username,
                        email=email,
                        password=raw_password,
                        is_active=False,
                        first_name=first_name,
                        last_name=last_name,
                    )
                    if phone_number:
                        try:
                            setattr(user, "phone_number", phone_number)
                            user.save(update_fields=["phone_number"])
                        except Exception:
                            pass

                # Send OTP via Auth0 (same as before)
                auth0_domain = settings.AUTH0_DOMAIN
                auth0_client_id = settings.AUTH0_CLIENT_ID

                payload = {
                    "client_id": auth0_client_id,
                    "connection": "email",
                    "email": user.email,
                    "send": "code"
                }

                try:
                    response = requests.post(
                        f"https://{auth0_domain}/passwordless/start",
                        json=payload,
                        timeout=self.OTP_SEND_TIMEOUT
                    )
                    response.raise_for_status()
                except requests.RequestException:
                    # keep the inactive user but inform client
                    return Response(
                        {"error": "Không thể gửi OTP. Vui lòng thử lại sau."},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR
                    )

                return Response(
                    {"message": "OTP đã được gửi. Vui lòng kiểm tra email để nhập mã xác thực."},
                    status=status.HTTP_201_CREATED
                )

        except Exception:
            return Response({"error": "Lỗi server."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



class VerifyOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = OTPVerifySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email']
        otp = serializer.validated_data['otp']
        
        auth0_domain = settings.AUTH0_DOMAIN
        auth0_client_id = settings.AUTH0_CLIENT_ID
        auth0_client_secret = settings.AUTH0_CLIENT_SECRET

        payload = {
            "grant_type": "http://auth0.com/oauth/grant-type/passwordless/otp",
            "client_id": auth0_client_id,
            "client_secret": auth0_client_secret,
            "username": email,
            "otp": otp,
            "realm": "email",
            "scope": "openid profile email"
        }
        
        try:
            response = requests.post(
                f"https://{auth0_domain}/oauth/token",
                json=payload
            )

            if not response.ok:
                print("Lỗi từ Auth0:", response.json())
                return Response(
                    {"error": "Mã OTP không hợp lệ hoặc đã hết hạn."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            try:
                user = User.objects.get(email=email, is_active=False)
                user.is_active = True
                user.save()
            except User.DoesNotExist:
                return Response(
                    {"error": "Tài khoản không tồn tại hoặc đã được kích hoạt."},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            return Response(
                {"message": "Xác thực thành công. Tài khoản đã được kích hoạt."},
                status=status.HTTP_200_OK
            )
            
        except requests.RequestException:
            return Response(
                {"error": "Lỗi khi kết nối đến dịch vụ xác thực."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        

class ResendOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = OTPResendSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data['email']

        try:
            user = User.objects.get(email=email, is_active=False)
        except User.DoesNotExist:
            return Response(
                {"error": "Tài khoản không tồn tại hoặc đã được kích hoạt."},
                status=status.HTTP_404_NOT_FOUND
            )

        auth0_domain = settings.AUTH0_DOMAIN
        auth0_client_id = settings.AUTH0_CLIENT_ID
        
        payload = {
            "client_id": auth0_client_id,
            "connection": "email",
            "email": user.email,
            "send": "code"
        }
        
        try:
            response = requests.post(
                f"https://{auth0_domain}/passwordless/start",
                json=payload
            )
            response.raise_for_status()
        
        except requests.RequestException:
            return Response(
                {"error": "Không thể gửi lại OTP. Vui lòng thử lại sau."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        return Response(
            {"message": "Đã gửi lại mã OTP. Vui lòng kiểm tra email của bạn."},
            status=status.HTTP_200_OK
        )


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]

        refresh = RefreshToken.for_user(user)
        return Response({
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
            },
        }, status=status.HTTP_200_OK)


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"message": "Logout successful"}, status=status.HTTP_200_OK)
        except Exception:
            return Response({"error": "Invalid token"}, status=status.HTTP_400_BAD_REQUEST)


class AdminLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = AdminLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]

        refresh = RefreshToken.for_user(user)
        return Response({
            'message': 'Admin login successful',
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'is_superuser': user.is_superuser
            }
        }, status=status.HTTP_200_OK)
