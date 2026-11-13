import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

import type { WrapVehicle } from '@/config/wrap';
import { cn } from '@/lib/utils';
import type { CarScene } from '@/lib/wrap/car-scene';

export interface CarPreviewHandle {
  /** Re-upload the wrap canvas after drawing into it. */
  refresh(): void;
  resetView(): void;
  /** PNG data URL of the current frame, or null before the scene is ready. */
  snapshot(): string | null;
}

export interface CarPreviewProps {
  vehicle: Pick<WrapVehicle, 'body' | 'zones' | 'slug'>;
  /** Canvas or image painted onto the body; null shows the bare paint. */
  wrap?: HTMLCanvasElement | HTMLImageElement | null;
  paint?: string;
  autoRotate?: boolean;
  interactive?: boolean;
  zoom?: boolean;
  azimuth?: number;
  elevation?: number;
  distance?: number;
  /** Static picture shown until WebGL is ready (and if it never is). */
  poster?: string;
  label?: string;
  className?: string;
  onReady?: () => void;
}

/**
 * Live 3D car. three.js is loaded on demand in the browser, so it never
 * reaches the server bundle and pages render (with the poster) before it
 * arrives.
 */
export const CarPreview = forwardRef<CarPreviewHandle, CarPreviewProps>(
  function CarPreview(
    {
      vehicle,
      wrap = null,
      paint,
      autoRotate = false,
      interactive = true,
      zoom = false,
      azimuth,
      elevation,
      distance,
      poster,
      label,
      className,
      onReady,
    },
    ref
  ) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const sceneRef = useRef<CarScene | null>(null);
    const wrapRef = useRef(wrap);
    wrapRef.current = wrap;
    const onReadyRef = useRef(onReady);
    onReadyRef.current = onReady;
    const [ready, setReady] = useState(false);
    const [failed, setFailed] = useState(false);

    useImperativeHandle(ref, () => ({
      refresh: () => sceneRef.current?.refreshWrap(),
      resetView: () => sceneRef.current?.resetView(),
      snapshot: () => {
        const scene = sceneRef.current;
        const canvas = canvasRef.current;
        if (!scene || !canvas) return null;
        scene.render();
        return canvas.toDataURL('image/png');
      },
    }));

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      let cancelled = false;
      let observer: ResizeObserver | null = null;
      setReady(false);

      import('@/lib/wrap/car-scene')
        .then(({ createCarScene }) => {
          if (cancelled) return;
          const scene = createCarScene(canvas, {
            body: vehicle.body,
            zones: vehicle.zones,
            interactive,
            autoRotate,
            zoom,
            azimuth,
            elevation,
            distance,
            paint,
          });
          sceneRef.current = scene;
          scene.setWrap(wrapRef.current);
          observer = new ResizeObserver(() => scene.resize());
          observer.observe(canvas);
          setReady(true);
          onReadyRef.current?.();
        })
        .catch(() => {
          if (!cancelled) setFailed(true);
        });

      return () => {
        cancelled = true;
        observer?.disconnect();
        sceneRef.current?.dispose();
        sceneRef.current = null;
      };
      // The scene is rebuilt only when the vehicle or camera preset changes.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [vehicle.slug, interactive, zoom, azimuth, elevation, distance]);

    useEffect(() => {
      sceneRef.current?.setWrap(wrap);
    }, [wrap]);

    useEffect(() => {
      sceneRef.current?.setAutoRotate(autoRotate);
    }, [autoRotate]);

    useEffect(() => {
      if (paint) sceneRef.current?.setPaint(paint);
    }, [paint]);

    return (
      <div className={cn('relative h-full w-full select-none', className)}>
        {poster && (!ready || failed) ? (
          <img
            src={poster}
            alt=""
            className="pointer-events-none absolute inset-0 h-full w-full object-contain"
          />
        ) : null}
        <canvas
          ref={canvasRef}
          role="img"
          aria-label={label}
          className={cn(
            'block h-full w-full touch-none transition-opacity duration-500',
            ready ? 'opacity-100' : 'opacity-0',
            interactive && 'cursor-grab active:cursor-grabbing'
          )}
        />
      </div>
    );
  }
);