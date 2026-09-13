/**
 * IndexedDB helpers for offline attendance capture.
 * Field workers may have no internet — records are saved locally
 * and synced automatically when connectivity is restored.
 */

const DB_NAME    = 'ManikstAgroOffline';
const DB_VERSION = 1;

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('pendingAttendance')) {
        db.createObjectStore('pendingAttendance', { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('auth')) {
        db.createObjectStore('auth', { keyPath: 'key' });
      }
    };

    req.onsuccess = (e) => resolve(e.target.result);
    req.onerror   = (e) => reject(e.target.error);
  });
}

/** Save a pending attendance record to IndexedDB */
export async function savePendingRecord(record) {
  const db    = await openDB();
  const tx    = db.transaction('pendingAttendance', 'readwrite');
  const store = tx.objectStore('pendingAttendance');
  return new Promise((resolve, reject) => {
    const req = store.add({ ...record, saved_at: new Date().toISOString() });
    req.onsuccess = () => resolve(req.result);
    req.onerror   = () => reject(req.error);
  });
}

/** Get all pending offline records */
export async function getPendingRecords() {
  const db    = await openDB();
  const tx    = db.transaction('pendingAttendance', 'readonly');
  const store = tx.objectStore('pendingAttendance');
  return new Promise((resolve, reject) => {
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror   = () => reject(req.error);
  });
}

/** Clear all synced records */
export async function clearPendingRecords() {
  const db    = await openDB();
  const tx    = db.transaction('pendingAttendance', 'readwrite');
  const store = tx.objectStore('pendingAttendance');
  return new Promise((resolve, reject) => {
    const req = store.clear();
    req.onsuccess = () => resolve();
    req.onerror   = () => reject(req.error);
  });
}

/** Save auth token to IDB (for SW background sync) */
export async function saveTokenToIDB(token) {
  const db    = await openDB();
  const tx    = db.transaction('auth', 'readwrite');
  const store = tx.objectStore('auth');
  return new Promise((resolve, reject) => {
    const req = store.put({ key: 'token', value: token });
    req.onsuccess = () => resolve();
    req.onerror   = () => reject(req.error);
  });
}

/** Count pending records */
export async function pendingCount() {
  const records = await getPendingRecords();
  return records.length;
}
