#!/bin/bash
# Hyble Core - Backup Script
# Usage: ./scripts/backup.sh [type] [destination]
# Types: full, database, files, config

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
BACKUP_TYPE=${1:-full}
BACKUP_DIR=${2:-/backups}
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

# Ensure backup directory exists
mkdir -p "$BACKUP_DIR"/{database,files,config,full}

log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

# Function to backup database
backup_database() {
    log "${YELLOW}Backing up database...${NC}"

    BACKUP_FILE="$BACKUP_DIR/database/db_backup_$TIMESTAMP.sql"

    if [ -z "$DATABASE_URL" ]; then
        log "${RED}DATABASE_URL not set${NC}"
        return 1
    fi

    pg_dump "$DATABASE_URL" > "$BACKUP_FILE"
    gzip "$BACKUP_FILE"

    SIZE=$(du -h "${BACKUP_FILE}.gz" | cut -f1)
    log "${GREEN}✓ Database backup: ${BACKUP_FILE}.gz ($SIZE)${NC}"
}

# Function to backup files
backup_files() {
    log "${YELLOW}Backing up files...${NC}"

    BACKUP_FILE="$BACKUP_DIR/files/files_backup_$TIMESTAMP.tar.gz"

    # Backup uploads, public assets
    tar -czf "$BACKUP_FILE" \
        --exclude='node_modules' \
        --exclude='.next' \
        --exclude='.git' \
        apps/core/public/uploads \
        packages/db/prisma/migrations \
        2>/dev/null || true

    SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    log "${GREEN}✓ Files backup: $BACKUP_FILE ($SIZE)${NC}"
}

# Function to backup config
backup_config() {
    log "${YELLOW}Backing up configuration...${NC}"

    BACKUP_FILE="$BACKUP_DIR/config/config_backup_$TIMESTAMP.tar.gz"

    tar -czf "$BACKUP_FILE" \
        .env* \
        ecosystem.config.js \
        tooling/nginx/*.conf \
        tooling/docker/*.yml \
        packages/db/prisma/schema.prisma \
        2>/dev/null || true

    SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    log "${GREEN}✓ Config backup: $BACKUP_FILE ($SIZE)${NC}"
}

# Function to do full backup
backup_full() {
    log "${YELLOW}Creating full backup...${NC}"

    BACKUP_FILE="$BACKUP_DIR/full/full_backup_$TIMESTAMP.tar.gz"

    # Create temporary directory
    TEMP_DIR=$(mktemp -d)

    # Backup database
    pg_dump "$DATABASE_URL" > "$TEMP_DIR/database.sql" 2>/dev/null || true

    # Copy important files
    cp -r apps/core/public/uploads "$TEMP_DIR/uploads" 2>/dev/null || true
    cp -r packages/db/prisma "$TEMP_DIR/prisma" 2>/dev/null || true
    cp .env* "$TEMP_DIR/" 2>/dev/null || true
    cp ecosystem.config.js "$TEMP_DIR/" 2>/dev/null || true

    # Create archive
    tar -czf "$BACKUP_FILE" -C "$TEMP_DIR" .

    # Cleanup
    rm -rf "$TEMP_DIR"

    SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    log "${GREEN}✓ Full backup: $BACKUP_FILE ($SIZE)${NC}"
}

# Function to cleanup old backups
cleanup_old_backups() {
    log "${YELLOW}Cleaning up old backups...${NC}"

    find "$BACKUP_DIR" -type f -mtime +$RETENTION_DAYS -delete

    DELETED=$(find "$BACKUP_DIR" -type f -mtime +$RETENTION_DAYS | wc -l)
    log "${GREEN}✓ Deleted $DELETED old backups${NC}"
}

# Function to upload to S3
upload_to_s3() {
    if [ -z "$S3_BUCKET" ]; then
        log "${YELLOW}S3_BUCKET not set, skipping S3 upload${NC}"
        return 0
    fi

    log "${YELLOW}Uploading to S3...${NC}"

    aws s3 sync "$BACKUP_DIR" "s3://$S3_BUCKET/backups/" \
        --exclude "*" \
        --include "*_$TIMESTAMP*"

    log "${GREEN}✓ Uploaded to S3${NC}"
}

# Function to verify backup
verify_backup() {
    log "${YELLOW}Verifying backup...${NC}"

    case $BACKUP_TYPE in
        database)
            BACKUP_FILE="$BACKUP_DIR/database/db_backup_$TIMESTAMP.sql.gz"
            ;;
        files)
            BACKUP_FILE="$BACKUP_DIR/files/files_backup_$TIMESTAMP.tar.gz"
            ;;
        config)
            BACKUP_FILE="$BACKUP_DIR/config/config_backup_$TIMESTAMP.tar.gz"
            ;;
        full)
            BACKUP_FILE="$BACKUP_DIR/full/full_backup_$TIMESTAMP.tar.gz"
            ;;
    esac

    if [ -f "$BACKUP_FILE" ] && [ -s "$BACKUP_FILE" ]; then
        # Test gzip integrity
        if gzip -t "$BACKUP_FILE" 2>/dev/null || tar -tzf "$BACKUP_FILE" > /dev/null 2>&1; then
            log "${GREEN}✓ Backup verified successfully${NC}"
            return 0
        fi
    fi

    log "${RED}✗ Backup verification failed${NC}"
    return 1
}

# Main execution
echo -e "${BLUE}╔══════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║          HYBLE CORE BACKUP                   ║${NC}"
echo -e "${BLUE}╠══════════════════════════════════════════════╣${NC}"
echo -e "${BLUE}║  Type: ${GREEN}$BACKUP_TYPE${NC}"
echo -e "${BLUE}║  Destination: ${GREEN}$BACKUP_DIR${NC}"
echo -e "${BLUE}║  Retention: ${GREEN}$RETENTION_DAYS days${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════╝${NC}"

START_TIME=$(date +%s)

case $BACKUP_TYPE in
    database)
        backup_database
        ;;
    files)
        backup_files
        ;;
    config)
        backup_config
        ;;
    full)
        backup_full
        ;;
    *)
        log "${RED}Invalid backup type: $BACKUP_TYPE${NC}"
        echo "Usage: ./scripts/backup.sh [full|database|files|config] [destination]"
        exit 1
        ;;
esac

# Verify and cleanup
verify_backup
cleanup_old_backups
upload_to_s3

END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║        BACKUP COMPLETED SUCCESSFULLY         ║${NC}"
echo -e "${GREEN}╠══════════════════════════════════════════════╣${NC}"
echo -e "${GREEN}║  Duration: ${DURATION}s${NC}"
echo -e "${GREEN}║  Timestamp: $TIMESTAMP${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════╝${NC}"

# Show backup sizes
echo ""
log "Backup directory contents:"
du -sh "$BACKUP_DIR"/*
