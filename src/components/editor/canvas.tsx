"use client";

import { ChevronLeft, ChevronRight, Minus, Plus } from "lucide-react";
import { useApp } from "../app-provider";
import { SlideCanvas } from "../slide-canvas";
import { Button } from "../ui/button";

export function EditorCanvas({ viewportWidth }: { viewportWidth: number }) {
  const app = useApp();

  const baseWidth = Math.min(440, Math.max(240, (viewportWidth - 560) * 0.55));
  const width = baseWidth * app.zoom;

  return (
    <section className="relative flex min-h-0 min-w-0 flex-col bg-shell">
      <div className="grid flex-1 place-items-center overflow-auto p-8">
        <div className="rounded-[4px]" style={{ boxShadow: "0 0 0 1px var(--border)" }}>
          <SlideCanvas
            slide={app.activeSlide}
            style={app.style}
            width={width}
            editable
            onHeadlineChange={(headline) => app.updateActive({ headline })}
            onBodyChange={(body) => app.updateActive({ body })}
            chrome={{
              handle: app.brand.handle,
              logo: app.brand.logo,
              index: app.active,
              total: app.doc.slides.length,
            }}
            className="rounded-[4px] transition-[width,height] duration-200 ease-out"
          />
        </div>
      </div>

      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-lg border border-line bg-surface p-1 shadow-float">
        <Button variant="ghost" size="iconSm" aria-label="Previous slide" onClick={app.prevSlide} disabled={app.active === 0}>
          <ChevronLeft size={16} strokeWidth={1.5} />
        </Button>
        <span className="tabular min-w-11 text-center text-[13px] font-medium text-t1">
          {app.active + 1} / {app.doc.slides.length}
        </span>
        <Button
          variant="ghost"
          size="iconSm"
          aria-label="Next slide"
          onClick={app.nextSlide}
          disabled={app.active === app.doc.slides.length - 1}
        >
          <ChevronRight size={16} strokeWidth={1.5} />
        </Button>
        <span className="mx-1 h-[18px] w-px bg-line" />
        <Button variant="ghost" size="iconSm" aria-label="Zoom out" onClick={app.zoomOut} disabled={app.zoom <= 0.4}>
          <Minus size={16} strokeWidth={2} />
        </Button>
        <Button variant="ghost" size="sm" className="tabular h-7 min-w-11 px-1.5 text-t2" onClick={app.zoomReset} aria-label="Reset zoom">
          {Math.round(app.zoom * 100)}%
        </Button>
        <Button variant="ghost" size="iconSm" aria-label="Zoom in" onClick={app.zoomIn} disabled={app.zoom >= 2}>
          <Plus size={16} strokeWidth={2} />
        </Button>
      </div>

      <span className="absolute right-4 top-3 text-xs text-t3">
        1080 × 1350 · Double‑click text to edit
      </span>
    </section>
  );
}
