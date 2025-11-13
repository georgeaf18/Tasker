# Database Setup - PostgreSQL with Docker

## Overview

Tasker uses **PostgreSQL 16** for development, running in Docker via Docker Compose. This provides an isolated, consistent database environment without requiring a local PostgreSQL installation.

**Stack:**

- PostgreSQL 16 (latest stable)
- Docker Compose for orchestration
- Persistent data volume for development
- Auto-restart on system reboot

---

## Quick Start

### 1. Copy Environment File

```bash
cp .env.example .env
```

### 2. Update Database Credentials

Edit `.env` and configure your database credentials:

```env
DATABASE_URL="postgresql://tasker:your_secure_password@localhost:5432/tasker_dev"
POSTGRES_USER=tasker
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=tasker_dev
```

**Important:** Change `your_secure_password` to a strong password.

### 3. Start PostgreSQL

```bash
npm run db:up
```

This will:

- Download PostgreSQL 16 image (first run only)
- Start the database container
- Create persistent volume for data
- Expose port 5432 to localhost

### 4. Verify Connection

```bash
npm run db:shell
```

You should see the PostgreSQL prompt:

```
tasker_dev=#
```

Type `\q` to exit.

---

## Available Scripts

All database operations use npm scripts for consistency:

- **`npm run db:up`** - Start PostgreSQL in detached mode
  - Runs `docker-compose up -d postgres`
  - Container runs in background
  - Safe to run multiple times (idempotent)

- **`npm run db:down`** - Stop PostgreSQL container
  - Stops container but preserves data
  - Use when done with development session

- **`npm run db:logs`** - View database logs
  - Real-time log output
  - Press `Ctrl+C` to exit
  - Useful for debugging connection issues

- **`npm run db:shell`** - Connect to PostgreSQL shell (psql)
  - Interactive database access
  - Run SQL queries directly
  - Inspect tables and data

- **`npm run db:clean`** - Stop and remove container + volumes
  - **WARNING:** This deletes all database data
  - Use when you need a fresh start
  - Requires re-running migrations after

---

## Connection Details

### From NestJS Backend

The backend uses Prisma ORM, which reads `DATABASE_URL` from `.env`:

```env
DATABASE_URL="postgresql://tasker:your_password@localhost:5432/tasker_dev"
```

Prisma automatically handles connection pooling and migrations.

### From External Tools

Use these credentials to connect from tools like TablePlus, pgAdmin, or DBeaver:

- **Host**: `localhost`
- **Port**: `5432`
- **Database**: `tasker_dev`
- **Username**: `tasker`
- **Password**: (from your `.env` file)
- **SSL Mode**: Disable (development only)

### Connection String Format

```
postgresql://[USER]:[PASSWORD]@[HOST]:[PORT]/[DATABASE]
```

Example:

```
postgresql://tasker:mypassword@localhost:5432/tasker_dev
```

---

## Troubleshooting

### Port 5432 Already in Use

**Problem:** Another PostgreSQL instance is using port 5432.

**Solution 1 - Stop Local PostgreSQL:**

```bash
# macOS (Homebrew)
brew services stop postgresql

# Linux (systemd)
sudo systemctl stop postgresql

# Check if port is free
lsof -i :5432
```

**Solution 2 - Change Docker Port:**

Edit `docker-compose.yml`:

```yaml
ports:
  - '5433:5432' # Use 5433 instead
```

Update `.env`:

```env
DATABASE_URL="postgresql://tasker:password@localhost:5433/tasker_dev"
```

### Cannot Connect to Database

**Problem:** Backend shows `Connection refused` or `ECONNREFUSED`.

**Diagnosis:**

```bash
# Check if container is running
docker ps | grep postgres

# Check container logs
npm run db:logs
```

**Solution:**

```bash
# Restart container
npm run db:down
npm run db:up

# Verify connection
npm run db:shell
```

If still failing, check:

1. `DATABASE_URL` in `.env` matches container credentials
2. Container health: `docker inspect tasker-postgres`
3. Firewall rules allow localhost:5432

### Permission Denied Errors

**Problem:** Docker shows permission errors when creating volumes.

**Solution (Linux):**

```bash
# Add user to docker group
sudo usermod -aG docker $USER

# Log out and log back in, then:
docker ps
```

**Solution (macOS/Windows):**

- Ensure Docker Desktop has disk access permissions
- Go to Docker Desktop → Settings → Resources → File Sharing
- Add project directory to shared paths

### Database Not Persisting Data

**Problem:** Data disappears after `docker-compose down`.

**Check Volume:**

```bash
# List volumes
docker volume ls | grep postgres

# Inspect volume
docker volume inspect tasker-postgres-data
```

**Solution:**

Ensure `docker-compose.yml` has volume mapping:

```yaml
volumes:
  - postgres_data:/var/lib/postgresql/data
```

If volume is missing:

```bash
npm run db:down
npm run db:up
```

---

## Security: PostgreSQL Access Control

For security during AI development sessions, you can control whether PostgreSQL is accessible externally.

### Quick Toggle

Use the convenience script:

```bash
# Enable external access (for your development work)
./scripts/toggle-db-access.sh on

# Disable external access (for AI auto-approve mode)
./scripts/toggle-db-access.sh off

# Check current status
./scripts/toggle-db-access.sh status
```

### Manual Configuration

Edit `.env` and set `POSTGRES_EXTERNAL_PORT`:

**Enabled (Development):**

```env
POSTGRES_EXTERNAL_PORT=5432
```

- Database accessible at `localhost:5432`
- GUI tools (TablePlus, Prisma Studio, etc.) can connect
- Backend on host can connect

**Disabled (AI Sessions):**

```env
POSTGRES_EXTERNAL_PORT=
```

- Database NOT accessible externally
- Secure during AI auto-approve mode
- Backend in Docker can still connect via service name

**Apply changes:**

```bash
docker-compose up -d
```

### Why This Matters

When Claude Code works in auto-approve mode, disabling external database access adds an extra security layer:

- Prevents malicious code from accessing your database
- Isolates the container from external networks
- Backend services in Docker can still communicate internally
- Simple toggle lets you enable access when you need it

### Best Practices

1. **Development work:** Enable external access (`./scripts/toggle-db-access.sh on`)
2. **AI auto-approve sessions:** Disable external access (`./scripts/toggle-db-access.sh off`)
3. **After AI session:** Re-enable if needed
4. **Production:** Always keep disabled (handled by separate docker-compose.prod.yml)

---

## Data Persistence

### How It Works

Docker Compose creates a **named volume** to store PostgreSQL data:

```yaml
volumes:
  postgres_data: # Named volume
```

This volume is mapped to the container's data directory:

```yaml
volumes:
  - postgres_data:/var/lib/postgresql/data
```

**Benefits:**

- Data survives container restarts
- Data persists after `docker-compose down`
- Fast I/O (native filesystem)
- Easy backup via `docker volume` commands

### Volume Location

**macOS:**

```
~/Library/Containers/com.docker.docker/Data/vms/0/
```

**Linux:**

```
/var/lib/docker/volumes/tasker_postgres_data/_data
```

**Windows:**

```
\\wsl$\docker-desktop-data\version-pack-data\community\docker\volumes
```

### Backup Database

```bash
# Export database to SQL file
docker exec tasker-postgres pg_dump -U tasker tasker_dev > backup.sql

# Restore from backup
cat backup.sql | docker exec -i tasker-postgres psql -U tasker tasker_dev
```

---

## Reset Database

### Soft Reset (Keep Container)

Drops all tables and re-runs Prisma migrations:

```bash
# Reset Prisma schema
npx prisma migrate reset

# Confirm with 'y' when prompted
```

This is **non-destructive** to the Docker container.

### Hard Reset (Delete Everything)

Completely removes container and data volume:

```bash
# Stop and remove everything
npm run db:clean

# Start fresh
npm run db:up

# Run migrations
npx prisma migrate dev --name init
```

Use this when:

- Switching to new Prisma schema
- Troubleshooting persistent issues
- Starting from scratch

---

## Development Workflow

### Daily Workflow

```bash
# Start work
npm run db:up

# Run backend with live reload
nx serve backend

# Stop when done
npm run db:down
```

### After Schema Changes

```bash
# Create migration
npx prisma migrate dev --name add_new_field

# Generate Prisma Client
npx prisma generate

# Verify in Prisma Studio
npx prisma studio
```

### Testing Changes

```bash
# Use separate test database
export DATABASE_URL="postgresql://tasker:password@localhost:5432/tasker_test"

# Run tests
nx test backend

# Reset to dev database
unset DATABASE_URL
```

---

**Note:** This setup is for **development only**. Production deployment uses managed PostgreSQL (e.g., Railway, Supabase, AWS RDS) with different connection pooling, SSL, and backup strategies.
