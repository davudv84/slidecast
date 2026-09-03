"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  Copy,
  Layers,
  Palette,
  Plus,
  Sparkles,
  Trash2,
  Type,
  UserRound,
} from "lucide-react";
import { useApp } from "@/components/app-provider";
import { useViewport } from "@/lib/use-viewport";
import { useSwipe } from "@/lib/use-swipe";
import { EditorTopBar } from "@/components/editor/top-bar";
import { SlideRail } from "@/components/editor/slide-rail";
import { EditorCanvas } from "@/components/editor/canvas";
import { BrandTab, ContentTab, Inspector, StyleTab } from "@/components/editor/inspector";
import { AiModal } from "@/components/editor/ai-modal";
import { ExportDrawer } from "@/components/editor/export-drawer";
import { PreviewOverlay } from "@/components/editor/preview-overlay";
import { SlideCanvas } from "@/components/slide-canvas";
import { SlidePreview, useElementWidth } from "@/components/slide-preview";
import { Modal } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { stripRich } from "@/lib/rich-text";
import { cn } from "@/lib/utils";

export default function EditorPage() {
  const app = useApp();
  const { width, ready, narrow, mid } = useViewport();

  // Landing on /editor with an empty workspace starts a fresh carousel.
  useEffect(() => {
    if (app.hydrated && !app.hasDocs) app.createDoc();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [app.hydrated, app.hasDocs]);

  return (
    <div className="flex h-dvh flex-col bg-shell">
      <EditorTopBar narrow={narrow} />

      {!ready || !app.hydrated ? (
        <div className="flex-1" />
      ) : narrow ? (
        <MobileEditor />
      ) : (
        <div
          className="grid min-h-0 flex-1"
          style={{ gridTemplateColumns: mid ? "160px 1fr 260px" : "200px 1fr 300px" }}
        >
          <SlideRail />
          <EditorCanvas viewportWidth={width} />
          <Inspector />
        </div>
      )}

      <AiModal />
      <ExportDrawer />
      <PreviewOverlay viewportWidth={width} />
    </div>
  );
}

/* --------------------------------------------------------- mobile editor */

type Sheet = "text" | "style" | "brand" | "slides" | null;

const SHEET_TITLES: Record<Exclude<Sheet, null>, string> = {
  text: "Text",
  style: "Style",
  brand: "Brand",
  slides: "Slides",
};

/**
 * Below 768px the editor is a phone editor: the slide fills the width, the
 * strip below switches slides, and every inspector lives in a bottom sheet.
 */
function MobileEditor() {
  const app = useApp();
  const [sheet, setSheet] = useState<Sheet>(null);
  const frame = useRef<HTMLDivElement>(null);
  // Measure the frame rather than trusting window.innerWidth: phones report
  // the layout viewport late, and an over-wide slide would clip.
  const width = useElementWidth(frame);
  const swipe = useSwipe(app.nextSlide, app.prevSlide);
  const total = app.doc.slides.length;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 pb-4 pt-3">
        <div
          ref={frame}
          className="mx-auto w-full max-w-110 overflow-hidden rounded-card shadow-[0_0_0_1px_var(--border)]"
          style={{ aspectRatio: "1080 / 1350" }}
          {...swipe}
        >
          {width > 0 ? (
            <SlideCanvas
              slide={app.activeSlide}
              style={app.style}
              width={width}
              chrome={app.chromeFor(app.active)}
              onTap={() => setSheet("text")}
            />
          ) : null}
        </div>

        <div className="flex items-center justify-between">
          <Button variant="secondary" size="icon" aria-label="Previous slide" onClick={app.prevSlide} disabled={app.active === 0}>
            <ChevronLeft size={16} strokeWidth={1.5} />
          </Button>
          <span className="tabular text-[13px] text-t2">
            {app.active + 1} / {total} · tap the slide to edit
          </span>
          <Button variant="secondary" size="icon" aria-label="Next slide" onClick={app.nextSlide} disabled={app.active === total - 1}>
            <ChevronRight size={16} strokeWidth={1.5} />
          </Button>
        </div>

        <SlideStrip onAdd={() => setSheet("slides")} />
      </div>

      <nav
        aria-label="Editor tools"
        className="flex flex-none items-center justify-around border-t border-line bg-surface px-2 pb-[max(8px,env(safe-area-inset-bottom))] pt-2"
      >
        <ToolButton icon={<Type size={20} strokeWidth={1.5} />} label="Text" onClick={() => setSheet("text")} />
        <ToolButton icon={<Palette size={20} strokeWidth={1.5} />} label="Style" onClick={() => setSheet("style")} />
        <ToolButton icon={<UserRound size={20} strokeWidth={1.5} />} label="Brand" onClick={() => setSheet("brand")} />
        <ToolButton icon={<Layers size={20} strokeWidth={1.5} />} label="Slides" onClick={() => setSheet("slides")} />
        <ToolButton icon={<Sparkles size={20} strokeWidth={1.5} />} label="Generate" onClick={app.openAi} />
      </nav>

      <Modal
        open={sheet !== null}
        onOpenChange={(o) => !o && setSheet(null)}
        placement="bottom"
        label={sheet ? SHEET_TITLES[sheet] : "Editor"}
        className="flex max-h-[85dvh] w-full flex-col rounded-t-modal border border-line bg-surface shadow-float"
      >
        <div className="flex flex-none items-center justify-between px-4 pb-2 pt-3">
          <span className="mx-auto mb-2 h-1 w-10 rounded-full bg-line" aria-hidden />
        </div>
        <div className="flex flex-none items-center justify-between px-4 pb-3">
          <h2 className="m-0 text-base font-semibold">{sheet ? SHEET_TITLES[sheet] : ""}</h2>
          <Button variant="secondary" size="sm" onClick={() => setSheet(null)}>
            Done
          </Button>
        </div>
        <div className="flex flex-col gap-[18px] overflow-y-auto px-4 pb-[max(16px,env(safe-area-inset-bottom))]">
          {sheet === "text" ? <ContentTab /> : null}
          {sheet === "style" ? <StyleTab /> : null}
          {sheet === "brand" ? <BrandTab /> : null}
          {sheet === "slides" ? <SlidesSheet /> : null}
        </div>
      </Modal>
    </div>
  );
}

function ToolButton({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-12 min-w-14 cursor-pointer flex-col items-center justify-center gap-1 rounded-control text-[11px] font-medium text-t2 transition-colors duration-150 ease-out hover:bg-hover hover:text-t1 active:bg-hover"
    >
      {icon}
      {label}
    </button>
  );
}

/** Horizontal thumbnail strip — tap to switch, last tile adds a slide. */
function SlideStrip({ onAdd }: { onAdd: () => void }) {
  const app = useApp();
  return (
    <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 py-1">
      {app.doc.slides.map((slide, i) => {
        const active = i === app.active;
        return (
          <button
            key={slide.id}
            type="button"
            aria-label={`Slide ${i + 1}: ${stripRich(slide.headline)}`}
            aria-current={active ? "true" : undefined}
            onClick={() => app.setActive(i)}
            className={cn(
              "w-16 flex-none cursor-pointer overflow-hidden rounded-[6px] border-2 transition-colors duration-150 ease-out",
              active ? "border-accent" : "border-line",
            )}
          >
            <SlidePreview slide={slide} style={app.style} chrome={app.chromeFor(i)} />
          </button>
        );
      })}
      <button
        type="button"
        aria-label="Add slide"
        onClick={() => {
          app.addSlide();
          onAdd();
        }}
        className="grid w-16 flex-none cursor-pointer place-items-center rounded-[6px] border-2 border-dashed border-line text-t2 transition-colors duration-150 ease-out hover:border-accent hover:text-accent"
        style={{ aspectRatio: "1080 / 1350" }}
      >
        <Plus size={18} strokeWidth={2} />
      </button>
    </div>
  );
}

/** Reorder, duplicate and delete without drag — thumbs are easier on a phone. */
function SlidesSheet() {
  const app = useApp();
  const total = app.doc.slides.length;
  return (
    <div className="flex flex-col gap-2">
      {app.doc.slides.map((slide, i) => {
        const active = i === app.active;
        return (
          <div
            key={slide.id}
            className={cn(
              "flex items-center gap-3 rounded-control border p-2",
              active ? "border-accent" : "border-line",
            )}
          >
            <button
              type="button"
              aria-label={`Select slide ${i + 1}`}
              onClick={() => app.setActive(i)}
              className="w-12 flex-none cursor-pointer overflow-hidden rounded-[4px] border border-line"
            >
              <SlidePreview slide={slide} style={app.style} chrome={app.chromeFor(i)} />
            </button>
            <button
              type="button"
              onClick={() => app.setActive(i)}
              className="flex min-w-0 flex-1 cursor-pointer flex-col text-left"
            >
              <span className="text-xs text-t3">Slide {i + 1} · {slide.type}</span>
              <span className="truncate text-sm font-medium text-t1">{stripRich(slide.headline)}</span>
            </button>
            <div className="flex flex-none gap-0.5">
              <Button variant="ghost" size="iconSm" aria-label={`Move slide ${i + 1} up`} disabled={i === 0} onClick={() => app.reorderSlides(i, i - 1)}>
                <ArrowUp size={14} strokeWidth={1.5} />
              </Button>
              <Button variant="ghost" size="iconSm" aria-label={`Move slide ${i + 1} down`} disabled={i === total - 1} onClick={() => app.reorderSlides(i, i + 1)}>
                <ArrowDown size={14} strokeWidth={1.5} />
              </Button>
              <Button variant="ghost" size="iconSm" aria-label={`Duplicate slide ${i + 1}`} onClick={() => app.duplicateSlide(i)}>
                <Copy size={14} strokeWidth={1.5} />
              </Button>
              <Button variant="ghost" size="iconSm" aria-label={`Delete slide ${i + 1}`} className="hover:text-danger" onClick={() => app.deleteSlide(i)}>
                <Trash2 size={14} strokeWidth={1.5} />
              </Button>
            </div>
          </div>
        );
      })}
      <Button variant="secondary" onClick={app.addSlide}>
        <Plus size={16} strokeWidth={2} />
        Add slide after current
      </Button>
    </div>
  );
}
