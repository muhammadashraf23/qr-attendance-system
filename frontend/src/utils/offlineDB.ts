/**
 * IndexedDB helpers for offline attendance capture.
 * Records are saved locally and synced automatically when connectivity is restored.
 */

const DB_NAME = 'AttendzoOffline';
const DB_VERSION = 1;

export interface OfflineRecord {
  id?: number;
  employee_id?: string;
  roll_number?: string;
  method: string;
  action: 'checkin' | 'checkout';
  timestamp: string;
  latitude?: number;
  longitude?: number;
  saved_at?: string;
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
