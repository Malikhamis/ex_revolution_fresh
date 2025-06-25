# Multi-stage Docker build for Ex Revolution
# Production-ready containerization with optimization

# Stage 1: Build stage
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for building)
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Remove dev dependencies
RUN npm prune --production

# Stage 2: Production stage
FROM node:18-alpine AS production

# Create app user for security
RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup

# Set working directory
WORKDIR /app

# Install runtime dependencies
RUN apk add --no-cache \
    curl \
    tini \
    && rm -rf /var/cache/apk/*

# Copy built application from builder stage
COPY --from=builder --chown=appuser:appgroup /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:appgroup /app/package*.json ./
COPY --from=builder --chown=appuser:appgroup /app/start-website.js ./
COPY --from=builder --chown=appuser:appgroup /app/sw.js ./
COPY --from=builder --chown=appuser:appgroup /app/manifest.json ./
COPY --from=builder --chown=appuser:appgroup /app/offline.html ./

# Copy application directories
COPY --from=builder --chown=appuser:appgroup /app/config ./config
COPY --from=builder --chown=appuser:appgroup /app/middleware ./middleware
COPY --from=builder --chown=appuser:appgroup /app/data ./data
COPY --from=builder --chown=appuser:appgroup /app/models ./models
COPY --from=builder --chown=appuser:appgroup /app/scripts ./scripts
COPY --from=builder --chown=appuser:appgroup /app/css ./css
COPY --from=builder --chown=appuser:appgroup /app/js ./js
COPY --from=builder --chown=appuser:appgroup /app/assets ./assets

# Copy built distribution files if they exist
COPY --from=builder --chown=appuser:appgroup /app/dist ./dist 2>/dev/null || true

# Create necessary directories
RUN mkdir -p uploads logs backups && \
    chown -R appuser:appgroup uploads logs backups

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV NPM_CONFIG_LOGLEVEL=warn

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

# Switch to non-root user
USER appuser

# Use tini as init system
ENTRYPOINT ["/sbin/tini", "--"]

# Start the application
CMD ["node", "start-website.js"]

# Metadata
LABEL maintainer="Ex Revolution <exrevolution8@gmail.com>"
LABEL version="2.0.0"
LABEL description="Ex Revolution - Enterprise Web Application"
LABEL org.opencontainers.image.source="https://github.com/exrevolution/website"
LABEL org.opencontainers.image.documentation="https://github.com/exrevolution/website/blob/main/docs/README.md"
