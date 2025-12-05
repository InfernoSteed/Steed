"""
Views for core game functionality.
"""

from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.core.cache import cache
from drf_spectacular.utils import extend_schema

from .models import Character
from .serializers import CharacterSerializer, CharacterListSerializer


class CharacterDetailView(generics.RetrieveUpdateAPIView):
    """
    Get or update current user's character profile.
    """
    serializer_class = CharacterSerializer
    permission_classes = (IsAuthenticated,)

    def get_object(self):
        """Return current user's character."""
        return self.request.user.character

    @extend_schema(
        responses={200: CharacterSerializer},
        description="Get current user's character profile"
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    @extend_schema(
        request=CharacterSerializer,
        responses={200: CharacterSerializer},
        description="Update current user's character profile"
    )
    def patch(self, request, *args, **kwargs):
        return super().patch(request, *args, **kwargs)


@extend_schema(
    responses={200: CharacterListSerializer(many=True)},
    description="Get leaderboard rankings by level"
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def leaderboard_view(request):
    """
    Get leaderboard rankings.

    Cached for 15 minutes for performance.
    """
    cache_key = 'leaderboard_top_100'
    cached_data = cache.get(cache_key)

    if cached_data:
        return Response(cached_data)

    # Get top 100 characters by level and experience
    top_characters = Character.objects.select_related('user').order_by(
        '-level', '-experience'
    )[:100]

    serializer = CharacterListSerializer(top_characters, many=True)
    data = serializer.data

    # Add ranking
    for idx, char in enumerate(data):
        char['rank'] = idx + 1

    # Cache for 15 minutes
    cache.set(cache_key, data, 900)

    return Response(data)


@extend_schema(
    responses={200: CharacterSerializer},
    description="Get character profile by ID"
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def character_profile_view(request, character_id):
    """
    Get character profile by ID.

    Public information only.
    """
    try:
        character = Character.objects.select_related('user', 'statistics').get(
            id=character_id
        )
    except Character.DoesNotExist:
        return Response(
            {'error': 'Character not found'},
            status=status.HTTP_404_NOT_FOUND
        )

    serializer = CharacterSerializer(character)
    return Response(serializer.data)
