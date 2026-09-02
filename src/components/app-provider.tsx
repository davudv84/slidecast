"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import {
  ACCENT_OPTIONS,
  DEFAULT_ACCENT,
  FONT_PAIR_LABELS,
  TEMPLATES,
  createBlankDoc,
  createSeedWorkspace,
  type Tone,
} from "@/lib/data";
import { docStyle, type SlideStyle } from "@/lib/doc-style";
import { downloadBlob, exportCarousel } from "@/lib/export";
import { draftSlides, titleFrom } from "@/lib/generator";
import { newId } from "@/lib/id";
import { encodeShare } from "@/lib/share";
import { clearWorkspace, loadWorkspace, saveWorkspace } from "@/lib/storage";
import type {
  Align,
  BrandKit,
  ConfirmRequest,
  Doc,
  DocStatus,
  ExportFormat,
  ExportQuality,
  ExportSize,
  FontPair,
  Preset,
  Profile,
  SaveState,
  Scheme,
  Slide,
  Toast,
  Workspace,
} from "@/lib/types";

let toastSeq = 1;

type Theme = "light" | "dark";
type InspectorTab = "content" | "style" | "brand";

export interface ExportProgress {
  done: number;
  total: number;
  label: string;
}

interface AppState {
  hydrated: boolean;

  /* appearance */
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  accent: string;
  setAccent: (hex: string) => void;

  /* account */
  profile: Profile;
  updateProfile: (patch: Partial<Profile>) => void;
  brand: BrandKit;
  updateBrand: (patch: Partial<BrandKit>) => void;
  presets: Preset[];
  savePreset: () => void;
  deletePreset: (id: string) => void;
  applyPreset: (preset: Preset) => void;
  resetWorkspace: () => void;

  /* documents */
  docs: Doc[];
  doc: Doc;
  hasDocs: boolean;
  openDoc: (id: string) => void;
  createDoc: (opts?: { withAi?: boolean; templateId?: number }) => void;
  deleteDoc: (id: string) => void;
  duplicateDoc: (id: string) => void;
  importDoc: (doc: Doc) => void;
  setTitle: (title: string) => void;
  setStatus: (status: DocStatus) => void;

  /* slides */
  style: SlideStyle;
  active: number;
  setActive: (index: number) => void;
  activeSlide: Slide;
  updateActive: (patch: Partial<Omit<Slide, "id">>) => void;
  addSlide: () => void;
  duplicateSlide: (index: number) => void;
  deleteSlide: (index: number) => void;
  reorderSlides: (from: number, to: number) => void;
  nextSlide: () => void;
  prevSlide: () => void;
  setTemplate: (id: number) => void;
  setScheme: (scheme: Scheme | null) => void;
  setFontPair: (pair: FontPair) => void;
  setAlign: (align: Align) => void;

  /* autosave */
  saveState: SaveState;
  touch: () => void;

  /* editor chrome */
  zoom: number;
  zoomIn: () => void;
  zoomOut: () => void;
  zoomReset: () => void;
  tab: InspectorTab;
  setTab: (tab: InspectorTab) => void;

  /* generation */
  aiOpen: boolean;
  openAi: () => void;
  closeAi: () => void;
  aiText: string;
  setAiText: (text: string) => void;
  aiTone: Tone;
  setAiTone: (tone: Tone) => void;
  aiCount: number;
  setAiCount: (count: number) => void;
  generating: boolean;
  genDone: number;
  genSlides: Slide[];
  generate: () => void;

  /* export */
  exportOpen: boolean;
  setExportOpen: (open: boolean) => void;
  format: ExportFormat;
  setFormat: (format: ExportFormat) => void;
  size: ExportSize;
  setSize: (size: ExportSize) => void;
  quality: ExportQuality;
  setQuality: (quality: ExportQuality) => void;
  exporting: boolean;
  exportProgress: ExportProgress | null;
  runExport: () => void;
  schedule: () => void;
  share: () => void;

  /* overlays */
  previewOpen: boolean;
  setPreviewOpen: (open: boolean) => void;
  cmdOpen: boolean;
  setCmdOpen: (open: boolean) => void;

  /* feedback */
  toasts: Toast[];
  toast: (message: string, onUndo?: () => void) => void;
  dismissToast: (id: number) => void;
  confirm: ConfirmRequest | null;
  requestConfirm: (request: ConfirmRequest) => void;
  cancelConfirm: () => void;
}

const Ctx = createContext<AppState | null>(null);

export function useApp() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useApp must be used inside <AppProvider>");
  return ctx;
}

/** Shown before hydration and when the workspace has no documents. */
const FALLBACK_DOC = createBlankDoc(0);

export function AppProvider({ children }: { children: ReactNode }) {
  const router = useRouter();

  const [ws, setWs] = useState<Workspace>(() => createSeedWorkspace());
  const [hydrated, setHydrated] = useState(false);
  const [theme, setTheme] = useState<Theme>("light");

  const [active, setActiveIndex] = useState(0);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [zoom, setZoom] = useState(1);
  const [tab, setTab] = useState<InspectorTab>("content");

  const [aiOpen, setAiOpen] = useState(false);
  const [aiText, setAiText] = useState("");
  const [aiTone, setAiTone] = useState<Tone>("Direct");
  const [aiCount, setAiCount] = useState(8);
  const [generating, setGenerating] = useState(false);
  const [genDone, setGenDone] = useState(0);
  const [genSlides, setGenSlides] = useState<Slide[]>([]);

  const [exportOpen, setExportOpen] = useState(false);
  const [format, setFormat] = useState<ExportFormat>("PNG");
  const [size, setSize] = useState<ExportSize>("Post");
  const [quality, setQuality] = useState<ExportQuality>("2x");
  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState<ExportProgress | null>(null);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);

  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirm, setConfirm] = useState<ConfirmRequest | null>(null);

  const saveTimers = useRef<{ a?: ReturnType<typeof setTimeout>; b?: ReturnType<typeof setTimeout> }>({});
  const genTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  /* ---------------------------------------------------------- hydration */
  useEffect(() => {
    const stored = loadWorkspace();
    setWs(stored ?? createSeedWorkspace());
    const t = window.localStorage.getItem("slidecast-theme");
    if (t === "dark" || t === "light") setTheme(t);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveWorkspace(ws);
  }, [ws, hydrated]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.style.colorScheme = theme;
    if (hydrated) window.localStorage.setItem("slidecast-theme", theme);
  }, [theme, hydrated]);

  /* Accent colour is a runtime token — everything reading --accent follows. */
  useEffect(() => {
    const root = document.documentElement.style;
    const accent = ws.accent || DEFAULT_ACCENT;
    if (accent === DEFAULT_ACCENT) {
      root.removeProperty("--accent");
      root.removeProperty("--accent-h");
      root.removeProperty("--accent-soft");
      return;
    }
    root.setProperty("--accent", accent);
    root.setProperty("--accent-h", `color-mix(in oklab, ${accent}, black 12%)`);
    root.setProperty(
      "--accent-soft",
      `color-mix(in oklab, ${accent} ${theme === "dark" ? 16 : 10}%, transparent)`,
    );
  }, [ws.accent, theme]);

  useEffect(
    () => () => {
      clearTimeout(saveTimers.current.a);
      clearTimeout(saveTimers.current.b);
      clearTimeout(genTimer.current);
    },
    [],
  );

  /* ---------------------------------------------------------------- toasts */
  const dismissToast = useCallback((id: number) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, onUndo?: () => void) => {
      const id = toastSeq++;
      setToasts((list) => [...list, { id, message, onUndo }]);
      setTimeout(() => dismissToast(id), 4000);
    },
    [dismissToast],
  );

  /* -------------------------------------------------------------- autosave */
  const touch = useCallback(() => {
    clearTimeout(saveTimers.current.a);
    clearTimeout(saveTimers.current.b);
    setSaveState("saving");
    saveTimers.current.a = setTimeout(() => {
      setSaveState("saved");
      saveTimers.current.b = setTimeout(() => setSaveState("idle"), 3000);
    }, 700);
  }, []);

  /* --------------------------------------------------------------- derived */
  const docs = useMemo(
    () => [...ws.docs].sort((a, b) => b.updatedAt - a.updatedAt),
    [ws.docs],
  );
  const doc = useMemo(
    () => ws.docs.find((d) => d.id === ws.lastOpenedId) ?? docs[0] ?? FALLBACK_DOC,
    [ws.docs, ws.lastOpenedId, docs],
  );
  const style = useMemo(() => docStyle(doc), [doc]);
  const activeSlide = doc.slides[Math.min(active, doc.slides.length - 1)] ?? doc.slides[0];

  /* Mutate the open document and stamp it. */
  const patchDoc = useCallback(
    (fn: (d: Doc) => Doc, opts: { silent?: boolean } = {}) => {
      setWs((w) => {
        const id = w.docs.find((d) => d.id === w.lastOpenedId)?.id ?? w.docs[0]?.id;
        if (!id) return w;
        return {
          ...w,
          docs: w.docs.map((d) =>
            d.id === id ? { ...fn(d), updatedAt: opts.silent ? d.updatedAt : Date.now() } : d,
          ),
        };
      });
      if (!opts.silent) touch();
    },
    [touch],
  );

  /* ------------------------------------------------------------ documents */
  const openDoc = useCallback(
    (id: string) => {
      setWs((w) => ({ ...w, lastOpenedId: id }));
      setActiveIndex(0);
      setZoom(1);
      router.push("/editor");
    },
    [router],
  );

  const createDoc = useCallback(
    (opts: { withAi?: boolean; templateId?: number } = {}) => {
      const fresh = createBlankDoc();
      if (opts.templateId != null) {
        fresh.templateId = opts.templateId;
        fresh.fontPair = TEMPLATES[opts.templateId].font;
      }
      setWs((w) => ({ ...w, docs: [fresh, ...w.docs], lastOpenedId: fresh.id }));
      setActiveIndex(0);
      setZoom(1);
      setAiText("");
      if (opts.withAi) setAiOpen(true);
      router.push("/editor");
    },
    [router],
  );

  const deleteDoc = useCallback(
    (id: string) => {
      const previous = ws.docs;
      const target = previous.find((d) => d.id === id);
      setWs((w) => ({
        ...w,
        docs: w.docs.filter((d) => d.id !== id),
        lastOpenedId: w.lastOpenedId === id ? null : w.lastOpenedId,
      }));
      setConfirm(null);
      toast(`Deleted “${target?.title ?? "carousel"}”`, () =>
        setWs((w) => ({ ...w, docs: previous })),
      );
    },
    [ws.docs, toast],
  );

  const duplicateDoc = useCallback(
    (id: string) => {
      setWs((w) => {
        const source = w.docs.find((d) => d.id === id);
        if (!source) return w;
        const copy: Doc = {
          ...source,
          id: newId("doc"),
          title: `${source.title} (copy)`,
          slides: source.slides.map((s) => ({ ...s, id: newId("s") })),
          status: "Draft",
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        return { ...w, docs: [copy, ...w.docs] };
      });
      toast("Carousel duplicated");
    },
    [toast],
  );

  const setTitle = useCallback(
    (title: string) => patchDoc((d) => ({ ...d, title })),
    [patchDoc],
  );

  /** Bring a shared carousel into this workspace and open it. */
  const importDoc = useCallback(
    (source: Doc) => {
      const fresh: Doc = {
        ...source,
        id: newId("doc"),
        slides: source.slides.map((s) => ({ ...s, id: newId("s") })),
        status: "Draft",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      setWs((w) => ({ ...w, docs: [fresh, ...w.docs], lastOpenedId: fresh.id }));
      setActiveIndex(0);
      router.push("/editor");
      toast(`“${fresh.title}” added to your carousels`);
    },
    [router, toast],
  );

  const setStatus = useCallback(
    (status: DocStatus) => patchDoc((d) => ({ ...d, status })),
    [patchDoc],
  );

  /* ---------------------------------------------------------------- slides */
  const setActive = useCallback((index: number) => setActiveIndex(index), []);

  const updateActive = useCallback(
    (patch: Partial<Omit<Slide, "id">>) => {
      patchDoc((d) => ({
        ...d,
        slides: d.slides.map((s, i) => (i === active ? { ...s, ...patch } : s)),
      }));
    },
    [active, patchDoc],
  );

  const addSlide = useCallback(() => {
    patchDoc((d) => {
      const slides = [...d.slides];
      slides.splice(active + 1, 0, {
        id: newId("s"),
        type: "point",
        headline: "New point",
        body: "Say one thing here.",
      });
      return { ...d, slides };
    });
    setActiveIndex(active + 1);
  }, [active, patchDoc]);

  const duplicateSlide = useCallback(
    (index: number) => {
      patchDoc((d) => {
        const slides = [...d.slides];
        slides.splice(index + 1, 0, { ...d.slides[index], id: newId("s") });
        return { ...d, slides };
      });
      setActiveIndex(index + 1);
      toast("Slide duplicated");
    },
    [patchDoc, toast],
  );

  const deleteSlide = useCallback(
    (index: number) => {
      if (doc.slides.length <= 1) {
        toast("A carousel needs at least one slide");
        return;
      }
      const previous = doc.slides;
      patchDoc((d) => ({ ...d, slides: d.slides.filter((_, i) => i !== index) }));
      setActiveIndex(Math.max(0, Math.min(index, doc.slides.length - 2)));
      toast(`Deleted slide ${index + 1}`, () => {
        patchDoc((d) => ({ ...d, slides: previous }));
        setActiveIndex(index);
      });
    },
    [doc.slides, patchDoc, toast],
  );

  const reorderSlides = useCallback(
    (from: number, to: number) => {
      if (from === to) return;
      patchDoc((d) => {
        const slides = [...d.slides];
        const [moved] = slides.splice(from, 1);
        slides.splice(to, 0, moved);
        return { ...d, slides };
      });
      setActiveIndex(to);
    },
    [patchDoc],
  );

  const nextSlide = useCallback(
    () => setActiveIndex((i) => Math.min(doc.slides.length - 1, i + 1)),
    [doc.slides.length],
  );
  const prevSlide = useCallback(() => setActiveIndex((i) => Math.max(0, i - 1)), []);

  const setTemplate = useCallback(
    (id: number) => patchDoc((d) => ({ ...d, templateId: id, scheme: null })),
    [patchDoc],
  );
  const setScheme = useCallback(
    (scheme: Scheme | null) => patchDoc((d) => ({ ...d, scheme })),
    [patchDoc],
  );
  const setFontPair = useCallback(
    (fontPair: FontPair) => patchDoc((d) => ({ ...d, fontPair })),
    [patchDoc],
  );
  const setAlign = useCallback(
    (align: Align) => patchDoc((d) => ({ ...d, align })),
    [patchDoc],
  );

  /* -------------------------------------------------------------- account */
  const updateProfile = useCallback((patch: Partial<Profile>) => {
    setWs((w) => ({ ...w, profile: { ...w.profile, ...patch } }));
  }, []);

  const updateBrand = useCallback(
    (patch: Partial<BrandKit>) => {
      setWs((w) => ({ ...w, brand: { ...w.brand, ...patch } }));
      touch();
    },
    [touch],
  );

  const setAccent = useCallback((hex: string) => {
    setWs((w) => ({ ...w, accent: hex || DEFAULT_ACCENT }));
  }, []);

  const savePreset = useCallback(() => {
    const template = TEMPLATES[doc.templateId];
    const preset: Preset = {
      id: newId("preset"),
      name: `${template.name} · ${FONT_PAIR_LABELS[doc.fontPair].split(" / ")[0]}`,
      fontLabel: FONT_PAIR_LABELS[doc.fontPair].split(" / ")[0],
      a: style.bg,
      b: style.fg,
      templateId: doc.templateId,
      font: doc.fontPair,
      scheme: doc.scheme,
    };
    setWs((w) => ({ ...w, presets: [preset, ...w.presets] }));
    toast(`Preset “${preset.name}” saved`);
  }, [doc, style, toast]);

  const deletePreset = useCallback(
    (id: string) => {
      const previous = ws.presets;
      setWs((w) => ({ ...w, presets: w.presets.filter((p) => p.id !== id) }));
      toast("Preset removed", () => setWs((w) => ({ ...w, presets: previous })));
    },
    [ws.presets, toast],
  );

  const applyPreset = useCallback(
    (preset: Preset) => {
      patchDoc((d) => ({
        ...d,
        templateId: preset.templateId,
        fontPair: preset.font,
        scheme: preset.scheme,
      }));
      toast(`Preset “${preset.name}” applied`);
    },
    [patchDoc, toast],
  );

  const resetWorkspace = useCallback(() => {
    clearWorkspace();
    setWs(createSeedWorkspace());
    setActiveIndex(0);
    setConfirm(null);
    toast("Workspace reset to sample data");
  }, [toast]);

  /* ------------------------------------------------------------- generate */
  const openAi = useCallback(() => setAiOpen(true), []);
  const closeAi = useCallback(() => {
    if (!generating) setAiOpen(false);
  }, [generating]);

  const generate = useCallback(() => {
    const drafted = draftSlides(aiText, {
      count: aiCount,
      tone: aiTone,
      handle: ws.brand.handle,
    });
    const title = titleFrom(aiText);
    setGenSlides(drafted);
    setGenerating(true);
    setGenDone(0);
    let step = 0;

    const tick = () => {
      step += 1;
      setGenDone(step);
      if (step < drafted.length) {
        genTimer.current = setTimeout(tick, 520);
        return;
      }
      genTimer.current = setTimeout(() => {
        patchDoc((d) => ({
          ...d,
          slides: drafted,
          title: d.title === "Untitled carousel" ? title : d.title,
        }));
        setActiveIndex(0);
        setGenerating(false);
        setAiOpen(false);
        toast(`Generated ${drafted.length} slides`);
      }, 500);
    };

    genTimer.current = setTimeout(tick, 600);
  }, [aiText, aiCount, aiTone, ws.brand.handle, patchDoc, toast]);

  /* ---------------------------------------------------------------- export */
  const runExport = useCallback(async () => {
    if (exporting) return;
    setExporting(true);
    setExportProgress({ done: 0, total: doc.slides.length, label: "Preparing…" });
    try {
      const result = await exportCarousel({
        doc,
        brand: ws.brand,
        format,
        size,
        quality,
        onProgress: (done, total, label) => setExportProgress({ done, total, label }),
      });
      downloadBlob(result.blob, result.filename);
      setExportOpen(false);
      toast(`${result.filename} downloaded · ${result.fileCount} ${format}`);
    } catch (err) {
      console.error(err);
      toast("Export failed. Try a lower quality setting.");
    } finally {
      setExporting(false);
      setExportProgress(null);
    }
  }, [exporting, doc, ws.brand, format, size, quality, toast]);

  const schedule = useCallback(() => {
    patchDoc((d) => ({ ...d, status: "Scheduled" }));
    setExportOpen(false);
    toast("Scheduled via Buffer · Tue 9:00");
  }, [patchDoc, toast]);

  const share = useCallback(async () => {
    const url = `${window.location.origin}/share#${encodeShare(doc, ws.brand)}`;
    try {
      await navigator.clipboard.writeText(url);
      toast("Share link copied");
    } catch {
      window.open(url, "_blank", "noopener");
      toast("Share link opened in a new tab");
    }
  }, [doc, ws.brand, toast]);

  /* ------------------------------------------------------------------ misc */
  const toggleTheme = useCallback(() => setTheme((t) => (t === "dark" ? "light" : "dark")), []);
  const zoomIn = useCallback(() => setZoom((z) => Math.min(2, +(z + 0.1).toFixed(2))), []);
  const zoomOut = useCallback(() => setZoom((z) => Math.max(0.4, +(z - 0.1).toFixed(2))), []);
  const zoomReset = useCallback(() => setZoom(1), []);
  const requestConfirm = useCallback((request: ConfirmRequest) => setConfirm(request), []);
  const cancelConfirm = useCallback(() => setConfirm(null), []);

  const value = useMemo<AppState>(
    () => ({
      hydrated,
      theme,
      toggleTheme,
      setTheme,
      accent: ws.accent || DEFAULT_ACCENT,
      setAccent,
      profile: ws.profile,
      updateProfile,
      brand: ws.brand,
      updateBrand,
      presets: ws.presets,
      savePreset,
      deletePreset,
      applyPreset,
      resetWorkspace,
      docs,
      doc,
      hasDocs: ws.docs.length > 0,
      openDoc,
      createDoc,
      deleteDoc,
      duplicateDoc,
      importDoc,
      setTitle,
      setStatus,
      style,
      active: Math.min(active, doc.slides.length - 1),
      setActive,
      activeSlide,
      updateActive,
      addSlide,
      duplicateSlide,
      deleteSlide,
      reorderSlides,
      nextSlide,
      prevSlide,
      setTemplate,
      setScheme,
      setFontPair,
      setAlign,
      saveState,
      touch,
      zoom,
      zoomIn,
      zoomOut,
      zoomReset,
      tab,
      setTab,
      aiOpen,
      openAi,
      closeAi,
      aiText,
      setAiText,
      aiTone,
      setAiTone,
      aiCount,
      setAiCount,
      generating,
      genDone,
      genSlides,
      generate,
      exportOpen,
      setExportOpen,
      format,
      setFormat,
      size,
      setSize,
      quality,
      setQuality,
      exporting,
      exportProgress,
      runExport,
      schedule,
      share,
      previewOpen,
      setPreviewOpen,
      cmdOpen,
      setCmdOpen,
      toasts,
      toast,
      dismissToast,
      confirm,
      requestConfirm,
      cancelConfirm,
    }),
    [
      hydrated,
      theme,
      toggleTheme,
      ws.accent,
      ws.profile,
      ws.brand,
      ws.presets,
      ws.docs.length,
      setAccent,
      updateProfile,
      updateBrand,
      savePreset,
      deletePreset,
      applyPreset,
      resetWorkspace,
      docs,
      doc,
      openDoc,
      createDoc,
      deleteDoc,
      duplicateDoc,
      importDoc,
      setTitle,
      setStatus,
      style,
      active,
      setActive,
      activeSlide,
      updateActive,
      addSlide,
      duplicateSlide,
      deleteSlide,
      reorderSlides,
      nextSlide,
      prevSlide,
      setTemplate,
      setScheme,
      setFontPair,
      setAlign,
      saveState,
      touch,
      zoom,
      zoomIn,
      zoomOut,
      zoomReset,
      tab,
      aiOpen,
      openAi,
      closeAi,
      aiText,
      aiTone,
      aiCount,
      generating,
      genDone,
      genSlides,
      generate,
      exportOpen,
      format,
      size,
      quality,
      exporting,
      exportProgress,
      runExport,
      schedule,
      share,
      previewOpen,
      cmdOpen,
      toasts,
      toast,
      dismissToast,
      confirm,
      requestConfirm,
      cancelConfirm,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export { ACCENT_OPTIONS };
