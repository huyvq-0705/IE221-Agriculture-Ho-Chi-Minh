from .serializers import UserSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from backend import settings
import requests

class UserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
        
    def patch(self, request):
        user = request.user    
        serializer = UserSerializer(user, data=request.data, partial=True)
        
        if serializer.is_valid():
            new_email = serializer.validated_data.get('email')
            is_email_edited = False
            if new_email and new_email.lower() != user.email.lower():
                is_email_edited = True
            
            if is_email_edited:
                user = serializer.save(is_active=False)

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
                        {"error": "Không thể gửi OTP. Vui lòng thử lại sau."},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR
                    )

                return Response(
                    {"message": "Đã gửi mã OTP. Vui lòng kiểm tra email của bạn."},
                    status=status.HTTP_200_OK
                )

            else:
                serializer.save()
            
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
