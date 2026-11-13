/** Every string the designer shows. The block fills it from translations. */
export interface EditorLabels {
  canvas: string;
  selectVehicle: string;
  tool: {
    select: string;
    text: string;
    draw: string;
    shape: string;
    fill: string;
    template: string;
    rotate: string;
    undo: string;
    redo: string;
    zoomIn: string;
    zoomOut: string;
    zoomFit: string;
    color: string;
    brush: string;
  };
  rail: {
    assets: string;
    ai: string;
    history: string;
    designs: string;
    gradient: string;
    plates: string;
    layers: string;
    close: string;
  };
  top: {
    save: string;
    saved: string;
    export: string;
    snapshot: string;
    share: string;
    linkCopied: string;
    gallery: string;
    more: string;
    startOver: string;
    startOverConfirm: string;
    changeLanguage: string;
    signIn: string;
  };
  preview: {
    title: string;
    reset: string;
    rotate: string;
    hide: string;
    show: string;
    watermark: string;
  };
  assets: {
    title: string;
    upload: string;
    hint: string;
    stickers: string;
    yours: string;
    empty: string;
    remove: string;
    invalid: string;
  };
  ai: {
    title: string;
    signInPrompt: string;
    signIn: string;
    placeholder: string;
    generate: string;
    generating: string;
    cost: (count: number) => string;
    balance: (count: number) => string;
    buy: string;
    ideasTitle: string;
    ideas: string[];
    failed: string;
    done: string;
    tooShort: string;
  };
  history: {
    title: string;
    signInPrompt: string;
    empty: string;
    use: string;
    failed: string;
    pending: string;
    expired: string;
  };
  designs: {
    title: string;
    gallery: string;
    mine: string;
    saveCurrent: string;
    namePlaceholder: string;
    untitled: string;
    empty: string;
    open: string;
    remove: string;
    applied: string;
  };
  gradient: {
    title: string;
    colors: string;
    angle: string;
    addStop: string;
    removeStop: string;
    presets: string;
    apply: string;
    solid: string;
  };
  plates: {
    title: string;
    description: string;
    text: string;
    open: string;
    browse: string;
  };
  layers: {
    title: string;
    empty: string;
    show: string;
    hide: string;
    lock: string;
    unlock: string;
    duplicate: string;
    remove: string;
    up: string;
    down: string;
    name: {
      text: string;
      image: string;
      shape: string;
      drawing: string;
      fill: string;
      gradient: string;
      design: string;
      ai: string;
    };
    textDefault: string;
  };
  props: {
    text: string;
    font: string;
    color: string;
    opacity: string;
    radius: string;
    ellipse: string;
    rectangle: string;
  };
  exporter: {
    title: string;
    description: string;
    fileName: string;
    fileNameHint: string;
    size: string;
    clip: string;
    clipHint: string;
    download: string;
    working: string;
    result: (size: string, dimensions: string) => string;
    reduced: string;
    howTo: string;
    viaApp: string;
    viaUsb: string;
    close: string;
  };
  notice: {
    guide: string;
    storage: string;
  };
}

export interface EditorAi {
  signedIn: boolean;
  signInHref: string;
  pricingHref: string;
  credits: number | null;
  cost: number;
  /** Runs a generation to completion and resolves with the image. */
  generate(prompt: string): Promise<Blob>;
  /** Downloads a finished generation from the history list. */
  fetchImage(url: string): Promise<Blob>;
  history: {
    id: string;
    prompt: string;
    status: string;
    imageUrl?: string;
  }[];
}