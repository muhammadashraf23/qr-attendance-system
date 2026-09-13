// public/sw.js — Attendzo Service Worker
const CACHE_NAME = 'attendzo-v1';
const OFFLINE_URLS = ['/', '/attend', '/employee', '/offline.html'];

// ─── Install: cache shell assets ────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(OFFLINE_URLS))
  );
  self.skipWaiting();
});

// ─── Activate: clean old caches ─────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ─── Fetch: network-first, fall back to cache ───────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // API calls: network only — don't cache
  if (request.url.includes('/api/')) {
    event.respondWith(fetch(request).catch(() =>
      new Response(JSON.stringify({ success: false, error: 'OFFLINE', message: 'No internet connection.' }),
        { headers: { 'Content-Type': 'application/json' } })
    ));
    return;
  }

  // Navigation: network first, fall back to cache
  event.respondWith(
    fetch(request)
      .then(response => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
        return response;
      })
      .catch(() => caches.match(request).then(cached => cached || caches.match('/offline.html')))
  );
});

// ─── Background Sync: send pending offline attendance ───────
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-attendance') {
    event.waitUntil(syncPendingAttendance());
  }
});

async function syncPendingAttendance() {
  // Open IndexedDB to get pending records
  const db = await openIDB();
  const tx  = db.transaction('pendingAttendance', 'readonly');
  const store = tx.objectStore('pendingAttendance');
  const records = await getAllFromStore(store);

  if (!records.length) return;

  const token = await getTokenFromDB(db);
  if (!token) return;

  try {
    const response = await fetch('/api/attendance/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ records }),
    });

    if (response.ok) {
      // Clear synced records
      const clearTx = db.transaction('pendingAttendance', 'readwrite');
      clearTx.objectStore('pendingAttendance').clear();
    }
  } catch (e) {
    console.error('[SW] Sync failed:', e);
  }
}

function openIDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('AttendzoOffline', 1);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('pendingAttendance'))
        db.createObjectStore('pendingAttendance', { keyPath: 'id', autoIncrement: true });
      if (!db.objectStoreNames.contains('auth'))
        db.createObjectStore('auth', { keyPath: 'key' });
    };
    req.onsuccess  = (e) => resolve(e.target.result);
    req.onerror    = (e) => reject(e.target.error);
  });
}

function getAllFromStore(store) {
  return new Promise((resolve, reject) => {
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror   = () => reject(req.error);
  });
}

async function getTokenFromDB(db) {
  return new Promise((resolve) => {
    const tx  = db.transaction('auth', 'readonly');
    const req = tx.objectStore('auth').get('token');
    req.onsuccess = () => resolve(req.result?.value || null);
    req.onerror   = () => resolve(null);
  });
}
