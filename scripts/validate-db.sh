#!/usr/bin/env bash
set -e

echo "🔍 Validating PostgreSQL setup..."
echo ""

# Check Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop."
    exit 1
fi

echo "✅ Docker is running"

# Load environment variables from .env if it exists
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
    echo "✅ Loaded environment variables from .env"
else
    echo "⚠️  No .env file found, using defaults"
fi

# Set defaults if not provided
POSTGRES_USER=${POSTGRES_USER:-tasker}
POSTGRES_DB=${POSTGRES_DB:-tasker_dev}

echo ""
echo "📋 Configuration:"
echo "   User: $POSTGRES_USER"
echo "   Database: $POSTGRES_DB"
echo ""

# Start PostgreSQL
echo "🚀 Starting PostgreSQL container..."
docker-compose up -d postgres

# Wait for health check
echo "⏳ Waiting for PostgreSQL to be healthy..."
SECONDS=0
MAX_WAIT=30

while [ $SECONDS -lt $MAX_WAIT ]; do
    # Check if container is healthy
    HEALTH_STATUS=$(docker inspect --format='{{.State.Health.Status}}' tasker-postgres 2>/dev/null || echo "starting")

    if [ "$HEALTH_STATUS" = "healthy" ]; then
        echo "✅ PostgreSQL is healthy (took ${SECONDS}s)"
        break
    fi

    if [ $SECONDS -ge $MAX_WAIT ]; then
        echo ""
        echo "❌ PostgreSQL health check timeout after ${MAX_WAIT}s"
        echo ""
        echo "📋 Container logs:"
        docker-compose logs postgres
        exit 1
    fi

    echo "   Status: $HEALTH_STATUS (${SECONDS}s elapsed)"
    sleep 2
done

echo ""

# Test connection
echo "🔗 Testing database connection..."
if docker-compose exec -T postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "SELECT 1;" > /dev/null 2>&1; then
    echo "✅ Database connection successful"
    echo "✅ Database '$POSTGRES_DB' exists"
else
    echo ""
    echo "❌ Failed to connect to database"
    echo ""
    echo "📋 Container logs:"
    docker-compose logs postgres
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ All validations passed!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "   PostgreSQL is running on localhost:5432"
echo "   Database: $POSTGRES_DB"
echo "   User: $POSTGRES_USER"
echo ""
echo "💡 Next steps:"
echo "   - View logs: npm run db:logs"
echo "   - Access shell: npm run db:shell"
echo "   - Stop database: npm run db:down"
echo ""
