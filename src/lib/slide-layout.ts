import type { ExportSize, SlideType } from "./types";

/**
 * Slide geometry, authored at Instagram resolution. The on-screen canvas and
 * the PNG/PDF renderer both read from here so what you see is what you export.
 */
export const SLIDE_SIZES: Record<ExportSize, { w: number; h: number }> = {
  Post: { w: 1080, h: 1350 },
  Story: { w: 1080, h: 1920 },
};

export const PAD = 96;

export const KICKER = { size: 34, lineHeight: 1.2, letterSpacing: 0.1, opacity: 0.55, gapBelow: 40 };
export const HEADLINE = { lineHeight: 1.05, letterSpacing: -0.03 };
export const BODY = { size: 40, lineHeight: 1.4, opacity: 0.78, gapAbove: 32 };
export const FOOTER = {
  size: 30,
  opacity: 0.55,
  height: 44,
  gapAbove: 60,
  logoGap: 16,
  dotH: 8,
  dotW: 12,
  dotActiveW: 40,
  dotGap: 10,
};

/** Headline size by slide type, shrinking for long copy so it never overflows. */
export function headlineSize(type: SlideType, text: string) {
  const base = type === "hook" || type === "cta" ? 96 : type === "quote" ? 72 : 84;
  const len = text.trim().length;
  const factor = len > 160 ? 0.6 : len > 110 ? 0.72 : len > 70 ? 0.85 : 1;
  return Math.round(base * factor);
}

/** Vertical band the headline + body block is justified within. */
export function contentBox(size: ExportSize) {
  const { h } = SLIDE_SIZES[size];
  const top = PAD + KICKER.size * KICKER.lineHeight + KICKER.gapBelow;
  const bottom = h - PAD - FOOTER.height - FOOTER.gapAbove;
  return { top, bottom, height: bottom - top };
}

export function slideTypeLabel(type: SlideType) {
  return type.toUpperCase();
}
