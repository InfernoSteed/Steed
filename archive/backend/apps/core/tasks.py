"""
Celery tasks for core game systems.
"""

from celery import shared_task
from django.utils import timezone
from .models import Character


@shared_task
def release_hospital_patients():
    """
    Release characters from hospital when their time expires.

    Runs every 5 minutes via Celery Beat.
    """
    characters = Character.objects.filter(
        in_hospital=True,
        hospital_until__lte=timezone.now()
    )

    count = characters.count()
    for character in characters:
        character.release_from_hospital()

    return f"Released {count} characters from hospital"


@shared_task
def release_jail_inmates():
    """
    Release characters from jail when their time expires.

    Runs every 5 minutes via Celery Beat.
    """
    characters = Character.objects.filter(
        in_jail=True,
        jail_until__lte=timezone.now()
    )

    count = characters.count()
    for character in characters:
        character.release_from_jail()

    return f"Released {count} characters from jail"


@shared_task
def update_leaderboards():
    """
    Update leaderboard cache.

    Runs every 15 minutes via Celery Beat.
    """
    from django.core.cache import cache

    # Get top 100 characters
    top_characters = Character.objects.select_related('user').order_by(
        '-level', '-experience'
    )[:100]

    # Prepare leaderboard data
    data = []
    for idx, character in enumerate(top_characters):
        data.append({
            'rank': idx + 1,
            'id': character.id,
            'username': character.user.username,
            'display_name': character.display_name,
            'level': character.level,
            'rank_title': character.rank,
            'avatar_url': character.avatar_url
        })

    # Cache for 15 minutes
    cache.set('leaderboard_top_100', data, 900)

    return f"Updated leaderboard with {len(data)} characters"
