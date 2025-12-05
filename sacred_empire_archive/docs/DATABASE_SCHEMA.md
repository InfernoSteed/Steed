# The Sacred Empire: Database Schema Design

## Overview

This document provides the complete database schema for The Sacred Empire, organized by functional domains. The schema is designed for PostgreSQL 15+ with a focus on performance, data integrity, and scalability.

**Schema Version:** 1.0 (MVP Phase 1)
**Database:** PostgreSQL 15+
**Naming Convention:** snake_case for tables and columns
**Indexing Strategy:** Aggressive indexing on foreign keys and frequently queried columns

---

## Table of Contents
1. [Entity Relationship Diagram](#entity-relationship-diagram)
2. [User & Authentication](#user--authentication)
3. [Character & Progression](#character--progression)
4. [Items & Inventory](#items--inventory)
5. [Crime System](#crime-system)
6. [Social Systems](#social-systems)
7. [Economy & Trading](#economy--trading)
8. [Territory & Property](#territory--property-phase-3)
9. [Logging & Audit](#logging--audit)
10. [Indexes & Optimization](#indexes--optimization)

---

## Entity Relationship Diagram

```
┌─────────────┐
│    users    │
└──────┬──────┘
       │ 1:1
       ▼
┌─────────────┐          ┌──────────────┐
│ characters  │◄────────►│  inventory   │
└──────┬──────┘   1:N    └──────┬───────┘
       │                         │
       │ 1:1                     │ N:1
       ▼                         ▼
┌──────────────┐          ┌─────────────┐
│ statistics   │          │    items    │
└──────────────┘          └─────────────┘

┌─────────────┐          ┌──────────────┐
│ characters  │◄────────►│ crew_members │
└──────┬──────┘   1:N    └──────┬───────┘
       │                         │ N:1
       │                         ▼
       │                  ┌─────────────┐
       │                  │    crews    │
       │                  └──────┬──────┘
       │                         │ 1:N
       │                         ▼
       │                  ┌───────────────┐
       │                  │ crew_messages │
       │                  └───────────────┘
       │
       │ 1:N
       ▼
┌──────────────┐
│crime_history │
└──────┬───────┘
       │ N:1
       ▼
┌─────────────┐
│ crime_types │
└─────────────┘
```

---

## User & Authentication

### Table: users
**Purpose:** Core user accounts and authentication
**Django Model:** Extends `AbstractUser`

```sql
CREATE TABLE users (
    -- Primary Key
    id SERIAL PRIMARY KEY,

    -- Authentication (Django standard fields)
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,  -- Hashed with Argon2/PBKDF2

    -- Status Flags
    is_active BOOLEAN DEFAULT TRUE,
    is_staff BOOLEAN DEFAULT FALSE,
    is_superuser BOOLEAN DEFAULT FALSE,

    -- Account Dates
    date_joined TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP NULL,

    -- Security
    ip_address INET NULL,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP NULL,

    -- Premium Status
    vip_status BOOLEAN DEFAULT FALSE,
    vip_expiry TIMESTAMP NULL,
    points INTEGER DEFAULT 0,  -- Premium currency

    -- Metadata
    email_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255) NULL,

    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    -- Constraints
    CONSTRAINT chk_username_length CHECK (LENGTH(username) >= 3),
    CONSTRAINT chk_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT chk_points_positive CHECK (points >= 0)
);

-- Indexes
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_last_login ON users(last_login DESC);
CREATE INDEX idx_users_vip_status ON users(vip_status, vip_expiry);
CREATE INDEX idx_users_active ON users(is_active) WHERE is_active = TRUE;

-- Comments
COMMENT ON TABLE users IS 'User accounts and authentication';
COMMENT ON COLUMN users.password IS 'Hashed password using Argon2 or PBKDF2';
COMMENT ON COLUMN users.points IS 'Premium currency purchased with real money';
```

---

## Character & Progression

### Table: characters
**Purpose:** Player character profiles and game state
**Relationship:** 1:1 with users

```sql
CREATE TABLE characters (
    -- Primary Key
    id SERIAL PRIMARY KEY,

    -- Foreign Key
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Profile Information
    display_name VARCHAR(100) NOT NULL,
    bio TEXT DEFAULT '',
    avatar_url VARCHAR(500) NULL,
    gender VARCHAR(20) DEFAULT 'undisclosed',  -- male, female, undisclosed

    -- Progression
    level INTEGER DEFAULT 1,
    experience BIGINT DEFAULT 0,
    rank VARCHAR(50) DEFAULT 'Associate',  -- Associate, Soldier, Caporegime, Underboss, Boss

    -- Resources
    cash BIGINT DEFAULT 1000,  -- Starting cash
    banked_cash BIGINT DEFAULT 0,  -- Cannot be lost on death

    -- Location
    current_city_id INTEGER REFERENCES cities(id) DEFAULT 1,  -- Default to New York City
    current_state_id INTEGER REFERENCES states(id) DEFAULT 33,  -- Default to New York State

    -- Status Effects
    in_hospital BOOLEAN DEFAULT FALSE,
    hospital_until TIMESTAMP NULL,
    in_jail BOOLEAN DEFAULT FALSE,
    jail_until TIMESTAMP NULL,

    -- New Player Protection
    safe_harbor_until TIMESTAMP DEFAULT NOW() + INTERVAL '7 days',

    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_active TIMESTAMP DEFAULT NOW(),

    -- Constraints
    CONSTRAINT chk_level_positive CHECK (level >= 1 AND level <= 100),
    CONSTRAINT chk_experience_positive CHECK (experience >= 0),
    CONSTRAINT chk_cash_positive CHECK (cash >= 0),
    CONSTRAINT chk_banked_cash_positive CHECK (banked_cash >= 0),
    CONSTRAINT chk_rank_valid CHECK (rank IN ('Associate', 'Soldier', 'Caporegime', 'Underboss', 'Boss'))
);

-- Indexes
CREATE INDEX idx_characters_user_id ON characters(user_id);
CREATE INDEX idx_characters_level ON characters(level DESC);
CREATE INDEX idx_characters_rank ON characters(rank);
CREATE INDEX idx_characters_current_city ON characters(current_city_id);
CREATE INDEX idx_characters_safe_harbor ON characters(safe_harbor_until);
CREATE INDEX idx_characters_last_active ON characters(last_active DESC);

-- Partial Indexes
CREATE INDEX idx_characters_in_hospital ON characters(id) WHERE in_hospital = TRUE;
CREATE INDEX idx_characters_in_jail ON characters(id) WHERE in_jail = TRUE;

-- Comments
COMMENT ON TABLE characters IS 'Player character profiles and game state';
COMMENT ON COLUMN characters.safe_harbor_until IS '7-day protection period for new players';
COMMENT ON COLUMN characters.banked_cash IS 'Cash stored in bank, safe from death penalty';
```

### Table: character_statistics
**Purpose:** Detailed tracking of player actions
**Relationship:** 1:1 with characters

```sql
CREATE TABLE character_statistics (
    -- Primary Key
    id SERIAL PRIMARY KEY,

    -- Foreign Key
    character_id INTEGER UNIQUE NOT NULL REFERENCES characters(id) ON DELETE CASCADE,

    -- Crime Statistics
    total_crimes INTEGER DEFAULT 0,
    successful_crimes INTEGER DEFAULT 0,
    failed_crimes INTEGER DEFAULT 0,
    solo_crimes INTEGER DEFAULT 0,
    multiplayer_crimes INTEGER DEFAULT 0,  -- Phase 2
    organized_crimes INTEGER DEFAULT 0,    -- Phase 2
    best_crime_streak INTEGER DEFAULT 0,

    -- Combat Statistics (Phase 2)
    total_attacks INTEGER DEFAULT 0,
    successful_attacks INTEGER DEFAULT 0,
    failed_attacks INTEGER DEFAULT 0,
    times_attacked INTEGER DEFAULT 0,
    times_defended INTEGER DEFAULT 0,
    kills INTEGER DEFAULT 0,
    deaths INTEGER DEFAULT 0,

    -- Economic Statistics
    total_earned BIGINT DEFAULT 0,
    total_spent BIGINT DEFAULT 0,
    items_bought INTEGER DEFAULT 0,
    items_sold INTEGER DEFAULT 0,
    highest_cash_amount BIGINT DEFAULT 0,

    -- Social Statistics
    crews_joined INTEGER DEFAULT 0,
    crews_created INTEGER DEFAULT 0,
    messages_sent INTEGER DEFAULT 0,
    messages_received INTEGER DEFAULT 0,
    forum_posts INTEGER DEFAULT 0,  -- Phase 2

    -- Progression Milestones
    first_crime_at TIMESTAMP NULL,
    last_crime_at TIMESTAMP NULL,
    first_kill_at TIMESTAMP NULL,  -- Phase 2
    max_level_reached INTEGER DEFAULT 1,

    -- Timestamps
    updated_at TIMESTAMP DEFAULT NOW(),

    -- Constraints
    CONSTRAINT chk_crime_totals CHECK (total_crimes = successful_crimes + failed_crimes)
);

-- Indexes
CREATE INDEX idx_stats_character_id ON character_statistics(character_id);

-- Comments
COMMENT ON TABLE character_statistics IS 'Detailed tracking of player actions and achievements';
```

### Table: equipped_loadout
**Purpose:** Currently equipped items for fast combat calculation
**Relationship:** 1:1 with characters

```sql
CREATE TABLE equipped_loadout (
    -- Primary Key
    id SERIAL PRIMARY KEY,

    -- Foreign Key
    character_id INTEGER UNIQUE NOT NULL REFERENCES characters(id) ON DELETE CASCADE,

    -- Equipment Slots
    weapon_id INTEGER REFERENCES items(id) ON DELETE SET NULL,
    vehicle_id INTEGER REFERENCES items(id) ON DELETE SET NULL,
    armor_head_id INTEGER REFERENCES items(id) ON DELETE SET NULL,
    armor_body_id INTEGER REFERENCES items(id) ON DELETE SET NULL,
    armor_legs_id INTEGER REFERENCES items(id) ON DELETE SET NULL,

    -- Cached Combat Stats (for performance)
    total_attack INTEGER DEFAULT 0,
    total_defense INTEGER DEFAULT 0,
    vehicle_speed INTEGER DEFAULT 0,

    -- Timestamps
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_loadout_character_id ON equipped_loadout(character_id);

-- Comments
COMMENT ON TABLE equipped_loadout IS 'Currently equipped items, cached stats for performance';
COMMENT ON COLUMN equipped_loadout.total_attack IS 'Cached attack power, updated when equipment changes';
```

---

## Items & Inventory

### Table: items
**Purpose:** Item definitions (weapons, vehicles, armor, collectibles)
**Type:** Static data (mostly seed data, rarely changes)

```sql
CREATE TABLE items (
    -- Primary Key
    id SERIAL PRIMARY KEY,

    -- Identification
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT DEFAULT '',
    image_url VARCHAR(500) NULL,

    -- Classification
    category VARCHAR(50) NOT NULL,  -- weapon, vehicle, armor, collectible, cosmetic
    subcategory VARCHAR(50) NULL,   -- pistol, shotgun, car, truck, etc.
    rarity VARCHAR(20) DEFAULT 'common',  -- common, rare, epic, legendary

    -- Stats (JSONB for flexibility)
    stats JSONB DEFAULT '{}',
    -- Examples:
    -- Weapon: {"damage": 50, "accuracy": 85}
    -- Vehicle: {"speed": 75, "storage": 5}
    -- Armor: {"protection": 20, "slot": "body"}

    -- Economy
    base_price BIGINT NOT NULL,
    npc_sellable BOOLEAN DEFAULT TRUE,
    tradeable BOOLEAN DEFAULT TRUE,

    -- Requirements
    min_level INTEGER DEFAULT 1,
    min_rank VARCHAR(50) DEFAULT 'Associate',

    -- Metadata
    is_active BOOLEAN DEFAULT TRUE,
    is_cosmetic BOOLEAN DEFAULT FALSE,  -- Cosmetic items have no stats

    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),

    -- Constraints
    CONSTRAINT chk_base_price_positive CHECK (base_price >= 0),
    CONSTRAINT chk_min_level_valid CHECK (min_level >= 1 AND min_level <= 100),
    CONSTRAINT chk_category_valid CHECK (category IN ('weapon', 'vehicle', 'armor', 'collectible', 'cosmetic')),
    CONSTRAINT chk_rarity_valid CHECK (rarity IN ('common', 'rare', 'epic', 'legendary'))
);

-- Indexes
CREATE INDEX idx_items_category ON items(category);
CREATE INDEX idx_items_rarity ON items(rarity);
CREATE INDEX idx_items_slug ON items(slug);
CREATE INDEX idx_items_base_price ON items(base_price);
CREATE INDEX idx_items_active ON items(is_active) WHERE is_active = TRUE;

-- Full-text search
CREATE INDEX idx_items_name_fts ON items USING GIN(to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- Comments
COMMENT ON TABLE items IS 'Item definitions (weapons, vehicles, armor, collectibles)';
COMMENT ON COLUMN items.stats IS 'JSONB column for flexible item statistics';
COMMENT ON COLUMN items.is_cosmetic IS 'True for cosmetic items (no gameplay stats)';
```

### Table: inventory
**Purpose:** Player-owned items
**Relationship:** Many characters have many items

```sql
CREATE TABLE inventory (
    -- Primary Key
    id SERIAL PRIMARY KEY,

    -- Foreign Keys
    character_id INTEGER NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    item_id INTEGER NOT NULL REFERENCES items(id) ON DELETE CASCADE,

    -- Quantity and State
    quantity INTEGER DEFAULT 1,
    equipped BOOLEAN DEFAULT FALSE,

    -- Acquisition Tracking
    acquired_at TIMESTAMP DEFAULT NOW(),
    acquired_from VARCHAR(50) DEFAULT 'unknown',  -- crime, purchase, trade, gift, admin

    -- Metadata
    notes TEXT NULL,  -- For special items, history, custom descriptions

    -- Unique Constraint (one row per character-item pair)
    UNIQUE(character_id, item_id),

    -- Constraints
    CONSTRAINT chk_quantity_positive CHECK (quantity > 0)
);

-- Indexes
CREATE INDEX idx_inventory_character_id ON inventory(character_id);
CREATE INDEX idx_inventory_item_id ON inventory(item_id);
CREATE INDEX idx_inventory_equipped ON inventory(character_id, equipped) WHERE equipped = TRUE;

-- Comments
COMMENT ON TABLE inventory IS 'Player-owned items';
COMMENT ON COLUMN inventory.acquired_from IS 'How the item was obtained: crime, purchase, trade, gift, admin';
```

---

## Crime System

### Table: crime_types
**Purpose:** Definition of crime activities
**Type:** Static data (seed data)

```sql
CREATE TABLE crime_types (
    -- Primary Key
    id SERIAL PRIMARY KEY,

    -- Identification
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT DEFAULT '',
    category VARCHAR(50) NOT NULL,  -- solo, multiplayer, organized

    -- Difficulty and Rewards
    difficulty INTEGER DEFAULT 1,  -- 1-10 scale
    base_success_rate INTEGER DEFAULT 50,  -- Percentage (0-100)
    base_cash_reward INTEGER DEFAULT 100,
    base_xp_reward INTEGER DEFAULT 10,

    -- Requirements
    min_level INTEGER DEFAULT 1,
    min_crew_members INTEGER DEFAULT 0,  -- For organized crimes (Phase 2)
    cooldown_minutes INTEGER DEFAULT 5,  -- Time between attempts

    -- Risks/Penalties
    jail_time_minutes INTEGER DEFAULT 0,  -- If failed
    hospital_time_minutes INTEGER DEFAULT 0,  -- If critically failed
    cash_loss_on_fail INTEGER DEFAULT 0,  -- Fine on failure

    -- Flavor
    flavor_text_success TEXT DEFAULT '',
    flavor_text_failure TEXT DEFAULT '',

    -- Metadata
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),

    -- Constraints
    CONSTRAINT chk_difficulty_valid CHECK (difficulty >= 1 AND difficulty <= 10),
    CONSTRAINT chk_success_rate_valid CHECK (base_success_rate >= 0 AND base_success_rate <= 100),
    CONSTRAINT chk_category_valid CHECK (category IN ('solo', 'multiplayer', 'organized'))
);

-- Indexes
CREATE INDEX idx_crime_types_category ON crime_types(category);
CREATE INDEX idx_crime_types_slug ON crime_types(slug);
CREATE INDEX idx_crime_types_active ON crime_types(is_active) WHERE is_active = TRUE;

-- Comments
COMMENT ON TABLE crime_types IS 'Definition of crime activities';
```

### Table: crime_history
**Purpose:** Log of all crime attempts
**Relationship:** Many characters have many crime attempts

```sql
CREATE TABLE crime_history (
    -- Primary Key
    id SERIAL PRIMARY KEY,

    -- Foreign Keys
    character_id INTEGER NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    crime_type_id INTEGER NOT NULL REFERENCES crime_types(id) ON DELETE CASCADE,

    -- Attempt Details
    attempted_at TIMESTAMP DEFAULT NOW(),
    success BOOLEAN NOT NULL,

    -- Rewards (if successful)
    cash_earned INTEGER DEFAULT 0,
    xp_earned INTEGER DEFAULT 0,
    items_found JSONB DEFAULT '[]',  -- Array of item IDs

    -- Context
    character_level INTEGER NOT NULL,
    success_rate INTEGER NOT NULL,  -- Calculated chance at time of attempt
    crew_id INTEGER REFERENCES crews(id) ON DELETE SET NULL,  -- If part of crew activity

    -- Roll (for transparency/debugging)
    roll_result INTEGER NULL,  -- 1-100 dice roll

    -- Constraints
    CONSTRAINT chk_cash_earned_positive CHECK (cash_earned >= 0),
    CONSTRAINT chk_xp_earned_positive CHECK (xp_earned >= 0),
    CONSTRAINT chk_success_rate_valid CHECK (success_rate >= 0 AND success_rate <= 100),
    CONSTRAINT chk_roll_valid CHECK (roll_result IS NULL OR (roll_result >= 1 AND roll_result <= 100))
);

-- Indexes
CREATE INDEX idx_crime_history_character_id ON crime_history(character_id);
CREATE INDEX idx_crime_history_crime_type_id ON crime_history(crime_type_id);
CREATE INDEX idx_crime_history_attempted_at ON crime_history(attempted_at DESC);
CREATE INDEX idx_crime_history_success ON crime_history(success);

-- Composite Index for queries like "recent crimes by character"
CREATE INDEX idx_crime_history_character_date ON crime_history(character_id, attempted_at DESC);

-- Partitioning (for large-scale)
-- Consider partitioning by attempted_at (monthly) once table grows large

-- Comments
COMMENT ON TABLE crime_history IS 'Log of all crime attempts for auditing and statistics';
COMMENT ON COLUMN crime_history.items_found IS 'JSONB array of item IDs found during crime (e.g., vehicles from GTA)';
```

### Table: crime_cooldowns
**Purpose:** Track when characters can attempt crimes again
**Relationship:** Many characters have many cooldowns

```sql
CREATE TABLE crime_cooldowns (
    -- Primary Key
    id SERIAL PRIMARY KEY,

    -- Foreign Keys
    character_id INTEGER NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    crime_type_id INTEGER NOT NULL REFERENCES crime_types(id) ON DELETE CASCADE,

    -- Cooldown Tracking
    last_attempted TIMESTAMP DEFAULT NOW(),
    can_attempt_at TIMESTAMP NOT NULL,

    -- Unique Constraint (one cooldown per character-crime pair)
    UNIQUE(character_id, crime_type_id)
);

-- Indexes
CREATE INDEX idx_crime_cooldowns_character_id ON crime_cooldowns(character_id);
CREATE INDEX idx_crime_cooldowns_can_attempt_at ON crime_cooldowns(can_attempt_at);

-- Composite Index for queries like "available crimes for character"
CREATE INDEX idx_crime_cooldowns_character_available ON crime_cooldowns(character_id, can_attempt_at);

-- Comments
COMMENT ON TABLE crime_cooldowns IS 'Tracks when characters can attempt each crime again';
```

### Table: daily_crime_counts
**Purpose:** Track crimes per day for diminishing returns
**Relationship:** One row per character per day

```sql
CREATE TABLE daily_crime_counts (
    -- Primary Key
    id SERIAL PRIMARY KEY,

    -- Foreign Key
    character_id INTEGER NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    date DATE DEFAULT CURRENT_DATE,

    -- Counts by Category
    solo_crimes_today INTEGER DEFAULT 0,
    multiplayer_crimes_today INTEGER DEFAULT 0,  -- Phase 2
    organized_crimes_today INTEGER DEFAULT 0,    -- Phase 2

    -- Unique Constraint (one row per character per day)
    UNIQUE(character_id, date),

    -- Constraints
    CONSTRAINT chk_solo_crimes_positive CHECK (solo_crimes_today >= 0),
    CONSTRAINT chk_multiplayer_crimes_positive CHECK (multiplayer_crimes_today >= 0),
    CONSTRAINT chk_organized_crimes_positive CHECK (organized_crimes_today >= 0)
);

-- Indexes
CREATE INDEX idx_daily_crime_counts_character_date ON daily_crime_counts(character_id, date);
CREATE INDEX idx_daily_crime_counts_date ON daily_crime_counts(date);

-- Cleanup old data (Celery task to delete rows older than 30 days)
-- DELETE FROM daily_crime_counts WHERE date < CURRENT_DATE - INTERVAL '30 days';

-- Comments
COMMENT ON TABLE daily_crime_counts IS 'Track crimes per day for diminishing returns system';
```

---

## Social Systems

### Table: crews
**Purpose:** Gangs/crews that players can join
**Relationship:** One crew has many members

```sql
CREATE TABLE crews (
    -- Primary Key
    id SERIAL PRIMARY KEY,

    -- Identification
    name VARCHAR(100) UNIQUE NOT NULL,
    tag VARCHAR(5) UNIQUE NOT NULL,  -- 3-5 character tag (e.g., "CHI", "NYC")
    description TEXT DEFAULT '',
    logo_url VARCHAR(500) NULL,

    -- Leadership
    founder_id INTEGER REFERENCES characters(id) ON DELETE SET NULL,
    current_don_id INTEGER REFERENCES characters(id) ON DELETE SET NULL,

    -- Statistics
    total_members INTEGER DEFAULT 0,
    total_wealth BIGINT DEFAULT 0,  -- Cumulative wealth of all members
    reputation INTEGER DEFAULT 0,   -- Earned through crimes, wars, etc.

    -- Settings
    recruitment_open BOOLEAN DEFAULT TRUE,
    min_level_requirement INTEGER DEFAULT 1,
    max_members INTEGER DEFAULT 20,  -- Upgradeable

    -- Economy
    crew_bank BIGINT DEFAULT 0,  -- Shared resources

    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    -- Constraints
    CONSTRAINT chk_tag_length CHECK (LENGTH(tag) >= 3 AND LENGTH(tag) <= 5),
    CONSTRAINT chk_tag_uppercase CHECK (tag = UPPER(tag)),
    CONSTRAINT chk_min_level_valid CHECK (min_level_requirement >= 1 AND min_level_requirement <= 100),
    CONSTRAINT chk_max_members_positive CHECK (max_members > 0),
    CONSTRAINT chk_crew_bank_positive CHECK (crew_bank >= 0)
);

-- Indexes
CREATE INDEX idx_crews_name ON crews(name);
CREATE INDEX idx_crews_tag ON crews(tag);
CREATE INDEX idx_crews_reputation ON crews(reputation DESC);
CREATE INDEX idx_crews_recruitment_open ON crews(recruitment_open) WHERE recruitment_open = TRUE;

-- Comments
COMMENT ON TABLE crews IS 'Gangs/crews that players can join';
COMMENT ON COLUMN crews.tag IS 'Short 3-5 character identifier, must be uppercase';
```

### Table: crew_members
**Purpose:** Membership in crews
**Relationship:** Many characters belong to (at most) one crew

```sql
CREATE TABLE crew_members (
    -- Primary Key
    id SERIAL PRIMARY KEY,

    -- Foreign Keys
    crew_id INTEGER NOT NULL REFERENCES crews(id) ON DELETE CASCADE,
    character_id INTEGER UNIQUE NOT NULL REFERENCES characters(id) ON DELETE CASCADE,

    -- Role in Crew
    role VARCHAR(50) DEFAULT 'Associate',  -- Don, Underboss, Caporegime, Soldier, Associate

    -- Contribution Tracking
    crimes_completed INTEGER DEFAULT 0,
    cash_contributed BIGINT DEFAULT 0,
    respect INTEGER DEFAULT 0,  -- Internal crew ranking

    -- Membership
    joined_at TIMESTAMP DEFAULT NOW(),
    promoted_at TIMESTAMP NULL,
    invited_by INTEGER REFERENCES characters(id) ON DELETE SET NULL,

    -- Constraints
    CONSTRAINT chk_role_valid CHECK (role IN ('Don', 'Underboss', 'Caporegime', 'Soldier', 'Associate')),
    CONSTRAINT chk_respect_positive CHECK (respect >= 0)
);

-- Indexes
CREATE INDEX idx_crew_members_crew_id ON crew_members(crew_id);
CREATE INDEX idx_crew_members_character_id ON crew_members(character_id);
CREATE INDEX idx_crew_members_role ON crew_members(crew_id, role);
CREATE INDEX idx_crew_members_respect ON crew_members(crew_id, respect DESC);

-- Comments
COMMENT ON TABLE crew_members IS 'Membership in crews';
COMMENT ON COLUMN crew_members.character_id IS 'Unique constraint: character can only be in one crew';
```

### Table: crew_messages
**Purpose:** Crew-wide chat messages
**Relationship:** Many messages per crew

```sql
CREATE TABLE crew_messages (
    -- Primary Key
    id SERIAL PRIMARY KEY,

    -- Foreign Keys
    crew_id INTEGER NOT NULL REFERENCES crews(id) ON DELETE CASCADE,
    sender_id INTEGER REFERENCES characters(id) ON DELETE SET NULL,  -- NULL if sender deleted

    -- Message Content
    message TEXT NOT NULL,

    -- Metadata
    sent_at TIMESTAMP DEFAULT NOW(),
    edited_at TIMESTAMP NULL,
    deleted BOOLEAN DEFAULT FALSE,

    -- Constraints
    CONSTRAINT chk_message_length CHECK (LENGTH(message) >= 1 AND LENGTH(message) <= 1000)
);

-- Indexes
CREATE INDEX idx_crew_messages_crew_sent ON crew_messages(crew_id, sent_at DESC);
CREATE INDEX idx_crew_messages_sender ON crew_messages(sender_id);
CREATE INDEX idx_crew_messages_deleted ON crew_messages(deleted) WHERE deleted = FALSE;

-- Cleanup old messages (Celery task to delete messages older than 90 days)
-- DELETE FROM crew_messages WHERE sent_at < NOW() - INTERVAL '90 days';

-- Comments
COMMENT ON TABLE crew_messages IS 'Crew-wide chat messages';
COMMENT ON COLUMN crew_messages.deleted IS 'Soft delete flag (for moderation)';
```

### Table: messages
**Purpose:** Private player-to-player messages
**Relationship:** Many messages between characters

```sql
CREATE TABLE messages (
    -- Primary Key
    id SERIAL PRIMARY KEY,

    -- Foreign Keys
    from_character_id INTEGER REFERENCES characters(id) ON DELETE SET NULL,
    to_character_id INTEGER NOT NULL REFERENCES characters(id) ON DELETE CASCADE,

    -- Message Content
    subject VARCHAR(200) DEFAULT 'No Subject',
    body TEXT NOT NULL,

    -- Status
    read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP NULL,
    replied BOOLEAN DEFAULT FALSE,

    -- Timestamps
    sent_at TIMESTAMP DEFAULT NOW(),

    -- Soft Delete
    deleted_by_sender BOOLEAN DEFAULT FALSE,
    deleted_by_recipient BOOLEAN DEFAULT FALSE,

    -- Constraints
    CONSTRAINT chk_subject_length CHECK (LENGTH(subject) <= 200),
    CONSTRAINT chk_body_length CHECK (LENGTH(body) >= 1 AND LENGTH(body) <= 5000)
);

-- Indexes
CREATE INDEX idx_messages_recipient ON messages(to_character_id, sent_at DESC);
CREATE INDEX idx_messages_sender ON messages(from_character_id, sent_at DESC);
CREATE INDEX idx_messages_unread ON messages(to_character_id, read) WHERE read = FALSE;

-- Comments
COMMENT ON TABLE messages IS 'Private player-to-player messages';
COMMENT ON COLUMN messages.deleted_by_sender IS 'Sender deleted (still visible to recipient)';
COMMENT ON COLUMN messages.deleted_by_recipient IS 'Recipient deleted (still visible to sender)';
```

---

## Economy & Trading

### Table: market_listings
**Purpose:** Player-to-player marketplace listings
**Relationship:** Characters sell items

```sql
CREATE TABLE market_listings (
    -- Primary Key
    id SERIAL PRIMARY KEY,

    -- Foreign Keys
    seller_id INTEGER NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    item_id INTEGER NOT NULL REFERENCES items(id) ON DELETE CASCADE,

    -- Listing Details
    quantity INTEGER DEFAULT 1,
    price_per_unit BIGINT NOT NULL,
    total_price BIGINT NOT NULL,

    -- Status
    status VARCHAR(20) DEFAULT 'active',  -- active, sold, cancelled, expired

    -- Timestamps
    listed_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '7 days',
    sold_at TIMESTAMP NULL,
    sold_to INTEGER REFERENCES characters(id) ON DELETE SET NULL,

    -- Constraints
    CONSTRAINT chk_quantity_positive CHECK (quantity > 0),
    CONSTRAINT chk_price_positive CHECK (price_per_unit > 0),
    CONSTRAINT chk_total_price_match CHECK (total_price = price_per_unit * quantity),
    CONSTRAINT chk_status_valid CHECK (status IN ('active', 'sold', 'cancelled', 'expired'))
);

-- Indexes
CREATE INDEX idx_market_listings_seller ON market_listings(seller_id);
CREATE INDEX idx_market_listings_item ON market_listings(item_id);
CREATE INDEX idx_market_listings_status ON market_listings(status);
CREATE INDEX idx_market_listings_expires ON market_listings(expires_at);

-- Composite Index for active listings
CREATE INDEX idx_market_active ON market_listings(status, item_id, price_per_unit)
    WHERE status = 'active';

-- Comments
COMMENT ON TABLE market_listings IS 'Player-to-player marketplace listings';
```

### Table: transactions
**Purpose:** Audit trail of all economic transactions
**Relationship:** Tracks movements of cash and items

```sql
CREATE TABLE transactions (
    -- Primary Key
    id SERIAL PRIMARY KEY,

    -- Parties Involved
    from_character_id INTEGER REFERENCES characters(id) ON DELETE SET NULL,  -- NULL for NPC/system
    to_character_id INTEGER REFERENCES characters(id) ON DELETE SET NULL,

    -- Transaction Details
    transaction_type VARCHAR(50) NOT NULL,  -- npc_purchase, player_trade, crime_reward, crew_contribution, gift
    amount BIGINT NOT NULL,  -- Cash amount
    item_id INTEGER REFERENCES items(id) ON DELETE SET NULL,
    item_quantity INTEGER DEFAULT 0,

    -- Context
    description TEXT DEFAULT '',
    related_listing_id INTEGER REFERENCES market_listings(id) ON DELETE SET NULL,
    related_crime_id INTEGER REFERENCES crime_history(id) ON DELETE SET NULL,

    -- Timestamp
    occurred_at TIMESTAMP DEFAULT NOW(),

    -- Constraints
    CONSTRAINT chk_transaction_type_valid CHECK (transaction_type IN (
        'npc_purchase', 'player_trade', 'crime_reward', 'crew_contribution',
        'gift', 'admin_grant', 'death_penalty', 'level_up_bonus'
    ))
);

-- Indexes
CREATE INDEX idx_transactions_from_character ON transactions(from_character_id, occurred_at DESC);
CREATE INDEX idx_transactions_to_character ON transactions(to_character_id, occurred_at DESC);
CREATE INDEX idx_transactions_type ON transactions(transaction_type);
CREATE INDEX idx_transactions_occurred_at ON transactions(occurred_at DESC);

-- Partitioning (for large-scale)
-- Consider partitioning by occurred_at (monthly) once table grows large

-- Comments
COMMENT ON TABLE transactions IS 'Audit trail of all economic transactions';
COMMENT ON COLUMN transactions.from_character_id IS 'NULL for NPC/system transactions';
```

---

## Territory & Property (Phase 3)

### Table: states
**Purpose:** US states for territory system
**Type:** Static data (51 rows: 50 states + DC)

```sql
CREATE TABLE states (
    -- Primary Key
    id SERIAL PRIMARY KEY,

    -- Identification
    name VARCHAR(100) UNIQUE NOT NULL,
    abbreviation VARCHAR(2) UNIQUE NOT NULL,
    region VARCHAR(50) NOT NULL,  -- Northeast, South, Midwest, West

    -- Bonuses (configurable)
    crime_bonus_percentage INTEGER DEFAULT 0,  -- +/- % to crime success
    property_cost_multiplier DECIMAL(3, 2) DEFAULT 1.0,  -- 0.8 = 20% cheaper

    -- Metadata
    is_active BOOLEAN DEFAULT TRUE
);

-- Indexes
CREATE INDEX idx_states_abbreviation ON states(abbreviation);
CREATE INDEX idx_states_region ON states(region);

-- Seed Data Example
INSERT INTO states (name, abbreviation, region) VALUES
    ('New York', 'NY', 'Northeast'),
    ('Illinois', 'IL', 'Midwest'),
    ('California', 'CA', 'West'),
    -- ... 48 more states
    ('District of Columbia', 'DC', 'Northeast');

-- Comments
COMMENT ON TABLE states IS 'US states for territory system (50 states + DC)';
```

### Table: cities
**Purpose:** Cities within states
**Relationship:** Many cities per state

```sql
CREATE TABLE cities (
    -- Primary Key
    id SERIAL PRIMARY KEY,

    -- Foreign Key
    state_id INTEGER NOT NULL REFERENCES states(id) ON DELETE CASCADE,

    -- Identification
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,

    -- Metadata
    population INTEGER DEFAULT 0,  -- Historical population (flavor)
    is_major_city BOOLEAN DEFAULT FALSE,  -- NYC, Chicago, etc.

    -- Unique Constraint (same city name can exist in different states)
    UNIQUE(state_id, name)
);

-- Indexes
CREATE INDEX idx_cities_state_id ON cities(state_id);
CREATE INDEX idx_cities_slug ON cities(slug);
CREATE INDEX idx_cities_major ON cities(is_major_city) WHERE is_major_city = TRUE;

-- Seed Data Example (Phase 1: 10 major cities)
INSERT INTO cities (state_id, name, slug, is_major_city) VALUES
    (33, 'New York City', 'new-york-city', TRUE),  -- NY
    (14, 'Chicago', 'chicago', TRUE),              -- IL
    (5, 'Los Angeles', 'los-angeles', TRUE);       -- CA

-- Comments
COMMENT ON TABLE cities IS 'Cities within states for location and territory';
```

### Table: properties (Phase 3)
**Purpose:** Purchasable properties for passive income
**Relationship:** Many properties per city

```sql
CREATE TABLE properties (
    -- Primary Key
    id SERIAL PRIMARY KEY,

    -- Foreign Keys
    city_id INTEGER NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
    owner_id INTEGER REFERENCES characters(id) ON DELETE SET NULL,

    -- Property Details
    property_type VARCHAR(50) NOT NULL,  -- apartment, house, mansion, speakeasy, casino, factory
    name VARCHAR(200) NOT NULL,
    description TEXT DEFAULT '',

    -- Economics
    purchase_price BIGINT NOT NULL,
    weekly_rent BIGINT DEFAULT 0,       -- If renting (not owning)
    daily_income BIGINT DEFAULT 0,      -- Passive income for businesses
    upkeep_cost BIGINT DEFAULT 0,       -- Daily maintenance cost

    -- Bonuses
    storage_slots INTEGER DEFAULT 0,    -- Additional inventory space
    bonus_stats JSONB DEFAULT '{}',     -- Various bonuses

    -- Ownership
    purchased_at TIMESTAMP NULL,
    rent_paid_until TIMESTAMP NULL,

    -- Constraints
    CONSTRAINT chk_property_type_valid CHECK (property_type IN (
        'apartment', 'house', 'mansion', 'speakeasy', 'casino', 'bullet_factory', 'warehouse'
    ))
);

-- Indexes
CREATE INDEX idx_properties_city_id ON properties(city_id);
CREATE INDEX idx_properties_owner_id ON properties(owner_id);
CREATE INDEX idx_properties_type ON properties(property_type);
CREATE INDEX idx_properties_available ON properties(owner_id) WHERE owner_id IS NULL;

-- Comments
COMMENT ON TABLE properties IS 'Purchasable properties for passive income (Phase 3)';
```

---

## Logging & Audit

### Table: action_logs
**Purpose:** Comprehensive logging of player actions for security and debugging
**Relationship:** Many logs per character

```sql
CREATE TABLE action_logs (
    -- Primary Key
    id SERIAL PRIMARY KEY,

    -- Foreign Key
    character_id INTEGER REFERENCES characters(id) ON DELETE SET NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,

    -- Action Details
    action_type VARCHAR(100) NOT NULL,  -- login, crime_attempt, purchase, trade, etc.
    action_data JSONB DEFAULT '{}',     -- Flexible data storage
    ip_address INET NULL,

    -- Result
    success BOOLEAN NOT NULL,
    error_message TEXT NULL,

    -- Timestamp
    occurred_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_action_logs_character ON action_logs(character_id, occurred_at DESC);
CREATE INDEX idx_action_logs_user ON action_logs(user_id, occurred_at DESC);
CREATE INDEX idx_action_logs_action_type ON action_logs(action_type);
CREATE INDEX idx_action_logs_occurred_at ON action_logs(occurred_at DESC);
CREATE INDEX idx_action_logs_ip ON action_logs(ip_address);

-- Partitioning (recommended)
-- Partition by occurred_at (monthly) for performance

-- Cleanup old logs (Celery task to delete logs older than 90 days)
-- DELETE FROM action_logs WHERE occurred_at < NOW() - INTERVAL '90 days';

-- Comments
COMMENT ON TABLE action_logs IS 'Comprehensive logging for security and debugging';
```

### Table: admin_logs
**Purpose:** Staff/admin actions for accountability
**Relationship:** Many logs per admin

```sql
CREATE TABLE admin_logs (
    -- Primary Key
    id SERIAL PRIMARY KEY,

    -- Foreign Key
    admin_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_character_id INTEGER REFERENCES characters(id) ON DELETE SET NULL,

    -- Action Details
    action_type VARCHAR(100) NOT NULL,  -- ban, unban, grant_item, adjust_cash, etc.
    action_data JSONB DEFAULT '{}',
    reason TEXT NOT NULL,

    -- Timestamp
    occurred_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_admin_logs_admin ON admin_logs(admin_user_id, occurred_at DESC);
CREATE INDEX idx_admin_logs_target ON admin_logs(target_character_id, occurred_at DESC);
CREATE INDEX idx_admin_logs_action_type ON admin_logs(action_type);
CREATE INDEX idx_admin_logs_occurred_at ON admin_logs(occurred_at DESC);

-- Comments
COMMENT ON TABLE admin_logs IS 'Staff/admin actions for accountability';
```

---

## Indexes & Optimization

### Indexing Strategy

**Primary Indexes:**
- All foreign keys are indexed
- Commonly queried columns (username, email, level, etc.)
- Timestamp columns for sorting (created_at, attempted_at, etc.)

**Composite Indexes:**
- Frequently combined queries (character_id + date)
- Sorting + filtering (status + price)

**Partial Indexes:**
- Only index relevant rows (WHERE is_active = TRUE)
- Reduces index size, improves performance

**Full-Text Search:**
- GIN indexes on text fields (item names, descriptions)
- Enables fast searching

### Query Optimization Tips

```sql
-- Use EXPLAIN ANALYZE to understand query performance
EXPLAIN ANALYZE
SELECT * FROM characters WHERE level > 50 ORDER BY experience DESC LIMIT 100;

-- Avoid SELECT * (only fetch needed columns)
-- ❌ BAD
SELECT * FROM characters;

-- ✅ GOOD
SELECT id, display_name, level FROM characters;

-- Use LIMIT for pagination
SELECT * FROM crime_history
WHERE character_id = 123
ORDER BY attempted_at DESC
LIMIT 50 OFFSET 0;  -- Page 1

-- Use EXISTS for boolean checks (faster than COUNT)
-- ❌ BAD
SELECT COUNT(*) > 0 FROM inventory WHERE character_id = 123 AND item_id = 45;

-- ✅ GOOD
SELECT EXISTS(SELECT 1 FROM inventory WHERE character_id = 123 AND item_id = 45);
```

### Materialized Views for Leaderboards

```sql
-- Leaderboard view (refresh every 15 minutes)
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
JOIN users u ON c.user_id = u.id
WHERE u.is_active = TRUE
ORDER BY rank_position;

CREATE UNIQUE INDEX ON leaderboard_rankings (character_id);

-- Refresh via Celery task
REFRESH MATERIALIZED VIEW CONCURRENTLY leaderboard_rankings;
```

---

## Database Maintenance

### Automated Tasks (Celery)

```python
# tasks.py
from celery import shared_task

@shared_task
def reset_daily_crime_bonuses():
    """Reset daily crime counts at midnight"""
    # Handled by date-based lookup, no deletion needed
    pass

@shared_task
def expire_market_listings():
    """Mark expired listings as expired"""
    MarketListing.objects.filter(
        expires_at__lte=timezone.now(),
        status='active'
    ).update(status='expired')

@shared_task
def release_hospital_patients():
    """Release characters from hospital when time expires"""
    Character.objects.filter(
        in_hospital=True,
        hospital_until__lte=timezone.now()
    ).update(in_hospital=False, hospital_until=None)

@shared_task
def cleanup_old_logs():
    """Delete logs older than 90 days"""
    cutoff = timezone.now() - timedelta(days=90)
    ActionLog.objects.filter(occurred_at__lt=cutoff).delete()
    CrewMessage.objects.filter(sent_at__lt=cutoff).delete()

@shared_task
def refresh_leaderboards():
    """Refresh materialized views for leaderboards"""
    from django.db import connection
    with connection.cursor() as cursor:
        cursor.execute("REFRESH MATERIALIZED VIEW CONCURRENTLY leaderboard_rankings;")
```

### Backup Strategy

```bash
# Daily backups
pg_dump -U sacred_user -d sacred_empire -F c -b -v -f backup_$(date +%Y%m%d).dump

# Weekly full backups (retain for 4 weeks)
# Monthly archives (retain for 1 year)
# Critical tables backed up hourly: users, characters, inventory, transactions
```

---

## Schema Versioning

**Current Version:** 1.0 (MVP Phase 1)

**Migration Strategy:**
- Django migrations for schema changes
- Version control all migration files
- Test migrations on staging before production
- Plan backward-compatible changes when possible

**Phase Roadmap:**
- **Phase 1 (MVP):** Current schema
- **Phase 2:** Add multiplayer_crimes, organized_crimes, pvp_combat tables
- **Phase 3:** Add properties, territories, casinos, escrow_trades
- **Phase 4:** Mobile-specific tables, push_notifications, achievements

---

## Conclusion

This database schema provides a solid foundation for The Sacred Empire, designed for:

✅ **Performance:** Aggressive indexing, materialized views, partitioning
✅ **Scalability:** Partitioned tables, caching strategy, horizontal scaling
✅ **Data Integrity:** Foreign key constraints, check constraints, ACID compliance
✅ **Auditability:** Comprehensive logging, transaction trails
✅ **Flexibility:** JSONB for dynamic data, phased rollout structure

**Next Steps:**
1. Create Django models from this schema
2. Generate initial migrations
3. Seed static data (items, crime_types, states, cities)
4. Set up backup automation
5. Configure monitoring (query performance, slow queries)

---

**Document Version:** 1.0
**Last Updated:** 2025-11-01
**Database:** PostgreSQL 15+
