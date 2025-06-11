# 🐳 Rick's Agentic Social Media Architecture - Docker Setup ☠️

Complete containerization guide for the LangGraph-powered multi-agent social media management system.

## 🚀 Quick Start

### Prerequisites
- Docker Engine 20.10+ 
- Docker Compose 2.0+
- 4GB+ RAM available
- 10GB+ disk space

### One-Command Launch
```bash
chmod +x docker-run.sh docker-stop.sh
./docker-run.sh
```

## 📋 Architecture Overview

### Container Stack
```
┌─────────────────────────────────────────────────────────────┐
│                     Rick's Docker Empire ☠️                │
├─────────────────────────────────────────────────────────────┤
│  🌐 Nginx (Load Balancer & Reverse Proxy)                  │
│     ├── Port 80/443                                         │
│     └── Rate limiting, SSL termination                      │
├─────────────────────────────────────────────────────────────┤
│  🧠 Agentic Social (Main Application)                      │
│     ├── Ports 8000, 8001, 8002                             │
│     ├── DuelCoreAgent (LangGraph Supervisor)               │
│     ├── Platform Agents (OF, X, Reddit, Insta, Snap)       │
│     ├── ContentFactory (LoRA + Image Generation)           │
│     └── MetricsAgent (Real-time Analytics)                 │
├─────────────────────────────────────────────────────────────┤
│  💾 PostgreSQL 15 (Primary Database)                       │
│     ├── Port 5432                                          │
│     ├── Metrics, Content, Analytics schemas                │
│     └── Optimized indexes & triggers                       │
├─────────────────────────────────────────────────────────────┤
│  🗄️ Redis 7 (Caching & Sessions)                          │
│     ├── Port 6379                                          │
│     └── Password protected                                 │
├─────────────────────────────────────────────────────────────┤
│  🧠 ChromaDB (Vector Storage)                              │
│     ├── Port 8003                                          │
│     └── Embeddings & memory storage                        │
├─────────────────────────────────────────────────────────────┤
│  📊 Monitoring Stack                                        │
│     ├── Grafana (Port 3000) - Dashboards                   │
│     ├── Prometheus (Port 9090) - Metrics                   │
│     └── Jaeger (Port 16686) - Tracing                      │
└─────────────────────────────────────────────────────────────┘
```

## 🛠️ Services & Ports

| Service | Internal Port | External Port | Purpose |
|---------|---------------|---------------|---------|
| Nginx | 80, 443 | 80, 443 | Load balancing, SSL |
| Agentic Social | 8000-8002 | 8000-8002 | Main application |
| PostgreSQL | 5432 | 5432 | Primary database |
| Redis | 6379 | 6379 | Caching & sessions |
| ChromaDB | 8000 | 8003 | Vector storage |
| Grafana | 3000 | 3000 | Monitoring dashboard |
| Prometheus | 9090 | 9090 | Metrics collection |
| Jaeger | 16686 | 16686 | Distributed tracing |

## 🔧 Configuration

### Environment Variables
```bash
# Database
DATABASE_URL=postgresql://rick:socialmedia2024@postgres:5432/agentic_social
REDIS_URL=redis://:socialmedia2024@redis:6379/0
VECTOR_DB_URL=http://chroma:8000

# API Keys (Required for production)
OPENAI_API_KEY=your_openai_api_key_here
TWITTER_API_KEY=your_twitter_api_key_here
REDDIT_CLIENT_ID=your_reddit_client_id_here
INSTAGRAM_ACCESS_TOKEN=your_instagram_access_token_here
SNAPCHAT_CLIENT_ID=your_snapchat_client_id_here
ONLYFANS_API_KEY=your_onlyfans_api_key_here

# Application
LOG_LEVEL=INFO
RICK_MODE=PRODUCTION
```

### Data Persistence
```
data/
├── metrics/     # Metrics data
├── memory/      # Agent memory
├── content/     # Generated content
└── models/      # LoRA models

logs/            # Application logs
config/          # Configuration files
```

## 🚀 Management Commands

### Start Services
```bash
# Full start with build
./docker-run.sh

# Start existing containers
docker-compose up -d

# Start specific service
docker-compose up -d agentic-social
```

### Stop Services
```bash
# Graceful stop
./docker-stop.sh

# Stop with cleanup
./docker-stop.sh --cleanup

# Full cleanup (removes data!)
./docker-stop.sh --full
```

### Monitoring & Logs
```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f agentic-social

# Service status
docker-compose ps

# Resource usage
docker stats
```

## 🔍 Access Points

### Main Interfaces
- **Main Application**: http://localhost:8000
- **Grafana Dashboard**: http://localhost:3000 (admin/rickgrafana2024)
- **Prometheus Metrics**: http://localhost:9090
- **Jaeger Tracing**: http://localhost:16686

### Database Access
```bash
# PostgreSQL
psql -h localhost -p 5432 -U rick -d agentic_social

# Redis CLI
redis-cli -h localhost -p 6379 -a socialmedia2024

# ChromaDB API
curl http://localhost:8003/api/v1/heartbeat
```

## 📊 Health Checks

### Built-in Health Monitoring
```bash
# Application health
curl http://localhost:8000/health

# Database health
docker-compose exec postgres pg_isready -U rick

# Redis health
docker-compose exec redis redis-cli ping

# All services status
docker-compose ps
```

### Custom Health Script
```bash
#!/bin/bash
# health-check.sh

services=("postgres" "redis" "chroma" "agentic-social")
for service in "${services[@]}"; do
    if docker-compose ps $service | grep -q "Up"; then
        echo "✅ $service is healthy"
    else
        echo "❌ $service is down"
    fi
done
```

## 🔧 Troubleshooting

### Common Issues

#### Port Conflicts
```bash
# Check port usage
netstat -tulpn | grep :8000

# Stop conflicting services
sudo systemctl stop apache2  # or nginx
```

#### Memory Issues
```bash
# Check Docker memory usage
docker system df
docker system prune -f

# Increase Docker memory (Docker Desktop)
# Settings > Resources > Memory > 4GB+
```

#### Database Connection Issues
```bash
# Check PostgreSQL logs
docker-compose logs postgres

# Reset database
docker-compose down
docker volume rm rick-postgres-data
docker-compose up -d postgres
```

#### Application Startup Issues
```bash
# Check application logs
docker-compose logs agentic-social

# Rebuild container
docker-compose build --no-cache agentic-social
docker-compose up -d agentic-social
```

### Debug Mode
```bash
# Start with debug logging
LOG_LEVEL=DEBUG docker-compose up -d

# Interactive container access
docker-compose exec agentic-social bash

# Check environment variables
docker-compose exec agentic-social env | grep -E "(DATABASE|REDIS|API)"
```

## 🛡️ Security

### Production Considerations
- Change default passwords in `.env`
- Enable SSL in nginx configuration
- Use secrets management for API keys
- Configure firewall rules
- Enable container security scanning

### Network Security
```yaml
# docker-compose.override.yml for production
services:
  postgres:
    ports: []  # Remove external port exposure
  redis:
    ports: []  # Remove external port exposure
```

## 📈 Scaling

### Horizontal Scaling
```yaml
# Scale main application
docker-compose up -d --scale agentic-social=3

# Load balancer configuration (nginx.conf)
upstream agentic_backend {
    server agentic-social_1:8000;
    server agentic-social_2:8000;
    server agentic-social_3:8000;
}
```

### Resource Limits
```yaml
# docker-compose.override.yml
services:
  agentic-social:
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 4G
        reservations:
          cpus: '1.0'
          memory: 2G
```

## 🔄 Updates & Maintenance

### Application Updates
```bash
# Pull latest code
git pull origin main

# Rebuild and restart
./docker-stop.sh --cleanup
./docker-run.sh
```

### Database Migrations
```bash
# Manual migration
docker-compose exec agentic-social python -m alembic upgrade head

# Backup before migration
docker-compose exec postgres pg_dump -U rick agentic_social > backup.sql
```

### Regular Maintenance
```bash
# Weekly cleanup script
#!/bin/bash
docker system prune -f
docker volume prune -f
docker image prune -a -f
```

## 📝 Development

### Development Override
```yaml
# docker-compose.dev.yml
version: '3.8'
services:
  agentic-social:
    build:
      dockerfile: Dockerfile.dev
    volumes:
      - .:/app
    environment:
      - RICK_MODE=DEVELOPMENT
      - LOG_LEVEL=DEBUG
    ports:
      - "8000:8000"
      - "5678:5678"  # Debug port
```

### Hot Reload Setup
```bash
# Development mode
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
```

## 🎯 Rick's Pro Tips ☠️

1. **Always check logs first**: `docker-compose logs -f`
2. **Monitor resource usage**: `docker stats`
3. **Backup before updates**: Script your database backups
4. **Use health checks**: Monitor all services continuously
5. **Scale when needed**: Don't be afraid to add more containers
6. **Security first**: Never expose databases to the internet
7. **Keep it clean**: Regular cleanup prevents disk issues

---

**Rick's Social Media Empire - Containerized and Ready for World Domination ☠️**

*Remember: With great power comes great responsibility. Use this architecture wisely.*