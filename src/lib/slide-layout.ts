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

/** Tweet-style header: round avatar, then "Name | brand" and the handle. */
export const HEADER = {
  avatar: 88,
  gap: 26,
  nameSize: 40,
  handleSize: 30,
  lineHeight: 1.2,
  gapBelow: 72,
};

/** Fallback kicker (page counter only) when the header is switched off. */
export const KICKER = { size: 30, lineHeight: 1.2, letterSpacing: 0.08, opacity: 0.5, gapBelow: 48 };

export const HEADLINE = { lineHeight: 1.06, letterSpacing: -0.03 };

/** The small accent square that closes a headline. */
export const ACCENT_SQUARE = { size: 0.26, gap: 0.18 };

export const BODY = { size: 40, lineHeight: 1.4, opacity: 0.72, gapAbove: 28 };

/** Short accent rule under every headline. */
export const RULE = { width: 140, height: 8, gapAbove: 30 };

/** The detail visual under the body: icon, stat graphic or picture. */
export const DETAIL = {
  gapAbove: 56,
  icon: 200,
  iconStroke: 1.5,
  statValue: 128,
  statLabel: 34,
  statGap: 10,
  barW: 88,
  barGap: 22,
  barMaxH: 160,
  barGapText: 48,
  imageMax: 320,
};

/** Photo overlay: how dark the slide colour sits over a background image. */
export const IMAGE_OVERLAY = { min: 0.25, max: 0.95, default: 0.7 };

/** List slides: accent square, bold title, muted explanation. */
export const BULLET = {
  marker: 18,
  markerGap: 34,
  titleSize: 52,
  titleLineHeight: 1.15,
  textSize: 36,
  textLineHeight: 1.35,
  textOpacity: 0.72,
  gapTitleText: 10,
  gapBetween: 44,
  gapAbove: 56,
};

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
  hintSize: 34,
  arrowGap: 14,
};

/** Headline size by slide type, shrinking for long copy so it never overflows. */
export function headlineSize(type: SlideType, text: string) {
  const base = type === "hook" || type === "cta" ? 104 : type === "quote" ? 72 : type === "list" ? 76 : 84;
  const len = text.replace(/\*/g, "").trim().length;
  const factor = len > 160 ? 0.58 : len > 110 ? 0.7 : len > 70 ? 0.84 : 1;
  return Math.round(base * factor);
}

/** Vertical band the headline + body block is justified within. */
export function contentBox(size: ExportSize, header: boolean) {
  const { h } = SLIDE_SIZES[size];
  const top = header
    ? PAD + HEADER.avatar + HEADER.gapBelow
    : PAD + KICKER.size * KICKER.lineHeight + KICKER.gapBelow;
  const bottom = h - PAD - FOOTER.height - FOOTER.gapAbove;
  return { top, bottom, height: bottom - top };
}

export function slideTypeLabel(type: SlideType) {
  return type.toUpperCase();
}
