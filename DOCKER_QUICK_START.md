# Docker Quick Start Guide

Quick reference for running Tasker with Docker.

## Local Development

### Start Services

```bash
# Start PostgreSQL only (for local development)
docker-compose up -d postgres

# Start all services (when backend/frontend are ready)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Database Management

```bash
# Run Prisma migrations
npx prisma migrate dev

# Open Prisma Studio (database GUI)
npx prisma studio

# Seed database
npm run seed
```

## Production Deployment

### Initial Setup

```bash
# Copy and configure environment
cp .env.production.example .env.production
nano .env.production

# Start all services
docker-compose -f docker-compose.prod.yml up -d

# Run migrations
docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

### Common Commands

```bash
# Restart a service
docker-compose -f docker-compose.prod.yml restart backend

# View service status
docker-compose -f docker-compose.prod.yml ps

# Update to latest images
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d

# View specific service logs
docker-compose -f docker-compose.prod.yml logs -f backend

# Execute command in container
docker-compose -f docker-compose.prod.yml exec backend npm run seed
```

## Building Docker Images

### Build Locally

```bash
# Build backend
docker build -f apps/backend/Dockerfile -t tasker-backend .

# Build frontend
docker build -f apps/frontend/Dockerfile -t tasker-frontend .

# Run built image
docker run -p 3000:3000 --env-file .env tasker-backend
```

### Multi-Platform Build

```bash
# Setup buildx (one-time)
docker buildx create --name mybuilder --use

# Build for multiple platforms
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -f apps/backend/Dockerfile \
  -t tasker-backend:latest \
  --push \
  .
```

## Health Checks

```bash
# Check backend health
curl http://localhost:3000/health

# Check frontend health
curl http://localhost:80/health

# Check PostgreSQL
docker-compose exec postgres pg_isready -U tasker

# View health status
docker inspect tasker-backend-prod --format='{{.State.Health.Status}}'
```

## Troubleshooting

### Container Won't Start

```bash
# View detailed logs
docker-compose logs backend

# Check container status
docker-compose ps

# Restart specific service
docker-compose restart backend
```

### Database Issues

```bash
# Connect to PostgreSQL
docker-compose exec postgres psql -U tasker -d tasker

# Check database exists
docker-compose exec postgres psql -U tasker -c "\l"

# View tables
docker-compose exec postgres psql -U tasker -d tasker -c "\dt"
```

### Clear Everything and Start Fresh

```bash
# Stop all containers
docker-compose down

# Remove volumes (DELETES DATA!)
docker-compose down -v

# Remove images
docker rmi tasker-backend tasker-frontend

# Start fresh
docker-compose up -d
```

## Resource Usage

```bash
# View resource usage (CPU, Memory, Network)
docker stats

# View disk usage
docker system df

# Clean up unused resources
docker system prune -a --volumes
```

## Development Workflow

### Recommended Setup

1. **Run PostgreSQL in Docker:**

   ```bash
   docker-compose up -d postgres
   ```

2. **Run backend/frontend locally:**

   ```bash
   # Terminal 1
   npm run start backend

   # Terminal 2
   npm run start frontend
   ```

3. **Benefit:** Hot reload during development

### Full Docker Development (Alternative)

1. **Uncomment services in `docker-compose.override.yml`**

2. **Start all services:**

   ```bash
   docker-compose up -d
   ```

3. **View logs:**
   ```bash
   docker-compose logs -f backend frontend
   ```

## Environment Variables

### Development (.env)

```bash
DATABASE_URL=postgresql://tasker_dev:tasker_dev@localhost:5432/tasker_dev
```

### Production (.env.production)

```bash
DATABASE_URL=postgresql://tasker:STRONG_PASSWORD@postgres:5432/tasker
CORS_ORIGIN=https://yourdomain.com
```

## Useful Docker Commands

```bash
# List all containers
docker ps -a

# List all images
docker images

# Remove stopped containers
docker container prune

# Remove unused images
docker image prune -a

# View container logs
docker logs <container_id>

# Execute bash in container
docker exec -it tasker-backend-prod sh

# Copy file from container
docker cp tasker-backend-prod:/app/logs/app.log ./app.log

# View container details
docker inspect tasker-backend-prod
```

## CI/CD

### Trigger CI

```bash
# Push to main or develop
git push origin main

# Create pull request
gh pr create
```

### Trigger Deployment

```bash
# Create and push tag
git tag v0.1.0
git push origin v0.1.0

# Manual trigger via GitHub Actions UI
# Repository → Actions → Deploy → Run workflow
```

## Next Steps

- Read [DEPLOYMENT.md](./DEPLOYMENT.md) for comprehensive guide
- See [.github/SECRETS_SETUP.md](./.github/SECRETS_SETUP.md) for CI/CD configuration
- Check `docker-compose.prod.yml` for production configuration
- Review Dockerfiles in `apps/*/Dockerfile` for build process

## Support

For issues:

- Check logs: `docker-compose logs -f`
- Verify health: `curl http://localhost:3000/health`
- Review DEPLOYMENT.md troubleshooting section
- Open GitHub issue with logs
