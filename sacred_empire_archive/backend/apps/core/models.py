"""
Core game models for The Sacred Empire.

Includes Character, Statistics, and progression systems.
"""

from django.db import models
from django.conf import settings
from django.utils import timezone
from datetime import timedelta


class Character(models.Model):
    """
    Player character profile and game state.

    One-to-one relationship with User model.
    """

    RANK_CHOICES = [
        ('Associate', 'Associate'),
        ('Soldier', 'Soldier'),
        ('Caporegime', 'Caporegime'),
        ('Underboss', 'Underboss'),
        ('Boss', 'Boss'),
    ]

    GENDER_CHOICES = [
        ('male', 'Male'),
        ('female', 'Female'),
        ('undisclosed', 'Prefer not to say'),
    ]

    # Foreign Keys
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='character'
    )

    # Profile Information
    display_name = models.CharField(max_length=100)
    bio = models.TextField(blank=True, default='')
    avatar_url = models.URLField(max_length=500, null=True, blank=True)
    gender = models.CharField(max_length=20, choices=GENDER_CHOICES, default='undisclosed')

    # Progression
    level = models.IntegerField(default=1)
    experience = models.BigIntegerField(default=0)
    rank = models.CharField(max_length=50, choices=RANK_CHOICES, default='Associate')

    # Resources
    cash = models.BigIntegerField(default=1000)  # Starting cash from settings
    banked_cash = models.BigIntegerField(default=0)

    # Location (will add FK to cities later)
    # current_city = models.ForeignKey('territory.City', on_delete=models.SET_NULL, null=True)
    # current_state = models.ForeignKey('territory.State', on_delete=models.SET_NULL, null=True)

    # Status Effects
    in_hospital = models.BooleanField(default=False)
    hospital_until = models.DateTimeField(null=True, blank=True)
    in_jail = models.BooleanField(default=False)
    jail_until = models.DateTimeField(null=True, blank=True)

    # New Player Protection
    safe_harbor_until = models.DateTimeField(
        default=lambda: timezone.now() + timedelta(days=7)
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_active = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'characters'
        verbose_name = 'Character'
        verbose_name_plural = 'Characters'
        ordering = ['-level', '-experience']

    def __str__(self):
        return f"{self.display_name} (Level {self.level})"

    @property
    def safe_harbor_active(self):
        """Check if character is still in safe harbor protection."""
        return timezone.now() < self.safe_harbor_until

    @property
    def total_wealth(self):
        """Total wealth (cash + banked)."""
        return self.cash + self.banked_cash

    def check_level_up(self):
        """
        Check if character should level up based on experience.

        Returns:
            bool: True if character leveled up
        """
        required_xp = self.get_xp_for_next_level()
        leveled_up = False

        while self.experience >= required_xp and self.level < 100:
            self.level += 1
            leveled_up = True

            # Grant level-up bonus cash
            bonus_cash = 100 * self.level
            self.cash += bonus_cash

            # Check for rank advancement
            self.check_rank_advancement()

            # Get XP for next level
            required_xp = self.get_xp_for_next_level()

        if leveled_up:
            self.save()

        return leveled_up

    def get_xp_for_next_level(self):
        """
        Calculate XP required for next level.

        Returns:
            int: XP required to reach next level
        """
        next_level = self.level + 1

        if next_level <= 10:
            return next_level * 100
        elif next_level <= 25:
            return 1000 + (next_level - 10) * 250
        elif next_level <= 50:
            return 4750 + (next_level - 25) * 500
        elif next_level <= 75:
            return 17250 + (next_level - 50) * 1000
        else:
            return 42250 + (next_level - 75) * 2500

    def check_rank_advancement(self):
        """Update rank based on current level."""
        if self.level >= 76:
            self.rank = 'Boss'
        elif self.level >= 51:
            self.rank = 'Underboss'
        elif self.level >= 26:
            self.rank = 'Caporegime'
        elif self.level >= 11:
            self.rank = 'Soldier'
        else:
            self.rank = 'Associate'

    def add_experience(self, amount):
        """
        Add experience and check for level up.

        Args:
            amount (int): Amount of XP to add

        Returns:
            bool: True if character leveled up
        """
        self.experience += amount
        leveled_up = self.check_level_up()
        if not leveled_up:
            self.save(update_fields=['experience'])
        return leveled_up

    def send_to_hospital(self, minutes):
        """
        Send character to hospital for specified duration.

        Args:
            minutes (int): Number of minutes in hospital
        """
        self.in_hospital = True
        self.hospital_until = timezone.now() + timedelta(minutes=minutes)
        self.save(update_fields=['in_hospital', 'hospital_until'])

    def send_to_jail(self, minutes):
        """
        Send character to jail for specified duration.

        Args:
            minutes (int): Number of minutes in jail
        """
        self.in_jail = True
        self.jail_until = timezone.now() + timedelta(minutes=minutes)
        self.save(update_fields=['in_jail', 'jail_until'])

    def release_from_hospital(self):
        """Release character from hospital."""
        self.in_hospital = False
        self.hospital_until = None
        self.save(update_fields=['in_hospital', 'hospital_until'])

    def release_from_jail(self):
        """Release character from jail."""
        self.in_jail = False
        self.jail_until = None
        self.save(update_fields=['in_jail', 'jail_until'])


class CharacterStatistics(models.Model):
    """
    Detailed tracking of player actions and achievements.

    One-to-one relationship with Character.
    """

    character = models.OneToOneField(
        Character,
        on_delete=models.CASCADE,
        related_name='statistics'
    )

    # Crime Statistics
    total_crimes = models.IntegerField(default=0)
    successful_crimes = models.IntegerField(default=0)
    failed_crimes = models.IntegerField(default=0)
    solo_crimes = models.IntegerField(default=0)
    multiplayer_crimes = models.IntegerField(default=0)  # Phase 2
    organized_crimes = models.IntegerField(default=0)    # Phase 2
    best_crime_streak = models.IntegerField(default=0)

    # Combat Statistics (Phase 2)
    total_attacks = models.IntegerField(default=0)
    successful_attacks = models.IntegerField(default=0)
    failed_attacks = models.IntegerField(default=0)
    times_attacked = models.IntegerField(default=0)
    times_defended = models.IntegerField(default=0)
    kills = models.IntegerField(default=0)
    deaths = models.IntegerField(default=0)

    # Economic Statistics
    total_earned = models.BigIntegerField(default=0)
    total_spent = models.BigIntegerField(default=0)
    items_bought = models.IntegerField(default=0)
    items_sold = models.IntegerField(default=0)
    highest_cash_amount = models.BigIntegerField(default=0)

    # Social Statistics
    crews_joined = models.IntegerField(default=0)
    crews_created = models.IntegerField(default=0)
    messages_sent = models.IntegerField(default=0)
    messages_received = models.IntegerField(default=0)
    forum_posts = models.IntegerField(default=0)  # Phase 2

    # Milestones
    first_crime_at = models.DateTimeField(null=True, blank=True)
    last_crime_at = models.DateTimeField(null=True, blank=True)
    first_kill_at = models.DateTimeField(null=True, blank=True)  # Phase 2
    max_level_reached = models.IntegerField(default=1)

    # Timestamps
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'character_statistics'
        verbose_name = 'Character Statistics'
        verbose_name_plural = 'Character Statistics'

    def __str__(self):
        return f"Stats for {self.character.display_name}"

    @property
    def crime_success_rate(self):
        """Calculate overall crime success rate."""
        if self.total_crimes == 0:
            return 0.0
        return (self.successful_crimes / self.total_crimes) * 100

    def record_crime_attempt(self, success=True):
        """
        Record a crime attempt.

        Args:
            success (bool): Whether the crime was successful
        """
        self.total_crimes += 1
        self.solo_crimes += 1

        if success:
            self.successful_crimes += 1
        else:
            self.failed_crimes += 1

        # Update timestamps
        if not self.first_crime_at:
            self.first_crime_at = timezone.now()
        self.last_crime_at = timezone.now()

        self.save()


class EquippedLoadout(models.Model):
    """
    Currently equipped items for a character.

    Cached stats for performance in combat calculations.
    """

    character = models.OneToOneField(
        Character,
        on_delete=models.CASCADE,
        related_name='loadout'
    )

    # Equipment Slots (will add FKs to Item model in economy app)
    # weapon = models.ForeignKey('economy.Item', on_delete=models.SET_NULL, null=True, related_name='+')
    # vehicle = models.ForeignKey('economy.Item', on_delete=models.SET_NULL, null=True, related_name='+')
    # armor_head = models.ForeignKey('economy.Item', on_delete=models.SET_NULL, null=True, related_name='+')
    # armor_body = models.ForeignKey('economy.Item', on_delete=models.SET_NULL, null=True, related_name='+')
    # armor_legs = models.ForeignKey('economy.Item', on_delete=models.SET_NULL, null=True, related_name='+')

    # Cached Combat Stats
    total_attack = models.IntegerField(default=0)
    total_defense = models.IntegerField(default=0)
    vehicle_speed = models.IntegerField(default=0)

    # Timestamps
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'equipped_loadout'
        verbose_name = 'Equipped Loadout'
        verbose_name_plural = 'Equipped Loadouts'

    def __str__(self):
        return f"Loadout for {self.character.display_name}"

    def recalculate_stats(self):
        """
        Recalculate total attack and defense from equipped items.

        Will be implemented when Item model is available.
        """
        # TODO: Implement when economy.Item model is available
        pass
