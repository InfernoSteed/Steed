# The Sacred Empire - Backend

Django backend for The Sacred Empire multiplayer browser game.

## Quick Start

### Using Docker (Recommended)

```bash
# From project root
docker-compose up -d

# Run migrations
docker-compose exec web python manage.py migrate

# Create superuser
docker-compose exec web python manage.py createsuperuser

# Access at http://localhost:8000
```

### Manual Setup

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r ../requirements.txt

# Set up environment
cp ../.env.example ../.env
# Edit .env with your settings

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Run development server
python manage.py runserver
```

## Project Structure

```
backend/
├── sacred_empire/       # Main Django project
│   ├── settings.py     # Configuration
│   ├── urls.py         # URL routing
│   ├── celery.py       # Celery configuration
│   ├── wsgi.py         # WSGI entry point
│   └── asgi.py         # ASGI entry point
├── apps/               # Django applications
│   ├── accounts/       # User authentication
│   ├── core/           # Character & game state
│   ├── crimes/         # Crime mechanics
│   ├── economy/        # Items & trading
│   ├── social/         # Crews & messaging
│   ├── combat/         # PvP combat (Phase 2)
│   └── territory/      # Territory control (Phase 3)
├── static/             # Static files
├── media/              # User uploads
└── manage.py           # Django management script
```

## API Documentation

Once running, visit:
- **Swagger UI:** http://localhost:8000/api/docs/
- **ReDoc:** http://localhost:8000/api/redoc/
- **Admin:** http://localhost:8000/admin/

## Running Tests

```bash
# Run all tests
python manage.py test

# Run specific app tests
python manage.py test apps.accounts

# With coverage
coverage run --source='.' manage.py test
coverage report
```

## Celery Tasks

```bash
# Start Celery worker (separate terminal)
celery -A sacred_empire worker -l info

# Start Celery beat (scheduled tasks)
celery -A sacred_empire beat -l info
```

## Current Implementation Status

### ✅ Phase 1 (MVP) - In Progress

**Completed:**
- [x] User authentication (register, login, JWT)
- [x] Character profiles and progression
- [x] Character statistics tracking
- [x] Equipment loadout system
- [x] Leaderboards
- [x] Celery task infrastructure

**In Progress:**
- [ ] Crime system (models, logic, API)
- [ ] Economy system (items, inventory, marketplace)
- [ ] Social systems (crews, messaging)

**Not Started:**
- [ ] Combat system (Phase 2)
- [ ] Territory control (Phase 3)

## Environment Variables

See `.env.example` for required environment variables.

Key settings:
- `DEBUG`: Enable debug mode (never True in production)
- `SECRET_KEY`: Django secret key
- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string

## Database Migrations

```bash
# Create new migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Show migration status
python manage.py showmigrations
```

## Code Quality

```bash
# Format code
black .

# Sort imports
isort .

# Lint
flake8 .
```

## Support

For issues and questions, see the main project README or open a GitHub issue.
