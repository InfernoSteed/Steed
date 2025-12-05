"""
Signals for automatic creation of related models.
"""

from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings

from .models import Character, CharacterStatistics, EquippedLoadout


@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_character_profile(sender, instance, created, **kwargs):
    """
    Automatically create Character profile when User is created.

    Args:
        sender: User model
        instance: User instance
        created: Boolean indicating if this is a new user
    """
    if created:
        # Create character with username as display name initially
        character = Character.objects.create(
            user=instance,
            display_name=instance.username,
            cash=settings.GAME_SETTINGS['NEW_PLAYER_STARTING_CASH']
        )

        # Create statistics
        CharacterStatistics.objects.create(character=character)

        # Create equipped loadout
        EquippedLoadout.objects.create(character=character)


@receiver(post_save, sender=Character)
def update_max_level_statistics(sender, instance, **kwargs):
    """
    Update max_level_reached in statistics when character levels up.

    Args:
        sender: Character model
        instance: Character instance
    """
    try:
        stats = instance.statistics
        if instance.level > stats.max_level_reached:
            stats.max_level_reached = instance.level
            stats.save(update_fields=['max_level_reached'])
    except CharacterStatistics.DoesNotExist:
        # Statistics not created yet (happens during initial creation)
        pass
