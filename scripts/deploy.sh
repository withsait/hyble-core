#!/bin/bash
# Hyble Core - Deployment Script
# Usage: ./scripts/deploy.sh [environment] [apps...]
# Example: ./scripts/deploy.sh production core gateway

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-production}
shift
APPS=${@:-"core gateway digital studios console"}

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(production|staging|development)$ ]]; then
    echo -e "${RED}Invalid environment: $ENVIRONMENT${NC}"
    echo "Usage: ./scripts/deploy.sh [production|staging|development] [apps...]"
    exit 1
fi

echo -e "${BLUE}╔══════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║          HYBLE CORE DEPLOYMENT               ║${NC}"
echo -e "${BLUE}╠══════════════════════════════════════════════╣${NC}"
echo -e "${BLUE}║  Environment: ${GREEN}$ENVIRONMENT${NC}"
echo -e "${BLUE}║  Apps: ${GREEN}$APPS${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════╝${NC}"

# Function to log with timestamp
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

# Function to check if command succeeded
check_status() {
    if [ $? -eq 0 ]; then
        log "${GREEN}✓ $1${NC}"
    else
        log "${RED}✗ $1 failed${NC}"
        exit 1
    fi
}

# Pre-flight checks
log "${YELLOW}Running pre-flight checks...${NC}"

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    log "${RED}Node.js 20+ required. Current: $(node -v)${NC}"
    exit 1
fi
log "${GREEN}✓ Node.js $(node -v)${NC}"

# Check pnpm
if ! command -v pnpm &> /dev/null; then
    log "${RED}pnpm not found. Please install pnpm.${NC}"
    exit 1
fi
log "${GREEN}✓ pnpm $(pnpm -v)${NC}"

# Check disk space
DISK_USAGE=$(df -h / | tail -1 | awk '{print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -gt 90 ]; then
    log "${RED}Low disk space: ${DISK_USAGE}% used${NC}"
    exit 1
fi
log "${GREEN}✓ Disk space: ${DISK_USAGE}% used${NC}"

# Check environment variables
if [ "$ENVIRONMENT" = "production" ]; then
    REQUIRED_VARS="DATABASE_URL REDIS_URL NEXTAUTH_SECRET"
    for var in $REQUIRED_VARS; do
        if [ -z "${!var}" ]; then
            log "${RED}Missing required env var: $var${NC}"
            exit 1
        fi
    done
    log "${GREEN}✓ Environment variables configured${NC}"
fi

# Backup database (production only)
if [ "$ENVIRONMENT" = "production" ]; then
    log "${YELLOW}Creating database backup...${NC}"
    BACKUP_FILE="/backups/pre-deploy-$(date +%Y%m%d_%H%M%S).sql"
    mkdir -p /backups
    pg_dump "$DATABASE_URL" > "$BACKUP_FILE" 2>/dev/null || true
    if [ -f "$BACKUP_FILE" ]; then
        log "${GREEN}✓ Backup created: $BACKUP_FILE${NC}"
    else
        log "${YELLOW}⚠ Backup skipped (no pg_dump available)${NC}"
    fi
fi

# Pull latest code
log "${YELLOW}Pulling latest code...${NC}"
BRANCH="main"
if [ "$ENVIRONMENT" = "staging" ]; then
    BRANCH="staging"
fi
git fetch origin
git checkout $BRANCH
git pull origin $BRANCH
check_status "Git pull"

# Install dependencies
log "${YELLOW}Installing dependencies...${NC}"
pnpm install --frozen-lockfile
check_status "Install dependencies"

# Generate Prisma client
log "${YELLOW}Generating Prisma client...${NC}"
pnpm db:generate
check_status "Generate Prisma client"

# Run migrations (production only)
if [ "$ENVIRONMENT" = "production" ] || [ "$ENVIRONMENT" = "staging" ]; then
    log "${YELLOW}Running database migrations...${NC}"
    pnpm db:migrate
    check_status "Database migrations"
fi

# Build applications
log "${YELLOW}Building applications...${NC}"
for app in $APPS; do
    log "Building $app..."
    pnpm build --filter=@hyble/$app
    check_status "Build $app"
done

# Deploy with PM2
log "${YELLOW}Deploying with PM2...${NC}"
for app in $APPS; do
    PM2_NAME="hyble-$app"
    log "Deploying $PM2_NAME..."

    # Check if app exists
    if pm2 describe $PM2_NAME > /dev/null 2>&1; then
        pm2 reload $PM2_NAME --update-env
    else
        cd apps/$app
        pm2 start npm --name "$PM2_NAME" -- start
        cd ../..
    fi
    check_status "Deploy $PM2_NAME"
done

# Save PM2 state
pm2 save
check_status "Save PM2 state"

# Health checks
log "${YELLOW}Running health checks...${NC}"
PORTS=("core:3000" "gateway:3001" "digital:3002" "studios:3003" "console:3004")

for port_map in "${PORTS[@]}"; do
    APP_NAME="${port_map%%:*}"
    PORT="${port_map##*:}"

    # Skip if app not in deployment list
    if [[ ! " $APPS " =~ " $APP_NAME " ]]; then
        continue
    fi

    # Wait for app to start
    for i in {1..30}; do
        if curl -sf "http://localhost:$PORT/api/health" > /dev/null 2>&1; then
            log "${GREEN}✓ $APP_NAME is healthy (port $PORT)${NC}"
            break
        fi
        if [ $i -eq 30 ]; then
            log "${RED}✗ $APP_NAME health check failed${NC}"
            exit 1
        fi
        sleep 2
    done
done

# Cleanup
log "${YELLOW}Cleaning up...${NC}"
find . -name '.next' -type d -mtime +7 -exec rm -rf {} + 2>/dev/null || true
pnpm store prune 2>/dev/null || true
log "${GREEN}✓ Cleanup complete${NC}"

# Print summary
echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║       DEPLOYMENT COMPLETED SUCCESSFULLY      ║${NC}"
echo -e "${GREEN}╠══════════════════════════════════════════════╣${NC}"
echo -e "${GREEN}║  Environment: $ENVIRONMENT${NC}"
echo -e "${GREEN}║  Apps: $APPS${NC}"
echo -e "${GREEN}║  Time: $(date +'%Y-%m-%d %H:%M:%S')${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════╝${NC}"

# Show PM2 status
pm2 status
