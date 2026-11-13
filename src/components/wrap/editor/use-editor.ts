import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { WrapVehicle } from '@/config/wrap';
import {
  assetIds,
  emptyDoc,
  parseDoc,
  type WrapDoc,
} from '@/lib/wrap/doc';
import type { WrapAsset } from '@/lib/wrap/render';
import {
  assetStore,
  autosaveStore,
  blobToImage,
  prepareImage,
  type StoredAsset,
} from '@/lib/wrap/storage';

export type EditorTool = 'select' | 'text' | 'draw' | 'rect' | 'fill';

export interface LibraryItem {
  id: string;
  name: string;
  url: string;
  width: number;
  height: number;
  source: StoredAsset['source'];
}

const HISTORY_LIMIT = 60;

/**
 * Document state for the designer: undo/redo history, the image library
 * (IndexedDB-backed) and the per-vehicle autosave.
 */
export function useWrapEditor(vehicle: WrapVehicle) {
  const [doc, setDoc] = useState<WrapDoc>(() => emptyDoc(vehicle));
  const docRef = useRef(doc);
  const past = useRef<WrapDoc[]>([]);
  const future = useRef<WrapDoc[]>([]);
  const gesture = useRef<WrapDoc | null>(null);
  const [, bump] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tool, setTool] = useState<EditorTool>('select');
  const [ready, setReady] = useState(false);

  const assets = useRef(new Map<string, WrapAsset>());
  const [assetsVersion, setAssetsVersion] = useState(0);
  const [library, setLibrary] = useState<LibraryItem[]>([]);

  const write = useCallback((next: WrapDoc) => {
    docRef.current = next;
    setDoc(next);
  }, []);

  const pushPast = useCallback((snapshot: WrapDoc) => {
    past.current.push(snapshot);
    if (past.current.length > HISTORY_LIMIT) past.current.shift();
    future.current = [];
    bump((n) => n + 1);
  }, []);

  /** One undoable change. */
  const commit = useCallback(
    (next: WrapDoc | ((doc: WrapDoc) => WrapDoc)) => {
      const current = docRef.current;
      const value = typeof next === 'function' ? next(current) : next;
      if (value === current) return;
      pushPast(current);
      write(value);
    },
    [pushPast, write]
  );

  /** A drag: many `preview` writes between `begin` and `end` undo as one. */
  const begin = useCallback(() => {
    gesture.current = docRef.current;
  }, []);
  const preview = useCallback(
    (next: WrapDoc | ((doc: WrapDoc) => WrapDoc)) => {
      write(typeof next === 'function' ? next(docRef.current) : next);
    },
    [write]
  );
  const end = useCallback(() => {
    const start = gesture.current;
    gesture.current = null;
    if (start && start !== docRef.current) pushPast(start);
  }, [pushPast]);

  const undo = useCallback(() => {
    const previous = past.current.pop();
    if (!previous) return;
    future.current.push(docRef.current);
    write(previous);
    bump((n) => n + 1);
  }, [write]);

  const redo = useCallback(() => {
    const next = future.current.pop();
    if (!next) return;
    past.current.push(docRef.current);
    write(next);
    bump((n) => n + 1);
  }, [write]);

  const getAsset = useCallback((id: string) => assets.current.get(id), []);

  const loadAssets = useCallback(async (target: WrapDoc) => {
    const missing = assetIds(target).filter((id) => !assets.current.has(id));
    if (!missing.length) return;
    await Promise.all(
      missing.map(async (id) => {
        try {
          const stored = await assetStore.get(id);
          if (stored) assets.current.set(id, await blobToImage(stored.blob));
        } catch {
          // The image is gone: the layer simply draws nothing.
        }
      })
    );
    setAssetsVersion((n) => n + 1);
  }, []);

  /** Replaces the document (open a saved design, start over). */
  const load = useCallback(
    (next: WrapDoc, options: { undoable?: boolean } = {}) => {
      const sized: WrapDoc = {
        ...next,
        vehicle: vehicle.slug,
        width: vehicle.width,
        height: vehicle.height,
      };
      if (options.undoable) pushPast(docRef.current);
      else {
        past.current = [];
        future.current = [];
        bump((n) => n + 1);
      }
      setSelectedId(null);
      write(sized);
      void loadAssets(sized);
    },
    [loadAssets, pushPast, vehicle, write]
  );

  const registerAsset = useCallback((id: string, asset: WrapAsset) => {
    assets.current.set(id, asset);
    setAssetsVersion((n) => n + 1);
  }, []);

  /** Stores an image in the library and returns it ready to draw. */
  const addImage = useCallback(
    async (
      file: Blob,
      name: string,
      source: StoredAsset['source']
    ): Promise<LibraryItem> => {
      const prepared = await prepareImage(file);
      const id = `asset_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
      const image = await blobToImage(prepared.blob);
      assets.current.set(id, image);
      setAssetsVersion((n) => n + 1);
      const item: LibraryItem = {
        id,
        name,
        url: URL.createObjectURL(prepared.blob),
        width: prepared.width,
        height: prepared.height,
        source,
      };
      setLibrary((items) => [item, ...items]);
      try {
        await assetStore.put({
          id,
          name,
          blob: prepared.blob,
          width: prepared.width,
          height: prepared.height,
          source,
          createdAt: Date.now(),
        });
      } catch {
        // Private mode or a full disk: the image still works this session.
      }
      return item;
    },
    []
  );

  const ensureAsset = useCallback(async (item: LibraryItem) => {
    if (assets.current.has(item.id)) return;
    const stored = await assetStore.get(item.id);
    if (!stored) return;
    assets.current.set(item.id, await blobToImage(stored.blob));
    setAssetsVersion((n) => n + 1);
  }, []);

  const removeFromLibrary = useCallback((id: string) => {
    setLibrary((items) => {
      const item = items.find((i) => i.id === id);
      if (item) URL.revokeObjectURL(item.url);
      return items.filter((i) => i.id !== id);
    });
    void assetStore.remove(id).catch(() => undefined);
  }, []);

  // Restore the library and this vehicle's autosave.
  useEffect(() => {
    let cancelled = false;
    const urls: string[] = [];
    (async () => {
      try {
        const stored = await assetStore.list();
        if (cancelled) return;
        setLibrary(
          stored.map((a) => {
            const url = URL.createObjectURL(a.blob);
            urls.push(url);
            return {
              id: a.id,
              name: a.name,
              url,
              width: a.width,
              height: a.height,
              source: a.source,
            };
          })
        );
      } catch {
        // No IndexedDB: the library starts empty.
      }
      try {
        const saved = await autosaveStore.get(vehicle.slug);
        const restored = saved ? parseDoc(saved.doc) : null;
        if (!cancelled && restored && restored.layers.length) {
          load(restored);
        }
      } catch {
        // Nothing to restore.
      }
      if (!cancelled) setReady(true);
    })();
    return () => {
      cancelled = true;
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
    // Runs once per vehicle.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicle.slug]);

  useEffect(() => {
    if (!ready) return;
    const timer = setTimeout(() => {
      void autosaveStore.put(vehicle.slug, doc).catch(() => undefined);
    }, 600);
    return () => clearTimeout(timer);
  }, [doc, ready, vehicle.slug]);

  const selected = useMemo(
    () => doc.layers.find((l) => l.id === selectedId) ?? null,
    [doc, selectedId]
  );

  return {
    doc,
    docRef,
    ready,
    selected,
    selectedId,
    setSelectedId,
    tool,
    setTool,
    commit,
    begin,
    preview,
    end,
    undo,
    redo,
    canUndo: past.current.length > 0,
    canRedo: future.current.length > 0,
    load,
    getAsset,
    assetsVersion,
    registerAsset,
    library,
    addImage,
    ensureAsset,
    removeFromLibrary,
  };
}

export type WrapEditorApi = ReturnType<typeof useWrapEditor>;