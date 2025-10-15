/**
 * Personal Finance Tracker - Service Worker
 * Handles offline functionality, caching, and background sync
 */

const CACHE_NAME = 'finance-tracker-v1.0.0';
const CACHE_URLS = [
    './',
    './index.html',
    './css/app.css',
    './js/app.js',
    './js/data-manager.js',
    './js/security.js',
    './js/charts.js',
    './manifest.json',
    
    // External CDN resources (fallbacks will be provided)
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js',
    'https://cdn.jsdelivr.net/npm/chart.js'
];

const OFFLINE_FALLBACKS = {
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css': './css/bootstrap-fallback.css',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css': './css/fontawesome-fallback.css',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js': './js/bootstrap-fallback.js',
    'https://cdn.jsdelivr.net/npm/chart.js': './js/chart-fallback.js'
};

/**
 * Service Worker Installation
 */
self.addEventListener('install', (event) => {
    console.log('Service Worker: Installing...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Service Worker: Caching app shell');
                return cache.addAll(CACHE_URLS.filter(url => !url.startsWith('https://')));
            })
            .then(() => {
                console.log('Service Worker: App shell cached');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('Service Worker: Cache failed', error);
            })
    );
});

/**
 * Service Worker Activation
 */
self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activating...');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME) {
                            console.log('Service Worker: Deleting old cache', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('Service Worker: Activated');
                return self.clients.claim();
            })
    );
});

/**
 * Fetch Event Handler
 */
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // Handle different types of requests
    if (url.origin === location.origin) {
        // Same-origin requests - cache first strategy
        event.respondWith(cacheFirstStrategy(request));
    } else {
        // Cross-origin requests (CDNs) - network first with fallback
        event.respondWith(networkFirstWithFallback(request));
    }
});

/**
 * Cache First Strategy for same-origin requests
 */
async function cacheFirstStrategy(request) {
    try {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            // Update cache in background if it's been a while
            updateCacheInBackground(request);
            return cachedResponse;
        }
        
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
        
    } catch (error) {
        console.error('Cache first strategy failed:', error);
        
        // Return offline fallback page for navigation requests
        if (request.mode === 'navigate') {
            return caches.match('./index.html');
        }
        
        return new Response('Offline', { status: 503 });
    }
}

/**
 * Network First Strategy with fallback for external resources
 */
async function networkFirstWithFallback(request) {
    try {
        const networkResponse = await fetch(request, {
            mode: 'cors',
            credentials: 'omit'
        });
        
        if (networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
            return networkResponse;
        }
        
        throw new Error('Network response not ok');
        
    } catch (error) {
        console.log('Network failed, trying cache:', request.url);
        
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Try fallback for known external resources
        const fallbackUrl = OFFLINE_FALLBACKS[request.url];
        if (fallbackUrl) {
            console.log('Using fallback for:', request.url);
            return caches.match(fallbackUrl);
        }
        
        console.error('No fallback available for:', request.url);
        return new Response('Resource not available offline', { status: 503 });
    }
}

/**
 * Update cache in background for stale resources
 */
async function updateCacheInBackground(request) {
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME);
            await cache.put(request, networkResponse);
            console.log('Background cache update successful for:', request.url);
        }
    } catch (error) {
        console.log('Background cache update failed for:', request.url);
    }
}

/**
 * Background Sync for offline data
 */
self.addEventListener('sync', (event) => {
    console.log('Service Worker: Background sync triggered', event.tag);
    
    if (event.tag === 'background-sync-data') {
        event.waitUntil(syncOfflineData());
    }
});

/**
 * Sync offline data when connection is restored
 */
async function syncOfflineData() {
    try {
        // Get pending sync data from IndexedDB
        const pendingData = await getPendingSyncData();
        
        if (pendingData.length > 0) {
            console.log('Syncing offline data:', pendingData.length, 'items');
            
            for (const item of pendingData) {
                try {
                    await processSyncItem(item);
                    await removeSyncItem(item.id);
                } catch (error) {
                    console.error('Failed to sync item:', item, error);
                }
            }
            
            // Notify all clients about successful sync
            await notifyClientsOfSync();
        }
        
    } catch (error) {
        console.error('Background sync failed:', error);
    }
}

/**
 * Get pending sync data from IndexedDB
 */
async function getPendingSyncData() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('FinanceTrackerSync', 1);
        
        request.onerror = () => reject(request.error);
        
        request.onsuccess = () => {
            const db = request.result;
            const transaction = db.transaction(['pendingSync'], 'readonly');
            const store = transaction.objectStore('pendingSync');
            const getAllRequest = store.getAll();
            
            getAllRequest.onsuccess = () => resolve(getAllRequest.result);
            getAllRequest.onerror = () => reject(getAllRequest.error);
        };
        
        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains('pendingSync')) {
                const store = db.createObjectStore('pendingSync', { keyPath: 'id', autoIncrement: true });
                store.createIndex('timestamp', 'timestamp', { unique: false });
            }
        };
    });
}

/**
 * Process a sync item (placeholder for actual sync logic)
 */
async function processSyncItem(item) {
    // This would typically involve sending data to a server
    // For this offline-first app, we'll just log the action
    console.log('Processing sync item:', item);
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 100));
}

/**
 * Remove synced item from IndexedDB
 */
async function removeSyncItem(id) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('FinanceTrackerSync', 1);
        
        request.onsuccess = () => {
            const db = request.result;
            const transaction = db.transaction(['pendingSync'], 'readwrite');
            const store = transaction.objectStore('pendingSync');
            const deleteRequest = store.delete(id);
            
            deleteRequest.onsuccess = () => resolve();
            deleteRequest.onerror = () => reject(deleteRequest.error);
        };
        
        request.onerror = () => reject(request.error);
    });
}

/**
 * Notify all clients about successful sync
 */
async function notifyClientsOfSync() {
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
        client.postMessage({
            type: 'SYNC_COMPLETE',
            timestamp: Date.now()
        });
    });
}

/**
 * Push Notification Handler
 */
self.addEventListener('push', (event) => {
    console.log('Service Worker: Push message received');
    
    const options = {
        body: event.data ? event.data.text() : 'New financial update available',
        icon: './assets/icon-192.png',
        badge: './assets/badge-72.png',
        vibrate: [200, 100, 200],
        data: {
            timestamp: Date.now(),
            url: './'
        },
        actions: [
            {
                action: 'view',
                title: 'View',
                icon: './assets/action-view.png'
            },
            {
                action: 'dismiss',
                title: 'Dismiss',
                icon: './assets/action-dismiss.png'
            }
        ],
        requireInteraction: false,
        silent: false
    };
    
    event.waitUntil(
        self.registration.showNotification('Finance Tracker', options)
    );
});

/**
 * Notification Click Handler
 */
self.addEventListener('notificationclick', (event) => {
    console.log('Service Worker: Notification clicked', event.action);
    
    event.notification.close();
    
    if (event.action === 'view') {
        event.waitUntil(
            clients.openWindow('./')
        );
    }
});

/**
 * Message Handler for communication with main app
 */
self.addEventListener('message', (event) => {
    console.log('Service Worker: Message received', event.data);
    
    if (event.data && event.data.type) {
        switch (event.data.type) {
            case 'SKIP_WAITING':
                self.skipWaiting();
                break;
                
            case 'GET_VERSION':
                event.ports[0].postMessage({
                    version: CACHE_NAME,
                    timestamp: Date.now()
                });
                break;
                
            case 'CLEAR_CACHE':
                clearAllCaches().then(() => {
                    event.ports[0].postMessage({ success: true });
                });
                break;
                
            case 'SYNC_DATA':
                // Register background sync
                self.registration.sync.register('background-sync-data');
                break;
                
            default:
                console.log('Unknown message type:', event.data.type);
        }
    }
});

/**
 * Clear all caches
 */
async function clearAllCaches() {
    const cacheNames = await caches.keys();
    await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
    );
    console.log('All caches cleared');
}

/**
 * Periodic Background Sync (if supported)
 */
if ('periodicSync' in self.registration) {
    self.addEventListener('periodicsync', (event) => {
        if (event.tag === 'financial-data-sync') {
            event.waitUntil(syncOfflineData());
        }
    });
}

/**
 * Handle app updates
 */
self.addEventListener('install', (event) => {
    // Show update available notification to user
    if (self.registration.active) {
        self.clients.matchAll().then(clients => {
            clients.forEach(client => {
                client.postMessage({
                    type: 'UPDATE_AVAILABLE',
                    version: CACHE_NAME
                });
            });
        });
    }
});

console.log('Service Worker: Script loaded');
