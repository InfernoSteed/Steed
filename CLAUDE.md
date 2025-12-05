# CLAUDE.md - AI Assistant Guide for The Sacred Empire

> **Last Updated:** 2025-12-05
> **Project:** The Sacred Empire - 1920s Prohibition-Era Multiplayer Browser Game
> **Stage:** Pre-Alpha / MVP Development
> **Branch:** claude/claude-md-mitargmev6irsf6i-01HtDZn3fX18XZVje8ZMvubD

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Quick Start for AI Assistants](#quick-start-for-ai-assistants)
3. [Codebase Structure](#codebase-structure)
4. [Technology Stack](#technology-stack)
5. [Development Workflows](#development-workflows)
6. [Key Conventions](#key-conventions)
7. [Critical Files](#critical-files)
8. [Common Tasks](#common-tasks)
9. [Testing Guidelines](#testing-guidelines)
10. [Git Workflow](#git-workflow)
11. [Important Context](#important-context)

---

## Project Overview

### What is The Sacred Empire?

A **1920s Prohibition-era multiplayer browser game** where players build criminal empires through strategic crime, crew cooperation, and territorial control.

**Core Gameplay Loop:**
```
Register → Create Character → Commit Crimes → Earn Money/XP →
Buy Equipment → Level Up → Join/Create Crew → Organized Crimes →
Territory Control → Build Empire
```

### Current Development Phase

**Status:** Phase 1 (MVP) - Infrastructure and Core Features
**Duration:** Week 1 of 24-week roadmap
**Completed:** Django project setup, basic infrastructure
**Next:** User authentication, character system, crime mechanics

### Key Design Principles

1. **Depth Over Breadth** - Perfect 10 features rather than rush 100
2. **Respect Player Time** - No mandatory twice-daily check-ins
3. **Never Sell Power** - Fair monetization (cosmetics only)
4. **Protect New Players** - 7-day safe harbor period
5. **Community First** - Browser games succeed through community

---

## Quick Start for AI Assistants

### First Steps When Working on This Project

1. **Read the Game Design** - Understand the vision:
   - `docs/GAME_DESIGN.md` - Complete feature analysis
   - `docs/MVP_ROADMAP.md` - Current phase objectives

2. **Understand the Architecture**:
   - `docs/TECHNICAL_ARCHITECTURE.md` - System design
   - `docs/DATABASE_SCHEMA.md` - Data model
   - `docs/API.md` - Endpoint specifications

3. **Check Current State**:
   ```bash
   git status
   git log --oneline -10
   ```

4. **Set Up Environment** (if needed):
   ```bash
   docker-compose up -d
   docker-compose exec web python manage.py migrate
   ```

### Critical Context for AI Assistants

- **This is a Django REST API project** with PostgreSQL + Redis
- **MVP Phase**: Only implement core features (see MVP_ROADMAP.md)
- **No Feature Creep**: Defer advanced features to Phase 2+
- **Testing Required**: 80% coverage minimum
- **Code Quality**: Black formatting, Flake8 linting, type hints preferred

---

## Codebase Structure

### Repository Layout

```
Steed/
├── backend/                      # Django backend application
│   ├── sacred_empire/           # Main Django project
│   │   ├── settings.py         # Django configuration ⭐
│   │   ├── urls.py             # URL routing
│   │   ├── celery.py           # Celery task queue config
│   │   ├── wsgi.py             # WSGI entry point
│   │   └── asgi.py             # ASGI entry point (Phase 2)
│   │
│   ├── apps/                    # Django applications
│   │   ├── accounts/           # User authentication & custom User model
│   │   │   ├── models.py      # User model (extends AbstractUser)
│   │   │   ├── views.py       # Auth views
│   │   │   ├── serializers.py # DRF serializers
│   │   │   └── urls.py        # Auth endpoints
│   │   │
│   │   ├── core/              # Character profiles & game state
│   │   │   ├── models.py      # Character, Statistics, EquippedLoadout
│   │   │   ├── views.py       # Character CRUD
│   │   │   ├── tasks.py       # Celery tasks (hospital release, leaderboards)
│   │   │   └── signals.py     # Django signals (auto-create character)
│   │   │
│   │   ├── crimes/            # Crime mechanics & logic
│   │   │   ├── models.py      # CrimeType, CrimeHistory, CrimeCooldown
│   │   │   ├── services.py    # Business logic (crime execution)
│   │   │   ├── views.py       # Crime API endpoints
│   │   │   └── tasks.py       # Daily reset tasks
│   │   │
│   │   ├── economy/           # Items, inventory, marketplace
│   │   │   ├── models.py      # Item, Inventory, MarketListing, Transaction
│   │   │   ├── services.py    # Trading logic
│   │   │   ├── views.py       # Economy API
│   │   │   └── tasks.py       # Market expiry tasks
│   │   │
│   │   ├── social/            # Crews, messaging, community
│   │   │   ├── models.py      # Crew, CrewMember, Message, CrewMessage
│   │   │   ├── services.py    # Crew management
│   │   │   └── views.py       # Social API
│   │   │
│   │   ├── combat/            # PvP combat system (Phase 2)
│   │   └── territory/         # Territory control (Phase 3)
│   │
│   └── manage.py              # Django management script
│
├── docs/                       # Comprehensive documentation
│   ├── GAME_DESIGN.md         # Complete game mechanics (1152 lines)
│   ├── TECHNICAL_ARCHITECTURE.md  # System design (1662 lines)
│   ├── DATABASE_SCHEMA.md     # Data model (1273 lines)
│   ├── API.md                 # RESTful API endpoints (734 lines)
│   ├── MVP_ROADMAP.md         # Phase 1 roadmap (1327 lines)
│   └── MONETIZATION.md        # Fair revenue model
│
├── frontend/                   # Frontend (Phase 1: Server-Side Rendered)
│   ├── templates/             # Django templates
│   └── static/                # CSS, JS, images
│
├── .env.example               # Environment variable template
├── requirements.txt           # Python dependencies
├── Dockerfile                 # Docker container spec
├── docker-compose.yml         # Multi-container orchestration
├── README.md                  # Main project documentation
├── CONTRIBUTING.md            # Contribution guidelines
└── CLAUDE.md                  # This file (AI assistant guide)
```

### Django App Responsibilities

| App | Purpose | Status | Key Models |
|-----|---------|--------|------------|
| **accounts** | User authentication, JWT tokens, custom User model | ✅ Setup Complete | `User` |
| **core** | Character profiles, stats, progression, leaderboards | ✅ Setup Complete | `Character`, `CharacterStatistics`, `EquippedLoadout` |
| **crimes** | Crime mechanics, cooldowns, daily bonuses | 🔄 In Progress | `CrimeType`, `CrimeHistory`, `CrimeCooldown`, `DailyCrimeCount` |
| **economy** | Items, inventory, NPC marketplace, player trading | 🔄 In Progress | `Item`, `Inventory`, `MarketListing`, `Transaction` |
| **social** | Crews, messaging, forums, community features | 🔄 In Progress | `Crew`, `CrewMember`, `Message`, `CrewMessage` |
| **combat** | PvP mechanics, bounties, hospital system | ❌ Phase 2 | TBD |
| **territory** | Properties, territory control, casinos | ❌ Phase 3 | `State`, `City`, `Property` |

---

## Technology Stack

### Backend Framework

**Django 4.2.7** with Django REST Framework 3.14.0
- **Why Django?** Mature, "batteries included", excellent ORM, built-in admin
- **Why DRF?** Best-in-class REST API framework for Django
- **Auth:** JWT via `djangorestframework-simplejwt`
- **API Docs:** Auto-generated via `drf-spectacular` (Swagger/OpenAPI)

### Database Layer

**PostgreSQL 15+** (Primary Database)
- ACID compliance for financial transactions
- JSONB support for flexible item stats
- Full-text search for forums/messages (Phase 2)
- PostGIS-ready for territory features (Phase 3)

**Redis 7+** (Cache & Task Queue)
- In-memory cache (5-minute TTL default)
- Leaderboard sorted sets
- Session storage
- Celery broker

### Task Queue

**Celery 5.3.4** with Redis broker
- Background jobs: Email sending, exports
- Scheduled tasks (Celery Beat):
  - Reset daily crime bonuses (midnight UTC)
  - Expire market listings (every 30 min)
  - Release hospital patients (every 5 min)
  - Update leaderboards (every 15 min)

### Frontend (Phase 1 MVP)

**Server-Side Rendered (SSR)**
- Django Templates
- Bootstrap 5.3 (responsive CSS)
- Vanilla JavaScript (ES6+)
- HTMX for AJAX interactions
- Alpine.js for reactive components

**Why SSR for MVP?**
- Rapid development
- SEO-friendly
- No separate frontend build process
- Progressive enhancement

### DevOps

**Containerization:** Docker + Docker Compose
- Services: web, db (PostgreSQL), redis, celery, celery-beat
- Volume persistence for data
- Health checks on all services

**Production Stack:**
- Gunicorn WSGI server (4 workers)
- WhiteNoise for static file serving
- Nginx reverse proxy (recommended)
- Sentry for error tracking
- SendGrid for transactional emails

### Code Quality Tools

- **Black 23.11.0** - Code formatter (100-char line length)
- **Flake8 6.1.0** - Linting
- **isort 5.12.0** - Import sorting
- **Pytest 7.4.3** - Testing framework
- **Coverage** - Code coverage measurement (80% minimum)

---

## Development Workflows

### Local Development Setup

```bash
# 1. Clone repository
git clone https://github.com/InfernoSteed/Steed.git
cd Steed

# 2. Copy environment variables
cp .env.example .env
# Edit .env with your database credentials

# 3. Start Docker services
docker-compose up -d

# 4. Run migrations
docker-compose exec web python manage.py migrate

# 5. Create superuser
docker-compose exec web python manage.py createsuperuser

# 6. Access application
# Web: http://localhost:8000
# Admin: http://localhost:8000/admin
# API Docs: http://localhost:8000/api/docs/
```

### Running Without Docker

```bash
# 1. Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Set up database (PostgreSQL must be running)
python backend/manage.py migrate

# 4. Run development server
python backend/manage.py runserver

# 5. Run Celery worker (separate terminal)
celery -A sacred_empire worker -l info

# 6. Run Celery Beat (separate terminal)
celery -A sacred_empire beat -l info
```

### Database Migrations

```bash
# Create migrations after model changes
python manage.py makemigrations

# Show migration status
python manage.py showmigrations

# Apply migrations
python manage.py migrate

# Rollback migration
python manage.py migrate <app_name> <migration_number>

# Show SQL for migration (debug)
python manage.py sqlmigrate <app_name> <migration_number>
```

### Testing

```bash
# Run all tests
python manage.py test

# Run specific app tests
python manage.py test apps.crimes

# Run with coverage
coverage run --source='.' manage.py test
coverage report
coverage html  # Generate HTML report in htmlcov/

# Run specific test class
python manage.py test apps.crimes.tests.test_services.TestCrimeAttempt

# Run specific test method
python manage.py test apps.crimes.tests.test_services.TestCrimeAttempt.test_successful_crime
```

### Code Formatting & Linting

```bash
# Format code with Black
black .

# Sort imports
isort .

# Lint with Flake8
flake8 .

# Type checking (optional)
mypy .

# Run all quality checks
black . && isort . && flake8 .
```

---

## Key Conventions

### Code Style

**Python:**
- Follow PEP 8 with 100-character line length
- Use Black for formatting (enforced via pre-commit hooks)
- Type hints preferred (not mandatory for MVP)
- Docstrings for complex functions

**Example:**
```python
def attempt_crime(character: Character, crime_type_slug: str) -> dict:
    """
    Attempt to commit a crime.

    Args:
        character: The character attempting the crime
        crime_type_slug: Slug of the crime type to attempt

    Returns:
        dict: Result with keys: success, cash_earned, xp_earned, message

    Raises:
        CrimeType.DoesNotExist: If crime_type_slug is invalid
    """
    # Implementation
```

### Django Patterns

**Models:**
- Use descriptive model names (singular)
- Add `__str__` method for admin display
- Use `Meta.ordering` for default sorting
- Add database indexes on foreign keys and frequently queried fields

```python
class Character(models.Model):
    """Player character profile and game state."""

    user = models.OneToOneField(User, on_delete=models.CASCADE)
    display_name = models.CharField(max_length=100)
    level = models.IntegerField(default=1)

    class Meta:
        db_table = 'characters'
        ordering = ['-level', '-experience']
        indexes = [
            models.Index(fields=['level']),
            models.Index(fields=['last_active']),
        ]

    def __str__(self):
        return f"{self.display_name} (Level {self.level})"
```

**Services Layer:**
- Business logic belongs in `services.py`, NOT in views or models
- Services are classes with static methods or functions
- Keep views thin (validation, serialization, HTTP responses)

```python
# crimes/services.py
class CrimeService:
    @staticmethod
    def attempt_crime(character, crime_type_slug):
        """Business logic for crime attempts."""
        # 1. Validate
        # 2. Check cooldown
        # 3. Calculate success
        # 4. Apply rewards
        # 5. Log attempt
        # 6. Return result
```

**Views:**
- Use DRF's `@api_view` decorator for function-based views
- Use ViewSets for CRUD operations
- Keep views focused on HTTP concerns

```python
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def commit_crime(request):
    """API endpoint to attempt a crime."""
    character = request.user.character
    crime_type = request.data.get('crime_type')

    # Business logic in service
    result = CrimeService.attempt_crime(character, crime_type)

    # Return HTTP response
    return Response(result)
```

**Query Optimization:**
```python
# ❌ BAD - N+1 queries
crews = Crew.objects.all()
for crew in crews:
    print(crew.current_don.display_name)  # Extra query!

# ✅ GOOD - Use select_related
crews = Crew.objects.select_related('current_don').all()
for crew in crews:
    print(crew.current_don.display_name)

# ✅ GOOD - Use prefetch_related for many-to-many
crews = Crew.objects.prefetch_related('members').all()
```

### Naming Conventions

**Database Tables:** `snake_case` (e.g., `crime_types`, `crew_members`)
**Django Models:** `PascalCase` (e.g., `CrimeType`, `CrewMember`)
**Functions/Variables:** `snake_case` (e.g., `attempt_crime`, `success_rate`)
**Constants:** `UPPER_SNAKE_CASE` (e.g., `MAX_CREW_SIZE`, `DEFAULT_TIMEOUT`)
**Classes:** `PascalCase` (e.g., `CrimeService`, `CharacterSerializer`)

### API Conventions

**URL Structure:**
```
/api/v1/auth/login/
/api/v1/characters/me/
/api/v1/crimes/commit/
/api/v1/economy/marketplace/
/api/v1/crews/{crew_id}/messages/
```

**HTTP Methods:**
- `GET` - Retrieve data
- `POST` - Create resource or execute action
- `PATCH` - Partial update
- `PUT` - Full update (rarely used)
- `DELETE` - Delete resource

**Response Format:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional human-readable message"
}

// OR for errors:
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": { ... }
}
```

### Git Commit Messages

Follow **Conventional Commits**:
```
feat: Add organized crime system
fix: Prevent duplicate inventory items
docs: Update API documentation
test: Add crime system unit tests
refactor: Simplify crime calculation logic
chore: Update dependencies
```

**Examples:**
```
feat(crimes): Add diminishing returns system

Implements daily crime tracking with multipliers:
- 100% for first 10 crimes
- 75% for crimes 11-20
- 50% for crimes 21-30
- 25% for crimes 31+

Closes #42

fix(inventory): Prevent equipping multiple weapons

- Add validation to ensure only one weapon equipped
- Add tests for equipment validation
- Update API error messages

Fixes #58
```

---

## Critical Files

### Configuration Files

**`backend/sacred_empire/settings.py`** ⭐⭐⭐
- All Django configuration
- Database settings (PostgreSQL via dj-database-url)
- Redis cache configuration
- Celery settings
- JWT authentication
- REST Framework configuration
- Security settings (HTTPS, HSTS, CORS)
- Game-specific settings (starting cash, safe harbor days)

**Key Settings to Know:**
```python
AUTH_USER_MODEL = 'accounts.User'  # Custom user model
PAGE_SIZE = 20  # API pagination
SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'] = timedelta(hours=1)
GAME_SETTINGS = {
    'NEW_PLAYER_STARTING_CASH': 1000,
    'NEW_PLAYER_SAFE_HARBOR_DAYS': 7,
    'MAX_CREW_SIZE_DEFAULT': 20,
}
```

**`.env.example`** ⭐⭐
- Template for environment variables
- Copy to `.env` and customize
- Never commit `.env` (in .gitignore)

**Required Variables:**
```bash
DEBUG=True
SECRET_KEY=your-secret-key
DATABASE_URL=postgresql://user:pass@localhost:5432/dbname
REDIS_URL=redis://localhost:6379/1
SENDGRID_API_KEY=your-sendgrid-key
```

**`docker-compose.yml`** ⭐⭐
- Multi-container orchestration
- Services: db, redis, web, celery, celery-beat
- Volume persistence
- Health checks

**`requirements.txt`** ⭐
- Python dependencies
- Pinned versions for reproducibility
- Update with `pip freeze > requirements.txt`

### Documentation Files

**`docs/GAME_DESIGN.md`** ⭐⭐⭐
- Complete game mechanics (200+ features)
- Feature taxonomy (Tier 1-4)
- Player progression system
- Social systems design
- Economic design
- Combat & equipment
- SWOT analysis
- Design philosophy

**`docs/MVP_ROADMAP.md`** ⭐⭐⭐
- 24-week development plan
- Week-by-week breakdown
- Feature specifications
- Testing strategy
- Launch checklist
- Success metrics

**`docs/TECHNICAL_ARCHITECTURE.md`** ⭐⭐
- System architecture
- Tech stack rationale
- Database design patterns
- API architecture
- Security measures
- Performance & scaling
- DevOps & deployment

**`docs/DATABASE_SCHEMA.md`** ⭐⭐
- Complete schema definitions
- Entity relationship diagrams
- Indexing strategy
- Query optimization tips
- Materialized views for leaderboards

**`docs/API.md`** ⭐
- RESTful API endpoints
- Request/response examples
- Error codes
- Rate limiting
- Authentication flow

### Code Entry Points

**`backend/manage.py`**
- Django management script
- Run with: `python manage.py <command>`

**`backend/sacred_empire/urls.py`**
- Main URL routing
- API versioning: `/api/v1/`
- Swagger docs: `/api/docs/`

**`backend/sacred_empire/celery.py`**
- Celery configuration
- Beat schedule (scheduled tasks)

---

## Common Tasks

### 1. Adding a New Model

```bash
# 1. Define model in apps/<app>/models.py
# Example: apps/crimes/models.py

from django.db import models

class CrimeType(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True)
    base_success_rate = models.IntegerField(default=50)

    class Meta:
        db_table = 'crime_types'
        ordering = ['name']

    def __str__(self):
        return self.name

# 2. Create migration
python manage.py makemigrations

# 3. Apply migration
python manage.py migrate

# 4. Register in admin (optional)
# apps/crimes/admin.py
from django.contrib import admin
from .models import CrimeType

@admin.register(CrimeType)
class CrimeTypeAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'base_success_rate']
    prepopulated_fields = {'slug': ('name',)}
```

### 2. Creating an API Endpoint

```python
# 1. Create serializer (apps/crimes/serializers.py)
from rest_framework import serializers
from .models import CrimeType

class CrimeTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = CrimeType
        fields = ['id', 'name', 'slug', 'base_success_rate']

# 2. Create view (apps/crimes/views.py)
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import CrimeType
from .serializers import CrimeTypeSerializer

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_available_crimes(request):
    """Get list of crimes available to character."""
    character = request.user.character
    crimes = CrimeType.objects.filter(min_level__lte=character.level)
    serializer = CrimeTypeSerializer(crimes, many=True)
    return Response({'crimes': serializer.data})

# 3. Add URL route (apps/crimes/urls.py)
from django.urls import path
from . import views

urlpatterns = [
    path('available/', views.get_available_crimes, name='available-crimes'),
]

# 4. Include in main URLs (backend/sacred_empire/urls.py)
urlpatterns = [
    path('api/v1/crimes/', include('apps.crimes.urls')),
]
```

### 3. Adding a Celery Task

```python
# 1. Define task (apps/crimes/tasks.py)
from celery import shared_task
from django.utils import timezone

@shared_task
def reset_daily_crime_bonuses():
    """Reset daily crime counts at midnight."""
    from .models import DailyCrimeCount

    # Delete old records (cleanup)
    cutoff = timezone.now().date() - timedelta(days=30)
    DailyCrimeCount.objects.filter(date__lt=cutoff).delete()

    return "Daily crime bonuses reset"

# 2. Add to beat schedule (backend/sacred_empire/settings.py)
CELERY_BEAT_SCHEDULE = {
    'reset-daily-crime-bonuses': {
        'task': 'apps.crimes.tasks.reset_daily_crime_bonuses',
        'schedule': crontab(hour=0, minute=0),  # Midnight daily
    },
}

# 3. Test manually
python manage.py shell
>>> from apps.crimes.tasks import reset_daily_crime_bonuses
>>> reset_daily_crime_bonuses.delay()
```

### 4. Writing Tests

```python
# apps/crimes/tests/test_services.py
from django.test import TestCase
from django.contrib.auth import get_user_model
from apps.core.models import Character
from apps.crimes.models import CrimeType
from apps.crimes.services import CrimeService

User = get_user_model()

class TestCrimeAttempt(TestCase):
    def setUp(self):
        """Set up test fixtures."""
        # Create user
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )

        # Create character
        self.character = Character.objects.create(
            user=self.user,
            display_name='Test Character',
            level=5,
            cash=1000
        )

        # Create crime type
        self.crime_type = CrimeType.objects.create(
            name='Test Crime',
            slug='test-crime',
            base_success_rate=50,
            base_cash_reward=100,
            base_xp_reward=10
        )

    def test_successful_crime(self):
        """Test successful crime attempt."""
        result = CrimeService.attempt_crime(
            self.character,
            'test-crime'
        )

        self.assertIn('success', result)
        self.assertIn('cash_earned', result)
        self.assertIn('xp_earned', result)

    def test_level_requirement(self):
        """Test that level requirement is enforced."""
        # Set high level requirement
        self.crime_type.min_level = 10
        self.crime_type.save()

        result = CrimeService.attempt_crime(
            self.character,
            'test-crime'
        )

        self.assertEqual(result['success'], False)
        self.assertIn('level', result['error'].lower())
```

### 5. Database Queries & Optimization

```python
# Check query count
from django.db import connection
from django.test.utils import override_settings

# Enable query logging
with override_settings(DEBUG=True):
    # Your code here
    crews = Crew.objects.select_related('current_don').all()

    # Print queries
    print(f"Number of queries: {len(connection.queries)}")
    for query in connection.queries:
        print(query['sql'])

# Use Django Debug Toolbar (add to INSTALLED_APPS in dev)
INSTALLED_APPS += ['debug_toolbar']

# Profile slow queries
# settings.py
LOGGING = {
    'loggers': {
        'django.db.backends': {
            'level': 'DEBUG',  # Log all SQL queries
        },
    },
}
```

---

## Testing Guidelines

### Test Coverage Requirements

- **Minimum:** 80% code coverage
- **Critical Systems:** 100% coverage
  - Authentication
  - Economy (transactions, purchases)
  - Crime mechanics
  - Combat (Phase 2)

### Test Structure

```
apps/
└── crimes/
    ├── tests/
    │   ├── __init__.py
    │   ├── test_models.py       # Model methods, properties
    │   ├── test_services.py     # Business logic
    │   ├── test_views.py        # API endpoints
    │   └── test_tasks.py        # Celery tasks
```

### Running Tests

```bash
# All tests
python manage.py test

# Specific app
python manage.py test apps.crimes

# With coverage
coverage run --source='.' manage.py test
coverage report
coverage html

# Fast tests (exclude slow tests)
python manage.py test --exclude-tag=slow

# Database tests only
python manage.py test --tag=db
```

### Test Data Factories

Use `factory_boy` for creating test data:

```python
# apps/crimes/factories.py
import factory
from factory.django import DjangoModelFactory
from .models import CrimeType

class CrimeTypeFactory(DjangoModelFactory):
    class Meta:
        model = CrimeType

    name = factory.Sequence(lambda n: f"Crime {n}")
    slug = factory.Sequence(lambda n: f"crime-{n}")
    base_success_rate = 50
    base_cash_reward = 100

# Usage in tests
def test_something(self):
    crime = CrimeTypeFactory(name="Grand Theft Auto")
```

---

## Git Workflow

### Branch Strategy

**Main Branches:**
- `main` - Production-ready code
- `develop` - Integration branch (not used in MVP)

**Feature Branches:**
```
feature/crime-system
bugfix/inventory-dupe
hotfix/security-vulnerability
docs/api-documentation
```

**AI Assistant Branches:**
- Current: `claude/claude-md-mitargmev6irsf6i-01HtDZn3fX18XZVje8ZMvubD`
- All development should occur on this branch
- Push to origin when complete

### Commit Guidelines

**Format:** `<type>(<scope>): <subject>`

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `test` - Tests
- `refactor` - Code refactoring
- `chore` - Maintenance

**Examples:**
```bash
git commit -m "feat(crimes): Add diminishing returns system"
git commit -m "fix(inventory): Prevent duplicate items"
git commit -m "docs(api): Update crime endpoints"
git commit -m "test(economy): Add marketplace tests"
```

### Making Changes

```bash
# 1. Check current status
git status

# 2. Create/switch to feature branch (or use assigned branch)
git checkout -b feature/my-feature
# OR for AI assistants, stay on assigned branch
git checkout claude/claude-md-mitargmev6irsf6i-01HtDZn3fX18XZVje8ZMvubD

# 3. Make changes, test locally
python manage.py test

# 4. Format and lint
black . && isort . && flake8 .

# 5. Stage changes
git add .

# 6. Commit with descriptive message
git commit -m "feat(crimes): Add new crime type system"

# 7. Push to remote
git push -u origin <branch-name>

# 8. Create pull request (if applicable)
# Use GitHub UI or `gh pr create`
```

### Pull Request Process

1. **Create PR** against `main` branch
2. **Fill out template**:
   - Summary of changes
   - Testing performed
   - Screenshots (if UI changes)
3. **CI Checks** must pass (tests, linting)
4. **Code Review** by at least one maintainer
5. **Squash and Merge** into main

---

## Important Context

### What AI Assistants Should Know

#### 1. MVP Focus

**Only implement Phase 1 features** (see `docs/MVP_ROADMAP.md`):
- ✅ User authentication
- ✅ Character creation
- ✅ Solo crimes (3 types)
- ✅ NPC marketplace
- ✅ Basic equipment
- ✅ Crew system (basic)
- ✅ Messaging
- ✅ Leaderboards

**Defer to later phases:**
- ❌ Multiplayer crimes (Phase 2)
- ❌ PvP combat (Phase 2)
- ❌ Player trading (Phase 2)
- ❌ Territory control (Phase 3)
- ❌ Property ownership (Phase 3)
- ❌ Casinos (Phase 3)

#### 2. Game Balance

**Crime Rewards (Diminishing Returns):**
- First 10 crimes: 100% payout
- Crimes 11-20: 75% payout
- Crimes 21-30: 50% payout
- Crimes 31+: 25% payout

**New Player Protection:**
- 7-day "Safe Harbor" period
- Cannot be attacked by other players
- Bonus XP (+25%)
- Marked with "New Player" badge

**Level Progression:**
- Level 1-10: 100 XP per level
- Level 11-25: 250 XP per level
- Level 26-50: 500 XP per level
- Level 51-75: 1,000 XP per level
- Level 76-100: 2,500 XP per level

#### 3. Security Considerations

**Always validate on server-side:**
```python
# ❌ BAD - Trust client data
cash_earned = request.data.get('cash_earned')
character.cash += cash_earned  # Client could send any value!

# ✅ GOOD - Calculate on server
result = CrimeService.attempt_crime(character, crime_type)
character.cash += result['cash_earned']  # Server determines value
```

**Prevent SQL Injection:**
```python
# ✅ ALWAYS use Django ORM (parameterized queries)
Character.objects.filter(username=user_input)

# ❌ NEVER use raw SQL with f-strings
cursor.execute(f"SELECT * FROM characters WHERE username = '{user_input}'")
```

**Rate Limiting:**
- Anonymous: 20 requests/hour
- Authenticated: 1,000 requests/hour
- Crimes: 60 requests/hour
- Trading: 100 requests/hour

#### 4. Performance Best Practices

**Use caching for expensive queries:**
```python
from django.core.cache import cache

def get_leaderboard():
    cache_key = 'leaderboard_top_100'
    cached = cache.get(cache_key)

    if cached:
        return cached

    # Expensive query
    leaderboard = Character.objects.select_related('user').order_by('-level')[:100]

    cache.set(cache_key, leaderboard, 900)  # 15 minutes
    return leaderboard
```

**Avoid N+1 queries:**
```python
# Use select_related for ForeignKey
crews = Crew.objects.select_related('current_don').all()

# Use prefetch_related for ManyToMany
crews = Crew.objects.prefetch_related('members').all()
```

#### 5. Common Pitfalls to Avoid

**❌ Don't create files unless absolutely necessary**
- Prefer editing existing files
- Don't create markdown files proactively

**❌ Don't add features not in MVP scope**
- Stick to MVP roadmap
- Defer advanced features

**❌ Don't skip tests**
- 80% coverage minimum
- Critical paths need 100%

**❌ Don't expose secrets**
- Use environment variables
- Never commit `.env` file
- Never hardcode API keys

**❌ Don't trust client input**
- Always validate server-side
- Calculate rewards server-side
- Check permissions

#### 6. File Modification Guidelines

**When making changes:**
1. **Read before edit** - Always read the file first
2. **Preserve formatting** - Match existing indentation
3. **No emojis** - Unless explicitly requested
4. **Test changes** - Run tests after modifications
5. **Update docs** - If changing API or behavior

---

## Quick Reference

### Essential Commands

```bash
# Start development environment
docker-compose up -d

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Run tests
python manage.py test

# Format code
black . && isort . && flake8 .

# Start Celery worker
celery -A sacred_empire worker -l info

# Django shell
python manage.py shell

# Create migration
python manage.py makemigrations

# View SQL for migration
python manage.py sqlmigrate <app> <migration>
```

### Important URLs (Local Development)

```
Web Application:    http://localhost:8000
Admin Panel:        http://localhost:8000/admin
API Docs (Swagger): http://localhost:8000/api/docs/
API Docs (ReDoc):   http://localhost:8000/api/redoc/
API Schema:         http://localhost:8000/api/schema/
```

### Key Environment Variables

```bash
DEBUG=True                    # Enable debug mode
SECRET_KEY=...                # Django secret key
DATABASE_URL=postgresql://... # PostgreSQL connection
REDIS_URL=redis://...         # Redis connection
SENDGRID_API_KEY=...          # Email service
SENTRY_DSN=...                # Error tracking (production)
```

### Project Contacts & Resources

- **Repository:** https://github.com/InfernoSteed/Steed
- **Documentation:** `/docs/` directory
- **Issue Tracker:** GitHub Issues
- **Current Branch:** `claude/claude-md-mitargmev6irsf6i-01HtDZn3fX18XZVje8ZMvubD`

---

## Summary for AI Assistants

When working on The Sacred Empire:

1. **Read the docs first** - Understand game design and architecture
2. **Stay in MVP scope** - Only implement Phase 1 features
3. **Test everything** - 80% coverage minimum
4. **Follow Django patterns** - Services for logic, views for HTTP
5. **Optimize queries** - Use select_related/prefetch_related
6. **Validate server-side** - Never trust client input
7. **Format code** - Black, isort, flake8
8. **Write tests** - Before marking features complete
9. **Commit properly** - Conventional commits format
10. **Push to assigned branch** - `claude/claude-md-mitargmev6irsf6i-01HtDZn3fX18XZVje8ZMvubD`

**This is a well-planned project with comprehensive documentation. Read the docs, follow the patterns, and build carefully. Quality over speed.**

---

**Last Updated:** 2025-12-05
**Document Version:** 1.0
**Maintainer:** AI Assistants working on The Sacred Empire
