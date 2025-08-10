// Service Worker for 가로수길 스케줄 스왑 PWA
const CACHE_NAME = 'shift-swap-v1';
const urlsToCache = [
  '/',
  '/css/styles.css',
  '/js/firebase-config.js',
  '/js/firebase-app.js',
  '/manifest.json'
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
  );
});

// Push notification event
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : '새로운 거래가 등록되었습니다!',
    icon: '/assets/icon-192x192.png',
    badge: '/assets/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: '확인하기',
        icon: '/assets/icon-72x72.png'
      },
      {
        action: 'close',
        title: '닫기',
        icon: '/assets/icon-72x72.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('가로수길 스케줄 스왑', options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});
