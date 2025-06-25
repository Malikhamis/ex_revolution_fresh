#!/bin/bash

# Ex Revolution - CapRover Deployment Script
# Automated deployment to CapRover on ThreeFold infrastructure

set -e  # Exit on any error

# =============================================================================
# CONFIGURATION
# =============================================================================
APP_NAME="exrevolution"
CAPROVER_URL=""
CAPROVER_PASSWORD=""
CAPROVER_APP_TOKEN=""
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
LOG_FILE="/tmp/caprover-deploy.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# =============================================================================
# LOGGING FUNCTIONS
# =============================================================================
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] 🚢 $1${NC}" | tee -a "$LOG_FILE"
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

log_caprover() {
    echo -e "${PURPLE}[$(date +'%Y-%m-%d %H:%M:%S')] 🚢 CapRover: $1${NC}" | tee -a "$LOG_FILE"
}

# =============================================================================
# UTILITY FUNCTIONS
# =============================================================================
check_prerequisites() {
    log "Checking CapRover deployment prerequisites..."
    
    # Check required commands
    local required_commands=("node" "npm" "curl" "git")
    for cmd in "${required_commands[@]}"; do
        if ! command -v "$cmd" &> /dev/null; then
            log_error "Required command '$cmd' is not installed"
            exit 1
        fi
    done
    
    # Check if CapRover CLI is installed
    if ! command -v caprover &> /dev/null; then
        log "Installing CapRover CLI..."
        npm install -g caprover
        log_success "CapRover CLI installed"
    else
        log_success "CapRover CLI found"
    fi
    
    # Check if captain-definition exists
    if [ ! -f "$PROJECT_ROOT/captain-definition" ]; then
        log_error "captain-definition file not found in project root"
        exit 1
    fi
    
    log_success "Prerequisites check passed"
}

load_caprover_config() {
    log "Loading CapRover configuration..."
    
    # Try to load from environment or config file
    if [ -f "$PROJECT_ROOT/.caprover" ]; then
        source "$PROJECT_ROOT/.caprover"
        log_success "CapRover configuration loaded from .caprover file"
    else
        # Prompt for configuration if not found
        read -p "Enter CapRover URL (e.g., https://captain.yourdomain.com): " CAPROVER_URL
        read -s -p "Enter CapRover password: " CAPROVER_PASSWORD
        echo
        read -p "Enter app name (default: exrevolution): " input_app_name
        APP_NAME=${input_app_name:-exrevolution}
        
        # Save configuration
        cat > "$PROJECT_ROOT/.caprover" << EOF
CAPROVER_URL="$CAPROVER_URL"
CAPROVER_PASSWORD="$CAPROVER_PASSWORD"
APP_NAME="$APP_NAME"
EOF
        log_success "CapRover configuration saved"
    fi
    
    log_caprover "URL: $CAPROVER_URL"
    log_caprover "App: $APP_NAME"
}

setup_caprover_cli() {
    log "Setting up CapRover CLI..."
    
    cd "$PROJECT_ROOT"
    
    # Login to CapRover
    echo "$CAPROVER_PASSWORD" | caprover login --caproverUrl "$CAPROVER_URL" --caproverPassword
    
    log_success "CapRover CLI configured"
}

create_caprover_app() {
    log "Creating CapRover application..."
    
    # Check if app already exists
    if caprover api --caproverUrl "$CAPROVER_URL" --path "/user/apps/appDefinitions" | grep -q "\"appName\":\"$APP_NAME\""; then
        log_warning "App '$APP_NAME' already exists, skipping creation"
        return 0
    fi
    
    # Create new app
    caprover api --caproverUrl "$CAPROVER_URL" --path "/user/apps/appDefinitions/$APP_NAME" --method "POST" --data '{
        "appName": "'$APP_NAME'",
        "hasPersistentData": false
    }'
    
    log_success "CapRover app '$APP_NAME' created"
}

configure_app_settings() {
    log "Configuring CapRover app settings..."
    
    # Configure environment variables
    local env_vars='{
        "NODE_ENV": "production",
        "PORT": "3000",
        "DEPLOYMENT_PLATFORM": "caprover-threefold",
        "CAPROVER_DEPLOYMENT": "true",
        "JWT_SECRET": "'${JWT_SECRET:-default-jwt-secret}'",
        "ADMIN_EMAIL": "'${ADMIN_EMAIL:-admin@exrevolution.com}'",
        "ADMIN_PASSWORD": "'${ADMIN_PASSWORD:-Admin@123}'"
    }'
    
    # Update app configuration
    caprover api --caproverUrl "$CAPROVER_URL" --path "/user/apps/appDefinitions/$APP_NAME" --method "POST" --data '{
        "appName": "'$APP_NAME'",
        "envVars": '$env_vars',
        "volumes": [],
        "ports": [],
        "nodeId": "",
        "notExposeAsWebApp": false,
        "forceSsl": true,
        "websocketSupport": false,
        "containerHttpPort": 3000,
        "preDeployFunction": "",
        "serviceUpdateOverride": "",
        "description": "Ex Revolution - Enterprise Web Application",
        "instanceCount": 1,
        "captainDefinitionRelativeFilePath": "./captain-definition",
        "redirectDomain": "",
        "customNginxConfig": "",
        "customDomain": []
    }'
    
    log_success "CapRover app settings configured"
}

deploy_to_caprover() {
    log "Deploying to CapRover..."
    
    cd "$PROJECT_ROOT"
    
    # Deploy using CapRover CLI
    caprover deploy --caproverUrl "$CAPROVER_URL" --appName "$APP_NAME"
    
    log_success "Deployment to CapRover completed"
}

setup_custom_domain() {
    log "Setting up custom domain..."
    
    if [ -n "$CUSTOM_DOMAIN" ]; then
        # Add custom domain
        caprover api --caproverUrl "$CAPROVER_URL" --path "/user/apps/appDefinitions/$APP_NAME/customdomain" --method "POST" --data '{
            "customDomain": "'$CUSTOM_DOMAIN'",
            "hasRootSsl": true,
            "hasWwwSsl": true
        }'
        
        log_success "Custom domain '$CUSTOM_DOMAIN' configured"
    else
        log "No custom domain specified, using default CapRover subdomain"
    fi
}

setup_databases() {
    log "Setting up databases..."
    
    # Deploy MongoDB using CapRover one-click app
    log "Deploying MongoDB..."
    caprover api --caproverUrl "$CAPROVER_URL" --path "/user/apps/oneClickApps" --method "POST" --data '{
        "appName": "'$APP_NAME'-mongo",
        "oneClickAppName": "mongodb"
    }'
    
    # Deploy Redis using CapRover one-click app
    log "Deploying Redis..."
    caprover api --caproverUrl "$CAPROVER_URL" --path "/user/apps/oneClickApps" --method "POST" --data '{
        "appName": "'$APP_NAME'-redis",
        "oneClickAppName": "redis"
    }'
    
    # Update app environment variables with database connections
    local updated_env_vars='{
        "NODE_ENV": "production",
        "PORT": "3000",
        "DEPLOYMENT_PLATFORM": "caprover-threefold",
        "CAPROVER_DEPLOYMENT": "true",
        "MONGODB_URI": "mongodb://srv-captain--'$APP_NAME'-mongo:27017/exrevolution",
        "REDIS_URL": "redis://srv-captain--'$APP_NAME'-redis:6379",
        "JWT_SECRET": "'${JWT_SECRET:-default-jwt-secret}'",
        "ADMIN_EMAIL": "'${ADMIN_EMAIL:-admin@exrevolution.com}'",
        "ADMIN_PASSWORD": "'${ADMIN_PASSWORD:-Admin@123}'"
    }'
    
    # Update app with database connections
    caprover api --caproverUrl "$CAPROVER_URL" --path "/user/apps/appDefinitions/$APP_NAME" --method "POST" --data '{
        "envVars": '$updated_env_vars'
    }'
    
    log_success "Databases configured"
}

health_check() {
    log "Performing health check..."
    
    local app_url="https://$APP_NAME.captain.$CAPROVER_DOMAIN"
    if [ -n "$CUSTOM_DOMAIN" ]; then
        app_url="https://$CUSTOM_DOMAIN"
    fi
    
    local health_url="$app_url/api/health"
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f -s "$health_url" > /dev/null; then
            log_success "Health check passed"
            log_caprover "Application URL: $app_url"
            return 0
        fi
        
        log "Health check attempt $attempt/$max_attempts failed, retrying in 10 seconds..."
        sleep 10
        ((attempt++))
    done
    
    log_error "Health check failed after $max_attempts attempts"
    return 1
}

setup_monitoring() {
    log "Setting up monitoring..."
    
    # Deploy monitoring stack if requested
    if [ "$SETUP_MONITORING" = "true" ]; then
        # Deploy Prometheus
        caprover api --caproverUrl "$CAPROVER_URL" --path "/user/apps/oneClickApps" --method "POST" --data '{
            "appName": "'$APP_NAME'-prometheus",
            "oneClickAppName": "prometheus"
        }'
        
        # Deploy Grafana
        caprover api --caproverUrl "$CAPROVER_URL" --path "/user/apps/oneClickApps" --method "POST" --data '{
            "appName": "'$APP_NAME'-grafana",
            "oneClickAppName": "grafana"
        }'
        
        log_success "Monitoring stack deployed"
    fi
}

display_deployment_info() {
    local app_url="https://$APP_NAME.captain.$CAPROVER_DOMAIN"
    if [ -n "$CUSTOM_DOMAIN" ]; then
        app_url="https://$CUSTOM_DOMAIN"
    fi
    
    echo ""
    echo "==============================================================================="
    echo "                    CAPROVER DEPLOYMENT SUMMARY"
    echo "==============================================================================="
    echo "Application: $APP_NAME"
    echo "Platform: CapRover on ThreeFold"
    echo "CapRover URL: $CAPROVER_URL"
    echo "Application URL: $app_url"
    echo "Deployment Time: $(date)"
    echo "Health Check: ✅ PASSED"
    echo "Status: 🚢 DEPLOYED ON CAPROVER"
    echo "==============================================================================="
    echo ""
    echo "🎯 CapRover + ThreeFold Benefits Active:"
    echo "  • Easy PaaS deployment with CapRover"
    echo "  • Decentralized infrastructure with ThreeFold"
    echo "  • Automatic SSL certificate management"
    echo "  • Built-in monitoring and logging"
    echo "  • One-click database deployments"
    echo ""
    echo "📊 Management URLs:"
    echo "  • Application: $app_url"
    echo "  • CapRover Dashboard: $CAPROVER_URL"
    echo "  • Health Check: $app_url/api/health"
    echo ""
    echo "🔧 Management Commands:"
    echo "  • View logs: caprover logs --appName $APP_NAME"
    echo "  • Scale app: Use CapRover dashboard to adjust instance count"
    echo "  • Update app: git push and redeploy through CapRover"
    echo "==============================================================================="
}

# =============================================================================
# MAIN DEPLOYMENT PROCESS
# =============================================================================
main() {
    log "Starting Ex Revolution deployment to CapRover on ThreeFold..."
    
    # Pre-deployment checks
    check_prerequisites
    load_caprover_config
    
    # Setup CapRover CLI
    setup_caprover_cli
    
    # Create and configure app
    create_caprover_app
    configure_app_settings
    
    # Setup databases
    setup_databases
    
    # Deploy application
    deploy_to_caprover
    
    # Setup custom domain if specified
    setup_custom_domain
    
    # Setup monitoring if requested
    setup_monitoring
    
    # Wait for deployment to complete
    log "Waiting for deployment to complete..."
    sleep 30
    
    # Perform health check
    if ! health_check; then
        log_error "CapRover deployment health check failed"
        exit 1
    fi
    
    # Display deployment information
    display_deployment_info
    
    log_success "Ex Revolution successfully deployed to CapRover on ThreeFold! 🚢🌐🚀"
}

# =============================================================================
# SCRIPT EXECUTION
# =============================================================================
case "${1:-deploy}" in
    "deploy")
        main
        ;;
    "logs")
        if [ -z "$APP_NAME" ]; then
            load_caprover_config
        fi
        caprover logs --appName "$APP_NAME"
        ;;
    "restart")
        if [ -z "$APP_NAME" ]; then
            load_caprover_config
        fi
        caprover api --path "/user/apps/appDefinitions/$APP_NAME/restart" --method "POST"
        log_success "Application restarted"
        ;;
    "scale")
        INSTANCES=${2:-2}
        if [ -z "$APP_NAME" ]; then
            load_caprover_config
        fi
        log "Scaling application to $INSTANCES instances..."
        caprover api --path "/user/apps/appDefinitions/$APP_NAME" --method "POST" --data '{
            "instanceCount": '$INSTANCES'
        }'
        log_success "Application scaled to $INSTANCES instances"
        ;;
    *)
        echo "Usage: $0 {deploy|logs|restart|scale [instances]}"
        echo ""
        echo "Commands:"
        echo "  deploy   - Deploy to CapRover (default)"
        echo "  logs     - View application logs"
        echo "  restart  - Restart application"
        echo "  scale    - Scale application (specify instances)"
        exit 1
        ;;
esac
