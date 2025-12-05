# The Sacred Empire

> A 1920s Prohibition-era multiplayer browser game where players build criminal empires through strategic crime, crew cooperation, and territorial control.

## 🎭 Game Overview

**Time Period:** 1920s-1933 (Prohibition Era)
**Genre:** Multiplayer Crime/Strategy/RPG
**Platform:** Browser-based (with future mobile expansion)
**Core Theme:** Building criminal empire through solo and organized crime activities

## 🎯 Project Status

**Current Phase:** Documentation & Planning
**Development Stage:** Pre-Alpha
**Target MVP Launch:** 6 months from development start

## 📚 Documentation

- [Complete Game Design Document](docs/GAME_DESIGN.md) - Comprehensive feature analysis
- [Technical Architecture](docs/TECHNICAL_ARCHITECTURE.md) - Backend systems and infrastructure
- [MVP Roadmap](docs/MVP_ROADMAP.md) - Phased development plan
- [Database Schema](docs/DATABASE_SCHEMA.md) - Data model design
- [Monetization Strategy](docs/MONETIZATION.md) - Fair, non-P2W revenue model
- [API Documentation](docs/API.md) - RESTful API endpoints

## 🎮 Core Features (MVP Phase 1)

### Player Systems
- User registration and authentication
- Character profiles with statistics tracking
- Rank-based progression system
- Player messaging and communication

### Crime Mechanics
- **Solo Crimes:** Grand Theft Auto, Bootlegging, Rackets
- **Multiplayer Crimes:** Cooperative criminal activities
- **Organized Crimes:** Crew-based operations (24-hour cycle)

### Social Systems
- Crew (gang) creation and management
- Crew-based organized crime activities
- Forums and community features
- Player-to-player interactions

### Economic Systems
- NPC marketplace for baseline economy
- Currency earned through criminal activities
- Basic property rental system
- Equipment purchases (weapons, vehicles, armor)

### Combat & Equipment
- Tiered weapon system (Common → Legendary)
- Period-authentic weaponry (Thompson SMG, BAR, etc.)
- Armor and protection mechanics
- Vehicle collection and progression

## 🏗️ Project Structure

```
steed/
├── docs/                    # Comprehensive documentation
├── backend/                 # Python/Django backend
│   ├── api/                # RESTful API
│   ├── core/               # Core game logic
│   ├── models/             # Database models
│   └── utils/              # Utility functions
├── frontend/               # Browser-based UI
│   ├── static/             # CSS, JS, images
│   └── templates/          # HTML templates
├── database/               # Schema and migrations
├── tests/                  # Test suites
└── scripts/                # Deployment and utility scripts
```

## 🚀 Development Roadmap

### Phase 1: Core Loop (Months 1-6) - MVP
- User authentication and profiles
- Basic crime mechanics (3 types)
- Simplified economy (NPC market)
- Initial ranking system (5 ranks)
- Messaging system

### Phase 2: Social Layer (Months 7-12)
- Crew creation and management
- Multiplayer crimes
- Forums and chat
- Basic PvP mechanics
- Property rental

### Phase 3: Territory Wars (Year 2)
- Property ownership
- Territory control system
- Crew vs. Crew combat
- Casino properties

### Phase 4: Platform Expansion (Year 3+)
- Mobile applications
- Advanced features
- International territories
- Competitive tournaments

## 💰 Monetization Philosophy

**Core Principle:** NEVER SELL POWER

### ✅ Fair Monetization (Implemented)
- **Cosmetics:** Avatar skins, vehicle paint jobs, crew emblems
- **Convenience:** Extra storage slots, faster travel
- **Social Features:** Custom chat colors, profile customization
- **Battle Pass:** Seasonal progression with free/premium tracks

### ❌ Rejected (Pay-to-Win)
- ~~Direct combat advantages~~
- ~~Higher crime payouts~~
- ~~Exclusive powerful items~~

## 🛡️ Player Protection Systems

### New Player Protection
- **7-Day Safe Harbor:** New players cannot be attacked
- **Level-Based Matchmaking:** ±10 level attack range
- **Tutorial System:** Graduated introduction to mechanics
- **Crew Protection:** Social consequences for griefing

### Anti-Cheat
- Server-side validation
- Rate limiting and anomaly detection
- Player reporting tools
- Clear consequences and enforcement

## 🔧 Technical Stack

**Backend:**
- Python 3.11+ with Django 4.2+
- PostgreSQL (primary database)
- Redis (caching layer)
- Celery (task queue)

**Frontend:**
- HTML5, CSS3, JavaScript (ES6+)
- Bootstrap 5 (responsive design)
- WebSockets (real-time features)

**Infrastructure:**
- Docker containerization
- Nginx reverse proxy
- Cloud hosting (AWS/GCP ready)
- Cloudflare CDN

## 📊 Success Metrics (Launch Phase)

**Acquisition:**
- Target: 5,000 registered users
- Cost Per Acquisition: <$5
- Organic vs. Paid: 60/40 split

**Engagement:**
- Daily Active Users: 1,000
- Session Length: 20+ minutes average
- DAU/MAU Ratio: 33%

**Retention:**
- Day 1: 50%
- Day 7: 30%
- Day 30: 15%

**Monetization:**
- Conversion Rate: 3-5%
- ARPU: $2
- LTV: $15-20

## 🤝 Contributing

This is currently a private development project. Contribution guidelines will be published upon public release.

## 📝 License

Copyright © 2025 The Sacred Empire Team. All rights reserved.

## 🎯 Design Principles

1. **Depth Over Breadth:** 10 features done excellently > 100 done adequately
2. **Respect Player Time:** Games should fit life, not vice versa
3. **Fair Monetization:** Never sell power, build trust through cosmetics
4. **Protect New Players:** Bottom of the funnel is the growth engine
5. **Community First:** Browser games succeed through community, not features

## 📞 Contact

- **Development Team:** [To be added]
- **Bug Reports:** GitHub Issues
- **Community Discord:** [To be added]

---

**Built with passion for the Prohibition era and strategic multiplayer gaming.**
