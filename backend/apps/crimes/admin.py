"""Admin configuration for the crimes app."""

from django.contrib import admin

from . import models


@admin.register(models.CrimeType)
class CrimeTypeAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "category",
        "difficulty",
        "base_success_rate",
        "base_cash_reward",
        "is_active",
    )
    list_filter = ("category", "is_active")
    search_fields = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}


@admin.register(models.CrimeHistory)
class CrimeHistoryAdmin(admin.ModelAdmin):
    list_display = (
        "character",
        "crime_type",
        "success",
        "cash_earned",
        "xp_earned",
        "attempted_at",
    )
    list_filter = ("success", "crime_type__category")
    search_fields = ("character__display_name", "crime_type__name")
    autocomplete_fields = ("character", "crime_type")
    date_hierarchy = "attempted_at"


@admin.register(models.CrimeCooldown)
class CrimeCooldownAdmin(admin.ModelAdmin):
    list_display = ("character", "crime_type", "last_attempted", "can_attempt_at")
    search_fields = ("character__display_name", "crime_type__name")
    autocomplete_fields = ("character", "crime_type")


@admin.register(models.DailyCrimeCount)
class DailyCrimeCountAdmin(admin.ModelAdmin):
    list_display = (
        "character",
        "date",
        "solo_crimes_today",
        "multiplayer_crimes_today",
        "organized_crimes_today",
    )
    search_fields = ("character__display_name",)
    list_filter = ("date",)
    autocomplete_fields = ("character",)
