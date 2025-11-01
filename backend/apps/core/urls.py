"""
URL configuration for core app.
"""

from django.urls import path
from .views import (
    CharacterDetailView,
    leaderboard_view,
    character_profile_view
)

app_name = 'core'

urlpatterns = [
    # Character Management
    path('me/', CharacterDetailView.as_view(), name='character-detail'),
    path('<int:character_id>/', character_profile_view, name='character-profile'),

    # Leaderboards
    path('leaderboard/', leaderboard_view, name='leaderboard'),
]
