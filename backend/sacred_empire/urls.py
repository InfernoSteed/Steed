"""
URL configuration for The Sacred Empire project.
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),

    # API Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),

    # API v1 Endpoints
    path('api/v1/auth/', include('apps.accounts.urls')),
    path('api/v1/characters/', include('apps.core.urls')),
    path('api/v1/crimes/', include('apps.crimes.urls')),
    path('api/v1/economy/', include('apps.economy.urls')),
    path('api/v1/social/', include('apps.social.urls')),
    path('api/v1/combat/', include('apps.combat.urls')),
    path('api/v1/territory/', include('apps.territory.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# Custom admin site configuration
admin.site.site_header = "The Sacred Empire Administration"
admin.site.site_title = "Sacred Empire Admin"
admin.site.index_title = "Welcome to The Sacred Empire Administration"
