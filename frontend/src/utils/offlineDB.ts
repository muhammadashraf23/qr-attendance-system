/**
 * IndexedDB helpers for offline attendance capture.
 * Records are saved locally and synced automatically when connectivity is restored.
 */

const DB_NAME = 'AttendzoOffline';
const DB_VERSION = 1;

export interface OfflineRecord {
  id?: number;
  member_id?: string;
  employee_id?: string;
  roll_number?: string;
  method: string;
  action?: 'checkin' | 'checkout' | string;
  timestamp?: string;
  date?: string;
  latitude?: number;
  longitude?: number;
  saved_at?: string;
  [key: string]: any;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return reject(new Error('Window undefined'));
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = (e: any) => {
      const db = e.target.result as IDBDatabase;
      if (!db.objectStoreNames.contains('pendingAttendance')) {
        db.createObjectStore('pendingAttendance', { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('auth')) {
        db.createObjectStore('auth', { keyPath: 'key' });
      }
    };

    req.onsuccess = (e: any) => resolve(e.target.result);
    req.onerror = (e: any) => reject(e.target.error);
  });
}

export async function saveTokenToIDB(token: string): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction('auth', 'readwrite');
    const store = tx.objectStore('auth');
    store.put({ key: 'jwt_token', token });
  } catch (err) {
    console.warn('Could not cache token in IDB', err);
  }
}

export async function getTokenFromIDB(): Promise<string | null> {
  try {
    const db = await openDB();
    const tx = db.transaction('auth', 'readonly');
    const store = tx.objectStore('auth');
    return new Promise((resolve) => {
      const req = store.get('jwt_token');
      req.onsuccess = () => resolve(req.result?.token || null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

export async function savePendingRecord(record: OfflineRecord): Promise<number> {
  const db = await openDB();
  const tx = db.transaction('pendingAttendance', 'readwrite');
  const store = tx.objectStore('pendingAttendance');
  return new Promise((resolve, reject) => {
    const req = store.add({ ...record, saved_at: new Date().toISOString() });
    req.onsuccess = () => resolve(req.result as number);
    req.onerror = () => reject(req.error);
  });
}

export async function getPendingRecords(): Promise<OfflineRecord[]> {
  const db = await openDB();
  const tx = db.transaction('pendingAttendance', 'readonly');
  const store = tx.objectStore('pendingAttendance');
  return new Promise((resolve, reject) => {
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result as OfflineRecord[]);
    req.onerror = () => reject(req.error);
  });
}

export async function clearPendingRecords(): Promise<void> {
  const db = await openDB();
  const tx = db.transaction('pendingAttendance', 'readwrite');
  const store = tx.objectStore('pendingAttendance');
  return new Promise((resolve, reject) => {
    const req = store.clear();
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function pendingCount(): Promise<number> {
  try {
    const records = await getPendingRecords();
    return records.length;
  } catch {
    return 0;
  }
}
