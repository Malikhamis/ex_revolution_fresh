#!/bin/bash

# Ex Revolution - ThreeFold Deployment Script
# Automated deployment to ThreeFold decentralized infrastructure

set -e  # Exit on any error

# =============================================================================
# CONFIGURATION
# =============================================================================
APP_NAME="exrevolution"
THREEFOLD_IMAGE="exrevolution:threefold"
DEPLOYMENT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$DEPLOYMENT_DIR/../.." && pwd)"
LOG_FILE="/tmp/threefold-deploy.log"

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
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] 🌐 $1${NC}" | tee -a "$LOG_FILE"
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

log_threefold() {
    echo -e "${PURPLE}[$(date +'%Y-%m-%d %H:%M:%S')] 🔷 ThreeFold: $1${NC}" | tee -a "$LOG_FILE"
}

# =============================================================================
# UTILITY FUNCTIONS
# =============================================================================
check_prerequisites() {
    log "Checking ThreeFold deployment prerequisites..."
    
    # Check required commands
    local required_commands=("docker" "docker-compose" "curl" "git")
    for cmd in "${required_commands[@]}"; do
        if ! command -v "$cmd" &> /dev/null; then
            log_error "Required command '$cmd' is not installed"
            exit 1
        fi
    done
    
    # Check if ThreeFold CLI is available (optional but recommended)
    if command -v tfcmd &> /dev/null; then
        log_success "ThreeFold CLI found"
        TFCMD_AVAILABLE=true
    else
        log_warning "ThreeFold CLI not found - using Docker Compose deployment"
        TFCMD_AVAILABLE=false
    fi
    
    # Check Docker version
    local docker_version=$(docker --version | grep -oE '[0-9]+\.[0-9]+' | head -1)
    log "Docker version: $docker_version"
    
    # Check if .env.threefold exists
    if [ ! -f "$DEPLOYMENT_DIR/.env.threefold" ]; then
        log_error "ThreeFold environment file not found: $DEPLOYMENT_DIR/.env.threefold"
        log "Please copy and configure .env.threefold with your ThreeFold settings"
        exit 1
    fi
    
    log_success "Prerequisites check passed"
}

load_threefold_config() {
    log "Loading ThreeFold configuration..."
    
    # Source the ThreeFold environment file
    source "$DEPLOYMENT_DIR/.env.threefold"
    
    # Validate required ThreeFold variables
    local required_vars=("THREEFOLD_NODE_ID" "THREEFOLD_FARM_ID" "THREEFOLD_REGION")
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            log_error "Required ThreeFold variable '$var' is not set"
            exit 1
        fi
    done
    
    log_success "ThreeFold configuration loaded"
    log_threefold "Node ID: $THREEFOLD_NODE_ID"
    log_threefold "Farm ID: $THREEFOLD_FARM_ID"
    log_threefold "Region: $THREEFOLD_REGION"
}

build_threefold_image() {
    log "Building ThreeFold-optimized Docker image..."
    
    cd "$PROJECT_ROOT"
    
    # Build the ThreeFold-specific image
    docker build \
        -f "$DEPLOYMENT_DIR/Dockerfile.threefold" \
        -t "$THREEFOLD_IMAGE" \
        --build-arg THREEFOLD_NODE_ID="$THREEFOLD_NODE_ID" \
        --build-arg THREEFOLD_REGION="$THREEFOLD_REGION" \
        .
    
    log_success "ThreeFold Docker image built: $THREEFOLD_IMAGE"
}

deploy_with_docker_compose() {
    log "Deploying to ThreeFold using Docker Compose..."
    
    cd "$DEPLOYMENT_DIR"
    
    # Copy environment file
    cp .env.threefold .env
    
    # Deploy using Docker Compose
    docker-compose -f docker-compose.threefold.yml up -d
    
    log_success "Docker Compose deployment initiated"
}

deploy_with_tfcmd() {
    log "Deploying to ThreeFold using tfcmd..."
    
    # Deploy main application
    tfcmd deploy \
        --image "$THREEFOLD_IMAGE" \
        --cpu 2 \
        --memory 4096 \
        --disk 50 \
        --network public \
        --env-file "$DEPLOYMENT_DIR/.env.threefold" \
        --name "$APP_NAME-app" \
        --node-id "$THREEFOLD_NODE_ID"
    
    # Deploy database
    tfcmd deploy \
        --image mongo:6.0 \
        --cpu 1 \
        --memory 2048 \
        --disk 20 \
        --network private \
        --name "$APP_NAME-db" \
        --node-id "$THREEFOLD_NODE_ID"
    
    # Deploy Redis
    tfcmd deploy \
        --image redis:7-alpine \
        --cpu 0.5 \
        --memory 1024 \
        --disk 5 \
        --network private \
        --name "$APP_NAME-redis" \
        --node-id "$THREEFOLD_NODE_ID"
    
    log_success "ThreeFold CLI deployment completed"
}

setup_threefold_networking() {
    log "Setting up ThreeFold networking..."
    
    # Create ThreeFold network if using tfcmd
    if [ "$TFCMD_AVAILABLE" = true ]; then
        tfcmd network create \
            --name "$APP_NAME-network" \
            --subnet "172.30.0.0/16" \
            --node-id "$THREEFOLD_NODE_ID"
    fi
    
    log_success "ThreeFold networking configured"
}

configure_threefold_gateway() {
    log "Configuring ThreeFold gateway..."
    
    if [ -n "$THREEFOLD_GATEWAY_URL" ]; then
        log_threefold "Gateway URL: $THREEFOLD_GATEWAY_URL"
        
        # Configure gateway if using tfcmd
        if [ "$TFCMD_AVAILABLE" = true ]; then
            tfcmd gateway configure \
                --name "$APP_NAME-gateway" \
                --backend "http://localhost:3000" \
                --domain "$THREEFOLD_CUSTOM_DOMAIN" \
                --node-id "$THREEFOLD_NODE_ID"
        fi
    else
        log_warning "No ThreeFold gateway URL configured"
    fi
    
    log_success "ThreeFold gateway configuration completed"
}

health_check_threefold() {
    log "Performing ThreeFold health check..."
    
    local max_attempts=30
    local attempt=1
    local health_url="http://localhost:3000/api/health/threefold"
    
    # If gateway URL is configured, use it
    if [ -n "$THREEFOLD_GATEWAY_URL" ]; then
        health_url="$THREEFOLD_GATEWAY_URL/api/health/threefold"
    fi
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f -s "$health_url" > /dev/null; then
            log_success "ThreeFold health check passed"
            
            # Get health details
            local health_response=$(curl -s "$health_url")
            log_threefold "Health response: $health_response"
            return 0
        fi
        
        log "Health check attempt $attempt/$max_attempts failed, retrying in 10 seconds..."
        sleep 10
        ((attempt++))
    done
    
    log_error "ThreeFold health check failed after $max_attempts attempts"
    return 1
}

setup_threefold_monitoring() {
    log "Setting up ThreeFold monitoring..."
    
    # Deploy monitoring stack if enabled
    if [ "$MONITORING_ENABLED" = "true" ]; then
        cd "$DEPLOYMENT_DIR"
        docker-compose -f docker-compose.threefold.yml --profile monitoring up -d
        log_success "ThreeFold monitoring stack deployed"
    fi
    
    log_success "ThreeFold monitoring configured"
}

setup_threefold_backup() {
    log "Setting up ThreeFold backup system..."
    
    # Create backup directories
    mkdir -p "$THREEFOLD_BACKUP_PATH"
    
    # Deploy backup service
    if [ "$BACKUP_ENABLED" = "true" ]; then
        cd "$DEPLOYMENT_DIR"
        docker-compose -f docker-compose.threefold.yml --profile backup up -d
        log_success "ThreeFold backup service deployed"
    fi
    
    log_success "ThreeFold backup system configured"
}

display_deployment_info() {
    echo ""
    echo "==============================================================================="
    echo "                    THREEFOLD DEPLOYMENT SUMMARY"
    echo "==============================================================================="
    echo "Application: $APP_NAME"
    echo "Platform: ThreeFold Decentralized Cloud"
    echo "Node ID: $THREEFOLD_NODE_ID"
    echo "Farm ID: $THREEFOLD_FARM_ID"
    echo "Region: $THREEFOLD_REGION"
    echo "Deployment Time: $(date)"
    
    if [ -n "$THREEFOLD_GATEWAY_URL" ]; then
        echo "Gateway URL: $THREEFOLD_GATEWAY_URL"
        echo "Application URL: $THREEFOLD_GATEWAY_URL"
    else
        echo "Local Access: http://localhost:3000"
    fi
    
    echo "Health Check: ✅ PASSED"
    echo "Status: 🌐 DEPLOYED ON THREEFOLD"
    echo "==============================================================================="
    echo ""
    echo "🎯 ThreeFold Benefits Active:"
    echo "  • Decentralized hosting across multiple nodes"
    echo "  • Edge computing for better global performance"
    echo "  • Enhanced privacy and data sovereignty"
    echo "  • Sustainable green energy infrastructure"
    echo "  • Cost-efficient decentralized cloud"
    echo ""
    echo "📊 Monitoring:"
    echo "  • Application: http://localhost:3000/api/health/threefold"
    echo "  • Monitoring: http://localhost:9090 (if enabled)"
    echo "  • Logs: docker-compose -f docker-compose.threefold.yml logs"
    echo ""
    echo "🔧 Management Commands:"
    echo "  • Scale: docker-compose -f docker-compose.threefold.yml up --scale app=3"
    echo "  • Stop: docker-compose -f docker-compose.threefold.yml down"
    echo "  • Backup: docker-compose -f docker-compose.threefold.yml --profile backup up"
    echo "==============================================================================="
}

# =============================================================================
# MAIN DEPLOYMENT PROCESS
# =============================================================================
main() {
    log "Starting Ex Revolution deployment to ThreeFold..."
    
    # Pre-deployment checks
    check_prerequisites
    load_threefold_config
    
    # Build ThreeFold-optimized image
    build_threefold_image
    
    # Setup ThreeFold infrastructure
    setup_threefold_networking
    
    # Deploy application
    if [ "$TFCMD_AVAILABLE" = true ]; then
        deploy_with_tfcmd
    else
        deploy_with_docker_compose
    fi
    
    # Configure gateway
    configure_threefold_gateway
    
    # Setup additional services
    setup_threefold_monitoring
    setup_threefold_backup
    
    # Wait for application to start
    log "Waiting for application to start..."
    sleep 30
    
    # Perform health check
    if ! health_check_threefold; then
        log_error "ThreeFold deployment health check failed"
        exit 1
    fi
    
    # Display deployment information
    display_deployment_info
    
    log_success "Ex Revolution successfully deployed to ThreeFold! 🌐🚀"
}

# =============================================================================
# SCRIPT EXECUTION
# =============================================================================
case "${1:-deploy}" in
    "deploy")
        main
        ;;
    "health")
        health_check_threefold
        ;;
    "stop")
        log "Stopping ThreeFold deployment..."
        cd "$DEPLOYMENT_DIR"
        docker-compose -f docker-compose.threefold.yml down
        log_success "ThreeFold deployment stopped"
        ;;
    "logs")
        cd "$DEPLOYMENT_DIR"
        docker-compose -f docker-compose.threefold.yml logs -f
        ;;
    "scale")
        REPLICAS=${2:-3}
        log "Scaling ThreeFold deployment to $REPLICAS replicas..."
        cd "$DEPLOYMENT_DIR"
        docker-compose -f docker-compose.threefold.yml up --scale app=$REPLICAS -d
        log_success "ThreeFold deployment scaled to $REPLICAS replicas"
        ;;
    *)
        echo "Usage: $0 {deploy|health|stop|logs|scale [replicas]}"
        echo ""
        echo "Commands:"
        echo "  deploy  - Deploy to ThreeFold (default)"
        echo "  health  - Check deployment health"
        echo "  stop    - Stop ThreeFold deployment"
        echo "  logs    - View deployment logs"
        echo "  scale   - Scale deployment (specify replicas)"
        exit 1
        ;;
esac
