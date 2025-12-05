# Contributing to The Sacred Empire

Thank you for your interest in contributing to The Sacred Empire! This document provides guidelines for contributing to the project.

## Table of Contents
1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Setup](#development-setup)
4. [Coding Standards](#coding-standards)
5. [Pull Request Process](#pull-request-process)
6. [Testing](#testing)
7. [Documentation](#documentation)

---

## Code of Conduct

### Our Pledge
We are committed to providing a welcoming and inclusive environment for all contributors, regardless of experience level, gender, gender identity and expression, sexual orientation, disability, personal appearance, body size, race, ethnicity, age, religion, or nationality.

### Our Standards
**Positive behavior includes:**
- Using welcoming and inclusive language
- Being respectful of differing viewpoints
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

**Unacceptable behavior includes:**
- Harassment, trolling, or derogatory comments
- Personal or political attacks
- Public or private harassment
- Publishing others' private information
- Any conduct that could reasonably be considered inappropriate

---

## Getting Started

### Prerequisites
- Python 3.11+
- PostgreSQL 15+
- Redis 7+
- Docker & Docker Compose (recommended)
- Git

### Fork and Clone
```bash
# Fork the repository on GitHub
# Then clone your fork
git clone https://github.com/YOUR_USERNAME/Steed.git
cd Steed

# Add upstream remote
git remote add upstream https://github.com/InfernoSteed/Steed.git
```

---

## Development Setup

### Using Docker (Recommended)
```bash
# Build and start services
docker-compose up -d

# Run migrations
docker-compose exec web python manage.py migrate

# Create superuser
docker-compose exec web python manage.py createsuperuser

# Load seed data
docker-compose exec web python manage.py loaddata seed_data.json

# Access at http://localhost:8000
```

### Manual Setup
```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Load seed data
python manage.py loaddata seed_data.json

# Run development server
python manage.py runserver
```

---

## Coding Standards

### Python Style Guide
We follow **PEP 8** with some modifications:
- Line length: 100 characters (not 79)
- Use `black` for code formatting
- Use `flake8` for linting
- Use `isort` for import sorting

### Code Formatting
```bash
# Format code with black
black .

# Sort imports
isort .

# Lint with flake8
flake8 .

# Type checking (optional but recommended)
mypy .
```

### Pre-commit Hooks
We use pre-commit hooks to enforce code quality:
```bash
# Install pre-commit
pip install pre-commit

# Install hooks
pre-commit install

# Run manually
pre-commit run --all-files
```

### Django Best Practices

**Models:**
```python
# ✅ GOOD
class Character(models.Model):
    """Player character profile and game state."""

    user = models.OneToOneField(User, on_delete=models.CASCADE)
    display_name = models.CharField(max_length=100)
    level = models.IntegerField(default=1)

    class Meta:
        db_table = 'characters'
        ordering = ['-level', '-experience']

    def __str__(self):
        return f"{self.display_name} (Level {self.level})"

    def check_level_up(self):
        """Check if character should level up based on experience."""
        # Implementation
```

**Views/Services:**
```python
# ✅ GOOD - Use service layer for business logic
# crimes/services.py
class CrimeService:
    @staticmethod
    def attempt_crime(character, crime_type_slug):
        """Attempt a crime and return result."""
        # Business logic here
        pass

# crimes/views.py
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def commit_crime(request):
    """API endpoint to attempt a crime."""
    character = request.user.character
    crime_type = request.data.get('crime_type')

    result = CrimeService.attempt_crime(character, crime_type)
    return Response(result)
```

**Queries:**
```python
# ❌ BAD - N+1 queries
crews = Crew.objects.all()
for crew in crews:
    print(crew.current_don.display_name)  # Extra query!

# ✅ GOOD - Use select_related
crews = Crew.objects.select_related('current_don').all()
for crew in crews:
    print(crew.current_don.display_name)
```

### JavaScript/Frontend
- Use ES6+ syntax
- Follow Airbnb JavaScript Style Guide
- Use `prettier` for formatting
- Use `eslint` for linting

---

## Pull Request Process

### Branch Naming
```
feature/crime-system
bugfix/inventory-dupe
hotfix/security-vulnerability
docs/api-documentation
```

### Commit Messages
Follow [Conventional Commits](https://www.conventionalcommits.org/):

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

### Pull Request Template
When creating a PR, include:

**Title:** Clear, concise description
```
feat: Add crew chat system
```

**Description:**
```
## Summary
Implements real-time crew chat using polling (MVP approach).

## Changes
- Added `crew_messages` table
- Created API endpoints for sending/retrieving messages
- Implemented rate limiting (20 messages/minute)
- Added frontend chat component

## Testing
- Unit tests for message creation
- Integration tests for rate limiting
- Manual testing with multiple users

## Screenshots
[Attach screenshots if applicable]

## Checklist
- [x] Code follows project style guide
- [x] Tests added and passing
- [x] Documentation updated
- [x] No breaking changes
- [x] Migrations created (if applicable)
```

### Review Process
1. **Submit PR:** Create pull request against `main` branch
2. **CI Checks:** Automated tests and linting must pass
3. **Code Review:** At least one maintainer review required
4. **Address Feedback:** Make requested changes
5. **Approval:** PR approved by maintainer
6. **Merge:** Squash and merge into main

---

## Testing

### Running Tests
```bash
# Run all tests
python manage.py test

# Run specific app tests
python manage.py test crimes

# Run with coverage
coverage run --source='.' manage.py test
coverage report
coverage html  # Generate HTML report

# Run specific test
python manage.py test crimes.tests.test_crime_service.TestCrimeAttempt
```

### Writing Tests
```python
# crimes/tests/test_crime_service.py
from django.test import TestCase
from crimes.services import CrimeService
from crimes.models import CrimeType
from accounts.models import User, Character

class TestCrimeAttempt(TestCase):
    def setUp(self):
        """Set up test fixtures."""
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.character = Character.objects.create(
            user=self.user,
            display_name='Test Character',
            level=5,
            cash=1000
        )
        self.crime_type = CrimeType.objects.create(
            name='Test Crime',
            slug='test-crime',
            category='solo',
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
        if result['success']:
            self.assertGreater(result['cash_earned'], 0)
            self.assertGreater(result['xp_earned'], 0)

    def test_cooldown_enforcement(self):
        """Test that cooldown is enforced."""
        # First attempt
        CrimeService.attempt_crime(self.character, 'test-crime')

        # Second attempt (should fail due to cooldown)
        result = CrimeService.attempt_crime(self.character, 'test-crime')

        self.assertEqual(result['success'], False)
        self.assertIn('cooldown', result['error'].lower())
```

### Test Coverage Requirements
- Minimum 80% code coverage for new features
- 100% coverage for critical systems (authentication, economy, combat)
- All bug fixes must include regression tests

---

## Documentation

### Code Documentation
```python
def attempt_crime(character, crime_type_slug):
    """
    Attempt to commit a crime.

    Args:
        character (Character): The character attempting the crime
        crime_type_slug (str): Slug of the crime type to attempt

    Returns:
        dict: Result of the crime attempt with keys:
            - success (bool): Whether the crime succeeded
            - cash_earned (int): Cash earned (if successful)
            - xp_earned (int): XP earned (if successful)
            - message (str): Description of the result

    Raises:
        CrimeType.DoesNotExist: If crime_type_slug is invalid
        ValidationError: If character doesn't meet requirements

    Example:
        >>> result = attempt_crime(character, 'grand-theft-auto')
        >>> if result['success']:
        ...     print(f"Earned ${result['cash_earned']}")
    """
    # Implementation
```

### API Documentation
- Update `docs/API.md` for any API changes
- Include request/response examples
- Document error codes

### README Updates
- Keep main README.md up to date
- Update feature lists when adding new features
- Update setup instructions if process changes

---

## Questions or Issues?

**For questions:**
- Open a GitHub Discussion
- Join our Discord server (link in README)
- Email: dev@sacredempire.com

**For bug reports:**
- Open a GitHub Issue
- Include steps to reproduce
- Include expected vs. actual behavior
- Include system information

**For security vulnerabilities:**
- **DO NOT open a public issue**
- Email: security@sacredempire.com
- We will respond within 48 hours

---

## License

By contributing to The Sacred Empire, you agree that your contributions will be licensed under the same license as the project (see LICENSE file).

---

**Thank you for contributing to The Sacred Empire!**

Together, we're building the best prohibition-era crime game on the web. 🎩🔫
