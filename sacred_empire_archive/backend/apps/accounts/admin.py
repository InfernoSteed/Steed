"""
Admin configuration for accounts app.
"""

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Admin interface for User model."""

    list_display = (
        'username',
        'email',
        'is_vip',
        'points',
        'is_staff',
        'is_active',
        'date_joined'
    )
    list_filter = ('is_staff', 'is_superuser', 'is_active', 'vip_status')
    search_fields = ('username', 'email', 'first_name', 'last_name')
    ordering = ('-date_joined',)

    fieldsets = BaseUserAdmin.fieldsets + (
        ('Premium Status', {
            'fields': ('vip_status', 'vip_expiry', 'points')
        }),
        ('Security', {
            'fields': ('ip_address', 'failed_login_attempts', 'locked_until')
        }),
        ('Verification', {
            'fields': ('email_verified', 'verification_token')
        }),
    )

    readonly_fields = ('created_at', 'updated_at')
