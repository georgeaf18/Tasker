#!/usr/bin/env bash

# PostgreSQL External Access Toggle
# Convenience script to enable/disable PostgreSQL port exposure for security

set -e

ENV_FILE=".env"
BACKUP_FILE=".env.backup"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env exists
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}Error: .env file not found${NC}"
    echo "Please copy .env.example to .env first"
    exit 1
fi

# Function to get current status
get_status() {
    if grep -q "^POSTGRES_EXTERNAL_PORT=5432" "$ENV_FILE"; then
        echo "enabled"
    elif grep -q "^POSTGRES_EXTERNAL_PORT=$" "$ENV_FILE" || grep -q "^POSTGRES_EXTERNAL_PORT=\"\"$" "$ENV_FILE"; then
        echo "disabled"
    else
        echo "unknown"
    fi
}

# Function to show current status
show_status() {
    local status=$(get_status)
    echo ""
    echo "PostgreSQL External Access Status:"
    echo "-----------------------------------"

    if [ "$status" = "enabled" ]; then
        echo -e "${GREEN}ENABLED${NC} - Database accessible at localhost:5432"
        echo "  ✓ GUI tools can connect"
        echo "  ✓ Host backend can connect"
        echo "  ⚠️  Use 'off' during AI auto-approve sessions"
    elif [ "$status" = "disabled" ]; then
        echo -e "${RED}DISABLED${NC} - Database NOT accessible externally"
        echo "  ✓ Secure for AI sessions"
        echo "  ✓ Docker services can still communicate"
        echo "  ⚠️  Use 'on' for development work"
    else
        echo -e "${YELLOW}UNKNOWN${NC} - POSTGRES_EXTERNAL_PORT not configured correctly"
        echo "Expected: POSTGRES_EXTERNAL_PORT=5432 (enabled) or POSTGRES_EXTERNAL_PORT= (disabled)"
    fi
    echo ""
}

# Function to enable external access
enable_access() {
    echo "Enabling PostgreSQL external access..."

    # Backup .env
    cp "$ENV_FILE" "$BACKUP_FILE"

    # Update or add POSTGRES_EXTERNAL_PORT
    if grep -q "^POSTGRES_EXTERNAL_PORT=" "$ENV_FILE"; then
        # Replace existing line
        sed -i.tmp 's/^POSTGRES_EXTERNAL_PORT=.*/POSTGRES_EXTERNAL_PORT=5432/' "$ENV_FILE"
        rm -f "$ENV_FILE.tmp"
    else
        # Add new line
        echo "POSTGRES_EXTERNAL_PORT=5432" >> "$ENV_FILE"
    fi

    echo -e "${GREEN}✓ External access enabled${NC}"
    echo ""
    echo "Restarting PostgreSQL container..."
    docker-compose up -d postgres
    echo ""
    echo -e "${GREEN}✓ PostgreSQL now accessible at localhost:5432${NC}"
}

# Function to disable external access
disable_access() {
    echo "Disabling PostgreSQL external access..."

    # Backup .env
    cp "$ENV_FILE" "$BACKUP_FILE"

    # Update or add POSTGRES_EXTERNAL_PORT
    if grep -q "^POSTGRES_EXTERNAL_PORT=" "$ENV_FILE"; then
        # Replace existing line with empty value
        sed -i.tmp 's/^POSTGRES_EXTERNAL_PORT=.*/POSTGRES_EXTERNAL_PORT=/' "$ENV_FILE"
        rm -f "$ENV_FILE.tmp"
    else
        # Add new line with empty value
        echo "POSTGRES_EXTERNAL_PORT=" >> "$ENV_FILE"
    fi

    echo -e "${GREEN}✓ External access disabled${NC}"
    echo ""
    echo "Restarting PostgreSQL container..."
    docker-compose up -d postgres
    echo ""
    echo -e "${GREEN}✓ PostgreSQL secured (no external access)${NC}"
}

# Main script logic
case "${1:-}" in
    on|enable)
        enable_access
        ;;
    off|disable)
        disable_access
        ;;
    status)
        show_status
        ;;
    *)
        echo "Usage: $0 {on|off|status}"
        echo ""
        echo "Commands:"
        echo "  on, enable   - Enable external PostgreSQL access (development mode)"
        echo "  off, disable - Disable external PostgreSQL access (AI session mode)"
        echo "  status       - Show current access status"
        echo ""
        show_status
        exit 1
        ;;
esac
