#!/bin/bash

# Ex Revolution - Production Deployment Script
# Automated deployment with health checks and rollback capability

set -e  # Exit on any error

# =============================================================================
# CONFIGURATION
# =============================================================================
APP_NAME="exrevolution"
APP_DIR="/var/www/exrevolution"
BACKUP_DIR="/var/backups/exrevolution"
LOG_FILE="/var/log/exrevolution/deploy.log"
HEALTH_CHECK_URL="http://localhost:3000/api/health"
DEPLOY_TIMEOUT=300  # 5 minutes

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# =============================================================================
# LOGGING FUNCTIONS
# =============================================================================
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] ✅ $1${NC}" | tee -a "$LOG_FILE"
}

log_warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] ⚠️  $1${NC}" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ❌ $1${NC}" | tee -a "$LOG_FILE"
}

# =============================================================================
# UTILITY FUNCTIONS
# =============================================================================
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check if running as root or with sudo
    if [[ $EUID -eq 0 ]]; then
        log_error "This script should not be run as root for security reasons"
        exit 1
    fi
    
    # Check required commands
    local required_commands=("node" "npm" "pm2" "git" "curl")
    for cmd in "${required_commands[@]}"; do
        if ! command -v "$cmd" &> /dev/null; then
            log_error "Required command '$cmd' is not installed"
            exit 1
        fi
    done
    
    # Check Node.js version
    local node_version=$(node --version | cut -d'v' -f2)
    local required_version="16.0.0"
    if ! printf '%s\n%s\n' "$required_version" "$node_version" | sort -V -C; then
        log_error "Node.js version $node_version is too old. Required: $required_version+"
        exit 1
    fi
    
    log_success "Prerequisites check passed"
}

create_backup() {
    log "Creating pre-deployment backup..."
    
    local backup_name="pre-deploy-$(date +%Y%m%d_%H%M%S)"
    local backup_path="$BACKUP_DIR/$backup_name"
    
    mkdir -p "$backup_path"
    
    # Backup current application
    if [ -d "$APP_DIR" ]; then
        cp -r "$APP_DIR" "$backup_path/app"
        log_success "Application backup created: $backup_path/app"
    fi
    
    # Backup database
    if command -v mongodump &> /dev/null; then
        mongodump --out "$backup_path/database" --quiet
        log_success "Database backup created: $backup_path/database"
    else
        log_warning "mongodump not found, skipping database backup"
    fi
    
    echo "$backup_path" > /tmp/exrev_backup_path
    log_success "Backup completed: $backup_name"
}

health_check() {
    log "Performing health check..."
    
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f -s "$HEALTH_CHECK_URL" > /dev/null; then
            log_success "Health check passed"
            return 0
        fi
        
        log "Health check attempt $attempt/$max_attempts failed, retrying in 10 seconds..."
        sleep 10
        ((attempt++))
    done
    
    log_error "Health check failed after $max_attempts attempts"
    return 1
}

rollback() {
    log_error "Deployment failed, initiating rollback..."
    
    local backup_path=$(cat /tmp/exrev_backup_path 2>/dev/null)
    
    if [ -n "$backup_path" ] && [ -d "$backup_path/app" ]; then
        # Stop current application
        pm2 stop "$APP_NAME" || true
        
        # Restore from backup
        rm -rf "$APP_DIR"
        cp -r "$backup_path/app" "$APP_DIR"
        
        # Restart application
        cd "$APP_DIR"
        pm2 start ecosystem.config.js --env production
        
        # Wait for application to start
        sleep 10
        
        if health_check; then
            log_success "Rollback completed successfully"
        else
            log_error "Rollback failed, manual intervention required"
        fi
    else
        log_error "No backup found for rollback, manual intervention required"
    fi
}

# =============================================================================
# DEPLOYMENT FUNCTIONS
# =============================================================================
stop_application() {
    log "Stopping application..."
    
    if pm2 list | grep -q "$APP_NAME"; then
        pm2 stop "$APP_NAME"
        log_success "Application stopped"
    else
        log_warning "Application not running"
    fi
}

update_code() {
    log "Updating application code..."
    
    cd "$APP_DIR"
    
    # Fetch latest changes
    git fetch origin
    
    # Get current commit for rollback reference
    local current_commit=$(git rev-parse HEAD)
    echo "$current_commit" > /tmp/exrev_previous_commit
    
    # Checkout latest code
    git reset --hard origin/main
    
    local new_commit=$(git rev-parse HEAD)
    log_success "Code updated from $current_commit to $new_commit"
}

install_dependencies() {
    log "Installing dependencies..."
    
    cd "$APP_DIR"
    
    # Clean install for production
    npm ci --production --silent
    
    log_success "Dependencies installed"
}

build_application() {
    log "Building application..."
    
    cd "$APP_DIR"
    
    # Run production build
    npm run build
    
    log_success "Application built"
}

update_configuration() {
    log "Updating configuration..."
    
    cd "$APP_DIR"
    
    # Copy production environment file if it doesn't exist
    if [ ! -f ".env" ] && [ -f ".env.production" ]; then
        cp ".env.production" ".env"
        log_success "Production environment file copied"
    fi
    
    # Update PM2 configuration
    if [ -f "ecosystem.config.js" ]; then
        log_success "PM2 configuration found"
    else
        log_warning "PM2 configuration not found, using default"
    fi
}

start_application() {
    log "Starting application..."
    
    cd "$APP_DIR"
    
    # Start with PM2
    if pm2 list | grep -q "$APP_NAME"; then
        pm2 restart "$APP_NAME"
    else
        pm2 start ecosystem.config.js --env production
    fi
    
    # Save PM2 configuration
    pm2 save
    
    log_success "Application started"
}

run_migrations() {
    log "Running database migrations..."
    
    cd "$APP_DIR"
    
    # Run any database migrations or setup scripts
    if [ -f "scripts/migrate.js" ]; then
        node scripts/migrate.js
        log_success "Database migrations completed"
    else
        log "No migrations to run"
    fi
}

cleanup() {
    log "Performing cleanup..."
    
    # Clean up temporary files
    rm -f /tmp/exrev_backup_path /tmp/exrev_previous_commit
    
    # Clean up old backups (keep last 5)
    if [ -d "$BACKUP_DIR" ]; then
        cd "$BACKUP_DIR"
        ls -t | tail -n +6 | xargs -r rm -rf
        log_success "Old backups cleaned up"
    fi
    
    # Clean up old logs
    find /var/log/exrevolution -name "*.log" -mtime +30 -delete 2>/dev/null || true
    
    log_success "Cleanup completed"
}

# =============================================================================
# MAIN DEPLOYMENT PROCESS
# =============================================================================
main() {
    log "Starting deployment of $APP_NAME..."
    
    # Trap to handle errors and perform rollback
    trap rollback ERR
    
    # Pre-deployment checks
    check_prerequisites
    
    # Create backup before deployment
    create_backup
    
    # Stop the application
    stop_application
    
    # Update code and dependencies
    update_code
    install_dependencies
    build_application
    
    # Update configuration
    update_configuration
    
    # Run migrations
    run_migrations
    
    # Start the application
    start_application
    
    # Wait for application to fully start
    sleep 15
    
    # Perform health check
    if ! health_check; then
        log_error "Health check failed, deployment unsuccessful"
        exit 1
    fi
    
    # Cleanup
    cleanup
    
    # Success
    log_success "Deployment completed successfully!"
    log_success "Application is running at: $HEALTH_CHECK_URL"
    
    # Display deployment summary
    echo ""
    echo "==============================================================================="
    echo "                           DEPLOYMENT SUMMARY"
    echo "==============================================================================="
    echo "Application: $APP_NAME"
    echo "Deployment Time: $(date)"
    echo "Health Check: ✅ PASSED"
    echo "Status: 🚀 DEPLOYED"
    echo "==============================================================================="
}

# =============================================================================
# SCRIPT EXECUTION
# =============================================================================
# Check if log directory exists
mkdir -p "$(dirname "$LOG_FILE")"

# Parse command line arguments
case "${1:-deploy}" in
    "deploy")
        main
        ;;
    "rollback")
        rollback
        ;;
    "health")
        health_check
        ;;
    "backup")
        create_backup
        ;;
    *)
        echo "Usage: $0 {deploy|rollback|health|backup}"
        echo ""
        echo "Commands:"
        echo "  deploy   - Deploy the application (default)"
        echo "  rollback - Rollback to previous version"
        echo "  health   - Perform health check"
        echo "  backup   - Create backup only"
        exit 1
        ;;
esac
