from rest_framework import serializers
from .models import Member, Ad

class MemberPublicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Member
        fields = ('id', 'email', 'username', 'is_moderator', 'created_at')

class MemberUpdateSerializer(serializers.Serializer):
    username = serializers.CharField(required=False, allow_blank=False, max_length=150)
    password = serializers.CharField(required=False, write_only=True, min_length=6)

    def update(self, instance: Member, validated_data):
        if 'username' in validated_data:
            instance.username = validated_data['username']
        if 'password' in validated_data:
            instance.set_password(validated_data['password'])
        instance.save()
        return instance

class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField()
    username = serializers.CharField(max_length=150)
    password = serializers.CharField(write_only=True, min_length=6)

    def validate_email(self, value):
        if Member.objects.filter(email=value).exists():
            raise serializers.ValidationError('Email already registered')
        return value

    def create(self, validated_data):
        member = Member(email=validated_data['email'], username=validated_data['username'])
        member.set_password(validated_data['password'])
        member.save()
        return member

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

class AdSerializer(serializers.ModelSerializer):
    owner = MemberPublicSerializer(read_only=True)

    class Meta:
        model = Ad
        fields = ('id', 'title', 'description', 'price', 'contacts', 'status', 'owner', 'created_at', 'updated_at')
        read_only_fields = ('status', 'owner', 'created_at', 'updated_at')

class AdCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ad
        fields = ('title', 'description', 'price', 'contacts')
