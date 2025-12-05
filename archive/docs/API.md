# The Sacred Empire: API Documentation

## Overview

This document describes the RESTful API for The Sacred Empire. All endpoints return JSON responses and use JWT authentication.

**Base URL:** `https://api.sacredempire.com/v1/`
**Authentication:** JWT Bearer tokens
**Rate Limiting:** 1000 requests/hour per authenticated user

---

## Authentication

### Register
```
POST /auth/register/

Request Body:
{
    "username": "al_capone",
    "email": "al@example.com",
    "password": "secret123"
}

Response (201 Created):
{
    "id": 1,
    "username": "al_capone",
    "email": "al@example.com",
    "message": "Account created successfully"
}
```

### Login
```
POST /auth/login/

Request Body:
{
    "username": "al_capone",
    "password": "secret123"
}

Response (200 OK):
{
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
    "expires_in": 3600,
    "user": {
        "id": 1,
        "username": "al_capone"
    }
}
```

### Refresh Token
```
POST /auth/refresh/

Request Body:
{
    "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
}

Response (200 OK):
{
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "expires_in": 3600
}
```

---

## Characters

### Get My Character
```
GET /characters/me/
Headers:
    Authorization: Bearer {access_token}

Response (200 OK):
{
    "id": 1,
    "display_name": "Alphonse Capone",
    "level": 15,
    "experience": 2500,
    "rank": "Soldier",
    "cash": 50000,
    "banked_cash": 100000,
    "current_city": "Chicago",
    "in_hospital": false,
    "safe_harbor_active": false,
    "crew": {
        "id": 5,
        "name": "Chicago Outfit",
        "tag": "CHI"
    }
}
```

### Update Character Profile
```
PATCH /characters/me/
Headers:
    Authorization: Bearer {access_token}

Request Body:
{
    "bio": "Born in Brooklyn, made my fortune in Chicago.",
    "gender": "male"
}

Response (200 OK):
{
    "id": 1,
    "display_name": "Alphonse Capone",
    "bio": "Born in Brooklyn, made my fortune in Chicago.",
    "gender": "male",
    "updated_at": "2025-11-01T12:00:00Z"
}
```

---

## Crimes

### Get Available Crimes
```
GET /crimes/available/
Headers:
    Authorization: Bearer {access_token}

Response (200 OK):
{
    "crimes": [
        {
            "id": 1,
            "name": "Grand Theft Auto",
            "slug": "grand-theft-auto",
            "category": "solo",
            "success_rate": 45,
            "cash_reward": 500,
            "xp_reward": 25,
            "cooldown_remaining": 0,
            "can_attempt": true
        },
        {
            "id": 2,
            "name": "Bootlegging",
            "slug": "bootlegging",
            "category": "solo",
            "success_rate": 65,
            "cash_reward": 200,
            "xp_reward": 15,
            "cooldown_remaining": 120,
            "can_attempt": false
        }
    ]
}
```

### Attempt Crime
```
POST /crimes/commit/
Headers:
    Authorization: Bearer {access_token}

Request Body:
{
    "crime_type": "grand-theft-auto"
}

Response (200 OK - Success):
{
    "success": true,
    "message": "You successfully stole a Cadillac V-16!",
    "cash_earned": 500,
    "xp_earned": 25,
    "items_found": [15],
    "new_level": 15,
    "new_experience": 2525,
    "new_cash": 50500,
    "cooldown_until": "2025-11-01T12:10:00Z"
}

Response (200 OK - Failure):
{
    "success": false,
    "message": "The cops caught you! You've been sent to jail.",
    "cash_earned": 0,
    "xp_earned": 0,
    "jail_until": "2025-11-01T12:30:00Z"
}

Response (400 Bad Request - On Cooldown):
{
    "error": "Crime on cooldown",
    "can_attempt_at": "2025-11-01T12:05:00Z"
}
```

---

## Economy

### Get NPC Marketplace
```
GET /economy/marketplace/
Headers:
    Authorization: Bearer {access_token}
Query Params:
    ?category=weapon
    &min_price=0
    &max_price=10000
    &page=1

Response (200 OK):
{
    "items": [
        {
            "id": 1,
            "name": "Colt M1911",
            "category": "weapon",
            "rarity": "common",
            "stats": {"damage": 15},
            "base_price": 500,
            "min_level": 1,
            "can_purchase": true
        },
        {
            "id": 8,
            "name": "Thompson SMG",
            "category": "weapon",
            "rarity": "epic",
            "stats": {"damage": 50},
            "base_price": 10000,
            "min_level": 15,
            "can_purchase": true
        }
    ],
    "pagination": {
        "page": 1,
        "per_page": 20,
        "total": 25
    }
}
```

### Purchase from NPC
```
POST /economy/purchase/
Headers:
    Authorization: Bearer {access_token}

Request Body:
{
    "item_id": 8,
    "quantity": 1
}

Response (200 OK):
{
    "message": "Purchased 1x Thompson SMG",
    "item": {
        "id": 8,
        "name": "Thompson SMG"
    },
    "total_cost": 10000,
    "new_cash": 40000,
    "new_quantity": 1
}

Response (400 Bad Request):
{
    "error": "Insufficient cash",
    "required": 10000,
    "available": 5000
}
```

### Get Inventory
```
GET /inventory/
Headers:
    Authorization: Bearer {access_token}

Response (200 OK):
{
    "inventory": [
        {
            "id": 1,
            "item": {
                "id": 8,
                "name": "Thompson SMG",
                "category": "weapon",
                "stats": {"damage": 50}
            },
            "quantity": 1,
            "equipped": true,
            "acquired_at": "2025-11-01T10:00:00Z"
        },
        {
            "id": 2,
            "item": {
                "id": 10,
                "name": "Cadillac V-16",
                "category": "vehicle",
                "stats": {"speed": 85, "storage": 6}
            },
            "quantity": 1,
            "equipped": false,
            "acquired_at": "2025-11-01T11:30:00Z"
        }
    ],
    "total_items": 2,
    "equipped_loadout": {
        "weapon": {
            "id": 8,
            "name": "Thompson SMG"
        },
        "vehicle": null,
        "armor_body": null
    }
}
```

### Equip Item
```
POST /inventory/equip/
Headers:
    Authorization: Bearer {access_token}

Request Body:
{
    "inventory_id": 2
}

Response (200 OK):
{
    "message": "Equipped Cadillac V-16",
    "loadout": {
        "weapon": {
            "id": 8,
            "name": "Thompson SMG"
        },
        "vehicle": {
            "id": 10,
            "name": "Cadillac V-16"
        }
    },
    "total_attack": 50,
    "total_defense": 0
}
```

---

## Crews

### Get All Crews
```
GET /crews/
Headers:
    Authorization: Bearer {access_token}
Query Params:
    ?recruitment_open=true
    &min_level=1
    &page=1

Response (200 OK):
{
    "crews": [
        {
            "id": 5,
            "name": "Chicago Outfit",
            "tag": "CHI",
            "description": "Dominant crime family in Chicago",
            "total_members": 15,
            "reputation": 5000,
            "recruitment_open": true,
            "min_level_requirement": 10
        }
    ],
    "pagination": {
        "page": 1,
        "per_page": 20,
        "total": 50
    }
}
```

### Create Crew
```
POST /crews/create/
Headers:
    Authorization: Bearer {access_token}

Request Body:
{
    "name": "New York Five Families",
    "tag": "NYC",
    "description": "The five major crime families of New York",
    "min_level_requirement": 15
}

Response (201 Created):
{
    "id": 10,
    "name": "New York Five Families",
    "tag": "NYC",
    "description": "The five major crime families of New York",
    "founder_id": 1,
    "current_don_id": 1,
    "total_members": 1,
    "created_at": "2025-11-01T12:00:00Z"
}

Response (400 Bad Request):
{
    "error": "Crew name already taken"
}
```

### Join Crew
```
POST /crews/{crew_id}/join/
Headers:
    Authorization: Bearer {access_token}

Response (200 OK):
{
    "message": "Joined Chicago Outfit",
    "crew": {
        "id": 5,
        "name": "Chicago Outfit",
        "tag": "CHI"
    },
    "role": "Associate"
}

Response (400 Bad Request):
{
    "error": "Level requirement not met",
    "required_level": 10,
    "your_level": 5
}
```

### Get Crew Details
```
GET /crews/{crew_id}/
Headers:
    Authorization: Bearer {access_token}

Response (200 OK):
{
    "id": 5,
    "name": "Chicago Outfit",
    "tag": "CHI",
    "description": "Dominant crime family in Chicago",
    "total_members": 15,
    "reputation": 5000,
    "created_at": "2025-10-01T12:00:00Z",
    "members": [
        {
            "id": 1,
            "display_name": "Alphonse Capone",
            "level": 50,
            "rank": "Boss",
            "role": "Don",
            "joined_at": "2025-10-01T12:00:00Z"
        },
        {
            "id": 2,
            "display_name": "Frank Nitti",
            "level": 45,
            "rank": "Underboss",
            "role": "Underboss",
            "joined_at": "2025-10-02T10:00:00Z"
        }
    ]
}
```

### Send Crew Message
```
POST /crews/{crew_id}/messages/
Headers:
    Authorization: Bearer {access_token}

Request Body:
{
    "message": "Let's hit the North Side tonight!"
}

Response (201 Created):
{
    "id": 100,
    "sender": {
        "id": 1,
        "display_name": "Alphonse Capone"
    },
    "message": "Let's hit the North Side tonight!",
    "sent_at": "2025-11-01T12:00:00Z"
}

Response (400 Bad Request):
{
    "error": "You are not a member of this crew"
}
```

### Get Crew Messages
```
GET /crews/{crew_id}/messages/
Headers:
    Authorization: Bearer {access_token}
Query Params:
    ?limit=50
    &before=2025-11-01T12:00:00Z

Response (200 OK):
{
    "messages": [
        {
            "id": 100,
            "sender": {
                "id": 1,
                "display_name": "Alphonse Capone"
            },
            "message": "Let's hit the North Side tonight!",
            "sent_at": "2025-11-01T12:00:00Z"
        },
        {
            "id": 99,
            "sender": {
                "id": 2,
                "display_name": "Frank Nitti"
            },
            "message": "Got the Tommy guns ready, boss.",
            "sent_at": "2025-11-01T11:55:00Z"
        }
    ],
    "has_more": true
}
```

---

## Messages

### Get Inbox
```
GET /messages/inbox/
Headers:
    Authorization: Bearer {access_token}
Query Params:
    ?unread_only=true
    &page=1

Response (200 OK):
{
    "messages": [
        {
            "id": 50,
            "from": {
                "id": 10,
                "display_name": "Bugs Moran"
            },
            "subject": "Let's make a deal",
            "body": "I think we can work together...",
            "read": false,
            "sent_at": "2025-11-01T11:00:00Z"
        }
    ],
    "unread_count": 5,
    "pagination": {
        "page": 1,
        "per_page": 20,
        "total": 30
    }
}
```

### Send Message
```
POST /messages/send/
Headers:
    Authorization: Bearer {access_token}

Request Body:
{
    "recipient_id": 10,
    "subject": "Re: Let's make a deal",
    "body": "I'm interested. Let's meet at the Green Mill."
}

Response (201 Created):
{
    "id": 51,
    "to": {
        "id": 10,
        "display_name": "Bugs Moran"
    },
    "subject": "Re: Let's make a deal",
    "body": "I'm interested. Let's meet at the Green Mill.",
    "sent_at": "2025-11-01T12:05:00Z"
}
```

### Mark as Read
```
POST /messages/{message_id}/read/
Headers:
    Authorization: Bearer {access_token}

Response (200 OK):
{
    "message": "Message marked as read",
    "read_at": "2025-11-01T12:10:00Z"
}
```

---

## Leaderboards

### Get Leaderboard
```
GET /leaderboards/{type}/
Headers:
    Authorization: Bearer {access_token}
Path Params:
    type: level | wealth | crimes | crew_reputation
Query Params:
    ?limit=100

Response (200 OK):
{
    "type": "level",
    "leaderboard": [
        {
            "rank": 1,
            "character": {
                "id": 1,
                "display_name": "Alphonse Capone",
                "level": 50,
                "experience": 125000
            },
            "value": 50
        },
        {
            "rank": 2,
            "character": {
                "id": 5,
                "display_name": "Lucky Luciano",
                "level": 48,
                "experience": 115000
            },
            "value": 48
        }
    ],
    "your_rank": 15,
    "your_value": 35,
    "last_updated": "2025-11-01T12:00:00Z"
}
```

---

## Error Responses

### Standard Error Format
```json
{
    "error": "Error message",
    "code": "ERROR_CODE",
    "details": {}
}
```

### HTTP Status Codes
- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Authentication required or failed
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error

### Common Error Codes
- `INVALID_CREDENTIALS` - Login failed
- `INSUFFICIENT_CASH` - Not enough money
- `LEVEL_TOO_LOW` - Level requirement not met
- `COOLDOWN_ACTIVE` - Action on cooldown
- `ALREADY_IN_CREW` - Character already in a crew
- `RATE_LIMIT_EXCEEDED` - Too many requests

---

## Rate Limiting

**Default Limits:**
- Authenticated: 1000 requests/hour
- Crimes: 60 requests/hour
- Trading: 100 requests/hour
- Messages: 50 requests/hour

**Response Headers:**
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 950
X-RateLimit-Reset: 1635782400
```

**Rate Limit Exceeded Response (429):**
```json
{
    "error": "Rate limit exceeded",
    "retry_after": 600,
    "limit": 1000,
    "window": 3600
}
```

---

**API Version:** 1.0
**Last Updated:** 2025-11-01
**Base URL:** https://api.sacredempire.com/v1/
