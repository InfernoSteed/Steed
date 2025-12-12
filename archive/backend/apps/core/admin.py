"""
Admin configuration for core app.
"""

from django.contrib import admin
from .models import Character, CharacterStatistics, EquippedLoadout


class CharacterStatisticsInline(admin.StackedInline):
    """Inline admin for character statistics."""
    model = CharacterStatistics
    can_delete = False
    fields = (
        'total_crimes', 'successful_crimes', 'failed_crimes',
        'total_earned', 'total_spent',
        'crews_joined', 'messages_sent',
        'first_crime_at', 'last_crime_at'
    )
    readonly_fields = fields


class EquippedLoadoutInline(admin.StackedInline):
    """Inline admin for equipped loadout."""
    model = EquippedLoadout
    can_delete = False
    fields = ('total_attack', 'total_defense', 'vehicle_speed')


@admin.register(Character)
class CharacterAdmin(admin.ModelAdmin):
    """Admin interface for Character model."""

    list_display = (
        'display_name',
        'user',
        'level',
        'rank',
        'cash',
        'in_hospital',
        'in_jail',
        'created_at'
    )
    list_filter = ('rank', 'in_hospital', 'in_jail', 'gender')
    search_fields = ('display_name', 'user__username', 'user__email')
    ordering = ('-level', '-experience')

    fieldsets = (
        ('Profile', {
            'fields': ('user', 'display_name', 'bio', 'avatar_url', 'gender')
        }),
        ('Progression', {
            'fields': ('level', 'experience', 'rank')
        }),
        ('Resources', {
            'fields': ('cash', 'banked_cash')
        }),
        ('Status', {
            'fields': (
                'in_hospital', 'hospital_until',
                'in_jail', 'jail_until',
                'safe_harbor_until'
            )
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'last_active')
        }),
    )

    readonly_fields = ('created_at', 'updated_at')
    inlines = [CharacterStatisticsInline, EquippedLoadoutInline]


@admin.register(CharacterStatistics)
class CharacterStatisticsAdmin(admin.ModelAdmin):
    """Admin interface for CharacterStatistics model."""

    list_display = (
        'character',
        'total_crimes',
        'successful_crimes',
        'total_earned',
        'crews_joined'
    )
    search_fields = ('character__display_name', 'character__user__username')
    readonly_fields = ('updated_at',)
