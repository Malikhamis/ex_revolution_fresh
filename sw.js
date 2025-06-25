/**
 * Service Worker for Ex Revolution Website
 * Provides offline functionality, caching, and PWA features
 */

const CACHE_NAME = 'exrev-v1.0.0';
const STATIC_CACHE = 'exrev-static-v1.0.0';
const DYNAMIC_CACHE = 'exrev-dynamic-v1.0.0';
const API_CACHE = 'exrev-api-v1.0.0';

// Assets to cache immediately
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/services.html',
    '/case-studies.html',
    '/blog.html',
    '/contact.html',
    '/quote.html',
    '/css/main.css',
    '/css/responsive.css',
    '/js/app.js',
    '/js/main.js',
    '/assets/images/logo.png',
    '/assets/images/hero-bg.jpg',
    '/manifest.json',
    '/offline.html'
];

// API endpoints to cache
const API_ENDPOINTS = [
    '/api/public/blog-posts',
    '/api/public/case-studies',
    '/api/health'
];

// Cache strategies
const CACHE_STRATEGIES = {
    static: 'cache-first',
    dynamic: 'network-first',
    api: 'network-first-with-fallback',
    images: 'cache-first'
};

/**
 * Service Worker Installation
 */
self.addEventListener('install', event => {
    console.log('🔧 Service Worker: Installing...');
    
    event.waitUntil(
        Promise.all([
            // Cache static assets
            caches.open(STATIC_CACHE).then(cache => {
                console.log('📦 Service Worker: Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            }),
            
            // Cache API endpoints
            caches.open(API_CACHE).then(cache => {
                console.log('📡 Service Worker: Pre-caching API endpoints');
                return Promise.all(
                    API_ENDPOINTS.map(endpoint => {
                        return fetch(endpoint)
                            .then(response => {
                                if (response.ok) {
                                    return cache.put(endpoint, response);
                                }
                            })
                            .catch(error => {
                                console.warn(`Failed to cache ${endpoint}:`, error);
                            });
                    })
                );
            })
        ]).then(() => {
            console.log('✅ Service Worker: Installation complete');
            return self.skipWaiting();
        })
    );
});

/**
 * Service Worker Activation
 */
self.addEventListener('activate', event => {
    console.log('🚀 Service Worker: Activating...');
    
    event.waitUntil(
        Promise.all([
            // Clean up old caches
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== STATIC_CACHE && 
                            cacheName !== DYNAMIC_CACHE && 
                            cacheName !== API_CACHE) {
                            console.log('🗑️ Service Worker: Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            }),
            
            // Take control of all clients
            self.clients.claim()
        ]).then(() => {
            console.log('✅ Service Worker: Activation complete');
        })
    );
});

/**
 * Fetch Event Handler
 */
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // Handle different types of requests
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(handleApiRequest(request));
    } else if (url.pathname.match(/\.(png|jpg|jpeg|gif|webp|svg)$/)) {
        event.respondWith(handleImageRequest(request));
    } else if (url.pathname.match(/\.(css|js)$/)) {
        event.respondWith(handleStaticRequest(request));
    } else {
        event.respondWith(handlePageRequest(request));
    }
});

/**
 * Handle API requests with network-first strategy
 */
async function handleApiRequest(request) {
    try {
        // Try network first
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            // Cache successful responses
            const cache = await caches.open(API_CACHE);
            cache.put(request, networkResponse.clone());
            return networkResponse;
        }
        
        throw new Error('Network response not ok');
        
    } catch (error) {
        console.log('📡 Service Worker: Network failed, trying cache for:', request.url);
        
        // Fallback to cache
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Return offline response for API
        return new Response(JSON.stringify({
            success: false,
            message: 'Offline - cached data not available',
            offline: true
        }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

/**
 * Handle image requests with cache-first strategy
 */
async function handleImageRequest(request) {
    // Try cache first
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
        return cachedResponse;
    }
    
    try {
        // Fetch from network
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            // Cache the image
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
            return networkResponse;
        }
        
        throw new Error('Network response not ok');
        
    } catch (error) {
        console.log('🖼️ Service Worker: Image not available:', request.url);
        
        // Return placeholder image
        return new Response('', {
            status: 404,
            statusText: 'Image not found'
        });
    }
}

/**
 * Handle static asset requests with cache-first strategy
 */
async function handleStaticRequest(request) {
    // Try cache first
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
        return cachedResponse;
    }
    
    try {
        // Fetch from network
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            // Cache the asset
            const cache = await caches.open(STATIC_CACHE);
            cache.put(request, networkResponse.clone());
            return networkResponse;
        }
        
        throw new Error('Network response not ok');
        
    } catch (error) {
        console.log('📄 Service Worker: Static asset not available:', request.url);
        return new Response('', { status: 404 });
    }
}

/**
 * Handle page requests with network-first strategy
 */
async function handlePageRequest(request) {
    try {
        // Try network first
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            // Cache the page
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
            return networkResponse;
        }
        
        throw new Error('Network response not ok');
        
    } catch (error) {
        console.log('📄 Service Worker: Page not available, trying cache:', request.url);
        
        // Try cache
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Fallback to offline page
        const offlineResponse = await caches.match('/offline.html');
        if (offlineResponse) {
            return offlineResponse;
        }
        
        // Last resort
        return new Response('Offline - Page not available', {
            status: 503,
            headers: { 'Content-Type': 'text/plain' }
        });
    }
}

/**
 * Background Sync for form submissions
 */
self.addEventListener('sync', event => {
    console.log('🔄 Service Worker: Background sync triggered:', event.tag);
    
    if (event.tag === 'contact-form') {
        event.waitUntil(syncContactForms());
    } else if (event.tag === 'quote-form') {
        event.waitUntil(syncQuoteForms());
    }
});

/**
 * Sync contact forms when online
 */
async function syncContactForms() {
    try {
        const db = await openDB();
        const forms = await getStoredForms(db, 'contact-forms');
        
        for (const form of forms) {
            try {
                const response = await fetch('/api/contact', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(form.data)
                });
                
                if (response.ok) {
                    await deleteStoredForm(db, 'contact-forms', form.id);
                    console.log('✅ Contact form synced:', form.id);
                }
            } catch (error) {
                console.error('❌ Failed to sync contact form:', error);
            }
        }
    } catch (error) {
        console.error('❌ Background sync failed:', error);
    }
}

/**
 * Push notification handler
 */
self.addEventListener('push', event => {
    console.log('📬 Service Worker: Push notification received');
    
    const options = {
        body: event.data ? event.data.text() : 'New update available!',
        icon: '/assets/images/icon-192x192.png',
        badge: '/assets/images/badge-72x72.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'View Details',
                icon: '/assets/images/checkmark.png'
            },
            {
                action: 'close',
                title: 'Close',
                icon: '/assets/images/xmark.png'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification('Ex Revolution', options)
    );
});

/**
 * Notification click handler
 */
self.addEventListener('notificationclick', event => {
    console.log('🔔 Service Worker: Notification clicked');
    
    event.notification.close();
    
    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

/**
 * Simple IndexedDB helpers
 */
function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('ExRevDB', 1);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        
        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains('contact-forms')) {
                db.createObjectStore('contact-forms', { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains('quote-forms')) {
                db.createObjectStore('quote-forms', { keyPath: 'id' });
            }
        };
    });
}

console.log('🔧 Service Worker: Script loaded');
