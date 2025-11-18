# Database Strategy - Multi-Environment Setup

**Status:** Tentative Plan
**Date:** 2025-11-17
**Context:** Initial discussion on preventing data loss while developing

---

## Problem Statement

As an ADHD task management app, Tasker presents a unique challenge:
- **Developer = User**: Same person building and using the app daily
- **Data is Critical**: Tasks cannot be lost during development
- **Need for Testing**: Must test features without corrupting production data

Currently using local Docker PostgreSQL - data is lost when containers are rebuilt.

---

## Solution: Multi-Environment Database Architecture

### Environment Separation (Industry Standard)

```
┌─────────────────────────────────────────────────┐
│ Production (Cloud)                              │
│ - Real user data (YOUR daily tasks)            │
│ - Automated backups (point-in-time recovery)   │
│ - High availability / replication              │
│ - Never touched by dev work                    │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ Staging (Cloud) - OPTIONAL INITIALLY            │
│ - Mirror of prod structure                     │
│ - Sanitized copy of prod data (optional)       │
│ - Pre-production testing                       │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ Development/Local (Your Machine)                │
│ - Seed data only (fake tasks)                  │
│ - Fast iteration                               │
│ - Disposable / rebuilt frequently              │
└─────────────────────────────────────────────────┘
```

---

## Industry Standard Practices

### 1. Never Share Databases Across Environments
- Each environment gets its own isolated database
- Prevents dev work from corrupting prod
- Allows independent schema changes

### 2. Production Data Protection
```bash
# Automated backups (Supabase/Railway/Render all do this)
- Continuous: Write-Ahead Log (WAL) archiving
- Daily: Full database snapshots (7-30 day retention)
- Point-in-time recovery: Restore to any second in the last 7 days
```

### 3. Data Refresh Strategy (Staging ← Production)
```bash
# Weekly or on-demand
1. pg_dump from production (with --no-owner --no-acl)
2. Sanitize sensitive data (if applicable - skip for personal app)
3. Restore to staging

# For personal app: Skip sanitization since it's all your data
```

### 4. Schema Migration Strategy
```bash
# Development
1. Write Prisma schema changes locally
2. Generate migration: npx prisma migrate dev
3. Test with seed data

# Staging (Optional)
4. Deploy migration to staging
5. Test with production-like data

# Production
6. Deploy migration to production (with backup first)
7. Run: npx prisma migrate deploy
```

---

## Recommended Setup for Tasker

### Option A: Cost-Effective (Recommended for Solo Dev)

**Production:** Cloud PostgreSQL (Supabase free tier or Railway)
- Your daily driver task data
- Automated backups included
- Access from anywhere (phone, laptop, etc.)
- Cost: ~$0-5/month

**Development:** Local Docker PostgreSQL
- Seed scripts for fake data
- Fast iteration
- No cloud costs
- Cost: $0

**Staging:** Skip initially - add when beta users arrive

### Option B: Full Professional Setup

**Production:** Supabase/Railway/Render ($15-25/month)
- High availability
- Automated backups
- Point-in-time recovery

**Staging:** Same provider, smaller tier ($5-10/month)
- Weekly refresh from prod

**Development:** Local Docker

---

## Recommended Cloud Provider: Supabase

**Why Supabase for Tasker:**
- PostgreSQL hosted (same as local)
- Free tier generous enough for solo use
- Real-time subscriptions (useful for task updates in future)
- Automatic backups included
- Point-in-time recovery (7 days on free tier)
- Row-level security (optional future feature for multi-user)
- Easy migration from local Prisma setup

**Alternatives:**
- **Railway:** Simpler, good GitHub integration, $5/month after free tier
- **Render:** Similar to Railway, good for NestJS apps
- **Neon:** Serverless PostgreSQL with generous free tier

---

## Backup Strategy

### Automated (Built into Hosting)
- Continuous WAL archiving (every transaction logged)
- Daily snapshots (automatic)
- Point-in-time recovery (restore to any second in last 7 days)

### Manual (Peace of Mind)
```bash
# Weekly export via Prisma
npx prisma db pull  # Updates schema.prisma

# Monthly data export (before major changes)
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Schema is already in git (prisma/schema.prisma)
```

---

## Migration Path

### Phase 1: Move Production to Cloud (Week 1)

**Goal:** Get your daily task data into a safe, backed-up cloud database

1. Sign up for Supabase (free tier)
2. Create production PostgreSQL database
3. Get connection string from Supabase dashboard
4. Update `.env.production` with cloud connection string
5. Run migrations: `npx prisma migrate deploy`
6. Seed your real tasks OR start fresh
7. Update NestJS backend to use production env vars

**Estimated Time:** 2-3 hours

### Phase 2: Local Development Setup (Week 2)

**Goal:** Fast local iteration without touching production

1. Keep `docker-compose.yml` for local PostgreSQL
2. Create robust seed script with fake tasks
   ```typescript
   // seed.ts
   const fakeTasks = [
     { title: 'Review PR #123', status: 'TODAY', priority: 2 },
     { title: 'Write documentation', status: 'BACKLOG', priority: 3 },
     // ... more fake data
   ];
   ```
3. Use `.env.local` for local database connection
4. Document: "NEVER connect local dev to cloud prod"

**Estimated Time:** 3-4 hours

### Phase 3: Staging Environment (When Needed)

**Goal:** Test risky features before production deployment

1. Add staging database to Supabase (or separate free tier account)
2. Create refresh script (staging ← production)
   ```bash
   #!/bin/bash
   # scripts/refresh-staging.sh
   pg_dump $PROD_DB_URL | psql $STAGING_DB_URL
   ```
3. Run weekly or before major feature deployments
4. Test migrations here first

**Estimated Time:** 2 hours
**Timeline:** Add when you have beta users or before v0.2

---

## Database Refresh Script (Staging ← Production)

**Purpose:** Copy production data to staging for realistic testing

```bash
#!/bin/bash
# scripts/refresh-staging.sh

set -e  # Exit on error

echo "🔄 Starting staging database refresh from production..."

# 1. Backup staging (just in case)
echo "📦 Backing up staging database..."
pg_dump $STAGING_DB_URL > "backups/staging_backup_$(date +%Y%m%d_%H%M%S).sql"

# 2. Drop staging schema and recreate
echo "🗑️  Dropping staging schema..."
psql $STAGING_DB_URL -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

# 3. Copy from production
echo "📥 Copying data from production..."
pg_dump $PROD_DB_URL --no-owner --no-acl | psql $STAGING_DB_URL

# 4. Sanitize (optional - skip for personal app)
# echo "🔒 Sanitizing sensitive data..."
# psql $STAGING_DB_URL -c "UPDATE users SET email = CONCAT('test+', id, '@example.com');"

echo "✅ Staging refresh complete!"
```

**For personal ADHD app:** Skip sanitization since it's all your data.

---

## Environment Variables Setup

### .env.production (Cloud)
```bash
DATABASE_URL="postgresql://user:pass@db.supabase.co:5432/postgres"
NODE_ENV="production"
```

### .env.local (Docker)
```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/tasker_dev"
NODE_ENV="development"
```

### .env.staging (Optional)
```bash
DATABASE_URL="postgresql://user:pass@staging.supabase.co:5432/postgres"
NODE_ENV="staging"
```

---

## Cost Breakdown

### Recommended Setup (Option A)
- **Production (Supabase Free Tier):** $0/month
  - Up to 500MB database
  - 7-day point-in-time recovery
  - Automatic backups

- **Development (Local Docker):** $0/month

- **Staging:** Skip initially ($0/month)

**Total: $0/month** until you exceed free tier limits

### When to Upgrade
- Database exceeds 500MB (unlikely for solo ADHD task manager)
- Need more than 7-day point-in-time recovery
- Adding beta users (move to $25/month tier)

---

## Data Loss Prevention Checklist

- [ ] Production database in cloud with automated backups
- [ ] Point-in-time recovery enabled (7+ days)
- [ ] Local development uses separate Docker database
- [ ] Environment variables clearly separated (.env.production vs .env.local)
- [ ] Seed script created for local fake data
- [ ] Manual backup procedure documented
- [ ] Never run migrations on production without testing first
- [ ] Git tracks schema.prisma (already doing this ✓)

---

## Next Steps

### Immediate (This Week)
1. Set up Supabase account
2. Create production database
3. Migrate current local data to production (if any valuable tasks exist)
4. Test connection from NestJS backend
5. Verify automated backups are working

### Soon (Next Week)
1. Create comprehensive seed script
2. Document local development workflow
3. Add instructions to README.md

### Future (When Needed)
1. Add staging environment
2. Set up database refresh script
3. Consider monitoring/alerting for production

---

## Questions to Resolve

- [ ] Export current local tasks before migration? (if any exist)
- [ ] Supabase vs Railway vs Neon? (Leaning Supabase for features)
- [ ] Keep Docker Compose for local dev? (Yes, recommended)
- [ ] Add staging immediately or wait for beta? (Wait recommended)

---

## References

- [Supabase Pricing](https://supabase.com/pricing)
- [Railway Pricing](https://railway.app/pricing)
- [Prisma Migrate Deploy](https://www.prisma.io/docs/concepts/components/prisma-migrate/migrate-development-production#production-and-testing-environments)
- [PostgreSQL Backup Best Practices](https://www.postgresql.org/docs/current/backup.html)

---

**Decision:** Proceed with **Option A** - Supabase free tier for production, local Docker for development.

**Timeline:** Phase 1 (cloud migration) this week, Phase 2 (local dev setup) next week.
