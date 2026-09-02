"use client";

import { useEffect } from "react";
import { ChevronLeft, ChevronRight, Monitor, Sparkles } from "lucide-react";
import { useApp } from "@/components/app-provider";
import { useViewport } from "@/lib/use-viewport";
import { useSwipe } from "@/lib/use-swipe";
import { EditorTopBar } from "@/components/editor/top-bar";
import { SlideRail } from "@/components/editor/slide-rail";
import { EditorCanvas } from "@/components/editor/canvas";
import { Inspector } from "@/components/editor/inspector";
import { AiModal } from "@/components/editor/ai-modal";
import { ExportDrawer } from "@/components/editor/export-drawer";
import { PreviewOverlay } from "@/components/editor/preview-overlay";
import { SlideCanvas } from "@/components/slide-canvas";
import { Button } from "@/components/ui/button";

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
        <MobilePreview viewportWidth={width} />
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

/** Below 768px the editor is read-only — editing needs a desktop. */
function MobilePreview({ viewportWidth }: { viewportWidth: number }) {
  const app = useApp();
  const width = Math.min(360, viewportWidth - 32);
  const swipe = useSwipe(app.nextSlide, app.prevSlide);

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-auto p-4 pb-[max(16px,env(safe-area-inset-bottom))]">
      <div className="flex items-center gap-2.5 rounded-card border border-line bg-surface px-3.5 py-3 text-[13px] text-t2">
        <Monitor size={16} strokeWidth={1.5} className="flex-none" />
        Open on desktop to edit. This is a read‑only preview — swipe to browse, export from here.
      </div>
      <div className="mx-auto overflow-hidden rounded-card border border-line" {...swipe}>
        <SlideCanvas
          slide={app.activeSlide}
          style={app.style}
          width={width}
          chrome={{
            handle: app.brand.handle,
            logo: app.brand.logo,
            index: app.active,
            total: app.doc.slides.length,
          }}
        />
      </div>
      <div className="flex items-center justify-center gap-2">
        <Button variant="secondary" size="icon" aria-label="Previous slide" onClick={app.prevSlide} disabled={app.active === 0}>
          <ChevronLeft size={16} strokeWidth={1.5} />
        </Button>
        <span className="tabular min-w-12 text-center text-[13px] text-t2">
          {app.active + 1} / {app.doc.slides.length}
        </span>
        <Button
          variant="secondary"
          size="icon"
          aria-label="Next slide"
          onClick={app.nextSlide}
          disabled={app.active === app.doc.slides.length - 1}
        >
          <ChevronRight size={16} strokeWidth={1.5} />
        </Button>
      </div>
      <div className="mx-auto flex w-full max-w-90 flex-col gap-2">
        <Button variant="secondary" onClick={app.openAi}>
          <Sparkles size={16} strokeWidth={1.5} />
          Regenerate from text
        </Button>
      </div>
    </div>
  );
}
