/**
 * Advanced Performance Monitoring Middleware
 * Real-time performance tracking, alerting, and analytics
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

/**
 * Performance Metrics Collector
 */
class PerformanceMonitor {
    constructor() {
        this.metrics = {
            requests: {
                total: 0,
                successful: 0,
                failed: 0,
                byMethod: {},
                byRoute: {},
                byStatusCode: {}
            },
            response: {
                totalTime: 0,
                averageTime: 0,
                minTime: Infinity,
                maxTime: 0,
                p95Time: 0,
                p99Time: 0,
                responseTimes: []
            },
            system: {
                startTime: Date.now(),
                uptime: 0,
                memory: {},
                cpu: {},
                load: []
            },
            errors: {
                total: 0,
                byType: {},
                byRoute: {},
                recent: []
            },
            alerts: {
                active: [],
                history: []
            }
        };
        
        this.thresholds = {
            responseTime: 1000, // 1 second
            errorRate: 5, // 5%
            memoryUsage: 80, // 80%
            cpuUsage: 80 // 80%
        };
        
        this.startSystemMonitoring();
    }
    
    /**
     * Start system monitoring
     */
    startSystemMonitoring() {
        // Update system metrics every 30 seconds
        setInterval(() => {
            this.updateSystemMetrics();
            this.checkAlerts();
        }, 30000);
        
        // Clean old data every 5 minutes
        setInterval(() => {
            this.cleanOldData();
        }, 300000);
    }
    
    /**
     * Request tracking middleware
     */
    trackRequest(req, res, next) {
        const startTime = Date.now();
        const route = this.normalizeRoute(req.route?.path || req.path);
        
        // Track request start
        this.metrics.requests.total++;
        this.metrics.requests.byMethod[req.method] = (this.metrics.requests.byMethod[req.method] || 0) + 1;
        this.metrics.requests.byRoute[route] = (this.metrics.requests.byRoute[route] || 0) + 1;
        
        // Track response
        res.on('finish', () => {
            const responseTime = Date.now() - startTime;
            const statusCode = res.statusCode;
            
            // Update response metrics
            this.updateResponseMetrics(responseTime);
            
            // Track status codes
            this.metrics.requests.byStatusCode[statusCode] = (this.metrics.requests.byStatusCode[statusCode] || 0) + 1;
            
            // Track success/failure
            if (statusCode >= 200 && statusCode < 400) {
                this.metrics.requests.successful++;
            } else {
                this.metrics.requests.failed++;
                this.trackError(req, res, responseTime);
            }
            
            // Log slow requests
            if (responseTime > this.thresholds.responseTime) {
                this.logSlowRequest(req, responseTime);
            }
        });
        
        next();
    }
    
    /**
     * Update response time metrics
     */
    updateResponseMetrics(responseTime) {
        this.metrics.response.totalTime += responseTime;
        this.metrics.response.averageTime = this.metrics.response.totalTime / this.metrics.requests.total;
        this.metrics.response.minTime = Math.min(this.metrics.response.minTime, responseTime);
        this.metrics.response.maxTime = Math.max(this.metrics.response.maxTime, responseTime);
        
        // Store response times for percentile calculations (keep last 1000)
        this.metrics.response.responseTimes.push(responseTime);
        if (this.metrics.response.responseTimes.length > 1000) {
            this.metrics.response.responseTimes.shift();
        }
        
        // Calculate percentiles
        this.calculatePercentiles();
    }
    
    /**
     * Calculate response time percentiles
     */
    calculatePercentiles() {
        const times = [...this.metrics.response.responseTimes].sort((a, b) => a - b);
        const length = times.length;
        
        if (length > 0) {
            this.metrics.response.p95Time = times[Math.floor(length * 0.95)] || 0;
            this.metrics.response.p99Time = times[Math.floor(length * 0.99)] || 0;
        }
    }
    
    /**
     * Track errors
     */
    trackError(req, res, responseTime) {
        const error = {
            timestamp: new Date().toISOString(),
            method: req.method,
            url: req.url,
            statusCode: res.statusCode,
            responseTime,
            userAgent: req.get('User-Agent'),
            ip: req.ip
        };
        
        this.metrics.errors.total++;
        this.metrics.errors.byRoute[req.path] = (this.metrics.errors.byRoute[req.path] || 0) + 1;
        this.metrics.errors.recent.push(error);
        
        // Keep only last 100 errors
        if (this.metrics.errors.recent.length > 100) {
            this.metrics.errors.recent.shift();
        }
    }
    
    /**
     * Update system metrics
     */
    updateSystemMetrics() {
        const memUsage = process.memoryUsage();
        const cpuUsage = process.cpuUsage();
        
        this.metrics.system.uptime = Date.now() - this.metrics.system.startTime;
        this.metrics.system.memory = {
            rss: memUsage.rss,
            heapUsed: memUsage.heapUsed,
            heapTotal: memUsage.heapTotal,
            external: memUsage.external,
            usage: (memUsage.heapUsed / memUsage.heapTotal) * 100
        };
        
        this.metrics.system.cpu = {
            user: cpuUsage.user,
            system: cpuUsage.system,
            usage: this.calculateCpuUsage()
        };
        
        this.metrics.system.load = os.loadavg();
    }
    
    /**
     * Calculate CPU usage percentage
     */
    calculateCpuUsage() {
        const cpus = os.cpus();
        let totalIdle = 0;
        let totalTick = 0;
        
        cpus.forEach(cpu => {
            for (const type in cpu.times) {
                totalTick += cpu.times[type];
            }
            totalIdle += cpu.times.idle;
        });
        
        return 100 - ~~(100 * totalIdle / totalTick);
    }
    
    /**
     * Check for alerts
     */
    checkAlerts() {
        const alerts = [];
        
        // High response time alert
        if (this.metrics.response.averageTime > this.thresholds.responseTime) {
            alerts.push({
                type: 'HIGH_RESPONSE_TIME',
                severity: 'warning',
                message: `Average response time is ${Math.round(this.metrics.response.averageTime)}ms`,
                threshold: this.thresholds.responseTime,
                current: this.metrics.response.averageTime
            });
        }
        
        // High error rate alert
        const errorRate = (this.metrics.requests.failed / this.metrics.requests.total) * 100;
        if (errorRate > this.thresholds.errorRate) {
            alerts.push({
                type: 'HIGH_ERROR_RATE',
                severity: 'critical',
                message: `Error rate is ${errorRate.toFixed(2)}%`,
                threshold: this.thresholds.errorRate,
                current: errorRate
            });
        }
        
        // High memory usage alert
        if (this.metrics.system.memory.usage > this.thresholds.memoryUsage) {
            alerts.push({
                type: 'HIGH_MEMORY_USAGE',
                severity: 'warning',
                message: `Memory usage is ${this.metrics.system.memory.usage.toFixed(2)}%`,
                threshold: this.thresholds.memoryUsage,
                current: this.metrics.system.memory.usage
            });
        }
        
        // Process new alerts
        alerts.forEach(alert => {
            if (!this.isAlertActive(alert.type)) {
                this.addAlert(alert);
            }
        });
        
        // Clear resolved alerts
        this.metrics.alerts.active = this.metrics.alerts.active.filter(alert => {
            return alerts.some(newAlert => newAlert.type === alert.type);
        });
    }
    
    /**
     * Check if alert is already active
     */
    isAlertActive(type) {
        return this.metrics.alerts.active.some(alert => alert.type === type);
    }
    
    /**
     * Add new alert
     */
    addAlert(alert) {
        alert.timestamp = new Date().toISOString();
        alert.id = Date.now().toString();
        
        this.metrics.alerts.active.push(alert);
        this.metrics.alerts.history.push(alert);
        
        // Keep only last 50 alerts in history
        if (this.metrics.alerts.history.length > 50) {
            this.metrics.alerts.history.shift();
        }
        
        console.warn(`🚨 ALERT: ${alert.message}`);
    }
    
    /**
     * Log slow request
     */
    logSlowRequest(req, responseTime) {
        console.warn(`🐌 Slow request: ${req.method} ${req.url} - ${responseTime}ms`);
    }
    
    /**
     * Normalize route for grouping
     */
    normalizeRoute(route) {
        if (!route) return 'unknown';
        
        // Replace IDs with placeholders
        return route
            .replace(/\/\d+/g, '/:id')
            .replace(/\/[a-f0-9-]{36}/g, '/:uuid')
            .replace(/\/[a-f0-9]{24}/g, '/:objectid');
    }
    
    /**
     * Clean old data
     */
    cleanOldData() {
        const fiveMinutesAgo = Date.now() - 300000;
        
        // Clean old response times
        this.metrics.response.responseTimes = this.metrics.response.responseTimes.filter(
            (time, index) => index >= this.metrics.response.responseTimes.length - 500
        );
        
        // Clean old errors
        this.metrics.errors.recent = this.metrics.errors.recent.filter(
            error => new Date(error.timestamp).getTime() > fiveMinutesAgo
        );
    }
    
    /**
     * Get current metrics
     */
    getMetrics() {
        return {
            ...this.metrics,
            timestamp: new Date().toISOString(),
            errorRate: (this.metrics.requests.failed / this.metrics.requests.total) * 100 || 0,
            successRate: (this.metrics.requests.successful / this.metrics.requests.total) * 100 || 0,
            requestsPerMinute: this.calculateRequestsPerMinute()
        };
    }
    
    /**
     * Calculate requests per minute
     */
    calculateRequestsPerMinute() {
        const uptimeMinutes = this.metrics.system.uptime / 60000;
        return uptimeMinutes > 0 ? this.metrics.requests.total / uptimeMinutes : 0;
    }
    
    /**
     * Export metrics to file
     */
    exportMetrics(filePath) {
        const metrics = this.getMetrics();
        fs.writeFileSync(filePath, JSON.stringify(metrics, null, 2));
    }
    
    /**
     * Reset metrics
     */
    reset() {
        this.metrics.requests = {
            total: 0,
            successful: 0,
            failed: 0,
            byMethod: {},
            byRoute: {},
            byStatusCode: {}
        };
        this.metrics.response = {
            totalTime: 0,
            averageTime: 0,
            minTime: Infinity,
            maxTime: 0,
            p95Time: 0,
            p99Time: 0,
            responseTimes: []
        };
        this.metrics.errors = {
            total: 0,
            byType: {},
            byRoute: {},
            recent: []
        };
    }
}

// Create global monitor instance
const performanceMonitor = new PerformanceMonitor();

module.exports = {
    PerformanceMonitor,
    performanceMonitor,
    trackRequest: (req, res, next) => performanceMonitor.trackRequest(req, res, next),
    getMetrics: () => performanceMonitor.getMetrics(),
    exportMetrics: (filePath) => performanceMonitor.exportMetrics(filePath),
    reset: () => performanceMonitor.reset()
};
