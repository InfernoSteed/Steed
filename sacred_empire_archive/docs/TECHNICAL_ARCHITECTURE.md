# The Sacred Empire: Technical Architecture

## Table of Contents
1. [Technology Stack](#technology-stack)
2. [System Architecture](#system-architecture)
3. [Database Design](#database-design)
4. [API Architecture](#api-architecture)
5. [Security & Authentication](#security--authentication)
6. [Performance & Scaling](#performance--scaling)
7. [DevOps & Deployment](#devops--deployment)
8. [Third-Party Integrations](#third-party-integrations)

---

## Technology Stack

### Backend Framework: Python/Django 4.2+

**Rationale:**
- ✅ **Mature ecosystem** - 18+ years of development, stable APIs
- ✅ **Built-in ORM** - Database abstraction with migration support
- ✅ **Admin interface** - Out-of-the-box administrative tools
- ✅ **Security features** - CSRF protection, XSS prevention, SQL injection protection
- ✅ **Large community** - Extensive documentation, third-party packages
- ✅ **Turn-based game fit** - Django excels at request/response cycles
- ✅ **Developer productivity** - Rapid development, "batteries included"

**Core Dependencies:**
```python
Django==4.2.7                 # Web framework
djangorestframework==3.14.0   # REST API framework
django-cors-headers==4.3.0    # CORS support
django-filter==23.3           # API filtering
celery==5.3.4                 # Async task queue
redis==5.0.1                  # Caching and Celery broker
channels==4.0.0               # WebSockets support
daphne==4.0.0                 # ASGI server
psycopg2-binary==2.9.9        # PostgreSQL adapter
python-dotenv==1.0.0          # Environment variable management
gunicorn==21.2.0              # WSGI server (production)
```

### Database Layer

#### Primary Database: PostgreSQL 15+
**Rationale:**
- ✅ **ACID compliance** - Critical for financial transactions (economy, trading)
- ✅ **JSON support** - Flexible data for items, configurations
- ✅ **Full-text search** - Forum and message searching
- ✅ **Geospatial** - PostGIS for territory/map features (future)
- ✅ **Performance** - Handles complex queries efficiently
- ✅ **Reliability** - Battle-tested in production environments

**Schema Highlights:**
- User accounts and authentication
- Character profiles and statistics
- Inventory and equipment
- Crews and memberships
- Properties and territory
- Transaction logs (audit trail)

#### Caching Layer: Redis 7+
**Rationale:**
- ✅ **In-memory speed** - Sub-millisecond response times
- ✅ **Data structures** - Lists, sets, sorted sets for leaderboards
- ✅ **Pub/sub** - Real-time messaging and notifications
- ✅ **Session storage** - Fast user session management
- ✅ **Celery broker** - Task queue message passing

**Cached Data:**
- User sessions (login state)
- Leaderboards and rankings
- Market listings
- Crew rosters
- Crime cooldowns
- Recently viewed pages

### Frontend Technology

#### Phase 1 (MVP): Server-Side Rendered (SSR) HTML
**Stack:**
- Django Templates
- Bootstrap 5.3 (responsive CSS framework)
- Vanilla JavaScript (ES6+) for interactions
- HTMX (lightweight AJAX library)
- Alpine.js (reactive UI components)

**Rationale:**
- ✅ **Rapid development** - Leverage Django's template system
- ✅ **SEO-friendly** - Server-rendered content
- ✅ **Low complexity** - No separate frontend build process
- ✅ **Progressive enhancement** - Works without JavaScript
- ✅ **Mobile-responsive** - Bootstrap handles responsive design

**Example Tech Stack:**
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>The Sacred Empire</title>

    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">

    <!-- Alpine.js for reactive components -->
    <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>

    <!-- HTMX for AJAX interactions -->
    <script src="https://unpkg.com/htmx.org@1.9.10"></script>
</head>
<body>
    <!-- Django template content -->
</body>
</html>
```

#### Phase 4 (Mobile Expansion): React Native
**Stack:**
- React Native 0.73+
- Expo framework (rapid development)
- Redux Toolkit (state management)
- React Navigation (routing)
- Axios (API calls)

**Rationale:**
- ✅ **Cross-platform** - iOS and Android from single codebase
- ✅ **React ecosystem** - Large community, many packages
- ✅ **Hot reload** - Fast development iteration
- ✅ **Native performance** - Comparable to native apps
- ✅ **Code reuse** - Share logic with potential web SPA

### Real-Time Features

#### WebSockets: Django Channels
**Use Cases:**
- Live chat (global, crew, trade)
- Real-time notifications
- Live leaderboard updates
- Crew activity feed
- Combat/territory battle updates

**Architecture:**
```
Client (Browser)
    ↓ WebSocket Connection
Django Channels (ASGI)
    ↓ Channel Layer
Redis (Message Broker)
    ↓ Broadcasting
All Connected Clients
```

**Example Implementation:**
```python
# consumers.py
from channels.generic.websocket import AsyncWebsocketConsumer
import json

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'chat_{self.room_name}'

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        message = data['message']

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message
            }
        )

    async def chat_message(self, event):
        message = event['message']
        await self.send(text_data=json.dumps({
            'message': message
        }))
```

### Task Queue: Celery

**Use Cases:**
- Scheduled tasks (crime resets, property income)
- Asynchronous processing (large data exports)
- Background jobs (email sending, notifications)
- Periodic tasks (leaderboard recalculation)

**Configuration:**
```python
# celery.py
from celery import Celery
from celery.schedules import crontab

app = Celery('sacred_empire')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()

# Periodic tasks
app.conf.beat_schedule = {
    'reset-daily-crimes': {
        'task': 'core.tasks.reset_daily_crime_bonuses',
        'schedule': crontab(hour=0, minute=0),  # Midnight daily
    },
    'collect-property-income': {
        'task': 'economy.tasks.process_property_income',
        'schedule': crontab(hour='*/6'),  # Every 6 hours
    },
    'update-leaderboards': {
        'task': 'rankings.tasks.update_all_leaderboards',
        'schedule': crontab(minute='*/15'),  # Every 15 minutes
    },
}
```

---

## System Architecture

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                            │
├─────────────────────────────────────────────────────────────────┤
│  Web Browser (Desktop/Mobile)  │  Mobile App (Phase 4)          │
│  - HTML/CSS/JS                 │  - React Native                │
│  - Bootstrap UI                │  - Native Components           │
│  - HTMX/Alpine.js              │  - Expo Framework              │
└─────────────────┬───────────────────────────────┬───────────────┘
                  │                               │
                  │ HTTPS/WSS                     │ HTTPS
                  │                               │
┌─────────────────▼───────────────────────────────▼───────────────┐
│                      LOAD BALANCER (Nginx)                      │
│                   - SSL Termination                             │
│                   - Request Routing                             │
│                   - Static File Serving                         │
│                   - Rate Limiting                               │
└─────────────────┬───────────────────────────────┬───────────────┘
                  │                               │
        ┌─────────▼─────────┐         ┌──────────▼────────┐
        │  HTTP Requests    │         │  WebSocket        │
        │                   │         │  Connections      │
        └─────────┬─────────┘         └──────────┬────────┘
                  │                               │
┌─────────────────▼───────────────────────────────▼───────────────┐
│                     APPLICATION LAYER                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────┐      ┌──────────────────────┐        │
│  │  Django (WSGI)      │      │  Channels (ASGI)     │        │
│  │  - REST API         │      │  - WebSockets        │        │
│  │  - Business Logic   │      │  - Real-time Updates │        │
│  │  - SSR Templates    │      │  - Chat System       │        │
│  └──────────┬──────────┘      └──────────┬───────────┘        │
│             │                            │                     │
│             └──────────┬─────────────────┘                     │
│                        │                                       │
└────────────────────────┼───────────────────────────────────────┘
                         │
           ┌─────────────┼─────────────┐
           │             │             │
           │             │             │
 ┌─────────▼────┐ ┌──────▼──────┐ ┌───▼──────────┐
 │ PostgreSQL   │ │   Redis     │ │   Celery     │
 │ (Primary DB) │ │  (Cache)    │ │ (Task Queue) │
 │              │ │             │ │              │
 │ - User Data  │ │ - Sessions  │ │ - Async Jobs │
 │ - Game State │ │ - Cache     │ │ - Scheduled  │
 │ - Inventory  │ │ - Pub/Sub   │ │ - Background │
 └──────────────┘ └─────────────┘ └──────────────┘
```

### Component Breakdown

#### 1. API Gateway (Nginx)
**Responsibilities:**
- SSL/TLS termination (HTTPS encryption)
- Load balancing (multiple application servers)
- Static file serving (CSS, JS, images)
- Rate limiting (prevent abuse)
- Request routing (API vs. WebSockets vs. static)
- Gzip compression

**Configuration Example:**
```nginx
upstream django_app {
    server web:8000;
    # Add more servers for horizontal scaling
    # server web2:8000;
    # server web3:8000;
}

upstream channels_app {
    server asgi:8001;
}

server {
    listen 80;
    server_name sacredempire.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name sacredempire.com;

    ssl_certificate /etc/ssl/certs/cert.pem;
    ssl_certificate_key /etc/ssl/private/key.pem;

    # Static files
    location /static/ {
        alias /app/staticfiles/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Media files (user uploads)
    location /media/ {
        alias /app/media/;
        expires 7d;
    }

    # WebSocket connections
    location /ws/ {
        proxy_pass http://channels_app;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }

    # API and web requests
    location / {
        proxy_pass http://django_app;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Rate limiting
        limit_req zone=api_limit burst=20 nodelay;
    }
}

# Rate limiting zone
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
```

#### 2. Application Layer (Django)
**Modules:**

```
backend/
├── core/                   # Core game logic
│   ├── models.py          # User, Character, Statistics
│   ├── views.py           # Main views
│   ├── tasks.py           # Celery tasks
│   └── utils.py           # Helper functions
├── crimes/                # Crime mechanics
│   ├── models.py          # Crime types, history
│   ├── services.py        # Crime execution logic
│   ├── apis.py            # REST API endpoints
│   └── tasks.py           # Crime reset tasks
├── economy/               # Economic systems
│   ├── models.py          # Items, Market, Transactions
│   ├── services.py        # Trading logic
│   ├── apis.py            # Market API
│   └── tasks.py           # Property income tasks
├── social/                # Social features
│   ├── models.py          # Crews, Messages, Forums
│   ├── services.py        # Crew management
│   ├── consumers.py       # WebSocket consumers
│   └── apis.py            # Social API
├── combat/                # PvP and combat
│   ├── models.py          # Combat logs, Bounties
│   ├── services.py        # Combat calculation
│   └── apis.py            # Combat API
├── territory/             # Territory control (Phase 3)
│   ├── models.py          # Territories, Control
│   ├── services.py        # Territory mechanics
│   └── apis.py            # Territory API
└── accounts/              # Authentication
    ├── models.py          # Custom User model
    ├── views.py           # Login, Register
    └── apis.py            # Auth API
```

#### 3. Data Layer

**PostgreSQL Schema Structure:**
```
Users & Profiles:
- users
- characters
- statistics
- preferences

Economy:
- items
- inventory
- transactions
- market_listings
- escrow_trades (Phase 3)

Social:
- crews
- crew_members
- messages
- forum_posts
- forum_replies

Crimes:
- crime_types
- crime_history
- organized_crimes
- crew_crimes

Combat:
- combat_logs
- bounties
- hospital_records

Territory:
- states
- cities
- properties
- territory_control
- casinos (Phase 3)

Logs & Audit:
- action_logs
- admin_logs
- transaction_logs
```

---

## Database Design

### Core Tables (MVP - Phase 1)

#### Users & Authentication
```sql
-- Custom user model extending Django AbstractUser
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_staff BOOLEAN DEFAULT FALSE,
    is_superuser BOOLEAN DEFAULT FALSE,
    date_joined TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP,
    ip_address INET,

    -- Additional fields
    vip_status BOOLEAN DEFAULT FALSE,
    vip_expiry TIMESTAMP NULL,
    points INTEGER DEFAULT 0,  -- Premium currency

    -- Indexes
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_vip_status (vip_status),
    INDEX idx_date_joined (date_joined)
);

-- Character profile (one-to-one with user)
CREATE TABLE characters (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,

    -- Profile
    display_name VARCHAR(100),
    bio TEXT,
    avatar_url VARCHAR(500),
    gender VARCHAR(20),

    -- Progression
    level INTEGER DEFAULT 1,
    experience BIGINT DEFAULT 0,
    rank VARCHAR(50) DEFAULT 'Associate',

    -- Resources
    cash BIGINT DEFAULT 1000,  -- Starting cash
    banked_cash BIGINT DEFAULT 0,

    -- Location
    current_city_id INTEGER REFERENCES cities(id),

    -- Status
    in_hospital BOOLEAN DEFAULT FALSE,
    hospital_until TIMESTAMP NULL,

    -- Safe Harbor (new player protection)
    safe_harbor_until TIMESTAMP DEFAULT NOW() + INTERVAL '7 days',

    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    -- Indexes
    INDEX idx_user_id (user_id),
    INDEX idx_level (level),
    INDEX idx_rank (rank),
    INDEX idx_safe_harbor (safe_harbor_until)
);

-- Character statistics (detailed tracking)
CREATE TABLE character_statistics (
    id SERIAL PRIMARY KEY,
    character_id INTEGER UNIQUE REFERENCES characters(id) ON DELETE CASCADE,

    -- Crime stats
    total_crimes INTEGER DEFAULT 0,
    successful_crimes INTEGER DEFAULT 0,
    failed_crimes INTEGER DEFAULT 0,
    solo_crimes INTEGER DEFAULT 0,
    multiplayer_crimes INTEGER DEFAULT 0,
    organized_crimes INTEGER DEFAULT 0,

    -- Combat stats
    total_attacks INTEGER DEFAULT 0,
    successful_attacks INTEGER DEFAULT 0,
    failed_attacks INTEGER DEFAULT 0,
    times_attacked INTEGER DEFAULT 0,
    kills INTEGER DEFAULT 0,
    deaths INTEGER DEFAULT 0,

    -- Economic stats
    total_earned BIGINT DEFAULT 0,
    total_spent BIGINT DEFAULT 0,
    items_bought INTEGER DEFAULT 0,
    items_sold INTEGER DEFAULT 0,

    -- Social stats
    crews_joined INTEGER DEFAULT 0,
    messages_sent INTEGER DEFAULT 0,
    forum_posts INTEGER DEFAULT 0,

    -- Timestamps
    updated_at TIMESTAMP DEFAULT NOW(),

    INDEX idx_character_id (character_id)
);
```

#### Items & Inventory
```sql
-- Item definitions (weapons, vehicles, armor, collectibles)
CREATE TABLE items (
    id SERIAL PRIMARY KEY,

    -- Identification
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    image_url VARCHAR(500),

    -- Classification
    category VARCHAR(50) NOT NULL,  -- weapon, vehicle, armor, collectible
    subcategory VARCHAR(50),        -- pistol, shotgun, etc.
    rarity VARCHAR(20) DEFAULT 'common',  -- common, rare, epic, legendary

    -- Stats (JSON for flexibility)
    stats JSONB DEFAULT '{}',
    -- Example: {"damage": 50, "accuracy": 85} for weapons
    -- Example: {"speed": 75, "storage": 5} for vehicles
    -- Example: {"protection": 20, "slot": "body"} for armor

    -- Economy
    base_price BIGINT NOT NULL,
    npc_sellable BOOLEAN DEFAULT TRUE,
    tradeable BOOLEAN DEFAULT TRUE,

    -- Requirements
    min_level INTEGER DEFAULT 1,
    min_rank VARCHAR(50) DEFAULT 'Associate',

    -- Metadata
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),

    -- Indexes
    INDEX idx_category (category),
    INDEX idx_rarity (rarity),
    INDEX idx_slug (slug),
    INDEX idx_base_price (base_price)
);

-- Player inventory
CREATE TABLE inventory (
    id SERIAL PRIMARY KEY,
    character_id INTEGER REFERENCES characters(id) ON DELETE CASCADE,
    item_id INTEGER REFERENCES items(id) ON DELETE CASCADE,

    -- Quantity and state
    quantity INTEGER DEFAULT 1,
    equipped BOOLEAN DEFAULT FALSE,

    -- Acquisition
    acquired_at TIMESTAMP DEFAULT NOW(),
    acquired_from VARCHAR(50),  -- crime, purchase, trade, gift

    -- Metadata
    notes TEXT,  -- For special items, history

    -- Unique constraint (one row per character-item pair)
    UNIQUE(character_id, item_id),

    -- Indexes
    INDEX idx_character_id (character_id),
    INDEX idx_item_id (item_id),
    INDEX idx_equipped (equipped)
);

-- Equipped loadout (for quick combat calculations)
CREATE TABLE equipped_loadout (
    id SERIAL PRIMARY KEY,
    character_id INTEGER UNIQUE REFERENCES characters(id) ON DELETE CASCADE,

    -- Equipment slots
    weapon_id INTEGER REFERENCES items(id) ON DELETE SET NULL,
    vehicle_id INTEGER REFERENCES items(id) ON DELETE SET NULL,
    armor_head_id INTEGER REFERENCES items(id) ON DELETE SET NULL,
    armor_body_id INTEGER REFERENCES items(id) ON DELETE SET NULL,
    armor_legs_id INTEGER REFERENCES items(id) ON DELETE SET NULL,

    -- Calculated stats (cached for performance)
    total_attack INTEGER DEFAULT 0,
    total_defense INTEGER DEFAULT 0,

    -- Timestamp
    updated_at TIMESTAMP DEFAULT NOW(),

    INDEX idx_character_id (character_id)
);
```

#### Crimes System
```sql
-- Crime type definitions
CREATE TABLE crime_types (
    id SERIAL PRIMARY KEY,

    -- Identification
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,  -- solo, multiplayer, organized

    -- Difficulty and rewards
    difficulty INTEGER DEFAULT 1,  -- 1-10 scale
    base_success_rate INTEGER DEFAULT 50,  -- Percentage
    base_cash_reward INTEGER DEFAULT 100,
    base_xp_reward INTEGER DEFAULT 10,

    -- Requirements
    min_level INTEGER DEFAULT 1,
    min_crew_members INTEGER DEFAULT 0,  -- For organized crimes
    cooldown_minutes INTEGER DEFAULT 5,  -- Time between attempts

    -- Risks
    jail_time_minutes INTEGER DEFAULT 0,  -- If failed
    hospital_time_minutes INTEGER DEFAULT 0,  -- If critically failed

    -- Metadata
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),

    INDEX idx_category (category),
    INDEX idx_slug (slug)
);

-- Crime attempt history
CREATE TABLE crime_history (
    id SERIAL PRIMARY KEY,
    character_id INTEGER REFERENCES characters(id) ON DELETE CASCADE,
    crime_type_id INTEGER REFERENCES crime_types(id) ON DELETE CASCADE,

    -- Attempt details
    attempted_at TIMESTAMP DEFAULT NOW(),
    success BOOLEAN NOT NULL,

    -- Rewards (if successful)
    cash_earned INTEGER DEFAULT 0,
    xp_earned INTEGER DEFAULT 0,
    items_found JSONB DEFAULT '[]',  -- Array of item IDs

    -- Context
    character_level INTEGER,
    success_rate INTEGER,  -- Calculated chance
    crew_id INTEGER REFERENCES crews(id) ON DELETE SET NULL,

    -- Indexes
    INDEX idx_character_id (character_id),
    INDEX idx_crime_type_id (crime_type_id),
    INDEX idx_attempted_at (attempted_at),
    INDEX idx_success (success)
);

-- Crime cooldowns (when player can attempt again)
CREATE TABLE crime_cooldowns (
    id SERIAL PRIMARY KEY,
    character_id INTEGER REFERENCES characters(id) ON DELETE CASCADE,
    crime_type_id INTEGER REFERENCES crime_types(id) ON DELETE CASCADE,

    -- Cooldown tracking
    last_attempted TIMESTAMP DEFAULT NOW(),
    can_attempt_at TIMESTAMP NOT NULL,

    -- Unique constraint
    UNIQUE(character_id, crime_type_id),

    -- Indexes
    INDEX idx_character_id (character_id),
    INDEX idx_can_attempt_at (can_attempt_at)
);

-- Daily crime tracking (for diminishing returns system)
CREATE TABLE daily_crime_counts (
    id SERIAL PRIMARY KEY,
    character_id INTEGER REFERENCES characters(id) ON DELETE CASCADE,
    date DATE DEFAULT CURRENT_DATE,

    -- Counts by category
    solo_crimes_today INTEGER DEFAULT 0,
    multiplayer_crimes_today INTEGER DEFAULT 0,
    organized_crimes_today INTEGER DEFAULT 0,

    -- Unique constraint (one row per character per day)
    UNIQUE(character_id, date),

    INDEX idx_character_date (character_id, date)
);
```

#### Social Systems (Crews)
```sql
-- Crews (gangs)
CREATE TABLE crews (
    id SERIAL PRIMARY KEY,

    -- Identification
    name VARCHAR(100) UNIQUE NOT NULL,
    tag VARCHAR(5) UNIQUE NOT NULL,  -- 3-5 character tag
    description TEXT,
    logo_url VARCHAR(500),

    -- Leadership
    founder_id INTEGER REFERENCES characters(id) ON DELETE SET NULL,
    current_don_id INTEGER REFERENCES characters(id) ON DELETE SET NULL,

    -- Stats
    total_members INTEGER DEFAULT 0,
    total_wealth BIGINT DEFAULT 0,
    reputation INTEGER DEFAULT 0,

    -- Settings
    recruitment_open BOOLEAN DEFAULT TRUE,
    min_level_requirement INTEGER DEFAULT 1,

    -- Bank (shared resources)
    crew_bank BIGINT DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    -- Indexes
    INDEX idx_name (name),
    INDEX idx_tag (tag),
    INDEX idx_reputation (reputation)
);

-- Crew membership
CREATE TABLE crew_members (
    id SERIAL PRIMARY KEY,
    crew_id INTEGER REFERENCES crews(id) ON DELETE CASCADE,
    character_id INTEGER REFERENCES characters(id) ON DELETE CASCADE,

    -- Role in crew
    role VARCHAR(50) DEFAULT 'Associate',  -- Don, Underboss, Caporegime, Soldier, Associate

    -- Contribution tracking
    crimes_completed INTEGER DEFAULT 0,
    cash_contributed BIGINT DEFAULT 0,
    respect INTEGER DEFAULT 0,

    -- Membership
    joined_at TIMESTAMP DEFAULT NOW(),
    promoted_at TIMESTAMP NULL,

    -- Unique constraint (character can only be in one crew)
    UNIQUE(character_id),

    -- Indexes
    INDEX idx_crew_id (crew_id),
    INDEX idx_character_id (character_id),
    INDEX idx_role (role)
);

-- Crew messages
CREATE TABLE crew_messages (
    id SERIAL PRIMARY KEY,
    crew_id INTEGER REFERENCES crews(id) ON DELETE CASCADE,
    sender_id INTEGER REFERENCES characters(id) ON DELETE SET NULL,

    -- Message content
    message TEXT NOT NULL,

    -- Metadata
    sent_at TIMESTAMP DEFAULT NOW(),
    edited_at TIMESTAMP NULL,
    deleted BOOLEAN DEFAULT FALSE,

    -- Indexes
    INDEX idx_crew_id_sent_at (crew_id, sent_at),
    INDEX idx_sender_id (sender_id)
);
```

#### Economy & Trading
```sql
-- Marketplace listings (player-to-player)
CREATE TABLE market_listings (
    id SERIAL PRIMARY KEY,
    seller_id INTEGER REFERENCES characters(id) ON DELETE CASCADE,
    item_id INTEGER REFERENCES items(id) ON DELETE CASCADE,

    -- Listing details
    quantity INTEGER DEFAULT 1,
    price_per_unit BIGINT NOT NULL,
    total_price BIGINT NOT NULL,

    -- Status
    status VARCHAR(20) DEFAULT 'active',  -- active, sold, cancelled, expired

    -- Timestamps
    listed_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '7 days',
    sold_at TIMESTAMP NULL,

    -- Indexes
    INDEX idx_seller_id (seller_id),
    INDEX idx_item_id (item_id),
    INDEX idx_status (status),
    INDEX idx_expires_at (expires_at)
);

-- Transactions (audit trail)
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,

    -- Parties involved
    from_character_id INTEGER REFERENCES characters(id) ON DELETE SET NULL,
    to_character_id INTEGER REFERENCES characters(id) ON DELETE SET NULL,

    -- Transaction details
    transaction_type VARCHAR(50) NOT NULL,  -- purchase, trade, gift, crime_reward
    amount BIGINT NOT NULL,
    item_id INTEGER REFERENCES items(id) ON DELETE SET NULL,
    item_quantity INTEGER DEFAULT 0,

    -- Context
    description TEXT,
    related_listing_id INTEGER REFERENCES market_listings(id) ON DELETE SET NULL,

    -- Timestamp
    occurred_at TIMESTAMP DEFAULT NOW(),

    -- Indexes
    INDEX idx_from_character (from_character_id),
    INDEX idx_to_character (to_character_id),
    INDEX idx_transaction_type (transaction_type),
    INDEX idx_occurred_at (occurred_at)
);
```

### Database Optimization Strategies

#### Indexing
```sql
-- Composite indexes for common queries
CREATE INDEX idx_crime_history_character_date
    ON crime_history(character_id, attempted_at DESC);

CREATE INDEX idx_market_active_items
    ON market_listings(status, item_id)
    WHERE status = 'active';

CREATE INDEX idx_characters_level_rank
    ON characters(level DESC, experience DESC);

-- Partial indexes (more efficient)
CREATE INDEX idx_active_users
    ON users(last_login DESC)
    WHERE is_active = TRUE;

CREATE INDEX idx_vip_users
    ON users(vip_expiry)
    WHERE vip_status = TRUE;
```

#### Partitioning (for large tables)
```sql
-- Partition crime_history by date (for archival)
CREATE TABLE crime_history (
    -- columns as before
) PARTITION BY RANGE (attempted_at);

CREATE TABLE crime_history_2025_01
    PARTITION OF crime_history
    FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

CREATE TABLE crime_history_2025_02
    PARTITION OF crime_history
    FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');

-- Auto-create partitions with pg_cron or application logic
```

#### Materialized Views (for complex queries)
```sql
-- Leaderboard (refresh every 15 minutes via Celery)
CREATE MATERIALIZED VIEW leaderboard_rankings AS
SELECT
    c.id AS character_id,
    c.display_name,
    c.level,
    c.experience,
    c.rank,
    cs.total_crimes,
    cs.kills,
    ROW_NUMBER() OVER (ORDER BY c.level DESC, c.experience DESC) AS rank_position
FROM characters c
JOIN character_statistics cs ON c.id = cs.character_id
WHERE c.user_id IN (SELECT id FROM users WHERE is_active = TRUE)
ORDER BY rank_position;

CREATE UNIQUE INDEX ON leaderboard_rankings (character_id);

-- Refresh via Celery task every 15 minutes
REFRESH MATERIALIZED VIEW CONCURRENTLY leaderboard_rankings;
```

---

## API Architecture

### RESTful API Design

#### API Versioning
**URL-based versioning:**
```
https://api.sacredempire.com/v1/characters/
https://api.sacredempire.com/v1/crimes/commit/
https://api.sacredempire.com/v1/market/listings/
```

#### Authentication
**JWT (JSON Web Tokens):**
```
POST /v1/auth/login/
{
    "username": "al_capone",
    "password": "secret123"
}

Response:
{
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
    "expires_in": 3600
}

Subsequent requests:
GET /v1/characters/me/
Headers:
    Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

#### Core API Endpoints (MVP)

```python
# accounts/apis.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """
    Register new user account

    POST /v1/auth/register/
    {
        "username": "john_dillinger",
        "email": "john@example.com",
        "password": "secret123"
    }
    """
    # Implementation
    pass

@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    """
    Login and receive JWT tokens

    POST /v1/auth/login/
    {
        "username": "john_dillinger",
        "password": "secret123"
    }
    """
    pass

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_character(request):
    """
    Get authenticated user's character profile

    GET /v1/characters/me/
    """
    character = request.user.character
    return Response({
        "id": character.id,
        "display_name": character.display_name,
        "level": character.level,
        "experience": character.experience,
        "rank": character.rank,
        "cash": character.cash,
        "current_city": character.current_city.name if character.current_city else None,
        "in_hospital": character.in_hospital,
        "safe_harbor_active": character.safe_harbor_until > timezone.now()
    })

# crimes/apis.py
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def commit_crime(request):
    """
    Attempt to commit a crime

    POST /v1/crimes/commit/
    {
        "crime_type": "grand-theft-auto"
    }
    """
    character = request.user.character
    crime_type_slug = request.data.get('crime_type')

    # Implementation in crimes/services.py
    from crimes.services import CrimeService
    result = CrimeService.attempt_crime(character, crime_type_slug)

    return Response(result)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_available_crimes(request):
    """
    Get list of crimes available to character

    GET /v1/crimes/available/
    """
    pass

# economy/apis.py
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_market_listings(request):
    """
    Get marketplace listings

    GET /v1/market/listings/
    Query params:
        - category: weapon, vehicle, armor
        - min_price: integer
        - max_price: integer
        - page: integer
    """
    pass

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_listing(request):
    """
    Create new market listing

    POST /v1/market/listings/
    {
        "item_id": 42,
        "quantity": 1,
        "price_per_unit": 5000
    }
    """
    pass

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def purchase_from_npc(request):
    """
    Purchase item from NPC marketplace

    POST /v1/economy/purchase/
    {
        "item_id": 15,
        "quantity": 1
    }
    """
    pass

# social/apis.py
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_crew(request):
    """
    Create new crew

    POST /v1/crews/create/
    {
        "name": "The Chicago Outfit",
        "tag": "CHI",
        "description": "Dominant crime family in Chicago"
    }
    """
    pass

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_crew_details(request, crew_id):
    """
    Get crew information

    GET /v1/crews/{crew_id}/
    """
    pass

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_message(request):
    """
    Send private message to another player

    POST /v1/messages/send/
    {
        "recipient_id": 42,
        "message": "Want to team up for a heist?"
    }
    """
    pass
```

### API Rate Limiting

```python
# settings.py
REST_FRAMEWORK = {
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle'
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '20/hour',  # Unauthenticated requests
        'user': '1000/hour',  # Authenticated requests
        'crimes': '60/hour',  # Crime-specific rate limit
        'trading': '100/hour',  # Trading-specific
    }
}

# Custom throttle for specific endpoints
from rest_framework.throttling import UserRateThrottle

class CrimeThrottle(UserRateThrottle):
    rate = '60/hour'

class TradingThrottle(UserRateThrottle):
    rate = '100/hour'
```

---

## Security & Authentication

### Authentication System

#### JWT Implementation
```python
# settings.py
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'AUTH_HEADER_TYPES': ('Bearer',),
}
```

### Security Measures

#### 1. Password Hashing
```python
# Django uses PBKDF2 by default (secure)
PASSWORD_HASHERS = [
    'django.contrib.auth.hashers.Argon2PasswordHasher',  # Most secure
    'django.contrib.auth.hashers.PBKDF2PasswordHasher',
    'django.contrib.auth.hashers.PBKDF2SHA1PasswordHasher',
]
```

#### 2. CSRF Protection
```python
# Enabled by default in Django
CSRF_COOKIE_SECURE = True  # Only send cookie over HTTPS
CSRF_COOKIE_HTTPONLY = True  # Prevent JavaScript access
SESSION_COOKIE_SECURE = True
```

#### 3. SQL Injection Prevention
```python
# ALWAYS use Django ORM (parameterized queries)
# ✅ SAFE
Character.objects.filter(username=user_input)

# ❌ NEVER do this
cursor.execute(f"SELECT * FROM characters WHERE username = '{user_input}'")
```

#### 4. XSS Prevention
```python
# Django templates auto-escape by default
{{ user_input }}  # Automatically escaped

# If you need raw HTML (dangerous!)
{{ user_input|safe }}  # Only use with trusted input
```

#### 5. Rate Limiting
```python
# Prevent brute force attacks
from django.core.cache import cache
from django.http import HttpResponseForbidden

def login_rate_limit(func):
    def wrapper(request, *args, **kwargs):
        ip = request.META.get('REMOTE_ADDR')
        key = f'login_attempts_{ip}'
        attempts = cache.get(key, 0)

        if attempts >= 5:
            return HttpResponseForbidden("Too many login attempts. Try again in 15 minutes.")

        response = func(request, *args, **kwargs)

        if response.status_code == 401:  # Failed login
            cache.set(key, attempts + 1, 900)  # 15 minutes
        else:
            cache.delete(key)

        return response
    return wrapper
```

#### 6. Anti-Cheat System
```python
# crimes/services.py
class CrimeService:
    @staticmethod
    def attempt_crime(character, crime_type_slug):
        # 1. Server-side validation
        crime_type = CrimeType.objects.get(slug=crime_type_slug)

        # 2. Check cooldown (prevent automation)
        cooldown = CrimeCooldown.objects.filter(
            character=character,
            crime_type=crime_type,
            can_attempt_at__gt=timezone.now()
        ).exists()

        if cooldown:
            return {"error": "Crime on cooldown"}

        # 3. Check level requirement
        if character.level < crime_type.min_level:
            return {"error": "Level too low"}

        # 4. Anomaly detection (suspicious patterns)
        recent_crimes = CrimeHistory.objects.filter(
            character=character,
            attempted_at__gte=timezone.now() - timedelta(minutes=5)
        ).count()

        if recent_crimes > 20:  # More than 20 crimes in 5 minutes
            # Flag for review
            AdminLog.objects.create(
                type='SUSPICIOUS_ACTIVITY',
                character=character,
                details=f'{recent_crimes} crimes in 5 minutes'
            )
            return {"error": "Rate limit exceeded"}

        # 5. Execute crime logic
        # ...
```

---

## Performance & Scaling

### Caching Strategy

```python
# settings.py
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': 'redis://127.0.0.1:6379/1',
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
        },
        'KEY_PREFIX': 'sacred_empire',
        'TIMEOUT': 300,  # 5 minutes default
    }
}

# Usage examples
from django.core.cache import cache

# Cache user session data
cache.set(f'character_{character.id}', character_data, 600)

# Cache leaderboard
cache.set('leaderboard_top_100', leaderboard_data, 900)

# Cache market listings
cache.set('market_active_listings', listings, 300)
```

### Database Query Optimization

```python
# ❌ N+1 Query Problem (BAD)
crews = Crew.objects.all()
for crew in crews:
    print(crew.current_don.display_name)  # Extra query for each crew!

# ✅ Optimized with select_related (GOOD)
crews = Crew.objects.select_related('current_don').all()
for crew in crews:
    print(crew.current_don.display_name)  # Single JOIN query

# ✅ Prefetch related items
characters = Character.objects.prefetch_related('inventory__item').all()

# ✅ Only fetch needed fields
Character.objects.values('id', 'display_name', 'level')
```

### Horizontal Scaling

```
┌──────────────┐
│ Load Balancer│
└──────┬───────┘
       │
   ┌───┴────────────┐
   │                │
┌──▼──┐          ┌──▼──┐
│Web 1│          │Web 2│  (Add more as needed)
└──┬──┘          └──┬──┘
   │                │
   └────┬──────┬────┘
        │      │
    ┌───▼──┐ ┌─▼────┐
    │ DB   │ │ Redis│
    └──────┘ └──────┘
```

**Stateless Application Servers:**
- No local session storage (use Redis)
- No local file uploads (use S3/object storage)
- Identical configuration across servers
- Can add/remove servers dynamically

---

## DevOps & Deployment

### Docker Configuration

```dockerfile
# Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Collect static files
RUN python manage.py collectstatic --noinput

EXPOSE 8000

CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "4", "sacred_empire.wsgi:application"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: sacred_empire
      POSTGRES_USER: sacred_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  web:
    build: .
    command: gunicorn --bind 0.0.0.0:8000 sacred_empire.wsgi:application
    volumes:
      - .:/app
      - static_volume:/app/staticfiles
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://sacred_user:${DB_PASSWORD}@db:5432/sacred_empire
      - REDIS_URL=redis://redis:6379/1
      - SECRET_KEY=${SECRET_KEY}
      - DEBUG=False
    depends_on:
      - db
      - redis

  asgi:
    build: .
    command: daphne -b 0.0.0.0 -p 8001 sacred_empire.asgi:application
    volumes:
      - .:/app
    ports:
      - "8001:8001"
    environment:
      - DATABASE_URL=postgresql://sacred_user:${DB_PASSWORD}@db:5432/sacred_empire
      - REDIS_URL=redis://redis:6379/1
    depends_on:
      - db
      - redis

  celery:
    build: .
    command: celery -A sacred_empire worker -l info
    volumes:
      - .:/app
    environment:
      - DATABASE_URL=postgresql://sacred_user:${DB_PASSWORD}@db:5432/sacred_empire
      - REDIS_URL=redis://redis:6379/1
    depends_on:
      - db
      - redis

  celery-beat:
    build: .
    command: celery -A sacred_empire beat -l info
    volumes:
      - .:/app
    environment:
      - DATABASE_URL=postgresql://sacred_user:${DB_PASSWORD}@db:5432/sacred_empire
      - REDIS_URL=redis://redis:6379/1
    depends_on:
      - db
      - redis

  nginx:
    image: nginx:alpine
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - static_volume:/app/staticfiles
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - web
      - asgi

volumes:
  postgres_data:
  static_volume:
```

### CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - name: Install dependencies
        run: |
          pip install -r requirements.txt
      - name: Run tests
        run: |
          python manage.py test
      - name: Run linters
        run: |
          flake8 .
          black --check .

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to server
        env:
          SSH_KEY: ${{ secrets.SSH_PRIVATE_KEY }}
        run: |
          # SSH into server and pull latest code
          # Run migrations
          # Restart services
```

---

## Third-Party Integrations

### Payment Processing
**Stripe Integration:**
```python
import stripe
stripe.api_key = settings.STRIPE_SECRET_KEY

def purchase_vip(user, months):
    amount = months * 999  # $9.99 per month in cents

    payment_intent = stripe.PaymentIntent.create(
        amount=amount,
        currency='usd',
        metadata={'user_id': user.id, 'months': months}
    )

    return payment_intent.client_secret
```

### Email Service
**SendGrid for transactional emails:**
```python
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

def send_welcome_email(user):
    message = Mail(
        from_email='noreply@sacredempire.com',
        to_emails=user.email,
        subject='Welcome to The Sacred Empire',
        html_content='<strong>Welcome to the family...</strong>'
    )

    sg = SendGridAPIClient(settings.SENDGRID_API_KEY)
    response = sg.send(message)
```

### Monitoring & Analytics
**Sentry for error tracking:**
```python
import sentry_sdk
from sentry_sdk.integrations.django import DjangoIntegration

sentry_sdk.init(
    dsn=settings.SENTRY_DSN,
    integrations=[DjangoIntegration()],
    traces_sample_rate=0.1,
)
```

---

## Conclusion

This technical architecture provides a solid foundation for The Sacred Empire, balancing:

- **Scalability:** Horizontal scaling, caching, database optimization
- **Security:** JWT auth, anti-cheat, rate limiting
- **Performance:** Redis caching, materialized views, query optimization
- **Maintainability:** Clean code structure, comprehensive testing
- **Cost-Effectiveness:** Start small, scale as needed

**Next Steps:**
1. Set up development environment (Docker)
2. Initialize Django project structure
3. Create database migrations
4. Implement MVP API endpoints
5. Build frontend templates
6. Deploy to staging environment

**Timeline Estimate:**
- Environment setup: 1 week
- MVP backend development: 8-10 weeks
- MVP frontend development: 6-8 weeks
- Testing and bug fixes: 4 weeks
- **Total MVP: ~20 weeks (5 months)**
