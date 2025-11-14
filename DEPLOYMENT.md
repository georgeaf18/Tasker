# Tasker Deployment Guide

## Quick Start

### Local Development with Docker

```bash
# Start all services (PostgreSQL, Backend, Frontend)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### Production Deployment

```bash
# Copy environment file and configure
cp .env.production.example .env.production
# Edit .env.production with your values

# Build and start production services
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop services
docker-compose -f docker-compose.prod.yml down
```

## Architecture

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   Frontend  │─────>│   Backend   │─────>│  PostgreSQL │
│   (Nginx)   │      │  (NestJS)   │      │             │
│   Port 80   │      │  Port 3000  │      │  Port 5432  │
└─────────────┘      └─────────────┘      └─────────────┘
```

## Docker Images

### Backend (`apps/backend/Dockerfile`)

**Multi-stage build:**
1. **Builder stage:** Node 20 Alpine
   - Installs all dependencies
   - Generates Prisma client
   - Builds backend with Nx
2. **Production stage:** Node 20 Alpine
   - Minimal image with only production dependencies
   - Non-root user (nodejs:nodejs)
   - Health check on `/health` endpoint
   - Runs on port 3000

**Security features:**
- Runs as non-root user (UID 1001)
- Uses `dumb-init` for proper signal handling
- Minimal attack surface (Alpine base)

### Frontend (`apps/frontend/Dockerfile`)

**Multi-stage build:**
1. **Builder stage:** Node 20 Alpine
   - Installs dependencies
   - Builds Angular app with production config
2. **Production stage:** Nginx Alpine
   - Serves static files
   - Custom nginx.conf with compression and security headers
   - SPA routing with fallback to index.html
   - Health check on `/health` endpoint
   - Runs on port 80

**Features:**
- Gzip compression enabled
- Security headers (X-Frame-Options, CSP, etc.)
- Static asset caching (1 year)
- API proxy support (commented out, can be enabled)

## Environment Variables

### Development (`.env`)

```bash
POSTGRES_USER=tasker
POSTGRES_PASSWORD=tasker_dev
POSTGRES_DB=tasker_dev
DATABASE_URL=postgresql://tasker:tasker_dev@localhost:5432/tasker_dev
```

### Production (`.env.production`)

**Required variables:**
```bash
# PostgreSQL
POSTGRES_USER=tasker
POSTGRES_PASSWORD=<strong_password_here>
POSTGRES_DB=tasker

# Backend
DATABASE_URL=postgresql://tasker:<password>@postgres:5432/tasker
CORS_ORIGIN=https://yourdomain.com

# Ports (optional, defaults shown)
POSTGRES_PORT=5432
BACKEND_PORT=3000
FRONTEND_PORT=80
```

## Health Checks

All services include health checks for monitoring:

### PostgreSQL
- **Check:** `pg_isready`
- **Interval:** 10s
- **Timeout:** 5s
- **Retries:** 5

### Backend
- **Endpoint:** `http://localhost:3000/health`
- **Interval:** 30s
- **Timeout:** 10s
- **Start period:** 40s (allows time for Prisma migrations)

### Frontend
- **Endpoint:** `http://localhost:80/health`
- **Interval:** 30s
- **Timeout:** 10s

## CI/CD Pipeline

### Continuous Integration (`.github/workflows/ci.yml`)

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`

**Jobs:**
1. **Lint** - ESLint on all projects
2. **Type Check** - TypeScript compilation check
3. **Test** - Unit tests with PostgreSQL service
   - Runs Prisma migrations
   - Generates coverage reports
   - Uploads to Codecov
4. **Build** - Production build of all apps
   - Uses Nx for optimized builds
   - Uploads artifacts

**Node version:** 20

**Database:** PostgreSQL 16 (test database via GitHub services)

### Deployment (`.github/workflows/deploy.yml`)

**Triggers:**
- Manual dispatch (workflow_dispatch)
- Git tags matching `v*.*.*`

**Jobs:**
1. **Build and Push** - Builds Docker images
   - Matrix build (backend, frontend)
   - Pushes to GitHub Container Registry
   - Tags: latest, semver, branch name, SHA
   - Multi-platform: linux/amd64, linux/arm64
   - Build cache enabled

2. **Deploy** - Deploys to server via SSH
   - Pulls latest images
   - Restarts containers
   - Verifies deployment

**Required secrets:**
- `PROD_HOST` - Production server IP/hostname
- `PROD_USER` - SSH user
- `PROD_SSH_KEY` - SSH private key
- `STAGING_HOST` - Staging server IP/hostname
- `STAGING_USER` - SSH user
- `STAGING_SSH_KEY` - SSH private key

## Server Setup

### Prerequisites

```bash
# Install Docker and Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker $USER

# Install Docker Compose
sudo apt-get update
sudo apt-get install docker-compose-plugin
```

### Initial Setup

```bash
# Create application directory
sudo mkdir -p /opt/tasker
sudo chown $USER:$USER /opt/tasker
cd /opt/tasker

# Clone repository or copy files
git clone git@github.com:georgeaf18/Tasker.git .

# Configure environment
cp .env.production.example .env.production
nano .env.production  # Edit with your values

# Start services
docker-compose -f docker-compose.prod.yml up -d

# Run database migrations (first time only)
docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy

# Seed database (optional)
docker-compose -f docker-compose.prod.yml exec backend npm run seed
```

## Monitoring

### View Logs

```bash
# All services
docker-compose -f docker-compose.prod.yml logs -f

# Specific service
docker-compose -f docker-compose.prod.yml logs -f backend

# Last 100 lines
docker-compose -f docker-compose.prod.yml logs --tail=100
```

### Check Service Status

```bash
# List running containers
docker-compose -f docker-compose.prod.yml ps

# Check health status
docker inspect tasker-backend-prod --format='{{.State.Health.Status}}'
docker inspect tasker-frontend-prod --format='{{.State.Health.Status}}'
```

### Resource Usage

```bash
# Container stats (CPU, Memory, Network)
docker stats

# Disk usage
docker system df
```

## Maintenance

### Database Backups

```bash
# Create backup
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U tasker tasker > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore backup
cat backup_20231113_120000.sql | docker-compose -f docker-compose.prod.yml exec -T postgres psql -U tasker tasker
```

### Update Application

```bash
# Pull latest images
docker-compose -f docker-compose.prod.yml pull

# Recreate containers with new images
docker-compose -f docker-compose.prod.yml up -d

# Remove old images
docker image prune -af
```

### Database Migrations

```bash
# Run new migrations
docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy

# Reset database (DESTRUCTIVE - dev only)
docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate reset
```

## Troubleshooting

### Backend won't start

```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs backend

# Common issues:
# 1. Database not ready - wait for health check
# 2. DATABASE_URL incorrect - check .env.production
# 3. Migrations failed - run manually

# Manually run migrations
docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy
```

### Frontend can't reach backend

```bash
# Check CORS_ORIGIN in .env.production
# Ensure backend is healthy
docker inspect tasker-backend-prod --format='{{.State.Health.Status}}'

# Test backend directly
curl http://localhost:3000/health

# Check nginx logs
docker-compose -f docker-compose.prod.yml logs frontend
```

### Database connection issues

```bash
# Verify PostgreSQL is running
docker-compose -f docker-compose.prod.yml ps postgres

# Check PostgreSQL logs
docker-compose -f docker-compose.prod.yml logs postgres

# Test connection manually
docker-compose -f docker-compose.prod.yml exec postgres psql -U tasker -d tasker -c "SELECT 1;"
```

### Out of disk space

```bash
# Clean up Docker resources
docker system prune -a --volumes

# Remove old containers
docker container prune

# Remove unused images
docker image prune -a

# Remove unused volumes (CAREFUL - this deletes data)
docker volume prune
```

## Performance Tuning

### Resource Limits (Optional)

Uncomment in `docker-compose.prod.yml`:

```yaml
deploy:
  resources:
    limits:
      cpus: '1'
      memory: 512M
    reservations:
      cpus: '0.5'
      memory: 256M
```

### PostgreSQL Tuning

Create `postgres.conf` and mount as volume:

```yaml
volumes:
  - ./postgres.conf:/etc/postgresql/postgresql.conf
```

Recommended settings:
```conf
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
max_connections = 100
```

### Nginx Caching

Add to `apps/frontend/nginx.conf`:

```nginx
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=api_cache:10m max_size=100m;

location /api/ {
    proxy_cache api_cache;
    proxy_cache_valid 200 5m;
    # ... rest of proxy config
}
```

## Security Hardening

### SSL/TLS (Recommended)

Use a reverse proxy (Caddy, Traefik, or Nginx) with Let's Encrypt:

```yaml
# docker-compose.prod.yml addition
services:
  caddy:
    image: caddy:2-alpine
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - caddy_data:/data
      - caddy_config:/config
```

**Caddyfile:**
```
yourdomain.com {
    reverse_proxy frontend:80
}

api.yourdomain.com {
    reverse_proxy backend:3000
}
```

### Firewall Rules

```bash
# Allow only necessary ports
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw enable
```

### Environment Security

```bash
# Restrict .env.production permissions
chmod 600 .env.production

# Never commit .env.production to git
echo ".env.production" >> .gitignore
```

## Scaling

### Horizontal Scaling (Multiple Instances)

```yaml
# docker-compose.prod.yml
services:
  backend:
    deploy:
      replicas: 3

  nginx-lb:
    image: nginx:alpine
    volumes:
      - ./nginx-lb.conf:/etc/nginx/nginx.conf
    ports:
      - "80:80"
```

### Database Connection Pooling

Configure Prisma connection pool:

```env
DATABASE_URL=postgresql://tasker:password@postgres:5432/tasker?connection_limit=10&pool_timeout=10
```

## Support

For issues and questions:
- GitHub Issues: https://github.com/georgeaf18/Tasker/issues
- Documentation: `/docs` directory
- Linear Project: https://linear.app/taskerapp
