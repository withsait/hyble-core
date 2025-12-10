#!/bin/bash

# Hyble Platform Deploy Script
# Usage: ./deploy.sh [panel|web|all]

set -e

SERVER="178.63.138.97"
USER="hyble"
DEPLOY_PATH="/home/hyble/apps/hyble-core"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

deploy_panel() {
    log_info "Deploying hyble-panel..."

    ssh $USER@$SERVER << 'EOF'
        cd /home/hyble/apps/hyble-core
        git pull origin main
        pnpm install
        pnpm --filter @hyble/db db:generate
        pnpm --filter @hyble/panel build
        pm2 restart hyble-panel || pm2 start apps/hyble-panel/ecosystem.config.js
    EOF

    log_info "hyble-panel deployed successfully!"
}

deploy_web() {
    log_info "Deploying hyble-web..."

    ssh $USER@$SERVER << 'EOF'
        cd /home/hyble/apps/hyble-core
        git pull origin main
        pnpm install
        pnpm --filter @hyble/web build
        pm2 restart hyble-web || pm2 start apps/hyble-web/ecosystem.config.js
    EOF

    log_info "hyble-web deployed successfully!"
}

case "$1" in
    panel)
        deploy_panel
        ;;
    web)
        deploy_web
        ;;
    all)
        deploy_panel
        deploy_web
        ;;
    *)
        echo "Usage: $0 {panel|web|all}"
        exit 1
        ;;
esac
