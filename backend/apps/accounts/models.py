"""
User account models for The Sacred Empire.
"""

from datetime import timedelta
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone


class User(AbstractUser):
    """
    Custom user model extending Django's AbstractUser.

    Additional fields for game-specific functionality.
    """

    # Email is required
    email = models.EmailField(unique=True, verbose_name='Email Address')

    # Security
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    failed_login_attempts = models.IntegerField(default=0)
    locked_until = models.DateTimeField(null=True, blank=True)

    # Premium Status
    vip_status = models.BooleanField(default=False, verbose_name='VIP Status')
    vip_expiry = models.DateTimeField(null=True, blank=True, verbose_name='VIP Expiry Date')
    points = models.IntegerField(default=0, verbose_name='Premium Points')

    # Verification
    email_verified = models.BooleanField(default=False)
    verification_token = models.CharField(max_length=255, null=True, blank=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        ordering = ['-date_joined']

    def __str__(self):
        return self.username

    @property
    def is_vip(self):
        """Check if user has active VIP status."""
        if not self.vip_status:
            return False
        if self.vip_expiry and self.vip_expiry < timezone.now():
            return False
        return True

    @property
    def is_locked(self):
        """Check if account is temporarily locked."""
        if self.locked_until and self.locked_until > timezone.now():
            return True
        return False

    def record_failed_login(self):
        """Record a failed login attempt."""
        self.failed_login_attempts += 1

        # Lock account after 5 failed attempts for 15 minutes
        if self.failed_login_attempts >= 5:
            self.locked_until = timezone.now() + timedelta(minutes=15)

        self.save(update_fields=['failed_login_attempts', 'locked_until'])

    def reset_failed_logins(self):
        """Reset failed login counter on successful login."""
        self.failed_login_attempts = 0
        self.locked_until = None
        self.save(update_fields=['failed_login_attempts', 'locked_until'])

    def grant_vip(self, days=30):
        """
        Grant VIP status for specified number of days.

        Args:
            days (int): Number of days to grant VIP status
        """
        self.vip_status = True
        if self.vip_expiry and self.vip_expiry > timezone.now():
            # Extend existing VIP
            self.vip_expiry += timedelta(days=days)
        else:
            # New VIP subscription
            self.vip_expiry = timezone.now() + timedelta(days=days)
        self.save(update_fields=['vip_status', 'vip_expiry'])

    def add_points(self, amount):
        """
        Add premium points to user account.

        Args:
            amount (int): Number of points to add
        """
        self.points += amount
        self.save(update_fields=['points'])

    def spend_points(self, amount):
        """
        Spend premium points.

        Args:
            amount (int): Number of points to spend

        Returns:
            bool: True if successful, False if insufficient points
        """
        if self.points < amount:
            return False

        self.points -= amount
        self.save(update_fields=['points'])
        return True
