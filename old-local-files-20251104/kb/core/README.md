# Simple Chat Bot

> Premium SaaS Chat Widget System with AI/Human Dual Mode

## Overview

Simple Chat Bot is a production-ready, Docker-containerized chat widget system featuring dual widget system with AI/Human mode switching, real-time dashboard, and workflow automation.

## Tech Stack

- **Backend**: Node.js v20.19.5, Express.js 4.x
- **Real-time**: Socket.io 2.2.0
- **Frontend**: Preact 7.x, Vanilla JS
- **Containerization**: Docker & Docker Compose
- **Proxy**: Traefik with Let's Encrypt SSL
- **Automation**: n8n 1.117.3
- **Database**: Qdrant (Vector DB)
- **Web Server**: Nginx Alpine

## Live Domains

- **Normal Chat Widget**: https://chat.simplechat.bot
- **Premium Chat Widget**: https://p-chat.simplechat.bot
- **Stats Dashboard**: https://stats.simplechat.bot
- **Database Management**: https://db.simplechat.bot
- **Workflow Engine**: https://n8n.photier.co

## Quick Start

```bash
# Start all services
docker compose up -d

# Check status
docker compose ps

# View logs
docker compose logs -f
```

## Features

### Normal Chat Widget
- Single chat window
- AI-powered responses via n8n
- Theme customization
- Persistent settings
- GeoIP location tracking

### Premium Chat Widget
- AI Bot Tab: Automated responses
- Live Support Tab: Telegram-based manual support
- Separate conversation histories
- Working hours configuration
- Enhanced analytics

### Stats Dashboard
- Real-time WebSocket updates
- Multi-language support (TR/EN)
- User management
- Message history
- Channel distribution

## Project Structure

```
/root/
├── intergram/              # Normal chat widget
├── intergram-premium/      # Premium chat (dual-mode)
├── stats/                  # Monitoring dashboard
├── docker-compose.yml      # Orchestration config
└── .gitignore             # Ignore rules
```

## API Endpoints

### Theme Management
```bash
GET /api/theme
POST /api/theme
```

### Widget Configuration
```bash
GET /api/widget-config
POST /api/widget-config
```

## Development

```bash
# Rebuild containers
docker compose build

# View logs
docker logs root-intergram-1 -f

# Check settings
docker exec root-intergram-1 cat /app/data/settings.json
```

## Documentation

- [INTERGRAM_SYSTEM_DOCS.md](INTERGRAM_SYSTEM_DOCS.md) - Complete system docs
- [SIMPLE_CHAT_BOT_ANALYSIS.md](SIMPLE_CHAT_BOT_ANALYSIS.md) - Project analysis
- [PREMIUM_SETTINGS_FIX_DOCUMENTATION.md](PREMIUM_SETTINGS_FIX_DOCUMENTATION.md) - Premium fixes

## License

Copyright (c) 2025 Simple Chat Bot. All rights reserved.

---

**Version**: 1.0.0
**Last Updated**: October 28, 2025
**Status**: Production Ready
