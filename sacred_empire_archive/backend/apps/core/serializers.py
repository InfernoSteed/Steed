"""
Serializers for core game models.
"""

from rest_framework import serializers
from .models import Character, CharacterStatistics, EquippedLoadout


class CharacterStatisticsSerializer(serializers.ModelSerializer):
    """Serializer for character statistics."""

    crime_success_rate = serializers.FloatField(read_only=True)

    class Meta:
        model = CharacterStatistics
        fields = (
            'total_crimes',
            'successful_crimes',
            'failed_crimes',
            'crime_success_rate',
            'solo_crimes',
            'total_earned',
            'total_spent',
            'items_bought',
            'crews_joined',
            'messages_sent',
            'first_crime_at',
            'last_crime_at',
            'max_level_reached'
        )


class EquippedLoadoutSerializer(serializers.ModelSerializer):
    """Serializer for equipped items."""

    class Meta:
        model = EquippedLoadout
        fields = ('total_attack', 'total_defense', 'vehicle_speed')


class CharacterSerializer(serializers.ModelSerializer):
    """Serializer for character profile."""

    safe_harbor_active = serializers.BooleanField(read_only=True)
    total_wealth = serializers.IntegerField(read_only=True)
    statistics = CharacterStatisticsSerializer(read_only=True)
    loadout = EquippedLoadoutSerializer(read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Character
        fields = (
            'id',
            'username',
            'display_name',
            'bio',
            'avatar_url',
            'gender',
            'level',
            'experience',
            'rank',
            'cash',
            'banked_cash',
            'total_wealth',
            'in_hospital',
            'hospital_until',
            'in_jail',
            'jail_until',
            'safe_harbor_active',
            'safe_harbor_until',
            'created_at',
            'last_active',
            'statistics',
            'loadout'
        )
        read_only_fields = (
            'id',
            'level',
            'experience',
            'rank',
            'cash',
            'banked_cash',
            'created_at',
            'last_active'
        )

    def update(self, instance, validated_data):
        """
        Update character profile.

        Only allow updating display_name, bio, gender, and avatar_url.
        """
        instance.display_name = validated_data.get('display_name', instance.display_name)
        instance.bio = validated_data.get('bio', instance.bio)
        instance.gender = validated_data.get('gender', instance.gender)
        instance.avatar_url = validated_data.get('avatar_url', instance.avatar_url)
        instance.save()
        return instance


class CharacterListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for character lists (leaderboards, etc.)."""

    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Character
        fields = (
            'id',
            'username',
            'display_name',
            'level',
            'rank',
            'avatar_url'
        )
