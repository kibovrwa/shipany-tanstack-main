import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react';

import {
  addLayer,
  hitTest,
  isFill,
  pathLayer,
  setBaseFill,
  shapeLayer,
  textLayer,
  toLocal,
  updateLayer,
  type WrapLayer,
} from '@/lib/wrap/doc';
import {
  composeView,
  fitText,
  renderArt,
  type WrapTemplate,
} from '@/lib/wrap/render';

import type { WrapEditorApi } from './use-editor';

export interface StageHandle {
  zoomBy(factor: number): void;
  fit(): void;
  /** The artwork without template or guides, at template resolution. */
  art(): HTMLCanvasElement | null;
}

export interface StageProps {
  editor: WrapEditorApi;
  template: WrapTemplate | null;
  clip: boolean;
  guides: boolean;
  color: string;
  brush: number;
  /** Names given to layers the stage creates. */
  names: { text: string; textValue: string; drawing: string; shape: string; fill: string };
  onZoom(percent: number): void;
  /** Called after every repaint with the artwork canvas. */
  onArt(art: HTMLCanvasElement): void;
  /** Space reserved for floating chrome, so "fit" centres in what is left. */
  insets?: { left: number; right: number; top: number; bottom: number };
  label: string;
}

interface View {
  scale: number;
  tx: number;
  ty: number;
}

type Drag =
  | { kind: 'pan'; x: number; y: number; view: View; moved: boolean }
  | { kind: 'move'; id: string; dx: number; dy: number }
  | { kind: 'resize'; layer: WrapLayer; start: number }
  | { kind: 'rotate'; layer: WrapLayer; offset: number }
  | { kind: 'draw'; points: number[]; id: string | null }
  | { kind: 'shape'; x: number; y: number; id: string | null };

const MIN_SCALE = 0.1;
const MAX_SCALE = 8;
const HANDLES = ['nw', 'ne', 'se', 'sw'] as const;

export const CanvasStage = forwardRef<StageHandle, StageProps>(
  function CanvasStage(
    {
      editor,
      template,
      clip,
      guides,
      color,
      brush,
      names,
      onZoom,
      onArt,
      insets,
      label,
    },
    ref
  ) {
    const { doc, docRef, selected, tool } = editor;
    const hostRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const artRef = useRef<HTMLCanvasElement | null>(null);
    const [view, setView] = useState<View>({ scale: 0.45, tx: 0, ty: 0 });
    const viewRef = useRef(view);
    viewRef.current = view;
    const drag = useRef<Drag | null>(null);
    const pointers = useRef(new Map<number, { x: number; y: number }>());
    const pinch = useRef<{ dist: number; view: View; cx: number; cy: number } | null>(
      null
    );
    const fitted = useRef(false);
    const onArtRef = useRef(onArt);
    onArtRef.current = onArt;
    const insetsRef = useRef(insets);
    insetsRef.current = insets;

    const fit = useCallback(() => {
      const host = hostRef.current;
      if (!host) return;
      const pad = insetsRef.current ?? { left: 0, right: 0, top: 0, bottom: 0 };
      const availW = Math.max(120, host.clientWidth - pad.left - pad.right);
      const availH = Math.max(120, host.clientHeight - pad.top - pad.bottom);
      const { width, height } = docRef.current;
      const scale = Math.min((availW * 0.92) / width, (availH * 0.82) / height);
      setView({
        scale,
        tx: pad.left + (availW - width * scale) / 2,
        ty: pad.top + (availH - height * scale) / 2,
      });
    }, [docRef]);

    const zoomAt = useCallback((factor: number, px?: number, py?: number) => {
      const host = hostRef.current;
      if (!host) return;
      setView((v) => {
        const scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, v.scale * factor));
        const cx = px ?? host.clientWidth / 2;
        const cy = py ?? host.clientHeight / 2;
        const k = scale / v.scale;
        return { scale, tx: cx - (cx - v.tx) * k, ty: cy - (cy - v.ty) * k };
      });
    }, []);

    useImperativeHandle(ref, () => ({
      zoomBy: (factor) => zoomAt(factor),
      fit,
      art: () => artRef.current,
    }));

    useLayoutEffect(() => {
      if (fitted.current) return;
      const host = hostRef.current;
      if (!host || !host.clientWidth) return;
      fitted.current = true;
      fit();
    });

    useEffect(() => {
      fitted.current = false;
    }, [doc.width, doc.height]);

    useEffect(() => {
      onZoom(Math.round(view.scale * 100));
    }, [onZoom, view.scale]);

    // Repaint: artwork first, then the on-screen composition.
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      let art = artRef.current;
      if (!art || art.width !== doc.width || art.height !== doc.height) {
        art = document.createElement('canvas');
        art.width = doc.width;
        art.height = doc.height;
        artRef.current = art;
      }
      renderArt(art.getContext('2d')!, doc, editor.getAsset);
      composeView(canvas.getContext('2d')!, art, template, { clip, guides });
      onArtRef.current(art);
    }, [doc, template, clip, guides, editor.assetsVersion, editor.getAsset]);

    // Wheel zoom needs a non-passive listener to stop the page from scrolling.
    useEffect(() => {
      const host = hostRef.current;
      if (!host) return;
      const onWheel = (e: WheelEvent) => {
        e.preventDefault();
        const rect = host.getBoundingClientRect();
        if (e.ctrlKey || e.metaKey || Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
          zoomAt(Math.exp(-e.deltaY * 0.0015), e.clientX - rect.left, e.clientY - rect.top);
        } else {
          setView((v) => ({ ...v, tx: v.tx - e.deltaX, ty: v.ty - e.deltaY }));
        }
      };
      host.addEventListener('wheel', onWheel, { passive: false });
      return () => host.removeEventListener('wheel', onWheel);
    }, [zoomAt]);

    const point = (e: { clientX: number; clientY: number }) => {
      const rect = hostRef.current!.getBoundingClientRect();
      const v = viewRef.current;
      const sx = e.clientX - rect.left;
      const sy = e.clientY - rect.top;
      return { sx, sy, x: (sx - v.tx) / v.scale, y: (sy - v.ty) / v.scale };
    };

    function onPointerDown(e: ReactPointerEvent<HTMLDivElement>) {
      if (e.button === 2) return;
      const host = hostRef.current!;
      host.setPointerCapture(e.pointerId);
      pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (pointers.current.size === 2) {
        // Second finger: whatever the first one started becomes a pinch.
        if (drag.current && drag.current.kind !== 'pan') editor.end();
        drag.current = null;
        const [a, b] = [...pointers.current.values()];
        const rect = host.getBoundingClientRect();
        pinch.current = {
          dist: Math.hypot(a.x - b.x, a.y - b.y) || 1,
          view: viewRef.current,
          cx: (a.x + b.x) / 2 - rect.left,
          cy: (a.y + b.y) / 2 - rect.top,
        };
        return;
      }

      const p = point(e);
      const handle = (e.target as HTMLElement).dataset?.handle;
      const current = docRef.current;

      if (e.button === 1 || e.altKey) {
        drag.current = { kind: 'pan', x: e.clientX, y: e.clientY, view: viewRef.current, moved: true };
        return;
      }

      if (handle && selected && !isFill(selected)) {
        editor.begin();
        if (handle === 'rotate') {
          const angle = (Math.atan2(p.y - selected.y, p.x - selected.x) * 180) / Math.PI;
          drag.current = { kind: 'rotate', layer: selected, offset: selected.rotation - angle };
        } else {
          drag.current = {
            kind: 'resize',
            layer: selected,
            start: Math.hypot(p.x - selected.x, p.y - selected.y) || 1,
          };
        }
        return;
      }

      if (tool === 'select') {
        const hit = hitTest(current, p.x, p.y, 6 / viewRef.current.scale);
        if (hit) {
          editor.setSelectedId(hit.id);
          editor.begin();
          drag.current = { kind: 'move', id: hit.id, dx: p.x - hit.x, dy: p.y - hit.y };
        } else {
          drag.current = { kind: 'pan', x: e.clientX, y: e.clientY, view: viewRef.current, moved: false };
        }
        return;
      }

      if (tool === 'fill') {
        editor.commit(setBaseFill(current, names.fill, { kind: 'solid', color }));
        return;
      }

      if (tool === 'text') {
        const layer = fitText({
          ...textLayer(current, names.text, names.textValue, { x: p.x, y: p.y }),
          color,
        });
        editor.commit(addLayer(current, layer));
        editor.setSelectedId(layer.id);
        editor.setTool('select');
        return;
      }

      editor.begin();
      if (tool === 'draw') {
        drag.current = { kind: 'draw', points: [p.x, p.y], id: null };
      } else {
        drag.current = { kind: 'shape', x: p.x, y: p.y, id: null };
      }
    }

    function onPointerMove(e: ReactPointerEvent<HTMLDivElement>) {
      if (!pointers.current.has(e.pointerId)) return;
      pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (pinch.current && pointers.current.size >= 2) {
        const [a, b] = [...pointers.current.values()];
        const rect = hostRef.current!.getBoundingClientRect();
        const start = pinch.current;
        const scale = Math.min(
          MAX_SCALE,
          Math.max(MIN_SCALE, (start.view.scale * Math.hypot(a.x - b.x, a.y - b.y)) / start.dist)
        );
        const cx = (a.x + b.x) / 2 - rect.left;
        const cy = (a.y + b.y) / 2 - rect.top;
        const k = scale / start.view.scale;
        setView({
          scale,
          tx: cx - (start.cx - start.view.tx) * k,
          ty: cy - (start.cy - start.view.ty) * k,
        });
        return;
      }

      const d = drag.current;
      if (!d) return;
      const p = point(e);
      const current = docRef.current;

      switch (d.kind) {
        case 'pan': {
          const dx = e.clientX - d.x;
          const dy = e.clientY - d.y;
          if (!d.moved && Math.hypot(dx, dy) < 3) return;
          d.moved = true;
          setView({ ...d.view, tx: d.view.tx + dx, ty: d.view.ty + dy });
          return;
        }
        case 'move':
          editor.preview(updateLayer(current, d.id, { x: p.x - d.dx, y: p.y - d.dy }));
          return;
        case 'rotate': {
          const angle = (Math.atan2(p.y - d.layer.y, p.x - d.layer.x) * 180) / Math.PI;
          let rotation = angle + d.offset;
          if (e.shiftKey) rotation = Math.round(rotation / 15) * 15;
          rotation = ((((rotation + 180) % 360) + 360) % 360) - 180;
          editor.preview(updateLayer(current, d.layer.id, { rotation }));
          return;
        }
        case 'resize': {
          const { layer } = d;
          const free = (layer.type === 'rect' || layer.type === 'ellipse') && !e.shiftKey;
          if (free) {
            const local = toLocal(layer, p.x, p.y);
            editor.preview(
              updateLayer(current, layer.id, {
                width: Math.max(8, Math.abs(local.x) * 2),
                height: Math.max(8, Math.abs(local.y) * 2),
              })
            );
            return;
          }
          const k = Math.max(0.02, Math.hypot(p.x - layer.x, p.y - layer.y) / d.start);
          editor.preview(
            updateLayer(current, layer.id, {
              width: Math.max(4, layer.width * k),
              height: Math.max(4, layer.height * k),
            })
          );
          return;
        }
        case 'draw': {
          const n = d.points.length;
          if (Math.hypot(p.x - d.points[n - 2], p.y - d.points[n - 1]) < 1.5) return;
          d.points.push(p.x, p.y);
          const base = d.id
            ? { ...current, layers: current.layers.filter((l) => l.id !== d.id) }
            : current;
          const layer = pathLayer(base, names.drawing, d.points, color, brush);
          if (!layer) return;
          if (d.id) layer.id = d.id;
          else d.id = layer.id;
          editor.preview(addLayer(base, layer));
          return;
        }
        case 'shape': {
          const width = Math.abs(p.x - d.x);
          const height = Math.abs(p.y - d.y);
          if (width < 3 && height < 3) return;
          const box = {
            x: (p.x + d.x) / 2,
            y: (p.y + d.y) / 2,
            width: Math.max(4, width),
            height: Math.max(4, height),
          };
          if (d.id) {
            editor.preview(updateLayer(current, d.id, box));
          } else {
            const layer = shapeLayer(current, names.shape, 'rect', box, color);
            d.id = layer.id;
            editor.preview(addLayer(current, layer));
          }
          return;
        }
      }
    }

    function onPointerUp(e: ReactPointerEvent<HTMLDivElement>) {
      pointers.current.delete(e.pointerId);
      if (pointers.current.size < 2) pinch.current = null;
      const d = drag.current;
      drag.current = null;
      if (!d) return;
      const current = docRef.current;

      if (d.kind === 'pan') {
        if (!d.moved) editor.setSelectedId(null);
        return;
      }
      if (d.kind === 'draw' && !d.id) {
        // A tap with the pencil leaves a dot.
        const [x, y] = d.points;
        const layer = pathLayer(current, names.drawing, [x, y, x + 0.01, y + 0.01], color, brush);
        if (layer) editor.preview(addLayer(current, layer));
      }
      if (d.kind === 'shape') {
        if (!d.id) {
          const size = Math.min(current.width, current.height) * 0.2;
          const layer = shapeLayer(
            current,
            names.shape,
            'rect',
            { x: d.x, y: d.y, width: size, height: size },
            color
          );
          d.id = layer.id;
          editor.preview(addLayer(current, layer));
        }
        editor.setSelectedId(d.id);
        editor.setTool('select');
      }
      if (d.kind === 'resize' && d.layer.type === 'text') {
        const layer = docRef.current.layers.find((l) => l.id === d.layer.id);
        if (layer?.type === 'text') {
          editor.preview(updateLayer(docRef.current, layer.id, fitText(layer)));
        }
      }
      editor.end();
    }

    const cursor =
      tool === 'select' ? 'default' : tool === 'text' ? 'text' : 'crosshair';

    const box =
      selected && !isFill(selected) && selected.visible
        ? {
            left: view.tx + selected.x * view.scale,
            top: view.ty + selected.y * view.scale,
            width: Math.max(1, selected.width * view.scale),
            height: Math.max(1, selected.height * view.scale),
            rotation: selected.rotation,
          }
        : null;

    return (
      <div
        ref={hostRef}
        role="application"
        aria-label={label}
        className="wrap-checker absolute inset-0 touch-none overflow-hidden select-none"
        style={{ cursor }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onContextMenu={(e) => e.preventDefault()}
      >
        <div
          className="absolute top-0 left-0 origin-top-left"
          style={{
            width: doc.width,
            height: doc.height,
            transform: `translate(${view.tx}px, ${view.ty}px) scale(${view.scale})`,
          }}
        >
          <canvas
            ref={canvasRef}
            width={doc.width}
            height={doc.height}
            className="block h-full w-full"
          />
        </div>
        <div
          className="pointer-events-none absolute border border-dashed border-neutral-400/70 dark:border-neutral-500/70"
          style={{
            left: view.tx,
            top: view.ty,
            width: doc.width * view.scale,
            height: doc.height * view.scale,
          }}
        />
        {box ? (
          <div
            className="pointer-events-none absolute"
            style={{
              left: box.left,
              top: box.top,
              width: box.width,
              height: box.height,
              transform: `translate(-50%, -50%) rotate(${box.rotation}deg)`,
            }}
          >
            <div className="absolute inset-0 border-[1.5px] border-blue-500" />
            {selected?.locked ? null : (
              <>
                {HANDLES.map((h) => (
                  <span
                    key={h}
                    data-handle={h}
                    className="pointer-events-auto absolute size-3 rounded-[3px] border-[1.5px] border-blue-500 bg-white"
                    style={{
                      left: h.includes('w') ? -6 : undefined,
                      right: h.includes('e') ? -6 : undefined,
                      top: h.includes('n') ? -6 : undefined,
                      bottom: h.includes('s') ? -6 : undefined,
                      cursor: h === 'nw' || h === 'se' ? 'nwse-resize' : 'nesw-resize',
                    }}
                  />
                ))}
                <span className="absolute -top-6 left-1/2 h-6 w-px -translate-x-1/2 bg-blue-500" />
                <span
                  data-handle="rotate"
                  className="pointer-events-auto absolute -top-9 left-1/2 size-3.5 -translate-x-1/2 cursor-grab rounded-full border-[1.5px] border-blue-500 bg-white"
                />
              </>
            )}
          </div>
        ) : null}
      </div>
    );
  }
);