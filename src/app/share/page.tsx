"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useApp } from "@/components/app-provider";
import { decodeShare } from "@/lib/share";
import { docStyle } from "@/lib/doc-style";
import { useViewport } from "@/lib/use-viewport";
import { useSwipe } from "@/lib/use-swipe";
import { SlideCanvas } from "@/components/slide-canvas";
import { Wordmark } from "@/components/brand";
import { Button } from "@/components/ui/button";
import type { Doc } from "@/lib/types";

/** Public, read-only viewer for a carousel encoded in the URL fragment. */
export default function SharePage() {
  const app = useApp();
  const { width, ready } = useViewport();
  const [shared, setShared] = useState<{ doc: Doc; handle: string } | null | undefined>(undefined);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setShared(decodeShare(window.location.hash));
  }, []);

  const total = shared?.doc.slides.length ?? 0;
  const next = () => setIndex((i) => Math.min(total - 1, i + 1));
  const prev = () => setIndex((i) => Math.max(0, i - 1));
  const swipe = useSwipe(next, prev);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total]);

  if (shared === undefined || !ready) {
    return <div className="min-h-screen bg-shell" />;
  }

  if (shared === null) {
    return (
      <div className="flex min-h-screen flex-col p-6 sm:p-8">
        <Wordmark />
        <div className="m-auto flex max-w-90 flex-col items-center gap-4 text-center">
          <h1 className="m-0 text-2xl font-semibold">This link is missing its carousel.</h1>
          <p className="m-0 text-t2">Ask the sender to copy the share link again from the editor.</p>
          <Button variant="primary" asChild>
            <Link href="/">Go to Slidecast</Link>
          </Button>
        </div>
      </div>
    );
  }

  const { doc, handle } = shared;
  const slide = doc.slides[Math.min(index, total - 1)];
  const slideWidth = Math.min(420, width - 32);

  return (
    <div className="flex min-h-screen flex-col bg-shell">
      <header className="flex h-15 items-center justify-between border-b border-line bg-surface px-4 sm:px-6">
        <Wordmark />
        <Button variant="primary" size="sm" onClick={() => app.importDoc(doc)}>
          Open in Slidecast
        </Button>
      </header>

      <main className="m-auto flex w-full max-w-120 flex-col items-center gap-5 px-4 py-8">
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="m-0 text-xl font-semibold">{doc.title}</h1>
          <p className="m-0 text-[13px] text-t3">
            {total} slides · shared by {handle}
          </p>
        </div>

        <div className="overflow-hidden rounded-card border border-line shadow-float" {...swipe}>
          <SlideCanvas
            slide={slide}
            style={docStyle(doc)}
            width={slideWidth}
            chrome={{ handle, index, total }}
          />
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="icon" aria-label="Previous slide" onClick={prev} disabled={index === 0}>
            <ChevronLeft size={16} strokeWidth={1.5} />
          </Button>
          <span className="tabular min-w-12 text-center text-[13px] text-t2">
            {index + 1} / {total}
          </span>
          <Button variant="secondary" size="icon" aria-label="Next slide" onClick={next} disabled={index === total - 1}>
            <ChevronRight size={16} strokeWidth={1.5} />
          </Button>
        </div>

        <p className="m-0 text-center text-[13px] text-t3">
          Made with Slidecast.{" "}
          <Link href="/signup" className="font-medium text-accent">
            Turn your own idea into a carousel
          </Link>
        </p>
      </main>
    </div>
  );
}
