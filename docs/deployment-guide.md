# Production Deployment Guide

## 🚀 Overview

This guide covers deploying Ex Revolution to production environments with enterprise-grade security, performance, and reliability.

## 📋 Pre-Deployment Checklist

### ✅ Security Requirements
- [ ] SSL/TLS certificates configured
- [ ] Environment variables secured
- [ ] Database credentials encrypted
- [ ] API rate limiting enabled
- [ ] CORS properly configured
- [ ] Security headers implemented

### ✅ Performance Requirements
- [ ] CDN configured for static assets
- [ ] Database indexes optimized
- [ ] Compression enabled (Gzip/Brotli)
- [ ] Caching strategies implemented
- [ ] Bundle optimization completed

### ✅ Monitoring Requirements
- [ ] Health check endpoints configured
- [ ] Error tracking enabled
- [ ] Performance monitoring active
- [ ] Backup system automated
- [ ] Log aggregation setup

## 🌐 Deployment Options

### Option 1: Traditional VPS/Dedicated Server

#### System Requirements
- **OS:** Ubuntu 20.04+ or CentOS 8+
- **RAM:** 4GB minimum, 8GB recommended
- **Storage:** 50GB SSD minimum
- **CPU:** 2 cores minimum, 4 cores recommended
- **Network:** 1Gbps connection

#### Installation Steps

1. **Server Setup**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Install Nginx for reverse proxy
sudo apt install nginx -y

# Install MongoDB (if using)
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
```

2. **Application Deployment**
```bash
# Clone repository
git clone <your-repo-url> /var/www/exrevolution
cd /var/www/exrevolution

# Install dependencies
npm ci --production

# Build for production
npm run build

# Set up environment
cp .env.example .env
# Edit .env with production values

# Set proper permissions
sudo chown -R www-data:www-data /var/www/exrevolution
sudo chmod -R 755 /var/www/exrevolution
```

3. **Nginx Configuration**
```nginx
# /etc/nginx/sites-available/exrevolution
server {
    listen 80;
    server_name exrevolution.com www.exrevolution.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name exrevolution.com www.exrevolution.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/exrevolution.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/exrevolution.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;

    # Security Headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";

    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Static Files
    location /assets/ {
        alias /var/www/exrevolution/assets/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location /uploads/ {
        alias /var/www/exrevolution/uploads/;
        expires 30d;
        add_header Cache-Control "public";
    }

    # API Proxy
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Main Application
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

4. **PM2 Configuration**
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'exrevolution',
    script: 'start-website.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/exrevolution/error.log',
    out_file: '/var/log/exrevolution/out.log',
    log_file: '/var/log/exrevolution/combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024'
  }]
};
```

### Option 2: Docker Deployment

#### Dockerfile
```dockerfile
# Multi-stage build for production
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# Production image
FROM node:18-alpine AS production

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

WORKDIR /app

# Copy built application
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nextjs:nodejs /app/package*.json ./
COPY --from=builder --chown=nextjs:nodejs /app/start-website.js ./
COPY --from=builder --chown=nextjs:nodejs /app/config ./config
COPY --from=builder --chown=nextjs:nodejs /app/middleware ./middleware
COPY --from=builder --chown=nextjs:nodejs /app/data ./data

USER nextjs

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

CMD ["node", "start-website.js"]
```

#### Docker Compose
```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/exrevolution
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - mongo
      - redis
    volumes:
      - ./uploads:/app/uploads
      - ./logs:/app/logs
    restart: unless-stopped

  mongo:
    image: mongo:6.0
    ports:
      - "27017:27017"
    environment:
      - MONGO_INITDB_ROOT_USERNAME=${MONGO_USERNAME}
      - MONGO_INITDB_ROOT_PASSWORD=${MONGO_PASSWORD}
    volumes:
      - mongo_data:/data/db
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/ssl/certs
    depends_on:
      - app
    restart: unless-stopped

volumes:
  mongo_data:
  redis_data:
```

### Option 3: Cloud Platform Deployment

#### Heroku
```bash
# Install Heroku CLI
npm install -g heroku

# Login and create app
heroku login
heroku create exrevolution-app

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-secret-key
heroku config:set MONGODB_URI=your-mongodb-uri

# Deploy
git push heroku main
```

#### AWS Elastic Beanstalk
```json
{
  ".ebextensions/01_nginx.config": {
    "files": {
      "/etc/nginx/conf.d/proxy.conf": {
        "content": "client_max_body_size 50M;"
      }
    }
  }
}
```

#### Google Cloud Platform
```yaml
# app.yaml
runtime: nodejs18

env_variables:
  NODE_ENV: production
  JWT_SECRET: your-secret-key
  MONGODB_URI: your-mongodb-uri

automatic_scaling:
  min_instances: 1
  max_instances: 10
  target_cpu_utilization: 0.6
```

## 🔒 Security Configuration

### SSL/TLS Setup with Let's Encrypt
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d exrevolution.com -d www.exrevolution.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Firewall Configuration
```bash
# UFW Firewall
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw allow 27017  # MongoDB (if needed)
```

### Environment Variables
```bash
# Production .env
NODE_ENV=production
PORT=3000

# Database
MONGODB_URI=mongodb://username:password@localhost:27017/exrevolution

# Authentication
JWT_SECRET=your-super-secure-secret-key-min-32-chars
JWT_EXPIRES_IN=24h

# Admin User
ADMIN_EMAIL=admin@exrevolution.com
ADMIN_PASSWORD=your-secure-password

# File Upload
UPLOAD_MAX_SIZE=5242880

# CDN
CDN_ENABLED=true
CDN_BASE_URL=https://cdn.exrevolution.com
CDN_PROVIDER=cloudflare

# Monitoring
SENTRY_DSN=your-sentry-dsn
LOG_LEVEL=info
```

## 📊 Monitoring & Logging

### Log Management
```bash
# Create log directories
sudo mkdir -p /var/log/exrevolution
sudo chown www-data:www-data /var/log/exrevolution

# Logrotate configuration
sudo tee /etc/logrotate.d/exrevolution << EOF
/var/log/exrevolution/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        pm2 reload exrevolution
    endscript
}
EOF
```

### Health Monitoring
```bash
# Create monitoring script
#!/bin/bash
# /usr/local/bin/health-check.sh

HEALTH_URL="https://exrevolution.com/api/health"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $HEALTH_URL)

if [ $RESPONSE -ne 200 ]; then
    echo "Health check failed: $RESPONSE"
    # Send alert (email, Slack, etc.)
    pm2 restart exrevolution
fi
```

## 🔄 Backup & Recovery

### Automated Backup Script
```bash
#!/bin/bash
# /usr/local/bin/backup.sh

BACKUP_DIR="/var/backups/exrevolution"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup
cd /var/www/exrevolution
node scripts/backup-system.js create daily

# Upload to cloud storage (optional)
# aws s3 sync $BACKUP_DIR s3://your-backup-bucket/
```

### Cron Jobs
```bash
# Add to crontab
0 2 * * * /usr/local/bin/backup.sh
0 3 * * 0 /usr/local/bin/backup.sh weekly
0 4 1 * * /usr/local/bin/backup.sh monthly
```

## 🚀 Performance Optimization

### Database Optimization
```javascript
// MongoDB indexes
db.blogposts.createIndex({ "status": 1, "createdAt": -1 })
db.casestudies.createIndex({ "status": 1, "featured": -1 })
db.contacts.createIndex({ "createdAt": -1 })
db.quotes.createIndex({ "status": 1, "createdAt": -1 })
```

### CDN Configuration
```javascript
// Cloudflare settings
- Browser Cache TTL: 1 year for assets
- Edge Cache TTL: 1 month for pages
- Always Online: Enabled
- Minification: CSS, JS, HTML
- Brotli Compression: Enabled
```

## 📈 Scaling Considerations

### Horizontal Scaling
- Load balancer configuration
- Database clustering
- Session management with Redis
- CDN for global distribution

### Vertical Scaling
- CPU and memory optimization
- Database query optimization
- Caching strategies
- Asset optimization

---

**Your application is now ready for enterprise production deployment! 🚀**
