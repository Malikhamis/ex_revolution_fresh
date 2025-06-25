/**
 * Progressive Web App (PWA) Implementation
 * Service Worker registration, installation prompts, and offline functionality
 */

class PWAManager {
    constructor() {
        this.deferredPrompt = null;
        this.isInstalled = false;
        this.isOnline = navigator.onLine;
        this.serviceWorkerRegistration = null;
        
        this.init();
    }
    
    /**
     * Initialize PWA functionality
     */
    async init() {
        console.log('🚀 PWA Manager: Initializing...');
        
        // Check if PWA is supported
        if (!this.isPWASupported()) {
            console.warn('⚠️ PWA features not fully supported in this browser');
            return;
        }
        
        // Register service worker
        await this.registerServiceWorker();
        
        // Setup installation prompt
        this.setupInstallPrompt();
        
        // Setup offline/online handlers
        this.setupConnectionHandlers();
        
        // Setup background sync
        this.setupBackgroundSync();
        
        // Setup push notifications
        this.setupPushNotifications();
        
        // Check if already installed
        this.checkInstallationStatus();
        
        console.log('✅ PWA Manager: Initialization complete');
    }
    
    /**
     * Check if PWA features are supported
     */
    isPWASupported() {
        return 'serviceWorker' in navigator && 'PushManager' in window;
    }
    
    /**
     * Register service worker
     */
    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                this.serviceWorkerRegistration = await navigator.serviceWorker.register('/sw.js');
                console.log('✅ Service Worker registered:', this.serviceWorkerRegistration);
                
                // Listen for updates
                this.serviceWorkerRegistration.addEventListener('updatefound', () => {
                    console.log('🔄 Service Worker update found');
                    this.handleServiceWorkerUpdate();
                });
                
            } catch (error) {
                console.error('❌ Service Worker registration failed:', error);
            }
        }
    }
    
    /**
     * Handle service worker updates
     */
    handleServiceWorkerUpdate() {
        const newWorker = this.serviceWorkerRegistration.installing;
        
        newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New version available
                this.showUpdateNotification();
            }
        });
    }
    
    /**
     * Show update notification
     */
    showUpdateNotification() {
        const notification = document.createElement('div');
        notification.className = 'pwa-update-notification';
        notification.innerHTML = `
            <div class="pwa-notification-content">
                <span>🔄 New version available!</span>
                <button onclick="pwaManager.applyUpdate()">Update</button>
                <button onclick="this.parentElement.parentElement.remove()">Later</button>
            </div>
        `;
        
        document.body.appendChild(notification);
    }
    
    /**
     * Apply service worker update
     */
    applyUpdate() {
        if (this.serviceWorkerRegistration && this.serviceWorkerRegistration.waiting) {
            this.serviceWorkerRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
            window.location.reload();
        }
    }
    
    /**
     * Setup installation prompt
     */
    setupInstallPrompt() {
        // Listen for beforeinstallprompt event
        window.addEventListener('beforeinstallprompt', (event) => {
            console.log('📱 PWA install prompt available');
            
            // Prevent the mini-infobar from appearing
            event.preventDefault();
            
            // Store the event for later use
            this.deferredPrompt = event;
            
            // Show custom install button
            this.showInstallButton();
        });
        
        // Listen for app installed event
        window.addEventListener('appinstalled', () => {
            console.log('✅ PWA installed successfully');
            this.isInstalled = true;
            this.hideInstallButton();
            this.trackEvent('pwa_installed');
        });
    }
    
    /**
     * Show install button
     */
    showInstallButton() {
        let installButton = document.getElementById('pwa-install-button');
        
        if (!installButton) {
            installButton = document.createElement('button');
            installButton.id = 'pwa-install-button';
            installButton.className = 'pwa-install-btn';
            installButton.innerHTML = '📱 Install App';
            installButton.onclick = () => this.promptInstall();
            
            // Add to page (you can customize the location)
            const header = document.querySelector('header') || document.body;
            header.appendChild(installButton);
        }
        
        installButton.style.display = 'block';
    }
    
    /**
     * Hide install button
     */
    hideInstallButton() {
        const installButton = document.getElementById('pwa-install-button');
        if (installButton) {
            installButton.style.display = 'none';
        }
    }
    
    /**
     * Prompt user to install PWA
     */
    async promptInstall() {
        if (!this.deferredPrompt) {
            console.warn('⚠️ Install prompt not available');
            return;
        }
        
        // Show the install prompt
        this.deferredPrompt.prompt();
        
        // Wait for user response
        const { outcome } = await this.deferredPrompt.userChoice;
        
        console.log(`👤 User ${outcome} the install prompt`);
        this.trackEvent('pwa_install_prompt', { outcome });
        
        // Clear the deferred prompt
        this.deferredPrompt = null;
        this.hideInstallButton();
    }
    
    /**
     * Setup connection handlers
     */
    setupConnectionHandlers() {
        window.addEventListener('online', () => {
            console.log('🌐 Back online');
            this.isOnline = true;
            this.handleOnline();
        });
        
        window.addEventListener('offline', () => {
            console.log('📡 Gone offline');
            this.isOnline = false;
            this.handleOffline();
        });
    }
    
    /**
     * Handle online event
     */
    handleOnline() {
        // Remove offline indicators
        document.body.classList.remove('pwa-offline');
        
        // Sync any pending data
        this.syncPendingData();
        
        // Show online notification
        this.showConnectionNotification('🌐 Back online!', 'success');
    }
    
    /**
     * Handle offline event
     */
    handleOffline() {
        // Add offline indicators
        document.body.classList.add('pwa-offline');
        
        // Show offline notification
        this.showConnectionNotification('📡 You\'re offline', 'warning');
    }
    
    /**
     * Show connection notification
     */
    showConnectionNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `pwa-connection-notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
    
    /**
     * Setup background sync
     */
    setupBackgroundSync() {
        if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
            console.log('✅ Background sync supported');
            
            // Register sync events when forms are submitted offline
            this.setupFormSync();
        } else {
            console.warn('⚠️ Background sync not supported');
        }
    }
    
    /**
     * Setup form synchronization
     */
    setupFormSync() {
        // Contact form sync
        const contactForm = document.getElementById('contact-form');
        if (contactForm) {
            contactForm.addEventListener('submit', (event) => {
                if (!this.isOnline) {
                    event.preventDefault();
                    this.storeFormData('contact', new FormData(contactForm));
                    this.registerSync('contact-form');
                }
            });
        }
        
        // Quote form sync
        const quoteForm = document.getElementById('quote-form');
        if (quoteForm) {
            quoteForm.addEventListener('submit', (event) => {
                if (!this.isOnline) {
                    event.preventDefault();
                    this.storeFormData('quote', new FormData(quoteForm));
                    this.registerSync('quote-form');
                }
            });
        }
    }
    
    /**
     * Store form data for later sync
     */
    async storeFormData(type, formData) {
        const data = {};
        for (const [key, value] of formData.entries()) {
            data[key] = value;
        }
        
        const item = {
            id: Date.now(),
            type: type,
            data: data,
            timestamp: new Date().toISOString()
        };
        
        // Store in IndexedDB (simplified version)
        const stored = JSON.parse(localStorage.getItem('pwa-pending-forms') || '[]');
        stored.push(item);
        localStorage.setItem('pwa-pending-forms', JSON.stringify(stored));
        
        console.log(`💾 Stored ${type} form data for later sync`);
        this.showConnectionNotification(`📝 ${type} form saved for when you're back online`, 'info');
    }
    
    /**
     * Register background sync
     */
    async registerSync(tag) {
        if (this.serviceWorkerRegistration) {
            try {
                await this.serviceWorkerRegistration.sync.register(tag);
                console.log(`🔄 Background sync registered: ${tag}`);
            } catch (error) {
                console.error('❌ Background sync registration failed:', error);
            }
        }
    }
    
    /**
     * Sync pending data when back online
     */
    async syncPendingData() {
        const pendingForms = JSON.parse(localStorage.getItem('pwa-pending-forms') || '[]');
        
        if (pendingForms.length > 0) {
            console.log(`🔄 Syncing ${pendingForms.length} pending forms`);
            
            for (const form of pendingForms) {
                try {
                    const endpoint = form.type === 'contact' ? '/api/contact' : '/api/quote';
                    const response = await fetch(endpoint, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(form.data)
                    });
                    
                    if (response.ok) {
                        console.log(`✅ Synced ${form.type} form`);
                    }
                } catch (error) {
                    console.error(`❌ Failed to sync ${form.type} form:`, error);
                }
            }
            
            // Clear synced forms
            localStorage.removeItem('pwa-pending-forms');
            this.showConnectionNotification('✅ All forms synced!', 'success');
        }
    }
    
    /**
     * Setup push notifications
     */
    async setupPushNotifications() {
        if ('Notification' in window && 'PushManager' in window) {
            console.log('✅ Push notifications supported');
            
            // Request permission if not already granted
            if (Notification.permission === 'default') {
                await this.requestNotificationPermission();
            }
        } else {
            console.warn('⚠️ Push notifications not supported');
        }
    }
    
    /**
     * Request notification permission
     */
    async requestNotificationPermission() {
        const permission = await Notification.requestPermission();
        console.log(`🔔 Notification permission: ${permission}`);
        
        if (permission === 'granted') {
            this.subscribeToNotifications();
        }
        
        return permission;
    }
    
    /**
     * Subscribe to push notifications
     */
    async subscribeToNotifications() {
        if (this.serviceWorkerRegistration) {
            try {
                const subscription = await this.serviceWorkerRegistration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: this.urlBase64ToUint8Array('YOUR_VAPID_PUBLIC_KEY_HERE')
                });
                
                console.log('✅ Push notification subscription:', subscription);
                
                // Send subscription to server
                await this.sendSubscriptionToServer(subscription);
                
            } catch (error) {
                console.error('❌ Push notification subscription failed:', error);
            }
        }
    }
    
    /**
     * Send subscription to server
     */
    async sendSubscriptionToServer(subscription) {
        try {
            await fetch('/api/push/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(subscription)
            });
            console.log('✅ Subscription sent to server');
        } catch (error) {
            console.error('❌ Failed to send subscription to server:', error);
        }
    }
    
    /**
     * Check installation status
     */
    checkInstallationStatus() {
        // Check if running as PWA
        if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
            this.isInstalled = true;
            console.log('✅ Running as installed PWA');
        }
        
        // Check if running in browser
        if (window.navigator.standalone === true) {
            this.isInstalled = true;
            console.log('✅ Running as installed PWA (iOS)');
        }
    }
    
    /**
     * Track PWA events
     */
    trackEvent(eventName, data = {}) {
        // Send to analytics (implement your analytics tracking here)
        console.log(`📊 PWA Event: ${eventName}`, data);
        
        // Example: Google Analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, data);
        }
    }
    
    /**
     * Utility: Convert VAPID key
     */
    urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        
        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        
        return outputArray;
    }
}

// Initialize PWA Manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.pwaManager = new PWAManager();
});

// Add PWA styles
const pwaStyles = `
    .pwa-install-btn {
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(45deg, #4f46e5, #7c3aed);
        color: white;
        border: none;
        padding: 12px 20px;
        border-radius: 25px;
        font-weight: 600;
        cursor: pointer;
        box-shadow: 0 4px 15px rgba(79, 70, 229, 0.3);
        z-index: 1000;
        transition: all 0.3s ease;
    }
    
    .pwa-install-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(79, 70, 229, 0.4);
    }
    
    .pwa-connection-notification {
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        padding: 12px 24px;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        z-index: 1001;
        animation: slideDown 0.3s ease;
    }
    
    .pwa-connection-notification.success {
        background: #10b981;
    }
    
    .pwa-connection-notification.warning {
        background: #f59e0b;
    }
    
    .pwa-connection-notification.info {
        background: #3b82f6;
    }
    
    .pwa-offline {
        filter: grayscale(0.3);
    }
    
    @keyframes slideDown {
        from { transform: translateX(-50%) translateY(-100%); }
        to { transform: translateX(-50%) translateY(0); }
    }
`;

// Inject PWA styles
const styleSheet = document.createElement('style');
styleSheet.textContent = pwaStyles;
document.head.appendChild(styleSheet);
