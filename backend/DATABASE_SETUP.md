# Database Setup Guide

## Overview
This project uses a three-tier database setup with environment-specific configuration files:
1. **Local Development** - Docker PostgreSQL (`.env.development`)
2. **Staging** - Neon development branch (`.env.staging`)
3. **Production** - Neon production branch (`.env.production`)

---

## Professional Environment Switching

### Automated Workflow (Recommended)

The project provides npm scripts that automatically handle environment switching:

**Development Commands:**
```bash
# Start app with LOCAL database (default)
npm run dev:local

# Start app with STAGING database
npm run dev:staging

# Check current environment
npm run env:status
```

**Database Migration Commands:**
```bash
# Run migrations on LOCAL database
npm run prisma:migrate:local

# Deploy migrations to STAGING
npm run prisma:migrate:staging

# Deploy migrations to PRODUCTION (use with caution!)
npm run prisma:migrate:production
```

**Database Seeding:**
```bash
# Seed LOCAL database
npm run seed:local

# Seed STAGING database
npm run seed:staging
```

**Database Studio:**
```bash
# Open Prisma Studio for LOCAL database
npm run prisma:studio:local

# Open Prisma Studio for STAGING database
npm run prisma:studio:staging
```

### Manual Environment Switching (If Needed)

If you need to manually switch environments:

```bash
# Switch to LOCAL
npm run env:local

# Switch to STAGING
npm run env:staging

# Switch to PRODUCTION (⚠️ use with extreme caution!)
npm run env:production
```

**Environment Files Structure:**

**Template Files (safe to commit - no real credentials):**
- `.env.development` - Local Docker database configuration
- `.env.staging` - Staging template with placeholders
- `.env.production` - Production template with placeholders

**Local Override Files (gitignored - contains real credentials):**
- `.env.staging.local` - Real Neon staging credentials
- `.env.production.local` - Real Neon production credentials

**Active File (gitignored):**
- `.env` - Currently active environment (automatically switched by npm scripts)

### For Production Deployment

**NEVER commit credentials to git!**

Set environment variables directly in your deployment platform:
- **Vercel/Netlify**: Set `DATABASE_URL` in project settings
- **Railway/Render**: Add environment variable in dashboard
- **GitHub Actions**: Store as repository secret (`DATABASE_URL`)
- **Docker**: Pass via `-e DATABASE_URL=...` or docker-compose environment section

---

## Quick Start

### 1. Local Development (Default)
```bash
# Make sure Docker is running
docker ps

# Start local PostgreSQL (if not running)
docker-compose up -d

# Run migrations and seed (automatically uses local DB)
npm run prisma:migrate:local
npm run seed:local

# Start the app with local database
npm run dev:local
```

### 2. Testing with Staging Data
```bash
# Deploy migrations to staging (if needed)
npm run prisma:migrate:staging

# Seed staging database
npm run seed:staging

# Start the app with staging database
npm run dev:staging
```

### 3. Production Deployment
```bash
# Deploy migrations to production (CAREFUL!)
npm run prisma:migrate:production

# For actual deployment, set DATABASE_URL in your hosting platform
# DO NOT run the app locally against production!
```

---

## Creating a Neon Development Branch

1. Go to [Neon Console](https://console.neon.tech)
2. Select your "Theia" project
3. Go to **Branches** in the sidebar
4. Click **Create Branch**
5. Name it "development"
6. Choose to branch from "production" (main) branch
7. Copy the connection string
8. Update your `.env` file

**Benefits:**
- Isolated testing environment
- Copy of production data structure
- No risk to production data
- Free on Neon's free tier

---

## Common Commands

```bash
# View current database
npx prisma studio

# Create new migration
npx prisma migrate dev --name description_of_changes

# Deploy migrations (staging/prod)
npx prisma migrate deploy

# Reset local database (WARNING: deletes all data)
npx prisma migrate reset

# Seed database with initial data
npm run seed

# Generate Prisma Client after schema changes
npx prisma generate
```

---

## Workflow Recommendations

### For New Features:
1. Develop locally using Docker PostgreSQL
2. Test migrations work correctly
3. Switch to Neon development branch
4. Deploy and test on cloud database
5. Once validated, deploy to production

### For Database Changes:
1. Create migration locally: `npx prisma migrate dev --name add_new_field`
2. Test thoroughly in local database
3. Deploy to development branch: `npx prisma migrate deploy`
4. Test in development
5. Deploy to production: `npx prisma migrate deploy`

---

## Troubleshooting

### Connection Issues
```bash
# Test connection
npx prisma db pull

# Check PostgreSQL is running (local)
docker ps | grep postgres

# Verify .env file
cat .env | grep DATABASE_URL
```

### Migration Issues
```bash
# Check migration status
npx prisma migrate status

# Resolve migration issues
npx prisma migrate resolve --applied <migration_name>
```

---

## Environment Variables

- `.env` - Your active database configuration (gitignored)
- `.env.example` - Template showing all options (committed to git)

Never commit `.env` - it contains sensitive credentials!
