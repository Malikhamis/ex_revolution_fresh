/**
 * Advanced Analytics and User Tracking System
 * Privacy-compliant analytics with detailed user behavior tracking
 */

class AnalyticsManager {
    constructor() {
        this.sessionId = this.generateSessionId();
        this.userId = this.getUserId();
        this.pageLoadTime = Date.now();
        this.events = [];
        this.userAgent = navigator.userAgent;
        this.screenResolution = `${screen.width}x${screen.height}`;
        this.viewport = this.getViewport();
        this.referrer = document.referrer;
        this.isBot = this.detectBot();
        
        this.init();
    }
    
    /**
     * Initialize analytics
     */
    init() {
        console.log('📊 Analytics Manager: Initializing...');
        
        // Track page view
        this.trackPageView();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Setup performance monitoring
        this.setupPerformanceMonitoring();
        
        // Setup user behavior tracking
        this.setupBehaviorTracking();
        
        // Setup form tracking
        this.setupFormTracking();
        
        // Setup scroll tracking
        this.setupScrollTracking();
        
        // Setup click tracking
        this.setupClickTracking();
        
        // Send data periodically
        this.setupDataSending();
        
        console.log('✅ Analytics Manager: Initialization complete');
    }
    
    /**
     * Generate unique session ID
     */
    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    /**
     * Get or create user ID
     */
    getUserId() {
        let userId = localStorage.getItem('analytics_user_id');
        if (!userId) {
            userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('analytics_user_id', userId);
        }
        return userId;
    }
    
    /**
     * Get viewport dimensions
     */
    getViewport() {
        return {
            width: window.innerWidth,
            height: window.innerHeight
        };
    }
    
    /**
     * Detect if user is a bot
     */
    detectBot() {
        const botPatterns = [
            /bot/i, /spider/i, /crawler/i, /scraper/i,
            /googlebot/i, /bingbot/i, /slurp/i, /duckduckbot/i
        ];
        
        return botPatterns.some(pattern => pattern.test(this.userAgent));
    }
    
    /**
     * Track page view
     */
    trackPageView() {
        const pageData = {
            event: 'page_view',
            timestamp: new Date().toISOString(),
            page: {
                url: window.location.href,
                path: window.location.pathname,
                title: document.title,
                referrer: this.referrer
            },
            session: {
                id: this.sessionId,
                isNewSession: !sessionStorage.getItem('analytics_session')
            },
            user: {
                id: this.userId,
                isReturning: localStorage.getItem('analytics_returning_user') === 'true'
            },
            device: {
                userAgent: this.userAgent,
                screenResolution: this.screenResolution,
                viewport: this.viewport,
                language: navigator.language,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                isBot: this.isBot
            }
        };
        
        this.trackEvent(pageData);
        
        // Mark as returning user
        localStorage.setItem('analytics_returning_user', 'true');
        sessionStorage.setItem('analytics_session', this.sessionId);
    }
    
    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Page unload
        window.addEventListener('beforeunload', () => {
            this.trackEvent({
                event: 'page_unload',
                timestamp: new Date().toISOString(),
                timeOnPage: Date.now() - this.pageLoadTime
            });
            
            // Send any pending data
            this.sendData(true);
        });
        
        // Visibility change
        document.addEventListener('visibilitychange', () => {
            this.trackEvent({
                event: 'visibility_change',
                timestamp: new Date().toISOString(),
                visible: !document.hidden
            });
        });
        
        // Window resize
        window.addEventListener('resize', () => {
            this.trackEvent({
                event: 'window_resize',
                timestamp: new Date().toISOString(),
                viewport: this.getViewport()
            });
        });
    }
    
    /**
     * Setup performance monitoring
     */
    setupPerformanceMonitoring() {
        // Wait for page load
        window.addEventListener('load', () => {
            setTimeout(() => {
                const perfData = this.getPerformanceData();
                this.trackEvent({
                    event: 'performance',
                    timestamp: new Date().toISOString(),
                    performance: perfData
                });
            }, 1000);
        });
    }
    
    /**
     * Get performance data
     */
    getPerformanceData() {
        const navigation = performance.getEntriesByType('navigation')[0];
        const paint = performance.getEntriesByType('paint');
        
        return {
            loadTime: navigation ? navigation.loadEventEnd - navigation.loadEventStart : 0,
            domContentLoaded: navigation ? navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart : 0,
            firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
            firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
            connectionType: navigator.connection?.effectiveType || 'unknown',
            memory: performance.memory ? {
                used: performance.memory.usedJSHeapSize,
                total: performance.memory.totalJSHeapSize,
                limit: performance.memory.jsHeapSizeLimit
            } : null
        };
    }
    
    /**
     * Setup user behavior tracking
     */
    setupBehaviorTracking() {
        let mouseMovements = 0;
        let keystrokes = 0;
        let lastActivity = Date.now();
        
        // Mouse movement
        document.addEventListener('mousemove', () => {
            mouseMovements++;
            lastActivity = Date.now();
        });
        
        // Keyboard activity
        document.addEventListener('keydown', () => {
            keystrokes++;
            lastActivity = Date.now();
        });
        
        // Track engagement every 30 seconds
        setInterval(() => {
            if (Date.now() - lastActivity < 30000) { // Active in last 30 seconds
                this.trackEvent({
                    event: 'user_engagement',
                    timestamp: new Date().toISOString(),
                    mouseMovements: mouseMovements,
                    keystrokes: keystrokes,
                    timeActive: Date.now() - this.pageLoadTime
                });
                
                mouseMovements = 0;
                keystrokes = 0;
            }
        }, 30000);
    }
    
    /**
     * Setup form tracking
     */
    setupFormTracking() {
        const forms = document.querySelectorAll('form');
        
        forms.forEach(form => {
            const formId = form.id || form.className || 'unknown_form';
            
            // Form start
            form.addEventListener('focusin', () => {
                this.trackEvent({
                    event: 'form_start',
                    timestamp: new Date().toISOString(),
                    formId: formId
                });
            }, { once: true });
            
            // Form submission
            form.addEventListener('submit', (event) => {
                this.trackEvent({
                    event: 'form_submit',
                    timestamp: new Date().toISOString(),
                    formId: formId,
                    success: !event.defaultPrevented
                });
            });
            
            // Form abandonment (focus out without submit)
            let formStarted = false;
            form.addEventListener('focusin', () => { formStarted = true; });
            form.addEventListener('focusout', () => {
                setTimeout(() => {
                    if (formStarted && !form.contains(document.activeElement)) {
                        this.trackEvent({
                            event: 'form_abandon',
                            timestamp: new Date().toISOString(),
                            formId: formId
                        });
                        formStarted = false;
                    }
                }, 100);
            });
        });
    }
    
    /**
     * Setup scroll tracking
     */
    setupScrollTracking() {
        let maxScroll = 0;
        let scrollMilestones = [25, 50, 75, 90, 100];
        let reachedMilestones = [];
        
        window.addEventListener('scroll', () => {
            const scrollPercent = Math.round(
                (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
            );
            
            maxScroll = Math.max(maxScroll, scrollPercent);
            
            // Track scroll milestones
            scrollMilestones.forEach(milestone => {
                if (scrollPercent >= milestone && !reachedMilestones.includes(milestone)) {
                    reachedMilestones.push(milestone);
                    this.trackEvent({
                        event: 'scroll_milestone',
                        timestamp: new Date().toISOString(),
                        milestone: milestone,
                        scrollPercent: scrollPercent
                    });
                }
            });
        });
        
        // Track final scroll depth on page unload
        window.addEventListener('beforeunload', () => {
            this.trackEvent({
                event: 'scroll_depth',
                timestamp: new Date().toISOString(),
                maxScrollPercent: maxScroll
            });
        });
    }
    
    /**
     * Setup click tracking
     */
    setupClickTracking() {
        document.addEventListener('click', (event) => {
            const element = event.target;
            const tagName = element.tagName.toLowerCase();
            
            // Track important clicks
            if (['a', 'button', 'input'].includes(tagName) || element.onclick) {
                this.trackEvent({
                    event: 'click',
                    timestamp: new Date().toISOString(),
                    element: {
                        tagName: tagName,
                        id: element.id,
                        className: element.className,
                        text: element.textContent?.substring(0, 100),
                        href: element.href,
                        type: element.type
                    },
                    position: {
                        x: event.clientX,
                        y: event.clientY
                    }
                });
            }
        });
    }
    
    /**
     * Setup data sending
     */
    setupDataSending() {
        // Send data every 30 seconds
        setInterval(() => {
            this.sendData();
        }, 30000);
        
        // Send data when page becomes hidden
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.sendData();
            }
        });
    }
    
    /**
     * Track custom event
     */
    trackEvent(eventData) {
        if (this.isBot) return; // Don't track bots
        
        this.events.push({
            ...eventData,
            sessionId: this.sessionId,
            userId: this.userId,
            url: window.location.href
        });
        
        console.log('📊 Analytics Event:', eventData.event, eventData);
        
        // Send immediately for critical events
        const criticalEvents = ['form_submit', 'error', 'purchase'];
        if (criticalEvents.includes(eventData.event)) {
            this.sendData();
        }
    }
    
    /**
     * Send analytics data to server
     */
    async sendData(isBeacon = false) {
        if (this.events.length === 0) return;
        
        const payload = {
            events: [...this.events],
            metadata: {
                timestamp: new Date().toISOString(),
                userAgent: this.userAgent,
                url: window.location.href
            }
        };
        
        try {
            if (isBeacon && navigator.sendBeacon) {
                // Use beacon for page unload
                navigator.sendBeacon('/api/analytics', JSON.stringify(payload));
            } else {
                // Regular fetch
                await fetch('/api/analytics', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            }
            
            console.log(`📊 Sent ${this.events.length} analytics events`);
            this.events = []; // Clear sent events
            
        } catch (error) {
            console.error('❌ Failed to send analytics data:', error);
            
            // Store failed events for retry
            const stored = JSON.parse(localStorage.getItem('analytics_failed_events') || '[]');
            stored.push(...this.events);
            localStorage.setItem('analytics_failed_events', JSON.stringify(stored.slice(-100))); // Keep last 100
        }
    }
    
    /**
     * Retry failed events
     */
    async retryFailedEvents() {
        const failedEvents = JSON.parse(localStorage.getItem('analytics_failed_events') || '[]');
        
        if (failedEvents.length > 0) {
            try {
                await fetch('/api/analytics', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ events: failedEvents })
                });
                
                localStorage.removeItem('analytics_failed_events');
                console.log(`📊 Retried ${failedEvents.length} failed events`);
                
            } catch (error) {
                console.error('❌ Failed to retry analytics events:', error);
            }
        }
    }
    
    /**
     * Get analytics summary
     */
    getSummary() {
        return {
            sessionId: this.sessionId,
            userId: this.userId,
            eventsTracked: this.events.length,
            timeOnPage: Date.now() - this.pageLoadTime,
            isBot: this.isBot
        };
    }
}

// Initialize Analytics Manager
document.addEventListener('DOMContentLoaded', () => {
    window.analyticsManager = new AnalyticsManager();
    
    // Retry failed events on page load
    setTimeout(() => {
        window.analyticsManager.retryFailedEvents();
    }, 2000);
});

// Expose global tracking function
window.trackEvent = (eventName, data = {}) => {
    if (window.analyticsManager) {
        window.analyticsManager.trackEvent({
            event: eventName,
            timestamp: new Date().toISOString(),
            ...data
        });
    }
};
