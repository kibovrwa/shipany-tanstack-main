import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import {
  Box,
  Camera,
  ChevronDown,
  Download,
  Ellipsis,
  FolderOpen,
  History,
  Images,
  Layers,
  LayoutTemplate,
  Maximize,
  MousePointer2,
  PaintBucket,
  Palette,
  Pencil,
  RectangleHorizontal,
  Redo2,
  RotateCcw,
  RotateCw,
  Save,
  Share2,
  Sparkles,
  Square,
  Type,
  Undo2,
  Upload,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { toast } from 'sonner';

import { Link } from '@/core/i18n/navigation';
import type { WrapVehicle } from '@/config/wrap';
import type { WrapDesign } from '@/config/wrap-gallery';
import { cn } from '@/lib/utils';
import {
  addLayer,
  duplicateLayer,
  emptyDoc,
  imageLayer,
  isFill,
  removeLayer,
  setBaseFill,
  updateLayer,
  WRAP_FONTS,
  type WrapLayer,
  type WrapPaint,
} from '@/lib/wrap/doc';
import { downloadBlob } from '@/lib/wrap/export';
import {
  composeTexture,
  fitText,
  loadTemplate,
  thumbnail,
  type WrapTemplate,
} from '@/lib/wrap/render';
import { designStore } from '@/lib/wrap/storage';
import {
  CarPreview,
  type CarPreviewHandle,
} from '@/components/wrap/car-preview';
import {
  WrapBrandLink,
  WrapLocaleSelect,
  WrapSignIn,
} from '@/components/wrap/site-header';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { CanvasStage, type StageHandle } from './canvas-stage';
import { ExportDialog } from './export-dialog';
import type { EditorAi, EditorLabels } from './labels';
import {
  AiPanel,
  AssetsPanel,
  DesignsPanel,
  GradientPanel,
  HistoryPanel,
  LayersPanel,
  PanelFrame,
  PlatesPanel,
} from './panels';
import { useWrapEditor, type EditorTool } from './use-editor';

export type EditorPanel =
  | 'assets'
  | 'ai'
  | 'history'
  | 'designs'
  | 'gradient'
  | 'plates'
  | 'layers';

export const EDITOR_PANELS: EditorPanel[] = [
  'assets',
  'ai',
  'history',
  'designs',
  'gradient',
  'plates',
  'layers',
];

export interface EditorInitial {
  panel?: EditorPanel;
  prompt?: string;
  fill?: string;
  gradient?: { colors: string[]; angle: number };
  design?: Pick<WrapDesign, 'id' | 'title' | 'recipe'>;
  share?: boolean;
}

export interface WrapEditorProps {
  vehicle: WrapVehicle;
  vehicles: { slug: string; label: string }[];
  vehicleLabel: string;
  templateUrl: string | null;
  gallery: Pick<WrapDesign, 'id' | 'title' | 'recipe'>[];
  labels: EditorLabels;
  ai: EditorAi;
  initial?: EditorInitial;
  galleryHref: string;
  contactHref: string;
  onVehicle(slug: string): void;
}

const BODY_PAINT = '#cfd1d6';

const PANEL_ICONS: Record<EditorPanel, ReactNode> = {
  assets: <Upload className="size-5" />,
  ai: <Sparkles className="size-5" />,
  history: <History className="size-5" />,
  designs: <FolderOpen className="size-5" />,
  gradient: <Palette className="size-5" />,
  plates: <RectangleHorizontal className="size-5" />,
  layers: <Layers className="size-5" />,
};

const TOOLS: { id: EditorTool; icon: ReactNode; key: string }[] = [
  { id: 'select', icon: <MousePointer2 className="size-4" />, key: 'v' },
  { id: 'text', icon: <Type className="size-4" />, key: 't' },
  { id: 'draw', icon: <Pencil className="size-4" />, key: 'p' },
  { id: 'rect', icon: <Square className="size-4" />, key: 'r' },
  { id: 'fill', icon: <PaintBucket className="size-4" />, key: 'f' },
];

const toolButton =
  'flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 disabled:cursor-default disabled:opacity-35 disabled:hover:bg-transparent dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-white';
const toolActive =
  'bg-blue-500 text-white hover:bg-blue-500 hover:text-white dark:bg-blue-500 dark:text-white dark:hover:bg-blue-500';
const floating =
  'border border-neutral-200 bg-white shadow-xl dark:border-neutral-800 dark:bg-neutral-900';
const topButton =
  'inline-flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-neutral-300 px-3 text-sm font-medium whitespace-nowrap text-neutral-900 transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-100 dark:hover:bg-neutral-800';
const topIcon =
  'flex size-9 cursor-pointer items-center justify-center text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-white';

function isTyping(target: EventTarget | null) {
  const el = target as HTMLElement | null;
  if (!el) return false;
  return (
    el.tagName === 'INPUT' ||
    el.tagName === 'TEXTAREA' ||
    el.tagName === 'SELECT' ||
    el.isContentEditable
  );
}

function useDesktop() {
  const [desktop, setDesktop] = useState(true);
  useEffect(() => {
    const query = window.matchMedia('(min-width: 768px)');
    const update = () => setDesktop(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  return desktop;
}

function LayerProps({
  layer,
  labels,
  onChange,
}: {
  layer: WrapLayer;
  labels: EditorLabels;
  onChange(patch: Partial<WrapLayer>, text?: boolean): void;
}) {
  const field =
    'h-8 rounded-md border border-neutral-200 bg-white px-2 text-xs text-neutral-900 outline-none focus:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white';
  const colour =
    'size-8 shrink-0 cursor-pointer rounded-md border border-neutral-200 bg-transparent p-0.5 dark:border-neutral-700';
  return (
    <div
      className={cn(
        floating,
        'flex max-w-[calc(100vw-1.5rem)] flex-wrap items-center gap-2 rounded-xl px-2.5 py-2'
      )}
    >
      {layer.type === 'text' ? (
        <>
          <input
            value={layer.text}
            aria-label={labels.props.text}
            onChange={(e) => onChange({ text: e.target.value }, true)}
            className={cn(field, 'w-36')}
          />
          <select
            value={layer.fontFamily}
            aria-label={labels.props.font}
            onChange={(e) => onChange({ fontFamily: e.target.value }, true)}
            className={cn(field, 'max-w-28')}
          >
            {WRAP_FONTS.map((font) => (
              <option key={font} value={font}>
                {font.replace(' Variable', '')}
              </option>
            ))}
          </select>
          <input
            type="color"
            value={layer.color}
            aria-label={labels.props.color}
            onChange={(e) => onChange({ color: e.target.value })}
            className={colour}
          />
        </>
      ) : null}
      {layer.type === 'rect' || layer.type === 'ellipse' ? (
        <>
          <select
            value={layer.type}
            aria-label={labels.tool.shape}
            onChange={(e) =>
              onChange({ type: e.target.value as 'rect' | 'ellipse' })
            }
            className={field}
          >
            <option value="rect">{labels.props.rectangle}</option>
            <option value="ellipse">{labels.props.ellipse}</option>
          </select>
          <input
            type="color"
            value={layer.fill}
            aria-label={labels.props.color}
            onChange={(e) => onChange({ fill: e.target.value })}
            className={colour}
          />
          {layer.type === 'rect' ? (
            <label className="flex items-center gap-1.5 text-[11px] text-neutral-500 dark:text-neutral-400">
              {labels.props.radius}
              <input
                type="range"
                min={0}
                max={Math.round(Math.min(layer.width, layer.height) / 2)}
                value={layer.radius}
                onChange={(e) => onChange({ radius: Number(e.target.value) })}
                className="w-16 accent-blue-500"
              />
            </label>
          ) : null}
        </>
      ) : null}
      {layer.type === 'path' ? (
        <input
          type="color"
          value={layer.color}
          aria-label={labels.props.color}
          onChange={(e) => onChange({ color: e.target.value })}
          className={colour}
        />
      ) : null}
      <label className="flex items-center gap-1.5 text-[11px] text-neutral-500 dark:text-neutral-400">
        {labels.props.opacity}
        <input
          type="range"
          min={0.05}
          max={1}
          step={0.05}
          value={layer.opacity}
          onChange={(e) => onChange({ opacity: Number(e.target.value) })}
          className="w-16 accent-blue-500"
        />
      </label>
    </div>
  );
}

export function WrapEditor({
  vehicle,
  vehicles,
  vehicleLabel,
  templateUrl,
  gallery,
  labels,
  ai,
  initial,
  galleryHref,
  contactHref,
  onVehicle,
}: WrapEditorProps) {
  const editor = useWrapEditor(vehicle);
  const desktop = useDesktop();
  const stageRef = useRef<StageHandle>(null);
  const previewRef = useRef<CarPreviewHandle>(null);
  const textureRef = useRef<HTMLCanvasElement | null>(null);
  const [texture, setTexture] = useState<HTMLCanvasElement | null>(null);
  const [template, setTemplate] = useState<WrapTemplate | null>(null);
  const [panel, setPanel] = useState<EditorPanel | null>(
    initial?.panel ?? null
  );
  const [guides, setGuides] = useState(true);
  const [color, setColor] = useState('#2563eb');
  const [brush, setBrush] = useState(14);
  const [zoom, setZoom] = useState(45);
  const [previewOpen, setPreviewOpen] = useState(true);
  const [spin, setSpin] = useState(false);
  const [exportOpen, setExportOpen] = useState<false | 'export' | 'share'>(
    initial?.share ? 'share' : false
  );
  const [prompt, setPrompt] = useState(initial?.prompt ?? '');
  const [generating, setGenerating] = useState(false);

  const { selected, docRef, commit, setSelectedId, setTool, undo, redo } =
    editor;

  // The reference opens the AI panel on desktop and keeps phones uncluttered.
  const panelDefaulted = useRef(!!initial?.panel);
  useEffect(() => {
    if (panelDefaulted.current) return;
    panelDefaulted.current = true;
    if (window.matchMedia('(min-width: 768px)').matches) setPanel('ai');
    else setPreviewOpen(false);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setTemplate(null);
    void loadTemplate(vehicle, templateUrl).then((loaded) => {
      if (!cancelled) setTemplate(loaded);
    });
    return () => {
      cancelled = true;
    };
  }, [vehicle, templateUrl]);

  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.width = vehicle.width;
    canvas.height = vehicle.height;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = BODY_PAINT;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    textureRef.current = canvas;
    setTexture(canvas);
  }, [vehicle]);

  const frame = useRef(0);
  const onArt = useCallback((art: HTMLCanvasElement) => {
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const target = textureRef.current;
      if (!target || target.width !== art.width) return;
      composeTexture(target.getContext('2d')!, art, BODY_PAINT);
      previewRef.current?.refresh();
    });
  }, []);
  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  // Deep links (?fill, ?gradient, ?design) are applied once the autosave has
  // been restored, as a normal undoable edit.
  const applied = useRef(false);
  useEffect(() => {
    if (!editor.ready || applied.current || !initial) return;
    applied.current = true;
    let paint: WrapPaint | null = null;
    let name = labels.layers.name.fill;
    if (initial.design) {
      paint = { kind: 'pattern', recipe: initial.design.recipe };
      name = initial.design.title;
    } else if (initial.gradient) {
      paint = { kind: 'gradient', ...initial.gradient };
      name = labels.layers.name.gradient;
    } else if (initial.fill) {
      paint = { kind: 'solid', color: initial.fill };
    }
    if (paint) {
      const value = paint;
      commit((doc) => setBaseFill(doc, name, value));
    }
  }, [editor.ready, initial, commit, labels]);

  const placeCover = useCallback(
    (id: string, name: string, size: { width: number; height: number }) => {
      const doc = docRef.current;
      const layer = imageLayer(doc, name, id, size, { cover: true });
      commit(addLayer(doc, layer));
      setSelectedId(layer.id);
      setTool('select');
    },
    [commit, docRef, setSelectedId, setTool]
  );

  async function generate() {
    const text = prompt.trim();
    if (text.length < 3) {
      toast.error(labels.ai.tooShort);
      return;
    }
    setGenerating(true);
    try {
      const blob = await ai.generate(text);
      const item = await editor.addImage(blob, text.slice(0, 40), 'ai');
      placeCover(item.id, labels.layers.name.ai, item);
      toast.success(labels.ai.done);
    } catch (e) {
      toast.error(e instanceof Error && e.message ? e.message : labels.ai.failed);
    } finally {
      setGenerating(false);
    }
  }

  async function useHistory(item: EditorAi['history'][number]) {
    if (!item.imageUrl) return;
    try {
      const blob = await ai.fetchImage(item.imageUrl);
      const stored = await editor.addImage(
        blob,
        item.prompt.slice(0, 40),
        'ai',
        `ai_${item.id}`
      );
      placeCover(stored.id, labels.layers.name.ai, stored);
    } catch {
      toast.error(labels.history.expired);
    }
  }

  async function saveDesign() {
    const art = stageRef.current?.art();
    const doc = docRef.current;
    try {
      await designStore.put({
        id: `design_${Date.now().toString(36)}`,
        name: `${vehicleLabel} · ${new Date().toLocaleString()}`,
        vehicle: doc.vehicle,
        doc,
        thumb: art ? thumbnail(art) : '',
        updatedAt: Date.now(),
      });
      toast.success(labels.top.saved);
    } catch {
      toast.error(labels.notice.storage);
    }
  }

  function snapshot() {
    const url = previewRef.current?.snapshot();
    if (!url) {
      setPreviewOpen(true);
      return;
    }
    void fetch(url)
      .then((r) => r.blob())
      .then((blob) => downloadBlob(blob, `${vehicle.slug}-preview.png`));
  }

  async function shareLink() {
    const url = window.location.origin + window.location.pathname;
    try {
      if (navigator.share) {
        await navigator.share({ title: document.title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      toast.success(labels.top.linkCopied);
    } catch {
      // The share sheet was dismissed.
    }
  }

  function startOver() {
    if (!window.confirm(labels.top.startOverConfirm)) return;
    commit(emptyDoc(vehicle));
    setSelectedId(null);
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (isTyping(e.target) || exportOpen) return;
      const mod = e.metaKey || e.ctrlKey;
      const key = e.key.toLowerCase();
      const current = editor.selected;
      if (mod && key === 'z') {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
        return;
      }
      if (mod && key === 'y') {
        e.preventDefault();
        redo();
        return;
      }
      if (mod && key === 'd' && current) {
        e.preventDefault();
        const [next, id] = duplicateLayer(docRef.current, current.id);
        commit(next);
        if (!isFill(current)) setSelectedId(id);
        return;
      }
      if (mod || e.altKey) return;
      if ((key === 'delete' || key === 'backspace') && current) {
        e.preventDefault();
        commit((doc) => removeLayer(doc, current.id));
        setSelectedId(null);
        return;
      }
      if (key === 'escape') {
        setSelectedId(null);
        setTool('select');
        return;
      }
      if (key.startsWith('arrow') && current && !current.locked && !isFill(current)) {
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        const dx = key === 'arrowleft' ? -step : key === 'arrowright' ? step : 0;
        const dy = key === 'arrowup' ? -step : key === 'arrowdown' ? step : 0;
        commit((doc) =>
          updateLayer(doc, current.id, { x: current.x + dx, y: current.y + dy })
        );
        return;
      }
      const tool = TOOLS.find((t) => t.key === key);
      if (tool) setTool(tool.id);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [editor.selected, exportOpen, commit, docRef, redo, undo, setSelectedId, setTool]);

  const changeSelected = (patch: Partial<WrapLayer>, text = false) => {
    if (!selected) return;
    commit((doc) => {
      const next = updateLayer(doc, selected.id, patch);
      if (!text) return next;
      const layer = next.layers.find((l) => l.id === selected.id);
      return layer?.type === 'text'
        ? updateLayer(next, layer.id, fitText(layer))
        : next;
    });
  };

  const toolLabels: Record<EditorTool, string> = {
    select: labels.tool.select,
    text: labels.tool.text,
    draw: labels.tool.draw,
    rect: labels.tool.shape,
    fill: labels.tool.fill,
  };
  const rotatable = !!selected && !isFill(selected) && !selected.locked;
  const rotation = rotatable ? Math.round(selected.rotation) : 0;
  const panelOpen = panel !== null;

  const panelTitle = panel
    ? panel === 'ai'
      ? labels.ai.title
      : panel === 'assets'
        ? labels.assets.title
        : panel === 'history'
          ? labels.history.title
          : panel === 'designs'
            ? labels.designs.title
            : panel === 'gradient'
              ? labels.gradient.title
              : panel === 'plates'
                ? labels.plates.title
                : labels.layers.title
    : '';

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-neutral-100 text-neutral-900 dark:bg-neutral-950 dark:text-white">
      <header className="z-30 shrink-0 border-b border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
        <div className="flex h-14 items-center justify-between gap-2 px-3 md:px-4">
          <div className="flex min-w-0 items-center gap-1.5 md:gap-3">
            <WrapBrandLink />
            <span className="hidden text-neutral-300 md:inline dark:text-neutral-600">
              ·
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger
                aria-label={labels.selectVehicle}
                className="flex h-9 min-w-0 items-center gap-1.5 rounded-lg px-2 text-sm font-medium text-neutral-900 transition-colors outline-none select-none hover:bg-neutral-100 dark:text-neutral-100 dark:hover:bg-neutral-800"
              >
                <span className="truncate max-md:max-w-24">{vehicleLabel}</span>
                <ChevronDown className="text-muted-foreground size-4 shrink-0" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-auto min-w-64">
                {vehicles.map((v) => (
                  <DropdownMenuItem
                    key={v.slug}
                    onClick={() => v.slug !== vehicle.slug && onVehicle(v.slug)}
                  >
                    {v.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <button
              type="button"
              onClick={saveDesign}
              className={cn(topButton, 'hidden md:inline-flex')}
            >
              <Save className="size-4" />
              {labels.top.save}
            </button>
          </div>

          <div className="flex shrink-0 items-center gap-1.5 md:gap-2.5">
            <div className="hidden overflow-hidden rounded-lg border border-neutral-300 md:flex dark:border-neutral-700">
              <button
                type="button"
                aria-label={labels.top.snapshot}
                title={labels.top.snapshot}
                onClick={snapshot}
                className={topIcon}
              >
                <Camera className="size-4" />
              </button>
              <button
                type="button"
                aria-label={labels.top.share}
                title={labels.top.share}
                onClick={shareLink}
                className={cn(
                  topIcon,
                  'border-x border-neutral-300 dark:border-neutral-700'
                )}
              >
                <Share2 className="size-4" />
              </button>
              <Link
                href={galleryHref}
                aria-label={labels.top.gallery}
                title={labels.top.gallery}
                className={topIcon}
              >
                <Images className="size-4" />
              </Link>
            </div>
            <button
              type="button"
              onClick={() => setExportOpen('export')}
              aria-label={labels.top.export}
              className="inline-flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-neutral-900 px-2.5 text-sm font-semibold whitespace-nowrap text-white transition-colors hover:bg-neutral-800 md:px-3.5 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
            >
              <Download className="size-4" />
              <span className="max-md:hidden">{labels.top.export}</span>
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger
                aria-label={labels.top.more}
                className="flex size-9 items-center justify-center rounded-lg text-neutral-600 transition-colors outline-none hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-white"
              >
                <Ellipsis className="size-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-auto min-w-48">
                <DropdownMenuItem onClick={saveDesign} className="md:hidden">
                  <Save className="size-4" />
                  {labels.top.save}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={snapshot} className="md:hidden">
                  <Camera className="size-4" />
                  {labels.top.snapshot}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={shareLink} className="md:hidden">
                  <Share2 className="size-4" />
                  {labels.top.share}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setExportOpen('share')}>
                  <Upload className="size-4" />
                  {labels.exporter.shareTitle}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={startOver}>
                  <RotateCcw className="size-4" />
                  {labels.top.startOver}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <WrapLocaleSelect label={labels.top.changeLanguage} />
            <WrapSignIn label={labels.top.signIn} />
          </div>
        </div>
      </header>

      <main className="relative min-h-0 flex-1">
        <CanvasStage
          ref={stageRef}
          editor={editor}
          template={template}
          clip={guides}
          guides={guides}
          color={color}
          brush={brush}
          names={{
            text: labels.layers.name.text,
            textValue: labels.layers.textDefault,
            drawing: labels.layers.name.drawing,
            shape: labels.layers.name.shape,
            fill: labels.layers.name.fill,
          }}
          onZoom={setZoom}
          onArt={onArt}
          insets={{
            left: panelOpen && desktop ? 408 : 84,
            right: 12,
            top: 12,
            bottom: 72,
          }}
          label={labels.canvas}
        />

        <nav
          aria-label={labels.rail.layers}
          className={cn(
            floating,
            'scrollbar-hide absolute top-3 left-3 z-20 flex max-h-[calc(100%-1.5rem)] w-[60px] flex-col gap-0.5 overflow-y-auto rounded-xl p-1 md:w-[72px] md:p-1.5'
          )}
        >
          {EDITOR_PANELS.map((id) => (
            <button
              key={id}
              type="button"
              aria-pressed={panel === id}
              onClick={() => setPanel(panel === id ? null : id)}
              className={cn(
                'flex cursor-pointer flex-col items-center gap-1 rounded-lg px-1 py-2 text-[10px] leading-none font-medium transition-colors',
                panel === id
                  ? 'bg-neutral-900 text-white dark:bg-neutral-700'
                  : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white'
              )}
            >
              {PANEL_ICONS[id]}
              <span className="max-w-full truncate">{labels.rail[id]}</span>
            </button>
          ))}
        </nav>

        {panel ? (
          <div className="absolute top-3 right-3 bottom-[4.5rem] left-[76px] z-20 flex flex-col md:right-auto md:bottom-3 md:left-24 md:w-[300px]">
            <PanelFrame
              title={panelTitle}
              icon={<span className="[&>svg]:size-4">{PANEL_ICONS[panel]}</span>}
              closeLabel={labels.rail.close}
              onClose={() => setPanel(null)}
            >
              {panel === 'assets' ? (
                <AssetsPanel editor={editor} labels={labels} />
              ) : panel === 'ai' ? (
                <AiPanel
                  labels={labels}
                  ai={ai}
                  prompt={prompt}
                  onPrompt={setPrompt}
                  busy={generating}
                  onGenerate={generate}
                />
              ) : panel === 'history' ? (
                <HistoryPanel labels={labels} ai={ai} onUse={useHistory} />
              ) : panel === 'designs' ? (
                <DesignsPanel
                  editor={editor}
                  labels={labels}
                  gallery={gallery}
                  exportArt={() => stageRef.current?.art() ?? null}
                />
              ) : panel === 'gradient' ? (
                <GradientPanel
                  editor={editor}
                  labels={labels}
                  initial={initial?.gradient}
                />
              ) : panel === 'plates' ? (
                <PlatesPanel labels={labels} />
              ) : (
                <LayersPanel editor={editor} labels={labels} />
              )}
            </PanelFrame>
          </div>
        ) : null}

        {previewOpen ? (
          <div
            className={cn(
              floating,
              'absolute top-3 right-3 z-10 h-[150px] w-[200px] overflow-hidden rounded-xl md:h-[220px] md:w-[300px]',
              panelOpen && 'max-md:hidden'
            )}
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_35%,#3a3a3e,#1b1b1d)]" />
            <CarPreview
              ref={previewRef}
              vehicle={vehicle}
              wrap={texture}
              paint={BODY_PAINT}
              autoRotate={spin}
              zoom
              label={labels.preview.title}
              className="relative"
            />
            <div className="absolute top-1.5 right-1.5 flex gap-0.5">
              <button
                type="button"
                aria-label={labels.preview.reset}
                title={labels.preview.reset}
                onClick={() => previewRef.current?.resetView()}
                className="flex size-7 cursor-pointer items-center justify-center rounded-md text-white/70 transition-colors hover:bg-white/10 hover:text-white"
              >
                <Maximize className="size-3.5" />
              </button>
              <button
                type="button"
                aria-label={labels.preview.rotate}
                title={labels.preview.rotate}
                aria-pressed={spin}
                onClick={() => setSpin((v) => !v)}
                className={cn(
                  'flex size-7 cursor-pointer items-center justify-center rounded-md transition-colors hover:bg-white/10 hover:text-white',
                  spin ? 'bg-white/15 text-white' : 'text-white/70'
                )}
              >
                <RotateCw className="size-3.5" />
              </button>
              <button
                type="button"
                aria-label={labels.preview.hide}
                title={labels.preview.hide}
                onClick={() => setPreviewOpen(false)}
                className="flex size-7 cursor-pointer items-center justify-center rounded-md text-white/70 transition-colors hover:bg-white/10 hover:text-white"
              >
                <X className="size-3.5" />
              </button>
            </div>
            {template && !template.official ? (
              <p className="pointer-events-none absolute right-2 bottom-1.5 left-2 truncate text-[10px] text-white/50">
                {labels.notice.guide}
              </p>
            ) : null}
          </div>
        ) : (
          <button
            type="button"
            aria-label={labels.preview.show}
            title={labels.preview.show}
            onClick={() => setPreviewOpen(true)}
            className={cn(
              floating,
              'absolute top-3 right-3 z-10 flex size-11 cursor-pointer items-center justify-center rounded-full text-neutral-700 transition-colors hover:text-neutral-900 dark:text-neutral-200 dark:hover:text-white',
              panelOpen && 'max-md:hidden'
            )}
          >
            <Box className="size-5" />
          </button>
        )}

        <div
          className={cn(
            floating,
            'absolute bottom-3 left-3 z-10 hidden flex-col items-center rounded-xl p-1 md:flex'
          )}
        >
          <button
            type="button"
            aria-label={labels.tool.zoomOut}
            title={labels.tool.zoomOut}
            onClick={() => stageRef.current?.zoomBy(1 / 1.2)}
            className={toolButton}
          >
            <ZoomOut className="size-4" />
          </button>
          <span className="py-1 text-[11px] font-medium text-neutral-600 tabular-nums dark:text-neutral-300">
            {zoom}%
          </span>
          <button
            type="button"
            aria-label={labels.tool.zoomIn}
            title={labels.tool.zoomIn}
            onClick={() => stageRef.current?.zoomBy(1.2)}
            className={toolButton}
          >
            <ZoomIn className="size-4" />
          </button>
          <button
            type="button"
            aria-label={labels.tool.zoomFit}
            title={labels.tool.zoomFit}
            onClick={() => stageRef.current?.fit()}
            className={toolButton}
          >
            <Maximize className="size-4" />
          </button>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-3 z-10 flex flex-col items-center gap-2 px-3">
          {selected && !isFill(selected) && editor.tool === 'select' ? (
            <div className="pointer-events-auto">
              <LayerProps
                layer={selected}
                labels={labels}
                onChange={changeSelected}
              />
            </div>
          ) : null}
          <div
            className={cn(
              floating,
              'scrollbar-hide pointer-events-auto flex max-w-full items-center gap-0.5 overflow-x-auto rounded-xl p-1'
            )}
          >
            {TOOLS.map((tool) => (
              <button
                key={tool.id}
                type="button"
                aria-label={toolLabels[tool.id]}
                title={`${toolLabels[tool.id]} (${tool.key.toUpperCase()})`}
                aria-pressed={editor.tool === tool.id}
                onClick={() => setTool(tool.id)}
                className={cn(toolButton, editor.tool === tool.id && toolActive)}
              >
                {tool.icon}
              </button>
            ))}
            <label
              title={labels.tool.color}
              className="relative flex size-9 shrink-0 cursor-pointer items-center justify-center"
            >
              <span
                className="size-5 rounded-full border border-black/15 dark:border-white/30"
                style={{ background: color }}
              />
              <input
                type="color"
                value={color}
                aria-label={labels.tool.color}
                onChange={(e) => setColor(e.target.value)}
                className="absolute inset-0 cursor-pointer opacity-0"
              />
            </label>
            {editor.tool === 'draw' ? (
              <input
                type="range"
                min={2}
                max={80}
                value={brush}
                aria-label={labels.tool.brush}
                title={labels.tool.brush}
                onChange={(e) => setBrush(Number(e.target.value))}
                className="mx-1 w-20 shrink-0 accent-blue-500"
              />
            ) : null}
            <span className="mx-1 h-5 w-px shrink-0 bg-neutral-200 dark:bg-neutral-700" />
            <button
              type="button"
              aria-label={labels.tool.template}
              title={labels.tool.template}
              aria-pressed={guides}
              onClick={() => setGuides((v) => !v)}
              className={cn(toolButton, guides && toolActive)}
            >
              <LayoutTemplate className="size-4" />
            </button>
            <div className="hidden shrink-0 items-center gap-2 px-2 md:flex">
              <RotateCw className="size-4 text-neutral-500 dark:text-neutral-400" />
              <input
                type="range"
                min={-180}
                max={180}
                value={rotation}
                disabled={!rotatable}
                aria-label={labels.tool.rotate}
                title={labels.tool.rotate}
                onPointerDown={() => editor.begin()}
                onPointerUp={() => editor.end()}
                onChange={(e) => {
                  if (!selected) return;
                  editor.preview((doc) =>
                    updateLayer(doc, selected.id, {
                      rotation: Number(e.target.value),
                    })
                  );
                }}
                className="w-24 accent-blue-500 disabled:opacity-40"
              />
              <span className="w-9 text-right text-xs text-neutral-500 tabular-nums dark:text-neutral-400">
                {rotation} °
              </span>
            </div>
            <span className="mx-1 h-5 w-px shrink-0 bg-neutral-200 dark:bg-neutral-700" />
            <button
              type="button"
              aria-label={labels.tool.undo}
              title={labels.tool.undo}
              disabled={!editor.canUndo}
              onClick={undo}
              className={toolButton}
            >
              <Undo2 className="size-4" />
            </button>
            <button
              type="button"
              aria-label={labels.tool.redo}
              title={labels.tool.redo}
              disabled={!editor.canRedo}
              onClick={redo}
              className={toolButton}
            >
              <Redo2 className="size-4" />
            </button>
          </div>
        </div>
      </main>

      <ExportDialog
        mode={exportOpen}
        onClose={() => setExportOpen(false)}
        labels={labels}
        vehicle={vehicle}
        template={template}
        contactHref={contactHref}
        getArt={() => stageRef.current?.art() ?? null}
      />
    </div>
  );
}