from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework import exceptions

class CookieJWTAuthentication(JWTAuthentication):
    """
    Authenticate by reading the access token from cookie named `accessToken`.
    Returns (user, validated_token) or None.
    """

    def authenticate(self, request):
        raw_token = request.COOKIES.get("accessToken")
        if not raw_token:
            return None

        # `get_validated_token` will raise InvalidToken if token invalid/expired
        try:
            validated_token = self.get_validated_token(raw_token)
        except Exception as exc:
            raise exceptions.AuthenticationFailed(str(exc))

        user = self.get_user(validated_token)
        if user is None:
            raise exceptions.AuthenticationFailed("User not found for token")

        return (user, validated_token)