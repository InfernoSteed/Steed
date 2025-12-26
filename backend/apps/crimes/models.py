"""Crime system models for The Sacred Empire."""

from datetime import timedelta

from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.db.models import Q
from django.utils import timezone


class CrimeType(models.Model):
    """Definition of a crime activity players can attempt."""

    class CrimeCategory(models.TextChoices):
        SOLO = "solo", "Solo"
        MULTIPLAYER = "multiplayer", "Multiplayer"
        ORGANIZED = "organized", "Organized"

    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True)
    description = models.TextField(blank=True, default="")
    category = models.CharField(
        max_length=50,
        choices=CrimeCategory.choices,
        default=CrimeCategory.SOLO,
    )

    difficulty = models.PositiveSmallIntegerField(
        default=1,
        validators=[MinValueValidator(1), MaxValueValidator(10)],
        help_text="Difficulty rating on a 1-10 scale.",
    )
    base_success_rate = models.PositiveSmallIntegerField(
        default=50,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text="Base chance of success represented as a percentage.",
    )
    base_cash_reward = models.PositiveIntegerField(default=100)
    base_xp_reward = models.PositiveIntegerField(default=10)

    min_level = models.PositiveIntegerField(default=1)
    min_crew_members = models.PositiveIntegerField(
        default=0,
        help_text="Minimum crew members required (organized crimes).",
    )
    cooldown_minutes = models.PositiveIntegerField(default=5)

    jail_time_minutes = models.PositiveIntegerField(default=0)
    hospital_time_minutes = models.PositiveIntegerField(default=0)
    cash_loss_on_fail = models.PositiveIntegerField(default=0)

    flavor_text_success = models.TextField(blank=True, default="")
    flavor_text_failure = models.TextField(blank=True, default="")

    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "crime_types"
        ordering = ["category", "difficulty", "name"]
        indexes = [
            models.Index(fields=["slug"], name="idx_crime_types_slug"),
            models.Index(fields=["category"], name="idx_crime_types_category"),
            models.Index(
                fields=["is_active"],
                name="idx_crime_types_active",
                condition=Q(is_active=True),
            ),
        ]
        verbose_name = "Crime Type"
        verbose_name_plural = "Crime Types"

    def __str__(self) -> str:
        return self.name

    @property
    def is_solo(self) -> bool:
        """Return True if the crime is a solo activity."""

        return self.category == self.CrimeCategory.SOLO


class CrimeHistory(models.Model):
    """Historical record of crime attempts."""

    character = models.ForeignKey(
        "core.Character",
        on_delete=models.CASCADE,
        related_name="crime_history",
    )
    crime_type = models.ForeignKey(
        CrimeType,
        on_delete=models.CASCADE,
        related_name="attempts",
    )

    attempted_at = models.DateTimeField(default=timezone.now)
    success = models.BooleanField()

    cash_earned = models.PositiveIntegerField(default=0)
    xp_earned = models.PositiveIntegerField(default=0)
    items_found = models.JSONField(default=list, blank=True)

    character_level = models.PositiveIntegerField()
    success_rate = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    roll_result = models.PositiveSmallIntegerField(
        null=True,
        blank=True,
        validators=[MinValueValidator(1), MaxValueValidator(100)],
    )

    class Meta:
        db_table = "crime_history"
        ordering = ["-attempted_at"]
        indexes = [
            models.Index(fields=["character"], name="idx_crime_history_character"),
            models.Index(fields=["crime_type"], name="idx_crime_history_type"),
            models.Index(fields=["attempted_at"], name="idx_crime_history_attempted_at"),
            models.Index(fields=["success"], name="idx_crime_history_success"),
            models.Index(
                fields=["character", "attempted_at"],
                name="idx_crime_history_character_date",
            ),
        ]
        verbose_name = "Crime History Entry"
        verbose_name_plural = "Crime History"

    def __str__(self) -> str:
        status = "success" if self.success else "failure"
        return f"{self.character} - {self.crime_type} ({status})"


class CrimeCooldown(models.Model):
    """Tracks when a character can attempt a crime again."""

    character = models.ForeignKey(
        "core.Character",
        on_delete=models.CASCADE,
        related_name="crime_cooldowns",
    )
    crime_type = models.ForeignKey(
        CrimeType,
        on_delete=models.CASCADE,
        related_name="cooldowns",
    )

    last_attempted = models.DateTimeField(default=timezone.now)
    can_attempt_at = models.DateTimeField()

    class Meta:
        db_table = "crime_cooldowns"
        constraints = [
            models.UniqueConstraint(
                fields=["character", "crime_type"],
                name="uniq_crime_cooldown_character_type",
            )
        ]
        indexes = [
            models.Index(
                fields=["character"], name="idx_crime_cooldowns_character"
            ),
            models.Index(
                fields=["can_attempt_at"], name="idx_crime_cooldowns_available"
            ),
            models.Index(
                fields=["character", "can_attempt_at"],
                name="idx_crime_cooldowns_character_available",
            ),
        ]
        verbose_name = "Crime Cooldown"
        verbose_name_plural = "Crime Cooldowns"

    def __str__(self) -> str:
        return f"{self.character} - {self.crime_type}"

    def reset_timer(self) -> None:
        """Update the next available attempt time based on crime cooldown."""

        self.can_attempt_at = self.last_attempted + timedelta(
            minutes=self.crime_type.cooldown_minutes
        )
        self.save(update_fields=["can_attempt_at"])


class DailyCrimeCount(models.Model):
    """Number of crimes attempted per character per day for diminishing returns."""

    character = models.ForeignKey(
        "core.Character",
        on_delete=models.CASCADE,
        related_name="daily_crime_counts",
    )
    date = models.DateField(default=timezone.localdate)

    solo_crimes_today = models.PositiveIntegerField(default=0)
    multiplayer_crimes_today = models.PositiveIntegerField(default=0)
    organized_crimes_today = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = "daily_crime_counts"
        constraints = [
            models.UniqueConstraint(
                fields=["character", "date"],
                name="uniq_daily_crime_counts_character_date",
            )
        ]
        indexes = [
            models.Index(
                fields=["character", "date"],
                name="idx_daily_crime_counts_character_date",
            ),
            models.Index(fields=["date"], name="idx_daily_crime_counts_date"),
        ]
        verbose_name = "Daily Crime Count"
        verbose_name_plural = "Daily Crime Counts"

    def __str__(self) -> str:
        return f"{self.character} - {self.date}"

    def increment(self, category: CrimeType.CrimeCategory) -> None:
        """Increment the count for the provided crime category."""

        if category == CrimeType.CrimeCategory.SOLO:
            self.solo_crimes_today += 1
            field = "solo_crimes_today"
        elif category == CrimeType.CrimeCategory.MULTIPLAYER:
            self.multiplayer_crimes_today += 1
            field = "multiplayer_crimes_today"
        else:
            self.organized_crimes_today += 1
            field = "organized_crimes_today"

        self.save(update_fields=[field])
