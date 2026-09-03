"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { SlideCanvas, type SlideChrome } from "./slide-canvas";
import type { SlideStyle } from "@/lib/doc-style";
import type { Slide } from "@/lib/types";

/** Live width of an element, kept current through a ResizeObserver. */
export function useElementWidth<T extends HTMLElement>(ref: RefObject<T | null>) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setWidth(el.clientWidth);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return width;
}

/**
 * A slide that fills whatever width its parent gives it — the same renderer
 * as the editor canvas, so cards and thumbnails are true previews.
 */
export function SlidePreview({
  slide,
  style,
  chrome,
  className,
  onTap,
}: {
  slide: Slide;
  style: SlideStyle;
  chrome?: SlideChrome;
  className?: string;
  onTap?: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const width = useElementWidth(ref);

  return (
    // `contain: inline-size` keeps the fixed-width canvas from feeding back
    // into its parent's intrinsic width (a grid track would otherwise grow).
    <div
      ref={ref}
      className={className}
      style={{ width: "100%", aspectRatio: "1080 / 1350", contain: "inline-size", overflow: "hidden" }}
    >
      {width > 0 ? (
        <SlideCanvas slide={slide} style={style} width={width} chrome={chrome} onTap={onTap} />
      ) : null}
    </div>
  );
}
