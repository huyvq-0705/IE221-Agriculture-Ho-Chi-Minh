from rest_framework import serializers
from django.contrib.auth import get_user_model, authenticate
from django.contrib.auth.password_validation import validate_password
from rest_framework.validators import UniqueValidator

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(required=True)
    username = serializers.CharField(required=True)
    
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])

    class Meta:
        model = User
        fields = (
            "id", "username", "email", "password",
            "first_name", "last_name", "phone_number", "gender",
            "date_of_birth", "address", "avatar",
        )

    def validate(self, attrs):
        email = attrs['email']
        username = attrs['username']

        # Block only if an ACTIVE user already uses the email/username
        if User.objects.filter(email=email, is_active=True).exists():
            raise serializers.ValidationError("Email này đã được sử dụng.")

        if User.objects.filter(username=username, is_active=True).exists():
            raise serializers.ValidationError("Username này đã tồn tại.")

        # If an inactive user exists, we'll update it in the view (no error here)
        return attrs

        return attrs

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data, is_active=False)
        return user

class OTPVerifySerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=10)
    forgotPassword = serializers.BooleanField(required=False, default=False)

class OTPResendSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    forgotPassword = serializers.BooleanField(required=False, default=False)

class OTPRequestSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(required=True)
    password = serializers.CharField(write_only=True, required=True)

    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')

        if username and password:
            user = authenticate(request=self.context.get('request'),
                                username=username, password=password)

            if not user:
                msg = 'Không thể đăng nhập với thông tin đã cung cấp.'
                raise serializers.ValidationError(msg, code='authorization')
        else:
            msg = 'Phải bao gồm "username" và "password".'
            raise serializers.ValidationError(msg, code='authorization')

        attrs['user'] = user
        return attrs

class AdminLoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')

        if not (username and password):
            raise serializers.ValidationError("Phải bao gồm 'username' và 'password'.")

        user = authenticate(request=self.context.get('request'), 
                              username=username, password=password)

        if not user:
            raise serializers.ValidationError("Thông tin đăng nhập không hợp lệ.")

        if not user.is_superuser:
            raise serializers.ValidationError("Truy cập bị từ chối. Cần có quyền admin.")
        
        attrs['user'] = user
        return attrs
    
class ResetPasswordSerializer(serializers.Serializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
