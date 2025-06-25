# CapRover Deployment Guide for Ex Revolution on ThreeFold

## 🚢 Overview

This guide covers deploying Ex Revolution using CapRover on ThreeFold's decentralized infrastructure, combining the ease of CapRover's PaaS with ThreeFold's distributed cloud benefits.

## 🎯 CapRover + ThreeFold Benefits

### **Perfect Combination**
- **Easy Deployment** - CapRover's one-click deployments
- **Decentralized Infrastructure** - ThreeFold's distributed nodes
- **Container Management** - Docker-based application deployment
- **SSL Management** - Automatic SSL certificate handling
- **Domain Management** - Easy custom domain configuration
- **Monitoring Dashboard** - Built-in application monitoring
- **Auto-scaling** - Horizontal scaling capabilities
- **Database Management** - Easy database deployment and management

### **Enterprise Features Enhanced**
- **PWA Deployment** - Perfect for Progressive Web Apps
- **Analytics Integration** - Easy integration with monitoring
- **Backup Management** - Automated backup solutions
- **Security** - Enhanced through CapRover + ThreeFold combination

## 🚀 CapRover Deployment Process

### Step 1: CapRover Setup on ThreeFold

#### **ThreeFold Node Requirements**
```yaml
# Minimum ThreeFold Node Specs for CapRover
CPU: 2 vCores
RAM: 4 GB
Storage: 50 GB SSD
Network: Public IP
OS: Ubuntu 20.04+
```

#### **CapRover Installation on ThreeFold Node**
```bash
# SSH into your ThreeFold node
ssh root@your-threefold-node-ip

# Install Docker
curl -fsSL https://get.docker.com | sh
systemctl enable docker
systemctl start docker

# Install CapRover
docker run -p 80:80 -p 443:443 -p 3000:3000 -v /var/run/docker.sock:/var/run/docker.sock -v /captain:/captain caprover/caprover

# Access CapRover dashboard
# http://your-threefold-node-ip:3000
# Default password: captain42
```

### Step 2: CapRover Initial Configuration

#### **Domain Setup**
1. Point your domain to ThreeFold node IP
2. Configure CapRover root domain
3. Enable SSL (Let's Encrypt)
4. Set up wildcard SSL for subdomains

#### **CapRover Dashboard Configuration**
```bash
# Access CapRover at: http://captain.yourdomain.com
# Login with: captain42 (change immediately)

# Configure:
# - Root domain: yourdomain.com
# - Enable HTTPS
# - Enable wildcard SSL
# - Configure email for Let's Encrypt
```

## 📦 Ex Revolution CapRover Configuration

### **captain-definition File**
```json
{
  "schemaVersion": 2,
  "dockerfilePath": "./deployment/caprover/Dockerfile.caprover",
  "dockerfileLines": [
    "FROM node:18-alpine",
    "WORKDIR /app",
    "COPY package*.json ./",
    "RUN npm ci --production",
    "COPY . .",
    "RUN npm run build",
    "EXPOSE 3000",
    "CMD [\"npm\", \"start\"]"
  ]
}
```

### **Environment Variables for CapRover**
```bash
# CapRover App Environment Variables
NODE_ENV=production
PORT=3000
DEPLOYMENT_PLATFORM=caprover-threefold

# Database (use CapRover one-click apps)
MONGODB_URI=mongodb://srv-captain--exrev-mongo:27017/exrevolution
REDIS_URL=redis://srv-captain--exrev-redis:6379

# Authentication
JWT_SECRET=your-secure-jwt-secret
ADMIN_EMAIL=admin@exrevolution.com
ADMIN_PASSWORD=your-secure-password

# CapRover specific
CAPROVER_APP_NAME=exrevolution
CAPROVER_DOMAIN=exrevolution.yourdomain.com

# ThreeFold integration
THREEFOLD_NODE_ID=your-node-id
THREEFOLD_DEPLOYMENT=true
```

## 🔧 CapRover Deployment Methods

### Method 1: Git Repository Deployment

#### **Setup Git Integration**
1. Connect GitHub/GitLab repository to CapRover
2. Configure automatic deployments on push
3. Set up webhook for continuous deployment

```bash
# In CapRover dashboard:
# 1. Create new app: "exrevolution"
# 2. Go to "Deployment" tab
# 3. Select "Deploy from Github/Bitbucket/Gitlab"
# 4. Enter repository URL
# 5. Set branch: "main"
# 6. Enable automatic deployment
```

### Method 2: Docker Image Deployment

#### **Build and Deploy Docker Image**
```bash
# Build image locally
docker build -f deployment/caprover/Dockerfile.caprover -t exrevolution:caprover .

# Tag for CapRover registry
docker tag exrevolution:caprover registry.yourdomain.com/exrevolution:latest

# Push to CapRover registry
docker push registry.yourdomain.com/exrevolution:latest

# Deploy in CapRover dashboard
# 1. Go to app deployment
# 2. Select "Deploy via ImageName"
# 3. Enter: registry.yourdomain.com/exrevolution:latest
```

### Method 3: CLI Deployment

#### **CapRover CLI Setup**
```bash
# Install CapRover CLI
npm install -g caprover

# Login to your CapRover instance
caprover login

# Deploy application
caprover deploy
```

## 🗄️ Database Setup with CapRover One-Click Apps

### **MongoDB Deployment**
```bash
# In CapRover dashboard:
# 1. Go to "One-Click Apps/Databases"
# 2. Select "MongoDB"
# 3. App Name: "exrev-mongo"
# 4. Set MongoDB credentials
# 5. Deploy

# Connection string will be:
# mongodb://srv-captain--exrev-mongo:27017/exrevolution
```

### **Redis Deployment**
```bash
# In CapRover dashboard:
# 1. Go to "One-Click Apps/Databases"
# 2. Select "Redis"
# 3. App Name: "exrev-redis"
# 4. Deploy

# Connection string will be:
# redis://srv-captain--exrev-redis:6379
```

## 🔒 SSL and Domain Configuration

### **Custom Domain Setup**
```bash
# In CapRover app settings:
# 1. Go to "HTTP Settings"
# 2. Add custom domain: "exrevolution.yourdomain.com"
# 3. Enable HTTPS
# 4. Force HTTPS redirect
# 5. Enable HTTP/2
```

### **Wildcard SSL Configuration**
```bash
# For subdomains (admin.exrevolution.yourdomain.com, api.exrevolution.yourdomain.com)
# 1. Configure wildcard SSL in CapRover settings
# 2. Add subdomain mappings
# 3. Configure reverse proxy rules
```

## 📊 Monitoring and Logging

### **CapRover Built-in Monitoring**
- **Application Logs** - Real-time log viewing
- **Resource Usage** - CPU, Memory, Network monitoring
- **Health Checks** - Automatic health monitoring
- **Metrics Dashboard** - Performance metrics

### **Enhanced Monitoring Setup**
```bash
# Deploy monitoring stack using CapRover one-click apps:
# 1. Prometheus - Metrics collection
# 2. Grafana - Visualization dashboard
# 3. Node Exporter - System metrics
```

## 🔄 Backup Strategy for CapRover

### **Database Backups**
```bash
# Create backup script for MongoDB
#!/bin/bash
# backup-mongo.sh

BACKUP_DIR="/captain/data/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup
docker exec srv-captain--exrev-mongo mongodump --out /data/backup_$DATE

# Compress backup
tar -czf $BACKUP_DIR/mongo_backup_$DATE.tar.gz /captain/data/exrev-mongo/backup_$DATE

# Clean old backups (keep last 7 days)
find $BACKUP_DIR -name "mongo_backup_*.tar.gz" -mtime +7 -delete
```

### **Application Backups**
```bash
# Backup application data and uploads
#!/bin/bash
# backup-app.sh

APP_DATA="/captain/data/exrevolution"
BACKUP_DIR="/captain/data/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Backup uploads and logs
tar -czf $BACKUP_DIR/app_backup_$DATE.tar.gz $APP_DATA/uploads $APP_DATA/logs

# Backup to ThreeFold storage (if configured)
# rsync -av $BACKUP_DIR/ threefold-backup-node:/backups/
```

## 🚀 Scaling with CapRover

### **Horizontal Scaling**
```bash
# In CapRover dashboard:
# 1. Go to app "App Configs"
# 2. Increase "Instance Count"
# 3. Configure load balancing
# 4. Set resource limits per instance
```

### **Vertical Scaling**
```bash
# Resource allocation per instance:
# 1. Set CPU limit (e.g., 1.0 CPU)
# 2. Set Memory limit (e.g., 2GB)
# 3. Configure restart policy
```

## 🔧 CapRover Configuration Files

### **Nginx Configuration Override**
```nginx
# Custom Nginx config for CapRover
# File: /captain/nginx/conf.d/custom.conf

# PWA Service Worker support
location /sw.js {
    add_header Cache-Control "no-cache";
    add_header Service-Worker-Allowed "/";
}

# API rate limiting
location /api/ {
    limit_req zone=api burst=10 nodelay;
    proxy_pass http://srv-captain--exrevolution:3000;
}

# Static asset caching
location /assets/ {
    expires 1y;
    add_header Cache-Control "public, immutable";
    proxy_pass http://srv-captain--exrevolution:3000;
}
```

### **Health Check Configuration**
```bash
# CapRover health check settings:
# Path: /api/health
# Port: 3000
# Interval: 30s
# Timeout: 10s
# Retries: 3
```

## 📋 CapRover Deployment Checklist

### ✅ Pre-Deployment
- [ ] ThreeFold node provisioned with public IP
- [ ] CapRover installed and configured
- [ ] Domain DNS pointed to ThreeFold node
- [ ] SSL certificates configured
- [ ] Database services deployed

### ✅ Application Deployment
- [ ] captain-definition file created
- [ ] Environment variables configured
- [ ] Application deployed successfully
- [ ] Custom domain configured
- [ ] HTTPS enabled and working

### ✅ Post-Deployment
- [ ] Health checks passing
- [ ] Monitoring configured
- [ ] Backup system setup
- [ ] Scaling policies defined
- [ ] Documentation updated

## 🎯 CapRover + ThreeFold Advantages

### **Development Experience**
- **Easy Deployments** - Git push to deploy
- **Environment Management** - Easy env var management
- **Database Management** - One-click database deployment
- **SSL Automation** - Automatic SSL certificate management
- **Monitoring Dashboard** - Built-in application monitoring

### **Production Benefits**
- **Decentralized Infrastructure** - ThreeFold's distributed network
- **Cost Efficiency** - Competitive ThreeFold pricing
- **Global Performance** - Edge computing capabilities
- **High Availability** - Multi-node deployment options
- **Data Sovereignty** - Control over data location

### **Enterprise Features**
- **Auto-scaling** - Horizontal and vertical scaling
- **Load Balancing** - Built-in load balancing
- **Health Monitoring** - Automatic health checks
- **Backup Integration** - Easy backup solutions
- **Security** - Enhanced through CapRover + ThreeFold

---

**Your Ex Revolution application is perfectly suited for CapRover deployment on ThreeFold! This combination provides enterprise-grade features with the simplicity of PaaS and the benefits of decentralized infrastructure. 🚢🌐🚀**
