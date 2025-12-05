"""
URL configuration for accounts app.
"""

from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    RegisterView,
    login_view,
    current_user_view,
    ChangePasswordView
)

app_name = 'accounts'

urlpatterns = [
    # Authentication
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', login_view, name='login'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # User Profile
    path('me/', current_user_view, name='current-user'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
]
