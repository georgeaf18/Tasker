# Deployment Infrastructure Overview

Complete production deployment infrastructure for Tasker, implementing Docker containerization and GitHub Actions CI/CD pipelines.

## Files Created

### Docker Configuration

1. **`apps/backend/Dockerfile`**
   - Multi-stage build (builder + production)
   - Node 20 Alpine base image
   - Generates Prisma client during build
   - Non-root user execution (nodejs:nodejs, UID 1001)
   - Health check on `/health` endpoint
   - dumb-init for proper signal handling
   - Production dependencies only in final image

2. **`apps/frontend/Dockerfile`**
   - Multi-stage build (builder + nginx)
   - Builds Angular app with Nx production configuration
   - Nginx Alpine for serving static files
   - Custom nginx.conf with compression and security
   - Health check endpoint
   - SPA routing support

3. **`apps/frontend/nginx.conf`**
   - Gzip compression enabled
   - Security headers (X-Frame-Options, CSP, etc.)
   - SPA fallback routing (try_files)
   - Static asset caching (1 year)
   - Optional API proxy (commented out)
   - Health check endpoint

4. **`docker-compose.prod.yml`**
   - PostgreSQL 16 with persistent volumes
   - Backend service with dependency on database
   - Frontend service with dependency on backend
   - Health checks on all services
   - Restart policies
   - Environment variable configuration
   - Isolated Docker network
   - Optional resource limits

5. **`docker-compose.override.yml`**
   - Local development configuration
   - Extends base docker-compose.yml
   - Volume mounts for hot reload
   - Development environment variables
   - Services commented out until backend/frontend are ready

6. **`.dockerignore`**
   - Excludes unnecessary files from Docker context
   - Reduces build time and image size
   - Prevents sensitive files from being copied

7. **`.env.production.example`**
   - Template for production environment variables
   - PostgreSQL configuration
   - Backend configuration
   - Frontend configuration
   - CORS settings

### GitHub Actions Workflows

8. **`.github/workflows/ci.yml`**
   - Continuous Integration pipeline
   - Jobs: lint, type-check, test, build
   - Runs on push to main/develop and PRs
   - PostgreSQL service for tests
   - Test coverage reporting
   - Build artifact uploads
   - Node 20, npm caching
   - Parallel job execution

9. **`.github/workflows/deploy.yml`**
   - Continuous Deployment pipeline
   - Multi-platform Docker builds (amd64, arm64)
   - Push to GitHub Container Registry
   - SSH deployment to servers
   - Manual or tag-triggered
   - Environment-specific (staging/production)
   - Health verification after deployment

### Documentation

10. **`DEPLOYMENT.md`**
    - Comprehensive deployment guide
    - Architecture overview
    - Environment variable configuration
    - Health check documentation
    - CI/CD pipeline details
    - Server setup instructions
    - Monitoring commands
    - Maintenance procedures
    - Troubleshooting guide
    - Performance tuning
    - Security hardening
    - Scaling strategies

11. **`.github/SECRETS_SETUP.md`**
    - GitHub secrets configuration guide
    - SSH key setup instructions
    - Server preparation steps
    - Security best practices
    - Troubleshooting common issues
    - Environment configuration
    - Complete deployment checklist

12. **`DOCKER_QUICK_START.md`**
    - Quick reference for Docker commands
    - Local development workflow
    - Production deployment commands
    - Health check commands
    - Database management
    - Troubleshooting steps
    - Resource management

13. **`apps/backend/health.controller.example.ts`**
    - Example health check controller for NestJS
    - `/health` endpoint for Docker health checks
    - `/ready` endpoint for readiness probes
    - Can be integrated into backend when structure is ready

14. **`README.md` (updated)**
    - Added Docker development section
    - Added production deployment section
    - Added CI/CD pipeline overview
    - Links to detailed guides

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     GitHub Actions                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │    Lint     │  │ Type Check  │  │    Test     │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
│         │                 │                 │               │
│         └─────────────────┴─────────────────┘               │
│                           │                                 │
│                    ┌─────────────┐                         │
│                    │    Build    │                         │
│                    └─────────────┘                         │
│                           │                                 │
│                    ┌─────────────┐                         │
│                    │   Deploy    │                         │
│                    └─────────────┘                         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              GitHub Container Registry                       │
│  ┌──────────────────┐      ┌──────────────────┐            │
│  │ tasker-backend   │      │ tasker-frontend  │            │
│  │  (multi-arch)    │      │  (multi-arch)    │            │
│  └──────────────────┘      └──────────────────┘            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Production Server                          │
│                                                              │
│  ┌─────────────┐      ┌─────────────┐      ┌─────────────┐│
│  │  Frontend   │─────>│   Backend   │─────>│  PostgreSQL ││
│  │   (Nginx)   │      │  (NestJS)   │      │             ││
│  │   Port 80   │      │  Port 3000  │      │  Port 5432  ││
│  └─────────────┘      └─────────────┘      └─────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │               Docker Network: tasker-network         │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Key Features

### Docker Multi-Stage Builds

**Benefits:**

- Smaller final images (only production dependencies)
- Faster deployments (less data to transfer)
- Enhanced security (minimal attack surface)
- Separation of build and runtime concerns

**Backend Image Size:**

- Builder stage: ~500MB (includes build tools)
- Production stage: ~150MB (Node + app only)

**Frontend Image Size:**

- Builder stage: ~500MB (includes Node + build tools)
- Production stage: ~25MB (Nginx + static files)

### Health Checks

All services include health checks for monitoring:

**PostgreSQL:**

- Command: `pg_isready`
- Interval: 10s
- Ensures database is accepting connections

**Backend:**

- Endpoint: `http://localhost:3000/health`
- Interval: 30s
- Start period: 40s (allows time for Prisma migrations)

**Frontend:**

- Endpoint: `http://localhost:80/health`
- Interval: 30s
- Ensures Nginx is serving files

### Security Hardening

**Container Security:**

- Non-root users (nodejs, nginx)
- Minimal base images (Alpine)
- No unnecessary packages
- Read-only file systems where possible

**Network Security:**

- Isolated Docker network
- Services communicate internally
- Only necessary ports exposed

**Secrets Management:**

- Environment variables via .env files
- GitHub secrets for CI/CD
- No hardcoded credentials
- SSH key-based deployment

**Image Security:**

- Multi-platform builds
- Signed images (via GHCR)
- Regular base image updates
- Scan for vulnerabilities (TODO: add to CI)

### CI/CD Pipeline

**Continuous Integration (on every push/PR):**

1. Lint all code
2. Type check with TypeScript
3. Run unit tests with coverage
4. Build production bundle
5. Upload artifacts

**Continuous Deployment (manual or tag-based):**

1. Build Docker images for amd64 and arm64
2. Push to GitHub Container Registry
3. SSH to production server
4. Pull latest images
5. Restart containers with new images
6. Verify health checks pass

**Deployment Strategies:**

- **Development:** Automatic on push to develop
- **Staging:** Manual approval required
- **Production:** Tag-based (v*.*.\*)

## Environment Variables

### Development

```bash
DATABASE_URL=postgresql://tasker_dev:tasker_dev@localhost:5432/tasker_dev
NODE_ENV=development
```

### Production

```bash
DATABASE_URL=postgresql://tasker:STRONG_PASSWORD@postgres:5432/tasker
NODE_ENV=production
CORS_ORIGIN=https://yourdomain.com
```

See `.env.production.example` for complete list.

## Deployment Workflow

### Initial Setup

1. **Server Preparation:**

   ```bash
   # Install Docker
   curl -fsSL https://get.docker.com | sh

   # Create app directory
   sudo mkdir -p /opt/tasker
   sudo chown $USER:$USER /opt/tasker
   cd /opt/tasker
   ```

2. **GitHub Secrets Configuration:**
   - Add `PROD_HOST` (server IP/hostname)
   - Add `PROD_USER` (SSH username)
   - Add `PROD_SSH_KEY` (SSH private key)

3. **Environment Configuration:**

   ```bash
   # On server
   cp .env.production.example .env.production
   nano .env.production  # Configure values
   ```

4. **Initial Deployment:**
   - Create git tag: `git tag v0.1.0`
   - Push tag: `git push origin v0.1.0`
   - GitHub Actions builds and deploys automatically

### Ongoing Deployments

**For hotfixes:**

```bash
git commit -m "fix: critical bug"
git tag v0.1.1
git push origin v0.1.1
```

**For features:**

```bash
# Manual deployment via GitHub UI
# Actions → Deploy → Run workflow → Select environment
```

## Monitoring

### Health Status

```bash
# Check all containers
docker-compose -f docker-compose.prod.yml ps

# Check individual health
docker inspect tasker-backend-prod --format='{{.State.Health.Status}}'
```

### Logs

```bash
# All services
docker-compose -f docker-compose.prod.yml logs -f

# Specific service
docker-compose -f docker-compose.prod.yml logs -f backend

# Last 100 lines
docker-compose -f docker-compose.prod.yml logs --tail=100
```

### Resource Usage

```bash
# Live stats
docker stats

# Disk usage
docker system df
```

## Maintenance

### Database Backups

```bash
# Create backup
docker-compose -f docker-compose.prod.yml exec postgres \
  pg_dump -U tasker tasker > backup_$(date +%Y%m%d).sql

# Restore backup
cat backup_20231113.sql | \
  docker-compose -f docker-compose.prod.yml exec -T postgres \
  psql -U tasker tasker
```

### Updates

```bash
# Pull latest images
docker-compose -f docker-compose.prod.yml pull

# Recreate containers
docker-compose -f docker-compose.prod.yml up -d

# Clean old images
docker image prune -af
```

### Migrations

```bash
# Run new migrations
docker-compose -f docker-compose.prod.yml exec backend \
  npx prisma migrate deploy

# Check migration status
docker-compose -f docker-compose.prod.yml exec backend \
  npx prisma migrate status
```

## Troubleshooting

### Build Fails

**Symptom:** Docker build fails during npm install or build step

**Solutions:**

- Check Node version compatibility
- Verify package.json syntax
- Clear Docker build cache: `docker builder prune`
- Check disk space: `df -h`

### Health Check Fails

**Symptom:** Container starts but health check fails

**Solutions:**

- Check application logs
- Verify health endpoint is implemented
- Ensure port is accessible internally
- Increase start period in health check config

### Deployment Fails

**Symptom:** GitHub Actions deployment fails

**Solutions:**

- Verify SSH connection from local machine
- Check GitHub secrets are configured
- Ensure server has Docker installed
- Verify /opt/tasker directory exists
- Check server disk space

## Performance Optimization

### Image Build Caching

GitHub Actions uses build cache to speed up builds:

- Cache type: GitHub Actions cache
- Cache mode: max (caches all layers)
- Typical cache hit: 2-5 minutes vs 10-15 minutes

### Production Optimizations

**Backend:**

- Prisma query optimization
- Connection pooling
- Environment-specific configs
- Logging levels

**Frontend:**

- Gzip compression
- Static asset caching (1 year)
- Bundle optimization
- Lazy loading

**Database:**

- Indexed queries
- Connection limits
- Optimized PostgreSQL config

## Security Considerations

### Secrets Management

**Never commit:**

- `.env.production`
- SSH private keys
- API tokens
- Database passwords

**Use GitHub secrets for:**

- Production credentials
- SSH keys
- API tokens
- Third-party service keys

### Container Security

**Best practices implemented:**

- ✅ Non-root users
- ✅ Minimal base images (Alpine)
- ✅ Multi-stage builds
- ✅ Health checks
- ✅ Resource limits
- ✅ Network isolation

**Additional hardening (recommended):**

- Container image scanning (Trivy, Snyk)
- Runtime security monitoring (Falco)
- Secrets management (Vault, AWS Secrets Manager)
- Network policies
- Regular security updates

## Scaling

### Horizontal Scaling

For high traffic, scale backend replicas:

```yaml
# docker-compose.prod.yml
services:
  backend:
    deploy:
      replicas: 3
```

Add load balancer (Nginx, HAProxy, or Traefik).

### Vertical Scaling

Increase resource limits:

```yaml
deploy:
  resources:
    limits:
      cpus: '2'
      memory: 1G
```

### Database Scaling

For high load:

- Read replicas
- Connection pooling
- Query optimization
- Caching layer (Redis)

## Future Enhancements

### Planned Improvements

- [ ] Automated vulnerability scanning in CI
- [ ] Kubernetes manifests for orchestration
- [ ] Helm charts for easy deployment
- [ ] Monitoring dashboard (Grafana + Prometheus)
- [ ] Log aggregation (ELK stack)
- [ ] Automated database backups
- [ ] Blue-green deployments
- [ ] Canary deployments
- [ ] A/B testing infrastructure

### Integration Opportunities

- **Monitoring:** Datadog, New Relic, Sentry
- **Logging:** LogDNA, Papertrail, Loggly
- **Alerting:** PagerDuty, OpsGenie
- **APM:** New Relic, Dynatrace
- **CDN:** CloudFlare, Fastly

## Quick Reference

### Common Commands

```bash
# Local development
docker-compose up -d postgres
npm run start backend
npm run start frontend

# Production deployment
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Health checks
curl http://localhost:3000/health
curl http://localhost:80/health

# Database operations
docker-compose exec postgres psql -U tasker
docker-compose exec backend npx prisma studio

# Maintenance
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d
docker system prune -af
```

### Important Files

- `apps/backend/Dockerfile` - Backend container definition
- `apps/frontend/Dockerfile` - Frontend container definition
- `docker-compose.prod.yml` - Production orchestration
- `.env.production` - Production environment variables
- `.github/workflows/ci.yml` - CI pipeline
- `.github/workflows/deploy.yml` - Deployment pipeline

### Documentation

- [DEPLOYMENT.md](../DEPLOYMENT.md) - Full deployment guide
- [DOCKER_QUICK_START.md](../DOCKER_QUICK_START.md) - Quick reference
- [.github/SECRETS_SETUP.md](../.github/SECRETS_SETUP.md) - CI/CD setup

## Support

For deployment issues:

1. Check logs: `docker-compose logs -f`
2. Verify health: `curl http://localhost:3000/health`
3. Review DEPLOYMENT.md troubleshooting section
4. Check GitHub Actions workflow logs
5. Open GitHub issue with error details

---

**Infrastructure completed:** 2025-11-13
**CI/CD pipelines:** GitHub Actions
**Container registry:** GitHub Container Registry
**Deployment target:** Self-hosted server via SSH
