from django.contrib import admin
from .models import Member, Ad

@admin.register(Member)
class MemberAdmin(admin.ModelAdmin):
    list_display = ('id', 'email', 'username', 'is_moderator', 'created_at')
    search_fields = ('email', 'username')
    list_filter = ('is_moderator',)

@admin.register(Ad)
class AdAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'owner', 'status', 'price', 'created_at')
    search_fields = ('title', 'description', 'contacts')
    list_filter = ('status',)
