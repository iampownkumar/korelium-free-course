/**
 * Korelium Service Worker
 * Provides offline support and performance caching
 */

const CACHE_NAME = 'korelium-v1.0.0';
const STATIC_CACHE = 'korelium-static-v1.0.0';
const API_CACHE = 'korelium-api-v1.0.0';

// Files to cache immediately
const STATIC_ASSETS = [
    './',
    './korelium-index.html',
    './korelium-admin.html',
    './korelium-style.css',
    './korelium-app.js',
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap'
];

// API endpoints to cache
const API_ENDPOINTS = [
    '/public/courses',
    '/api/course-categories'
];

// Install event - cache static assets
self.addEventListener('install', event => {
    console.log('🔧 Service Worker installing...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => {
                console.log('📦 Caching static assets...');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                console.log('✅ Static assets cached');
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('❌ Error caching static assets:', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log('🔧 Service Worker activating...');
    
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== STATIC_CACHE && cacheName !== API_CACHE) {
                            console.log('🗑️ Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('✅ Service Worker activated');
                return self.clients.claim();
            })
    );
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Handle API requests
    if (url.hostname === 'localhost' && url.port === '9000') {
        event.respondWith(handleApiRequest(request));
        return;
    }
    
    // Handle static assets
    if (request.destination === 'document' || 
        request.destination === 'script' || 
        request.destination === 'style' ||
        request.destination === 'image') {
        event.respondWith(handleStaticRequest(request));
        return;
    }
    
    // Default: network first
    event.respondWith(fetch(request));
});

// Handle API requests with cache-first strategy for GET requests
async function handleApiRequest(request) {
    const url = new URL(request.url);
    const isPublicEndpoint = API_ENDPOINTS.some(endpoint => 
        url.pathname.startsWith(endpoint)
    );
    
    // Only cache GET requests to public endpoints
    if (request.method === 'GET' && isPublicEndpoint) {
        try {
            // Try cache first
            const cache = await caches.open(API_CACHE);
            const cachedResponse = await cache.match(request);
            
            if (cachedResponse) {
                console.log('📋 Serving from API cache:', url.pathname);
                
                // Background update
                fetch(request)
                    .then(response => {
                        if (response.ok) {
                            cache.put(request, response.clone());
                        }
                    })
                    .catch(() => {}); // Ignore background update errors
                
                return cachedResponse;
            }
            
            // Network fallback
            const response = await fetch(request);
            
            if (response.ok) {
                console.log('🌐 Fetched from network and caching:', url.pathname);
                cache.put(request, response.clone());
            }
            
            return response;
            
        } catch (error) {
            console.error('❌ API request failed:', error);
            
            // Return cached version if available
            const cache = await caches.open(API_CACHE);
            const cachedResponse = await cache.match(request);
            
            if (cachedResponse) {
                console.log('📋 Serving stale cache due to network error');
                return cachedResponse;
            }
            
            // Return offline page or error response
            return new Response(
                JSON.stringify({ 
                    success: false, 
                    error: 'Network error - please check your connection' 
                }),
                {
                    status: 503,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }
    }
    
    // For non-GET requests or non-public endpoints, just forward to network
    return fetch(request);
}

// Handle static assets with cache-first strategy
async function handleStaticRequest(request) {
    try {
        // Try cache first
        const cache = await caches.open(STATIC_CACHE);
        const cachedResponse = await cache.match(request);
        
        if (cachedResponse) {
            console.log('📋 Serving from static cache:', request.url);
            return cachedResponse;
        }
        
        // Network fallback
        const response = await fetch(request);
        
        if (response.ok && request.destination !== 'document') {
            console.log('🌐 Fetched from network and caching:', request.url);
            cache.put(request, response.clone());
        }
        
        return response;
        
    } catch (error) {
        console.error('❌ Static request failed:', error);
        
        // Return cached version if available
        const cache = await caches.open(STATIC_CACHE);
        const cachedResponse = await cache.match(request);
        
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // For HTML documents, return offline page
        if (request.destination === 'document') {
            return new Response(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Korelium - Offline</title>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <style>
                        body {
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            min-height: 100vh;
                            margin: 0;
                            background: #0a0a0a;
                            color: #f8fafc;
                            text-align: center;
                        }
                        .offline-container {
                            max-width: 400px;
                            padding: 2rem;
                        }
                        .offline-icon {
                            font-size: 4rem;
                            margin-bottom: 1rem;
                        }
                        h1 {
                            margin-bottom: 1rem;
                            color: #00d4ff;
                        }
                        button {
                            background: linear-gradient(135deg, #00d4ff 0%, #6366f1 100%);
                            color: white;
                            border: none;
                            padding: 0.75rem 1.5rem;
                            border-radius: 0.5rem;
                            cursor: pointer;
                            font-weight: 600;
                            margin-top: 1rem;
                        }
                    </style>
                </head>
                <body>
                    <div class="offline-container">
                        <div class="offline-icon">📡</div>
                        <h1>You're Offline</h1>
                        <p>Check your internet connection and try again.</p>
                        <button onclick="window.location.reload()">Retry</button>
                    </div>
                </body>
                </html>
            `, {
                headers: { 'Content-Type': 'text/html' }
            });
        }
        
        return new Response('Network error', { status: 503 });
    }
}

// Handle background sync (for future offline form submissions)
self.addEventListener('sync', event => {
    if (event.tag === 'background-sync') {
        console.log('🔄 Background sync triggered');
        event.waitUntil(doBackgroundSync());
    }
});

async function doBackgroundSync() {
    try {
        // Handle any pending offline actions
        const pendingActions = await getStoredActions();
        
        for (const action of pendingActions) {
            try {
                await executeAction(action);
                await removeStoredAction(action.id);
            } catch (error) {
                console.error('❌ Failed to sync action:', error);
            }
        }
        
        console.log('✅ Background sync completed');
    } catch (error) {
        console.error('❌ Background sync failed:', error);
    }
}

// Helper functions for offline storage
async function getStoredActions() {
    // Implementation for getting stored offline actions
    return [];
}

async function removeStoredAction(actionId) {
    // Implementation for removing completed actions
}

async function executeAction(action) {
    // Implementation for executing stored actions
}

// Handle push notifications (for future use)
self.addEventListener('push', event => {
    if (event.data) {
        const data = event.data.json();
        console.log('📱 Push notification received:', data);
        
        const options = {
            body: data.body,
            icon: '/icon-192x192.png',
            badge: '/badge-72x72.png',
            data: data.data || {},
            actions: data.actions || [],
            tag: data.tag || 'korelium-notification'
        };
        
        event.waitUntil(
            self.registration.showNotification(data.title, options)
        );
    }
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
    console.log('📱 Notification clicked:', event.notification);
    
    event.notification.close();
    
    // Handle action clicks
    if (event.action) {
        console.log('📱 Notification action clicked:', event.action);
    }
    
    // Open the app
    event.waitUntil(
        clients.matchAll({ type: 'window' })
            .then(clientList => {
                // Focus existing window or open new one
                for (const client of clientList) {
                    if (client.url.includes('korelium') && 'focus' in client) {
                        return client.focus();
                    }
                }
                
                if (clients.openWindow) {
                    return clients.openWindow('./');
                }
            })
    );
});

// Log service worker lifecycle events
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({ version: CACHE_NAME });
    }
});

console.log('🔧 Korelium Service Worker loaded successfully!');