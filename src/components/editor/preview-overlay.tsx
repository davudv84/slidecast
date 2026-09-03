"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useApp } from "../app-provider";
import { useSwipe } from "@/lib/use-swipe";
import { SlideCanvas } from "../slide-canvas";

/** Full-screen, read-only run-through of the carousel. */
export function PreviewOverlay({ viewportWidth }: { viewportWidth: number }) {
  const app = useApp();
  const width = Math.min(360, viewportWidth * 0.8);
  const swipe = useSwipe(app.nextSlide, app.prevSlide);

  return (
    <AnimatePresence>
      {app.previewOpen ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          role="dialog"
          aria-label="Carousel preview"
          onClick={() => app.setPreviewOpen(false)}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-scrim-strong p-6"
          {...swipe}
        >
          <div onClick={(e) => e.stopPropagation()} className="overflow-hidden rounded-card">
            <SlideCanvas
              slide={app.activeSlide}
              style={app.style}
              width={width}
              chrome={app.chromeFor(app.active)}
            />
          </div>
          <div onClick={(e) => e.stopPropagation()} className="flex items-center gap-2 text-[13px] text-on-scrim">
            <OverlayButton label="Previous slide" onClick={app.prevSlide} disabled={app.active === 0}>
              <ChevronLeft size={16} strokeWidth={1.5} />
            </OverlayButton>
            <span className="tabular">
              {app.active + 1} / {app.doc.slides.length}
            </span>
            <OverlayButton label="Next slide" onClick={app.nextSlide} disabled={app.active === app.doc.slides.length - 1}>
              <ChevronRight size={16} strokeWidth={1.5} />
            </OverlayButton>
          </div>
          <span className="text-xs text-[var(--on-scrim-muted)]">Esc to close · ← → or swipe to navigate</span>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function OverlayButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="grid h-9 w-9 cursor-pointer place-items-center rounded-control border border-[var(--on-scrim-border)] bg-transparent text-on-scrim transition-opacity duration-150 ease-out hover:opacity-80 disabled:cursor-default disabled:opacity-30"
    >
      {children}
    </button>
  );
}
