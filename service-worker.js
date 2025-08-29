// Enhanced PWA Service Worker with Auto-Updater and Cache Manager
// Version: 4.0.0

// Configuration
const CACHE_CONFIG = {
  name: 'pwa-template-v4',
  version: '4.0.0',
  buildTime: Date.now(),
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  maxEntries: 100, // Maximum number of cached entries
  urlsToCache: [
    './',
    './index.html',
    './styles.css',
    './app.js',
    './encrypted-storage.js',
    './manifest.json',
    './icons/icon-192x192.png',
    './icons/icon-512x512.png',
    './icons/icon.svg'
  ],
  // Files that should always be fetched fresh (not cached)
  noCache: [
    './version.json',
    './update-check.json'
  ],
  // Files that should be cached with network-first strategy
  networkFirst: [
    './api/',
    './data/'
  ]
};

// Update notification configuration
const UPDATE_CONFIG = {
  checkInterval: 30 * 60 * 1000, // Check for updates every 30 minutes
  notificationTitle: 'PWA Template Update',
  notificationOptions: {
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    vibrate: [100, 50, 100],
    requireInteraction: false,
    actions: [
      {
        action: 'update',
        title: 'Update Now',
        icon: '/icons/icon-192x192.png'
      },
      {
        action: 'later',
        title: 'Later',
        icon: '/icons/icon-192x192.png'
      }
    ]
  }
};

// Cache management utilities
const CacheManager = {
  // Open cache with version
  async openCache() {
    return await caches.open(CACHE_CONFIG.name);
  },

  // Add multiple URLs to cache
  async addAllToCache(urls) {
    const cache = await this.openCache();
    const promises = urls.map(url => 
      cache.add(url).catch(error => {
        console.warn(`Failed to cache ${url}:`, error);
        return null;
      })
    );
    return Promise.allSettled(promises);
  },

  // Clean old caches
  async cleanOldCaches() {
    const cacheNames = await caches.keys();
    const oldCaches = cacheNames.filter(name => 
      name !== CACHE_CONFIG.name && name.startsWith('pwa-template-')
    );
    
    console.log('Cleaning old caches:', oldCaches);
    
    return Promise.all(
      oldCaches.map(name => {
        console.log('Deleting old cache:', name);
        return caches.delete(name);
      })
    );
  },

  // Clean expired entries from current cache
  async cleanExpiredEntries() {
    const cache = await this.openCache();
    const requests = await cache.keys();
    const now = Date.now();
    
    const expiredPromises = requests.map(async request => {
      const response = await cache.match(request);
      if (!response) return null;
      
      const cacheTime = response.headers.get('sw-cache-time');
      if (!cacheTime) return null;
      
      const age = now - parseInt(cacheTime);
      if (age > CACHE_CONFIG.maxAge) {
        console.log('Removing expired cache entry:', request.url);
        return cache.delete(request);
      }
      return null;
    });
    
    return Promise.all(expiredPromises);
  },

  // Limit cache entries
  async limitCacheEntries() {
    const cache = await this.openCache();
    const requests = await cache.keys();
    
    if (requests.length > CACHE_CONFIG.maxEntries) {
      const toDelete = requests.slice(0, requests.length - CACHE_CONFIG.maxEntries);
      console.log(`Limiting cache entries, deleting ${toDelete.length} old entries`);
      
      return Promise.all(
        toDelete.map(request => cache.delete(request))
      );
    }
  }
};

// Update management utilities
const UpdateManager = {
  // Check for updates
  async checkForUpdates() {
    try {
      // Create a version check URL with cache busting
      const versionUrl = `./version.json?t=${Date.now()}`;
      const response = await fetch(versionUrl, { 
        method: 'GET',
        cache: 'no-cache'
      });
      
      if (!response.ok) return false;
      
      const versionData = await response.json();
      const currentVersion = CACHE_CONFIG.version;
      
      console.log('Version check:', { current: currentVersion, server: versionData.version });
      
      return versionData.version !== currentVersion;
    } catch (error) {
      console.warn('Update check failed:', error);
      return false;
    }
  },

  // Notify clients about update
  async notifyClientsAboutUpdate() {
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'UPDATE_AVAILABLE',
        version: CACHE_CONFIG.version,
        timestamp: Date.now()
      });
    });
  },

  // Show update notification
  async showUpdateNotification() {
    if (!('Notification' in self)) return;
    
    if (Notification.permission === 'granted') {
      const notification = new Notification(
        UPDATE_CONFIG.notificationTitle,
        {
          ...UPDATE_CONFIG.notificationOptions,
          body: `A new version (${CACHE_CONFIG.version}) is available. Click to update.`,
          data: { version: CACHE_CONFIG.version }
        }
      );
      
      notification.onclick = () => {
        notification.close();
        self.clients.openWindow('./');
      };
    }
  },

  // Force update by clearing cache and reloading
  async forceUpdate() {
    console.log('Forcing update...');
    
    // Clear all caches
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames.map(name => caches.delete(name))
    );
    
    // Notify clients to reload
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'FORCE_UPDATE',
        timestamp: Date.now()
      });
    });
  }
};

// Install event - cache resources and set up update checking
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing version', CACHE_CONFIG.version);
  
  event.waitUntil(
    Promise.all([
      // Cache essential resources
      CacheManager.addAllToCache(CACHE_CONFIG.urlsToCache),
      // Clean old caches
      CacheManager.cleanOldCaches()
    ]).then(() => {
      console.log('Service Worker: Installation complete');
      return self.skipWaiting();
    }).catch((error) => {
      console.error('Service Worker: Installation failed', error);
    })
  );
});

// Activate event - claim clients and set up periodic update checks
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating version', CACHE_CONFIG.version);
  
  event.waitUntil(
    Promise.all([
      // Clean old caches
      CacheManager.cleanOldCaches(),
      // Clean expired entries
      CacheManager.cleanExpiredEntries(),
      // Claim all clients
      self.clients.claim()
    ]).then(() => {
      console.log('Service Worker: Activation complete');
      
      // Set up periodic update checks
      setInterval(async () => {
        const hasUpdate = await UpdateManager.checkForUpdates();
        if (hasUpdate) {
          console.log('Update available, notifying clients');
          await UpdateManager.notifyClientsAboutUpdate();
          await UpdateManager.showUpdateNotification();
        }
      }, UPDATE_CONFIG.checkInterval);
      
      // Initial update check
      UpdateManager.checkForUpdates().then(hasUpdate => {
        if (hasUpdate) {
          UpdateManager.notifyClientsAboutUpdate();
        }
      });
    })
  );
});

// Fetch event - enhanced caching strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    event.respondWith(fetch(request));
    return;
  }
  
  // Skip non-HTTP(S) requests
  if (!url.protocol.startsWith('http')) {
    event.respondWith(fetch(request));
    return;
  }
  
  // Handle no-cache files
  if (CACHE_CONFIG.noCache.some(pattern => request.url.includes(pattern))) {
    event.respondWith(
      fetch(request, { cache: 'no-cache' })
        .catch(() => new Response('Offline', { status: 503 }))
    );
    return;
  }
  
  // Handle network-first files
  if (CACHE_CONFIG.networkFirst.some(pattern => request.url.includes(pattern))) {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Cache successful responses
          if (response.ok) {
            const responseToCache = response.clone();
            caches.open(CACHE_CONFIG.name).then(cache => {
              cache.put(request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          // Fallback to cache
          return caches.match(request);
        })
    );
    return;
  }
  
  // Default cache-first strategy
  event.respondWith(
    caches.match(request)
      .then(async (cachedResponse) => {
        if (cachedResponse) {
          console.log('Service Worker: Serving from cache', request.url);
          
          // Check if cache is stale and update in background
          const cacheTime = cachedResponse.headers.get('sw-cache-time');
          if (cacheTime) {
            const age = Date.now() - parseInt(cacheTime);
            if (age > CACHE_CONFIG.maxAge) {
              // Update cache in background
              fetch(request)
                .then(response => {
                  if (response.ok) {
                    const responseToCache = response.clone();
                    caches.open(CACHE_CONFIG.name).then(cache => {
                      cache.put(request, responseToCache);
                    });
                  }
                })
                .catch(() => {
                  // Ignore background update failures
                });
            }
          }
          
          return cachedResponse;
        }
        
        console.log('Service Worker: Fetching from network', request.url);
        return fetch(request)
          .then(response => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clone the response for caching
            const responseToCache = response.clone();
            
            // Add cache timestamp header
            const headers = new Headers(responseToCache.headers);
            headers.set('sw-cache-time', Date.now().toString());
            
            const modifiedResponse = new Response(responseToCache.body, {
              status: responseToCache.status,
              statusText: responseToCache.statusText,
              headers: headers
            });
            
            // Cache the response
            caches.open(CACHE_CONFIG.name)
              .then(cache => {
                cache.put(request, modifiedResponse);
                // Limit cache entries
                CacheManager.limitCacheEntries();
              });
            
            return response;
          })
          .catch(() => {
            // If both cache and network fail, return a fallback
            if (request.destination === 'document') {
              return caches.match('./index.html');
            }
            return new Response('Offline', { status: 503 });
          });
      })
  );
});

// Message event - handle client messages
self.addEventListener('message', (event) => {
  const { data } = event;
  
  switch (data.type) {
    case 'CHECK_UPDATE':
      UpdateManager.checkForUpdates().then(hasUpdate => {
        event.ports[0].postMessage({ hasUpdate });
      });
      break;
      
    case 'FORCE_UPDATE':
      UpdateManager.forceUpdate();
      break;
      
    case 'CLEAR_CACHE':
      CacheManager.cleanOldCaches().then(() => {
        event.ports[0].postMessage({ success: true });
      });
      break;
      
    case 'GET_CACHE_INFO':
      caches.open(CACHE_CONFIG.name).then(cache => {
        cache.keys().then(requests => {
          event.ports[0].postMessage({
            cacheName: CACHE_CONFIG.name,
            version: CACHE_CONFIG.version,
            entryCount: requests.length,
            maxEntries: CACHE_CONFIG.maxEntries
          });
        });
      });
      break;
  }
});

// Background sync (when available)
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('Service Worker: Background sync triggered');
    // Implement background sync logic here
  }
});

// Push notification (when available)
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'No payload',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };
  
  event.waitUntil(
    self.registration.showNotification('PWA Template', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked');
  event.notification.close();
  
  if (event.action === 'update') {
    // Handle update action
    UpdateManager.forceUpdate();
  } else {
    // Default action - open app
    event.waitUntil(
      clients.openWindow('./')
    );
  }
});

// Periodic cache maintenance
setInterval(() => {
  CacheManager.cleanExpiredEntries();
  CacheManager.limitCacheEntries();
}, 60 * 60 * 1000); // Every hour
