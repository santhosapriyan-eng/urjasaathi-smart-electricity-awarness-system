// UrjaSaathi - Progressive Web App Service Worker
// Version: 1.0.0

const CACHE_NAME = 'urjasaathi-v1.0.0';
const APP_SHELL_CACHE = 'urjasaathi-shell-v1.0.0';

// Assets to cache immediately on install
const PRECACHE_ASSETS = [
    '/',
    '/index.html',
    '/styles/main.css',
    '/styles/loading.css',
    '/scripts/main.js',
    '/scripts/loading.js',
    '/scripts/charts.js',
    '/scripts/appliances.js',
    '/manifest.json'
];

// Offline fallback page
const OFFLINE_URL = '/offline.html';

// Install event - cache critical assets
self.addEventListener('install', (event) => {
    console.log('Service Worker: Installing...');
    
    event.waitUntil(
        caches.open(APP_SHELL_CACHE)
            .then((cache) => {
                console.log('Service Worker: Caching app shell');
                return cache.addAll(PRECACHE_ASSETS);
            })
            .then(() => {
                console.log('Service Worker: Install completed');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('Service Worker: Install failed', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activating...');
    
    const cacheWhitelist = [CACHE_NAME, APP_SHELL_CACHE];
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (!cacheWhitelist.includes(cacheName)) {
                            console.log('Service Worker: Deleting old cache', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('Service Worker: Activation completed');
                return self.clients.claim();
            })
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') return;
    
    // Skip chrome-extension requests
    if (event.request.url.startsWith('chrome-extension://')) return;
    
    const requestUrl = new URL(event.request.url);
    
    // Handle API requests differently
    if (requestUrl.pathname.startsWith('/api/')) {
        event.respondWith(handleApiRequest(event));
        return;
    }
    
    // Handle navigation requests
    if (event.request.mode === 'navigate') {
        event.respondWith(handleNavigationRequest(event));
        return;
    }
    
    // Handle static assets
    event.respondWith(handleStaticRequest(event));
});

// Strategy: Cache First, Fallback to Network
async function handleStaticRequest(event) {
    try {
        // Try cache first
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Fallback to network
        const networkResponse = await fetch(event.request);
        
        // Cache the new response
        if (networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(event.request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.log('Service Worker: Fetch failed', error);
        
        // If it's an image, return a placeholder
        if (event.request.destination === 'image') {
            return caches.match('/assets/images/placeholder.svg');
        }
        
        throw error;
    }
}

// Strategy: Network First, Fallback to Cache
async function handleApiRequest(event) {
    try {
        // Try network first
        const networkResponse = await fetch(event.request);
        
        // Cache successful responses
        if (networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(event.request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.log('Service Worker: API request failed, trying cache', error);
        
        // Fallback to cache
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Return offline data structure
        return new Response(
            JSON.stringify({ 
                offline: true, 
                timestamp: new Date().toISOString(),
                message: 'You are offline. Showing cached data.'
            }),
            {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
}

// Strategy: Network First with Offline Page Fallback
async function handleNavigationRequest(event) {
    try {
        // Try network first for fresh content
        const networkResponse = await fetch(event.request);
        
        // Cache the page for future offline use
        const cache = await caches.open(CACHE_NAME);
        cache.put(event.request, networkResponse.clone());
        
        return networkResponse;
    } catch (error) {
        console.log('Service Worker: Navigation request failed', error);
        
        // Check cache for the page
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Show offline page
        const offlineResponse = await caches.match(OFFLINE_URL);
        if (offlineResponse) {
            return offlineResponse;
        }
        
        // Fallback to a simple offline message
        return new Response(
            `
            <!DOCTYPE html>
            <html>
            <head>
                <title>UrjaSaathi - Offline</title>
                <style>
                    body { 
                        font-family: sans-serif; 
                        display: flex; 
                        flex-direction: column; 
                        align-items: center; 
                        justify-content: center; 
                        height: 100vh; 
                        text-align: center; 
                        padding: 20px; 
                    }
                    h1 { color: #666; }
                    p { color: #999; }
                </style>
            </head>
            <body>
                <h1>⚠️ You're Offline</h1>
                <p>UrjaSaathi requires an internet connection for this feature.</p>
                <p>Basic energy monitoring is still available.</p>
                <button onclick="location.reload()">Retry</button>
            </body>
            </html>
            `,
            {
                status: 200,
                headers: { 'Content-Type': 'text/html' }
            }
        );
    }
}

// Background Sync for offline actions
self.addEventListener('sync', (event) => {
    console.log('Service Worker: Background sync', event.tag);
    
    if (event.tag === 'sync-appliance-states') {
        event.waitUntil(syncApplianceStates());
    }
    
    if (event.tag === 'sync-energy-data') {
        event.waitUntil(syncEnergyData());
    }
});

// Sync appliance states when back online
async function syncApplianceStates() {
    try {
        // Get pending actions from IndexedDB
        const pendingActions = await getPendingActions();
        
        for (const action of pendingActions) {
            await sendApplianceAction(action);
            await removePendingAction(action.id);
        }
        
        console.log('Service Worker: Appliance states synced');
    } catch (error) {
        console.error('Service Worker: Sync failed', error);
    }
}

// Sync energy data
async function syncEnergyData() {
    try {
        // Get cached energy data
        const cachedData = await getCachedEnergyData();
        
        if (cachedData.length > 0) {
            // Send to server
            await fetch('/api/energy/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(cachedData)
            });
            
            // Clear cached data
            await clearCachedEnergyData();
            
            console.log('Service Worker: Energy data synced');
        }
    } catch (error) {
        console.error('Service Worker: Energy sync failed', error);
    }
}

// IndexedDB helper functions
async function getPendingActions() {
    // In a real app, you would use IndexedDB
    // For now, return empty array
    return [];
}

async function sendApplianceAction(action) {
    // Send appliance action to server
    return fetch('/api/appliances/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(action)
    });
}

async function removePendingAction(actionId) {
    // Remove action from pending queue
    console.log('Removing action', actionId);
}

async function getCachedEnergyData() {
    // Get cached energy readings
    return [];
}

async function clearCachedEnergyData() {
    // Clear energy data cache
    console.log('Clearing cached energy data');
}

// Push Notifications
self.addEventListener('push', (event) => {
    console.log('Service Worker: Push received', event);
    
    const data = event.data ? event.data.json() : {};
    const title = data.title || 'UrjaSaathi';
    const options = {
        body: data.body || 'New notification',
        icon: '/assets/images/icons/icon-192x192.png',
        badge: '/assets/images/icons/badge-72x72.png',
        vibrate: [200, 100, 200],
        data: data,
        actions: [
            {
                action: 'view',
                title: 'View'
            },
            {
                action: 'dismiss',
                title: 'Dismiss'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
    console.log('Service Worker: Notification clicked', event);
    
    event.notification.close();
    
    const notificationData = event.notification.data;
    
    if (event.action === 'view') {
        // Open the app
        const urlToOpen = notificationData.url || '/';
        
        event.waitUntil(
            clients.matchAll({
                type: 'window',
                includeUncontrolled: true
            }).then((windowClients) => {
                // Check if app is already open
                for (const client of windowClients) {
                    if (client.url === urlToOpen && 'focus' in client) {
                        return client.focus();
                    }
                }
                
                // Open new window
                if (clients.openWindow) {
                    return clients.openWindow(urlToOpen);
                }
            })
        );
    }
    
    // Handle other actions
    if (notificationData.action === 'appliance_alert') {
        // Handle appliance alert
        clients.openWindow('/appliances.html');
    }
});

// Periodic Sync (if supported)
if ('periodicSync' in self.registration) {
    self.addEventListener('periodicsync', (event) => {
        if (event.tag === 'update-energy-data') {
            event.waitUntil(updateEnergyData());
        }
    });
}

async function updateEnergyData() {
    console.log('Service Worker: Periodic sync - updating energy data');
    // Update energy data in background
}

// Handle app updates
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

// Cache cleanup
function cleanupOldCaches() {
    setInterval(async () => {
        const cacheNames = await caches.keys();
        const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        
        for (const cacheName of cacheNames) {
            const cache = await caches.open(cacheName);
            const requests = await cache.keys();
            
            for (const request of requests) {
                const response = await cache.match(request);
                if (response) {
                    const dateHeader = response.headers.get('date');
                    if (dateHeader) {
                        const cachedDate = new Date(dateHeader).getTime();
                        if (cachedDate < weekAgo) {
                            cache.delete(request);
                        }
                    }
                }
            }
        }
    }, 24 * 60 * 60 * 1000); // Run daily
}

// Start cache cleanup
cleanupOldCaches();