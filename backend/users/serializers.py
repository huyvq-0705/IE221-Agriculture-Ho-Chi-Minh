from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 
            'phone_number', 'gender', 'date_of_birth', 'address', 'avatar',
            'date_joined',
        ]
        
        read_only_fields = [
            'id', 'date_joined'
        ]

    def validate(self, attrs):
        current_user = self.instance

        if 'email' in attrs and attrs['email'] != current_user.email:
            if User.objects.filter(email=attrs['email']).exists():
                raise serializers.ValidationError({'email': 'Email already exists'})
                
        return attrs
