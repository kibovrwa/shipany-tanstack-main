import type { WrapDoc } from './doc';

/**
 * Browser-side persistence for the designer (IndexedDB): saved designs, the
 * per-vehicle autosave and the uploaded/generated image library. Nothing
 * here leaves the device.
 */
const DB_NAME = 'wrap-studio';
const DB_VERSION = 1;

export interface SavedDesign {
  id: string;
  name: string;
  vehicle: string;
  doc: WrapDoc;
  thumb: string;
  updatedAt: number;
}

export interface StoredAsset {
  id: string;
  name: string;
  blob: Blob;
  width: number;
  height: number;
  source: 'upload' | 'ai';
  createdAt: number;
}

interface Autosave {
  vehicle: string;
  doc: WrapDoc;
  updatedAt: number;
}

let dbPromise: Promise<IDBDatabase> | null = null;

function open(): Promise<IDBDatabase> {
  if (typeof indexedDB === 'undefined') {
    return Promise.reject(new Error('IndexedDB unavailable'));
  }
  dbPromise ??= new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('designs')) {
        db.createObjectStore('designs', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('assets')) {
        db.createObjectStore('assets', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('autosave')) {
        db.createObjectStore('autosave', { keyPath: 'vehicle' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => {
      dbPromise = null;
      reject(request.error);
    };
  });
  return dbPromise;
}

function run<T>(
  store: string,
  mode: IDBTransactionMode,
  action: (s: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
  return open().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const request = action(db.transaction(store, mode).objectStore(store));
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      })
  );
}

export const designStore = {
  list: () =>
    run<SavedDesign[]>('designs', 'readonly', (s) => s.getAll()).then((all) =>
      all.sort((a, b) => b.updatedAt - a.updatedAt)
    ),
  put: (design: SavedDesign) =>
    run('designs', 'readwrite', (s) => s.put(design)).then(() => undefined),
  remove: (id: string) =>
    run('designs', 'readwrite', (s) => s.delete(id)).then(() => undefined),
};

export const assetStore = {
  list: () =>
    run<StoredAsset[]>('assets', 'readonly', (s) => s.getAll()).then((all) =>
      all.sort((a, b) => b.createdAt - a.createdAt)
    ),
  get: (id: string) =>
    run<StoredAsset | undefined>('assets', 'readonly', (s) => s.get(id)),
  put: (asset: StoredAsset) =>
    run('assets', 'readwrite', (s) => s.put(asset)).then(() => undefined),
  remove: (id: string) =>
    run('assets', 'readwrite', (s) => s.delete(id)).then(() => undefined),
};

export const autosaveStore = {
  get: (vehicle: string) =>
    run<Autosave | undefined>('autosave', 'readonly', (s) => s.get(vehicle)),
  put: (vehicle: string, doc: WrapDoc) =>
    run('autosave', 'readwrite', (s) =>
      s.put({ vehicle, doc, updatedAt: Date.now() } satisfies Autosave)
    ).then(() => undefined),
  remove: (vehicle: string) =>
    run('autosave', 'readwrite', (s) => s.delete(vehicle)).then(() => undefined),
};

/** Decodes an image file, downscaled so the library stays small. */
export async function prepareImage(
  file: Blob,
  maxEdge = 2048
): Promise<{ blob: Blob; width: number; height: number }> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  if (scale === 1) {
    const size = { width: bitmap.width, height: bitmap.height };
    bitmap.close();
    return { blob: file, ...size };
  }
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('encode failed'))),
      'image/png'
    )
  );
  return { blob, width: canvas.width, height: canvas.height };
}

export function blobToImage(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Image failed to load'));
    };
    image.src = url;
  });
}