# The Sacred Empire: MVP Roadmap (Phase 1)

## Executive Summary

This document outlines the **Minimum Viable Product (MVP)** development roadmap for The Sacred Empire. The MVP focuses on delivering the core game loop with essential features, allowing early player testing and validation before expanding scope.

**MVP Duration:** 20-24 weeks (5-6 months)
**Target Launch:** Private Beta with 100-500 players
**Success Criteria:** 30% Day-7 retention, 2-3 sessions per day, positive player feedback

---

## Table of Contents
1. [MVP Scope Definition](#mvp-scope-definition)
2. [Development Phases](#development-phases)
3. [Week-by-Week Breakdown](#week-by-week-breakdown)
4. [Feature Specifications](#feature-specifications)
5. [Testing Strategy](#testing-strategy)
6. [Launch Checklist](#launch-checklist)

---

## MVP Scope Definition

### What's IN the MVP ✅

**Core Systems:**
1. User registration and authentication
2. Character creation and profiles
3. Solo crime mechanics (3 types: GTA, Bootlegging, Rackets)
4. Basic economy (NPC marketplace)
5. Equipment system (10 weapons, 10 vehicles, 5 armor pieces)
6. Level and XP progression
7. Rank system (5 ranks)
8. Basic crew functionality (create, join, chat)
9. One-on-one messaging
10. Basic statistics tracking
11. Simple leaderboards
12. New player protection (Safe Harbor)

**Technical Infrastructure:**
1. Django backend with PostgreSQL
2. Redis caching
3. RESTful API
4. Server-side rendered frontend (Bootstrap)
5. Basic admin panel
6. Docker deployment

### What's OUT of the MVP ❌

**Deferred to Phase 2+:**
1. ~~Multiplayer crimes~~ (Phase 2)
2. ~~Organized crimes~~ (Phase 2)
3. ~~PvP combat~~ (Phase 2)
4. ~~Player trading~~ (Phase 2)
5. ~~Property ownership~~ (Phase 3)
6. ~~Territory control~~ (Phase 3)
7. ~~Casino properties~~ (Phase 3)
8. ~~Escrow system~~ (Phase 3)
9. ~~Manufacturing (bullet factories)~~ (Phase 3)
10. ~~Mobile apps~~ (Phase 4)
11. ~~WebSockets/real-time chat~~ (Phase 2)
12. ~~Forums~~ (Phase 2)

**Rationale:** Focus on perfecting core loop before adding complexity. Early players provide feedback on fundamental mechanics.

---

## Development Phases

### Phase 1A: Foundation (Weeks 1-4)

**Goal:** Set up development environment and basic infrastructure

**Deliverables:**
- Development environment (Docker, PostgreSQL, Redis)
- Django project structure
- Database schema for core tables
- User authentication system
- Basic admin panel
- CI/CD pipeline

**Team:** 1-2 backend developers

### Phase 1B: Core Features (Weeks 5-12)

**Goal:** Implement core game loop

**Deliverables:**
- Character creation and profiles
- Crime mechanics (3 types)
- NPC marketplace
- Equipment system
- XP and leveling
- Rank progression
- Statistics tracking

**Team:** 2-3 backend developers, 1 frontend developer

### Phase 1C: Social Features (Weeks 13-16)

**Goal:** Add essential social mechanics

**Deliverables:**
- Crew creation and management
- Crew member roster
- Basic crew chat (polling, not WebSockets)
- One-on-one messaging
- Leaderboards

**Team:** 2 backend developers, 1 frontend developer

### Phase 1D: Polish & Testing (Weeks 17-20)

**Goal:** Bug fixes, balance, and UX improvements

**Deliverables:**
- Comprehensive testing
- Balance adjustments
- UI/UX refinements
- Performance optimization
- Security hardening
- Documentation

**Team:** Full team + QA testers

### Phase 1E: Beta Launch (Weeks 21-24)

**Goal:** Private beta with early adopters

**Deliverables:**
- Closed beta invitation system
- Player onboarding flow
- Analytics and monitoring
- Community Discord setup
- Feedback collection system
- Rapid iteration on player feedback

**Team:** Full team + community manager

---

## Week-by-Week Breakdown

### Week 1: Environment Setup
**Backend:**
- ✅ Set up Docker Compose (PostgreSQL, Redis, Django)
- ✅ Initialize Django project structure
- ✅ Configure settings (dev, staging, prod)
- ✅ Set up Git repository and branching strategy
- ✅ Configure pre-commit hooks (Black, Flake8)

**DevOps:**
- ✅ Set up GitHub Actions for CI/CD
- ✅ Configure staging server
- ✅ Set up error tracking (Sentry)

**Deliverables:**
- Running local dev environment
- Automated testing pipeline
- Deployment to staging server

---

### Week 2: User Authentication
**Backend:**
- ✅ Custom User model (extending AbstractUser)
- ✅ Registration endpoint
- ✅ Login endpoint (JWT tokens)
- ✅ Password reset flow
- ✅ Email verification (optional for beta)

**Frontend:**
- ✅ Registration page
- ✅ Login page
- ✅ Basic navigation header

**Database:**
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    date_joined TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP,
    vip_status BOOLEAN DEFAULT FALSE,
    points INTEGER DEFAULT 0
);
```

**Testing:**
- Unit tests for auth endpoints
- Integration tests for registration flow

---

### Week 3: Character System
**Backend:**
- ✅ Character model (profile, stats, location)
- ✅ Character creation endpoint
- ✅ Character detail endpoint
- ✅ Character update endpoint
- ✅ Statistics model

**Frontend:**
- ✅ Character creation flow
- ✅ Character profile page
- ✅ Statistics display

**Database:**
```sql
CREATE TABLE characters (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(id),
    display_name VARCHAR(100),
    bio TEXT,
    avatar_url VARCHAR(500),
    level INTEGER DEFAULT 1,
    experience BIGINT DEFAULT 0,
    rank VARCHAR(50) DEFAULT 'Associate',
    cash BIGINT DEFAULT 1000,
    banked_cash BIGINT DEFAULT 0,
    safe_harbor_until TIMESTAMP DEFAULT NOW() + INTERVAL '7 days'
);

CREATE TABLE character_statistics (
    id SERIAL PRIMARY KEY,
    character_id INTEGER UNIQUE REFERENCES characters(id),
    total_crimes INTEGER DEFAULT 0,
    successful_crimes INTEGER DEFAULT 0,
    total_earned BIGINT DEFAULT 0,
    total_spent BIGINT DEFAULT 0
);
```

**Testing:**
- Character creation validation
- Profile update authorization

---

### Week 4: Items & Inventory
**Backend:**
- ✅ Item model (weapons, vehicles, armor)
- ✅ Inventory model
- ✅ Equipped loadout model
- ✅ Seed database with 25 items (10 weapons, 10 vehicles, 5 armor)

**Frontend:**
- ✅ Inventory page
- ✅ Equipment page
- ✅ Item details modal

**Database:**
```sql
CREATE TABLE items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(50) NOT NULL,
    rarity VARCHAR(20) DEFAULT 'common',
    stats JSONB DEFAULT '{}',
    base_price BIGINT NOT NULL,
    min_level INTEGER DEFAULT 1
);

CREATE TABLE inventory (
    id SERIAL PRIMARY KEY,
    character_id INTEGER REFERENCES characters(id),
    item_id INTEGER REFERENCES items(id),
    quantity INTEGER DEFAULT 1,
    equipped BOOLEAN DEFAULT FALSE,
    UNIQUE(character_id, item_id)
);
```

**Data Seeding:**
```python
# Weapons
Item.objects.create(name="Knife", slug="knife", category="weapon", rarity="common", stats={"damage": 5}, base_price=50, min_level=1)
Item.objects.create(name="Colt M1911", slug="colt-m1911", category="weapon", rarity="common", stats={"damage": 15}, base_price=500, min_level=1)
# ... 8 more weapons

# Vehicles
Item.objects.create(name="Ford Model T", slug="ford-model-t", category="vehicle", rarity="common", stats={"speed": 45, "storage": 2}, base_price=850, min_level=1)
# ... 9 more vehicles

# Armor
Item.objects.create(name="Leather Jacket", slug="leather-jacket", category="armor", rarity="common", stats={"protection": 5, "slot": "body"}, base_price=200, min_level=1)
# ... 4 more armor pieces
```

---

### Week 5-6: Crime System (Part 1)
**Backend:**
- ✅ CrimeType model
- ✅ CrimeHistory model
- ✅ CrimeCooldown model
- ✅ DailyCrimeCount model (for diminishing returns)
- ✅ Crime execution service
- ✅ Success rate calculation
- ✅ Reward distribution
- ✅ Cooldown management

**Crime Type Definitions:**
```python
# Grand Theft Auto
CrimeType.objects.create(
    name="Grand Theft Auto",
    slug="grand-theft-auto",
    category="solo",
    difficulty=5,
    base_success_rate=40,
    base_cash_reward=500,
    base_xp_reward=25,
    min_level=1,
    cooldown_minutes=10,
    jail_time_minutes=30
)

# Bootlegging
CrimeType.objects.create(
    name="Bootlegging",
    slug="bootlegging",
    category="solo",
    difficulty=3,
    base_success_rate=60,
    base_cash_reward=200,
    base_xp_reward=15,
    min_level=1,
    cooldown_minutes=5
)

# Racket
CrimeType.objects.create(
    name="Run Racket",
    slug="run-racket",
    category="solo",
    difficulty=2,
    base_success_rate=75,
    base_cash_reward=100,
    base_xp_reward=10,
    min_level=1,
    cooldown_minutes=5
)
```

**Crime Service Logic:**
```python
# crimes/services.py
class CrimeService:
    @staticmethod
    def attempt_crime(character, crime_type_slug):
        # 1. Get crime type
        crime_type = CrimeType.objects.get(slug=crime_type_slug)

        # 2. Check level requirement
        if character.level < crime_type.min_level:
            return {"success": False, "error": "Level too low"}

        # 3. Check cooldown
        cooldown = CrimeCooldown.objects.filter(
            character=character,
            crime_type=crime_type,
            can_attempt_at__gt=timezone.now()
        ).first()

        if cooldown:
            return {
                "success": False,
                "error": f"On cooldown until {cooldown.can_attempt_at}"
            }

        # 4. Calculate success rate
        base_rate = crime_type.base_success_rate
        level_bonus = character.level * 0.5
        success_rate = min(base_rate + level_bonus, 95)

        # 5. Determine success
        roll = random.randint(1, 100)
        success = roll <= success_rate

        # 6. Calculate rewards (with diminishing returns)
        daily_count = DailyCrimeCount.objects.get_or_create(
            character=character,
            date=timezone.now().date()
        )[0]

        multiplier = CrimeService._get_diminishing_multiplier(daily_count.solo_crimes_today)
        cash_reward = int(crime_type.base_cash_reward * multiplier) if success else 0
        xp_reward = int(crime_type.base_xp_reward * multiplier) if success else 0

        # 7. Apply rewards
        if success:
            character.cash += cash_reward
            character.experience += xp_reward
            character.check_level_up()  # Helper method
            character.save()

            # Update statistics
            stats = character.statistics
            stats.total_crimes += 1
            stats.successful_crimes += 1
            stats.solo_crimes += 1
            stats.total_earned += cash_reward
            stats.save()

            # Increment daily count
            daily_count.solo_crimes_today += 1
            daily_count.save()

        # 8. Create cooldown
        CrimeCooldown.objects.update_or_create(
            character=character,
            crime_type=crime_type,
            defaults={
                'last_attempted': timezone.now(),
                'can_attempt_at': timezone.now() + timedelta(minutes=crime_type.cooldown_minutes)
            }
        )

        # 9. Log attempt
        CrimeHistory.objects.create(
            character=character,
            crime_type=crime_type,
            success=success,
            cash_earned=cash_reward,
            xp_earned=xp_reward,
            character_level=character.level,
            success_rate=success_rate
        )

        # 10. Return result
        return {
            "success": success,
            "cash_earned": cash_reward,
            "xp_earned": xp_reward,
            "new_level": character.level,
            "new_experience": character.experience,
            "message": "Crime successful!" if success else "Crime failed!"
        }

    @staticmethod
    def _get_diminishing_multiplier(crimes_today):
        """Diminishing returns on daily crimes"""
        if crimes_today < 10:
            return 1.0
        elif crimes_today < 20:
            return 0.75
        elif crimes_today < 30:
            return 0.5
        else:
            return 0.25
```

**Frontend:**
- ✅ Crimes page listing available crimes
- ✅ Crime attempt button
- ✅ Result modal/notification
- ✅ Cooldown timer display
- ✅ Success/failure animations

**Testing:**
- Crime success rate validation
- Cooldown enforcement
- Reward calculation accuracy
- Diminishing returns logic

---

### Week 7: NPC Marketplace
**Backend:**
- ✅ Purchase endpoint (buy from NPC)
- ✅ Inventory management
- ✅ Currency deduction
- ✅ Item delivery to inventory

**Frontend:**
- ✅ Marketplace page with item catalog
- ✅ Item filtering (category, price range)
- ✅ Purchase confirmation modal
- ✅ Shopping cart (optional)

**API Endpoint:**
```python
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def purchase_from_npc(request):
    character = request.user.character
    item_id = request.data.get('item_id')
    quantity = request.data.get('quantity', 1)

    item = Item.objects.get(id=item_id)
    total_cost = item.base_price * quantity

    # Validation
    if character.cash < total_cost:
        return Response({"error": "Insufficient cash"}, status=400)

    if character.level < item.min_level:
        return Response({"error": "Level too low"}, status=400)

    # Transaction
    character.cash -= total_cost
    character.save()

    # Add to inventory
    inventory_item, created = Inventory.objects.get_or_create(
        character=character,
        item=item,
        defaults={'quantity': 0}
    )
    inventory_item.quantity += quantity
    inventory_item.save()

    # Log transaction
    Transaction.objects.create(
        from_character=None,  # NPC purchase
        to_character=character,
        transaction_type='npc_purchase',
        amount=total_cost,
        item=item,
        item_quantity=quantity
    )

    return Response({
        "message": f"Purchased {quantity}x {item.name}",
        "new_cash": character.cash,
        "new_quantity": inventory_item.quantity
    })
```

---

### Week 8: Level & Rank Progression
**Backend:**
- ✅ Level-up logic
- ✅ Experience calculation
- ✅ Rank advancement system
- ✅ Rank benefits configuration

**Rank Definitions:**
```python
RANKS = {
    'Associate': {
        'min_level': 1,
        'benefits': 'Basic access to game features'
    },
    'Soldier': {
        'min_level': 11,
        'benefits': 'Access to multiplayer crimes (Phase 2)'
    },
    'Caporegime': {
        'min_level': 26,
        'benefits': 'Can create crews'
    },
    'Underboss': {
        'min_level': 51,
        'benefits': 'Territory control (Phase 3)'
    },
    'Boss': {
        'min_level': 76,
        'benefits': 'Maximum prestige and power'
    }
}

def check_rank_advancement(character):
    for rank, data in RANKS.items():
        if character.level >= data['min_level']:
            character.rank = rank
    character.save()
```

**Level-Up Logic:**
```python
def check_level_up(character):
    while character.experience >= get_xp_for_level(character.level + 1):
        character.level += 1
        # Award level-up bonus
        character.cash += 100 * character.level

    check_rank_advancement(character)

def get_xp_for_level(level):
    """XP required to reach this level"""
    if level <= 10:
        return level * 100
    elif level <= 25:
        return 1000 + (level - 10) * 250
    elif level <= 50:
        return 4750 + (level - 25) * 500
    elif level <= 75:
        return 17250 + (level - 50) * 1000
    else:
        return 42250 + (level - 75) * 2500
```

**Frontend:**
- ✅ Level progress bar
- ✅ Rank display badge
- ✅ Level-up notification/modal
- ✅ Rank advancement notification

---

### Week 9-10: Crew System (Basic)
**Backend:**
- ✅ Crew model
- ✅ CrewMember model
- ✅ Crew creation endpoint
- ✅ Join crew endpoint
- ✅ Leave crew endpoint
- ✅ Crew roster endpoint
- ✅ Crew statistics

**Database:**
```sql
CREATE TABLE crews (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    tag VARCHAR(5) UNIQUE NOT NULL,
    description TEXT,
    logo_url VARCHAR(500),
    founder_id INTEGER REFERENCES characters(id),
    current_don_id INTEGER REFERENCES characters(id),
    total_members INTEGER DEFAULT 0,
    total_wealth BIGINT DEFAULT 0,
    reputation INTEGER DEFAULT 0,
    recruitment_open BOOLEAN DEFAULT TRUE,
    min_level_requirement INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE crew_members (
    id SERIAL PRIMARY KEY,
    crew_id INTEGER REFERENCES crews(id) ON DELETE CASCADE,
    character_id INTEGER UNIQUE REFERENCES characters(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'Associate',
    crimes_completed INTEGER DEFAULT 0,
    cash_contributed BIGINT DEFAULT 0,
    joined_at TIMESTAMP DEFAULT NOW()
);
```

**Frontend:**
- ✅ Crew creation page
- ✅ Crew browsing/search page
- ✅ Crew detail page (roster, stats)
- ✅ Join/leave crew buttons
- ✅ Crew member list

---

### Week 11: Messaging System
**Backend:**
- ✅ Message model
- ✅ Send message endpoint
- ✅ Inbox endpoint (list received messages)
- ✅ Sent messages endpoint
- ✅ Read message endpoint
- ✅ Delete message endpoint

**Database:**
```sql
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    from_character_id INTEGER REFERENCES characters(id) ON DELETE SET NULL,
    to_character_id INTEGER REFERENCES characters(id) ON DELETE CASCADE,
    subject VARCHAR(200),
    body TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMP DEFAULT NOW(),
    read_at TIMESTAMP NULL,
    deleted_by_sender BOOLEAN DEFAULT FALSE,
    deleted_by_recipient BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_messages_recipient ON messages(to_character_id, sent_at DESC);
CREATE INDEX idx_messages_sender ON messages(from_character_id, sent_at DESC);
```

**Frontend:**
- ✅ Inbox page
- ✅ Compose message modal
- ✅ Message thread view
- ✅ Unread message counter (header badge)

---

### Week 12: Leaderboards
**Backend:**
- ✅ Leaderboard service (cached)
- ✅ Leaderboard endpoints (by level, wealth, crimes)
- ✅ Celery task to refresh leaderboard cache

**Leaderboard Types:**
1. **Overall Level** - Top players by level/XP
2. **Wealth** - Top players by total cash
3. **Crime Master** - Most successful crimes
4. **Crew Ranking** - Top crews by reputation

**Caching Strategy:**
```python
# leaderboards/services.py
from django.core.cache import cache

class LeaderboardService:
    CACHE_TIMEOUT = 900  # 15 minutes

    @staticmethod
    def get_top_by_level(limit=100):
        cache_key = f'leaderboard_level_top_{limit}'
        cached = cache.get(cache_key)

        if cached:
            return cached

        top_characters = Character.objects.select_related('user').filter(
            user__is_active=True
        ).order_by('-level', '-experience')[:limit]

        data = [
            {
                'rank': idx + 1,
                'display_name': char.display_name,
                'level': char.level,
                'experience': char.experience,
                'rank_title': char.rank
            }
            for idx, char in enumerate(top_characters)
        ]

        cache.set(cache_key, data, LeaderboardService.CACHE_TIMEOUT)
        return data
```

**Frontend:**
- ✅ Leaderboard page with tabs
- ✅ Pagination for long lists
- ✅ Highlight current player's position
- ✅ Refresh timestamp

---

### Week 13-14: Crew Chat (Polling-Based)
**Backend:**
- ✅ CrewMessage model
- ✅ Send crew message endpoint
- ✅ Get recent crew messages endpoint (last 50)
- ✅ Polling-based updates (not WebSockets for MVP)

**Database:**
```sql
CREATE TABLE crew_messages (
    id SERIAL PRIMARY KEY,
    crew_id INTEGER REFERENCES crews(id) ON DELETE CASCADE,
    sender_id INTEGER REFERENCES characters(id) ON DELETE SET NULL,
    message TEXT NOT NULL,
    sent_at TIMESTAMP DEFAULT NOW(),
    edited_at TIMESTAMP NULL,
    deleted BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_crew_messages_crew_sent ON crew_messages(crew_id, sent_at DESC);
```

**Frontend:**
- ✅ Crew chat panel (on crew page)
- ✅ Message input and send
- ✅ Auto-refresh every 5 seconds (polling)
- ✅ Scroll to bottom on new messages

**Rate Limiting:**
```python
# Prevent spam
@ratelimit(key='user', rate='20/m', method='POST')
def send_crew_message(request):
    # ... implementation
```

---

### Week 15-16: Statistics & Profile Enhancements
**Backend:**
- ✅ Expand statistics tracking
- ✅ Achievement detection (Phase 2 will add UI)
- ✅ Profile customization endpoints

**Enhanced Statistics:**
```python
class CharacterStatistics:
    # Crime stats
    total_crimes
    successful_crimes
    failed_crimes
    solo_crimes
    best_crime_streak

    # Economic stats
    total_earned
    total_spent
    highest_cash_amount

    # Social stats
    crews_joined
    messages_sent

    # Timestamps
    first_crime_at
    last_crime_at
```

**Frontend:**
- ✅ Enhanced profile page with charts
- ✅ Bio editing
- ✅ Avatar upload (basic)
- ✅ Statistics dashboard

---

### Week 17-18: Polish & Balance
**Activities:**
- ✅ Crime balance adjustments based on playtesting
- ✅ Item pricing adjustments
- ✅ XP curve tuning
- ✅ UI/UX improvements
  - Better mobile responsiveness
  - Loading states and animations
  - Error handling and user feedback
  - Accessibility (ARIA labels, keyboard navigation)
- ✅ Performance optimization
  - Database query optimization
  - Implement query caching
  - Frontend asset minification
- ✅ Security audit
  - Penetration testing
  - SQL injection checks
  - XSS vulnerability testing
  - Rate limiting validation

---

### Week 19-20: Comprehensive Testing
**Testing Types:**

**1. Unit Tests**
```python
# tests/test_crimes.py
def test_crime_success_calculation():
    character = create_test_character(level=5)
    crime_type = CrimeType.objects.get(slug='bootlegging')
    # ... assertions

def test_diminishing_returns():
    # Test that crimes after 10 give reduced rewards
    # ...
```

**2. Integration Tests**
```python
def test_full_crime_flow():
    # Register user -> Create character -> Commit crime -> Check rewards
    # ...
```

**3. Load Testing**
```bash
# Using locust.io
locust -f locustfile.py --host=https://staging.sacredempire.com
```

**4. User Acceptance Testing (UAT)**
- Recruit 20-30 beta testers
- Provide testing checklist
- Collect feedback via forms

**5. Security Testing**
- OWASP Top 10 vulnerability scanning
- Dependency vulnerability checks
- Penetration testing (basic)

---

### Week 21-22: Beta Preparation
**Infrastructure:**
- ✅ Set up production server
- ✅ Configure SSL certificates
- ✅ Set up CDN (Cloudflare)
- ✅ Configure backup systems
- ✅ Set up monitoring (Sentry, DataDog)
- ✅ Implement analytics (Google Analytics, Mixpanel)

**Community:**
- ✅ Create Discord server
- ✅ Set up community channels
- ✅ Recruit moderators
- ✅ Create welcome guide
- ✅ Set up feedback forms

**Documentation:**
- ✅ Player guide (how to play)
- ✅ FAQ
- ✅ Rules and code of conduct
- ✅ Privacy policy and ToS

---

### Week 23: Soft Launch (Closed Beta)
**Invitation Strategy:**
- Invite 50 players initially
- Handpicked testers (diverse backgrounds)
- Daily monitoring and support
- Rapid bug fixing

**Metrics to Track:**
- Registration conversion rate
- Day 1, Day 3, Day 7 retention
- Average session length
- Crimes committed per user
- Most used features
- Drop-off points

**Daily Activities:**
- Morning: Check overnight errors (Sentry)
- Midday: Review player feedback (Discord, forms)
- Afternoon: Implement hotfixes
- Evening: Analyze metrics, plan next day

---

### Week 24: Beta Expansion & Iteration
**Expand Beta:**
- Invite 200 more players
- Allow existing players to invite friends (referral codes)
- Promote on Reddit (r/browsergames), Discord communities

**Iteration Focus:**
- Balance adjustments based on data
- Fix critical bugs
- Improve onboarding based on drop-off analysis
- Enhance most-used features
- Remove/defer least-used features

**Decision Point:**
- If metrics are good (>30% D7 retention): Plan public launch (Phase 2)
- If metrics are poor: Iterate for 4 more weeks before expanding

---

## Feature Specifications

### 1. Crime System Detailed Spec

**Grand Theft Auto (GTA)**
```
Name: Grand Theft Auto
Category: Solo
Difficulty: 5/10
Base Success Rate: 40%
Cooldown: 10 minutes
Min Level: 1

Rewards (Success):
- Cash: $500 (base)
- XP: 25
- Chance to steal vehicle (5%)

Penalties (Failure):
- Jail Time: 30 minutes (cannot commit crimes)
- Small fine: $50

Success Rate Modifiers:
+ Level bonus: +0.5% per level
+ Vehicle equipped: +5%
+ Crew bonus (Phase 2): +10%

Maximum Success Rate: 95% (always 5% failure chance)

Narrative Flavor Text:
"You scope out the parking lot, looking for a prime target.
A shiny Cadillac catches your eye..."
```

**Bootlegging**
```
Name: Bootlegging
Category: Solo
Difficulty: 3/10
Base Success Rate: 60%
Cooldown: 5 minutes
Min Level: 1

Rewards (Success):
- Cash: $200
- XP: 15

Penalties (Failure):
- Inventory confiscated: Small cash loss ($25)

Success Rate Modifiers:
+ Level bonus: +0.5% per level
+ Vehicle with high storage: +10%

Flavor Text:
"You load up cases of Canadian whiskey and head for the speakeasy.
The cops are doing rounds tonight..."
```

**Run Racket**
```
Name: Run Protection Racket
Category: Solo
Difficulty: 2/10
Base Success Rate: 75%
Cooldown: 5 minutes
Min Level: 1

Rewards (Success):
- Cash: $100
- XP: 10

Penalties (Failure):
- None (low risk)

Success Rate Modifiers:
+ Level bonus: +0.5% per level
+ Weapon equipped: +5%

Flavor Text:
"You pay a visit to the local businesses on your turf.
Time to collect this week's protection money..."
```

### 2. Equipment Specifications

**Weapons (Damage Values):**
1. Knife: 5 damage, $50, Level 1
2. Brass Knuckles: 8 damage, $75, Level 1
3. Colt M1911: 15 damage, $500, Level 1
4. Webly Mk VI: 18 damage, $750, Level 3
5. Model 1897 Shotgun: 35 damage, $2,000, Level 5
6. Lee-Enfield SMLE Mk III: 30 damage, $2,500, Level 7
7. MP 18: 40 damage, $5,000, Level 10
8. Thompson SMG: 50 damage, $10,000, Level 15
9. Browning Automatic Rifle (BAR): 65 damage, $25,000, Level 20
10. Custom Tommy Gun: 60 damage, $20,000, Level 18

**Vehicles (Speed & Storage):**
1. Ford Model T: 45mph, 2 storage, $850, Level 1
2. Cadillac Type 57: 60mph, 4 storage, $3,500, Level 3
3. Pierce-Arrow Model 32: 55mph, 5 storage, $3,000, Level 2
4. Duesenberg Model A: 75mph, 3 storage, $8,500, Level 10
5. Buick Series 20: 50mph, 4 storage, $2,000, Level 2
6. Chrysler Six: 65mph, 3 storage, $4,500, Level 5
7. Packard Single Six: 70mph, 4 storage, $6,000, Level 7
8. Lincoln Model L: 65mph, 5 storage, $7,000, Level 8
9. Cadillac V-16: 85mph, 6 storage, $30,000, Level 25
10. Duesenberg Model J: 90mph, 5 storage, $25,000, Level 22

**Armor (Protection Values):**
1. Leather Jacket: 5 protection, $200, Level 1
2. Fedora Hat: 2 protection, $100, Level 1
3. Reinforced Suit: 12 protection, $1,500, Level 5
4. Steel Vest: 20 protection, $5,000, Level 10
5. Full Body Armor: 40 protection, $15,000, Level 15

### 3. Progression Specifications

**XP Requirements per Level:**
```python
LEVEL_XP_REQUIREMENTS = {
    1: 0,
    2: 100,
    3: 200,
    4: 300,
    5: 400,
    6: 500,
    7: 600,
    8: 700,
    9: 800,
    10: 900,
    11: 1150,
    12: 1400,
    13: 1650,
    # ... continues to level 100
}
```

**Rank Advancement:**
```
Associate (Level 1-10):
- Starting rank
- Access to all MVP features

Soldier (Level 11-25):
- Unlocks multiplayer crimes (Phase 2)
- +5% crime success rate bonus

Caporegime (Level 26-50):
- Can create crews
- +10% crime success rate bonus
- Can organize crew activities

Underboss (Level 51-75):
- Territory control (Phase 3)
- +15% crime success rate bonus
- Advanced crew management

Boss/Don (Level 76-100):
- Maximum prestige
- +20% crime success rate bonus
- All features unlocked
```

---

## Testing Strategy

### Automated Testing
**Target Coverage:** 80% code coverage

```bash
# Run tests
python manage.py test

# With coverage report
coverage run --source='.' manage.py test
coverage report
coverage html
```

**Test Categories:**
1. Unit tests (models, services, utilities)
2. API tests (endpoints, authentication)
3. Integration tests (full user flows)
4. Performance tests (load, stress)

### Manual Testing Checklist
**Critical Paths:**
- [ ] User registration and login
- [ ] Character creation
- [ ] Committing each crime type
- [ ] Purchasing items from NPC market
- [ ] Equipping items
- [ ] Leveling up and rank advancement
- [ ] Creating a crew
- [ ] Joining a crew
- [ ] Sending and receiving messages
- [ ] Viewing leaderboards
- [ ] Crew chat functionality

**Edge Cases:**
- [ ] Attempting crime while on cooldown
- [ ] Purchasing item with insufficient funds
- [ ] Joining crew with level requirement not met
- [ ] Creating crew with duplicate name/tag
- [ ] Sending message to non-existent user
- [ ] SQL injection attempts
- [ ] XSS attempts in user input fields

### Beta Testing Goals
**Week 1 (50 players):**
- Test basic functionality
- Identify critical bugs
- Validate game balance
- Collect qualitative feedback

**Week 2-4 (250 players):**
- Stress test infrastructure
- Validate retention metrics
- Test social features at scale
- Identify meta-game strategies

---

## Launch Checklist

### Pre-Launch (2 weeks before)
- [ ] All features tested and working
- [ ] Performance benchmarks met (page load <2s)
- [ ] Security audit completed
- [ ] Backup systems tested
- [ ] Monitoring dashboards configured
- [ ] Discord server ready
- [ ] Documentation complete (player guide, FAQ)
- [ ] Terms of Service and Privacy Policy published
- [ ] Beta tester invitations prepared

### Launch Week
- [ ] Deploy to production
- [ ] Smoke tests on production
- [ ] Send beta invitations (batch 1: 50 players)
- [ ] Monitor error logs hourly
- [ ] Discord support channel active
- [ ] Daily metrics review
- [ ] Hotfix deployment ready

### Post-Launch (Weeks 2-4)
- [ ] Daily player count tracking
- [ ] Retention cohort analysis
- [ ] Player feedback synthesis
- [ ] Balance adjustments based on data
- [ ] Plan Phase 2 features based on feedback
- [ ] Expand beta to 250 players
- [ ] Community events (first crew tournament)
- [ ] Bug fix releases (weekly)

---

## Success Metrics

### Week 1 Targets (50 players)
- **Registration Rate:** 80% of invites
- **Character Creation:** 90% of registered users
- **First Crime:** 85% of characters
- **Day 1 Retention:** 60%
- **Average Session:** 15+ minutes
- **Critical Bugs:** 0
- **Server Uptime:** 99%+

### Week 4 Targets (250 players)
- **Day 7 Retention:** 30%
- **Day 14 Retention:** 20%
- **Sessions per Day:** 2-3
- **Crimes per Player:** 20+ per day
- **Crew Membership:** 40% of active players
- **Messages Sent:** 5+ per active player per day
- **NPC Purchases:** 80% of players have bought items

### Phase 2 Go/No-Go Criteria
**GREEN LIGHT (Proceed to Phase 2):**
- ✅ Day 7 Retention ≥ 30%
- ✅ Average session length ≥ 20 minutes
- ✅ <5 critical bugs per week
- ✅ Positive community sentiment (Discord, surveys)
- ✅ Server performance stable (<1% error rate)

**YELLOW LIGHT (Iterate MVP for 4 more weeks):**
- ⚠️ Day 7 Retention 20-30%
- ⚠️ Average session 15-20 minutes
- ⚠️ Mixed community feedback
- ⚠️ Some balance issues

**RED LIGHT (Major Pivot or Pause):**
- ❌ Day 7 Retention <20%
- ❌ Average session <15 minutes
- ❌ Frequent critical bugs
- ❌ Negative community sentiment
- ❌ Core game loop not engaging

---

## Risk Mitigation

### Technical Risks
**Risk:** Database performance degrades with more users
**Mitigation:**
- Query optimization from day 1
- Caching strategy implemented
- Database indexing
- Horizontal scaling plan ready

**Risk:** Security vulnerability exploited
**Mitigation:**
- Security audit before launch
- Bug bounty program (Phase 2)
- Rapid hotfix deployment process
- Regular dependency updates

### Product Risks
**Risk:** Core loop not engaging
**Mitigation:**
- Early playtesting (internal team plays for 2 weeks)
- Balance adjustments based on data
- Willingness to pivot features

**Risk:** Players find exploits
**Mitigation:**
- Server-side validation on all actions
- Anomaly detection
- Player reporting system
- Clear consequences for exploiting

### Community Risks
**Risk:** Toxic community culture develops
**Mitigation:**
- Clear code of conduct
- Active moderation from day 1
- Ban/mute tools implemented
- Positive community events

**Risk:** Low player acquisition
**Mitigation:**
- Referral program (beta players invite friends)
- Content marketing (dev blog, Reddit posts)
- Influencer partnerships (Phase 2)

---

## Conclusion

This MVP roadmap provides a clear, achievable path to launching The Sacred Empire's core experience. By focusing on the essential game loop and deferring advanced features to later phases, we can:

1. **Launch faster** (5-6 months vs. 2+ years for full scope)
2. **Validate core mechanics** before heavy investment
3. **Iterate based on real player feedback**
4. **Build community early** to support long-term growth
5. **Manage scope creep** through strict prioritization

**Next Steps After MVP:**
1. Analyze beta metrics and feedback
2. Make go/no-go decision for Phase 2
3. Plan Phase 2 features (multiplayer crimes, PvP, property rental)
4. Continue community growth
5. Explore monetization introduction (cosmetics only)

**Remember:** The goal of MVP is not to launch a complete game, but to launch a **compelling core loop** that players enjoy and want more of. Quality over quantity. Depth over breadth.

---

**Document Version:** 1.0
**Last Updated:** 2025-11-01
**Approved By:** [Development Team]
**Next Review:** After Week 12 (Mid-MVP Checkpoint)
