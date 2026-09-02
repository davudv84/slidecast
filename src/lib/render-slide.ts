import {
  BODY,
  FOOTER,
  HEADLINE,
  KICKER,
  PAD,
  SLIDE_SIZES,
  contentBox,
  headlineSize,
  slideTypeLabel,
} from "./slide-layout";
import type { SlideStyle } from "./doc-style";
import type { ExportSize, Slide } from "./types";

export interface RenderChrome {
  handle: string;
  logo: HTMLImageElement | null;
  index: number;
  total: number;
}

export interface RenderOptions {
  slide: Slide;
  style: SlideStyle;
  size: ExportSize;
  scale: number;
  chrome: RenderChrome;
}

type Ctx = CanvasRenderingContext2D & { letterSpacing?: string };

function setLetterSpacing(ctx: Ctx, em: number, fontSize: number) {
  if ("letterSpacing" in ctx) ctx.letterSpacing = `${(em * fontSize).toFixed(2)}px`;
}

/** Greedy word wrap using the context's current font. */
export function wrapLines(ctx: Ctx, text: string, maxWidth: number) {
  const lines: string[] = [];
  for (const paragraph of text.replace(/\r/g, "").split("\n")) {
    const words = paragraph.split(/\s+/).filter(Boolean);
    if (words.length === 0) {
      lines.push("");
      continue;
    }
    let line = "";
    for (const word of words) {
      const candidate = line ? `${line} ${word}` : word;
      if (!line || ctx.measureText(candidate).width <= maxWidth) {
        line = candidate;
      } else {
        lines.push(line);
        line = word;
      }
    }
    lines.push(line);
  }
  return lines;
}

/** Paint one slide at Instagram resolution × `scale` onto a fresh canvas. */
export function renderSlide(opts: RenderOptions): HTMLCanvasElement {
  const { slide, style, size, scale, chrome } = opts;
  const { w, h } = SLIDE_SIZES[size];
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(w * scale);
  canvas.height = Math.round(h * scale);
  const ctx = canvas.getContext("2d") as Ctx;
  ctx.scale(scale, scale);

  ctx.fillStyle = style.bg;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = style.fg;
  ctx.textBaseline = "top";

  const family = style.fontFamily;
  const innerWidth = w - PAD * 2;

  /* Kicker — slide type left, page counter right. */
  ctx.font = `500 ${KICKER.size}px ${family}`;
  setLetterSpacing(ctx, KICKER.letterSpacing, KICKER.size);
  ctx.globalAlpha = KICKER.opacity;
  ctx.textAlign = "left";
  ctx.fillText(slideTypeLabel(slide.type), PAD, PAD);
  ctx.textAlign = "right";
  ctx.fillText(`${chrome.index + 1} / ${chrome.total}`, w - PAD, PAD);
  ctx.globalAlpha = 1;

  /* Headline + body block. */
  const hs = headlineSize(slide.type, slide.headline);
  ctx.font = `${style.weight} ${hs}px ${family}`;
  setLetterSpacing(ctx, HEADLINE.letterSpacing, hs);
  const headLines = wrapLines(ctx, slide.headline, innerWidth);
  const headLine = hs * HEADLINE.lineHeight;
  const headHeight = headLines.length * headLine;

  const hasBody = slide.body.trim().length > 0;
  ctx.font = `400 ${BODY.size}px ${family}`;
  setLetterSpacing(ctx, 0, BODY.size);
  const bodyLines = hasBody ? wrapLines(ctx, slide.body, innerWidth) : [];
  const bodyLine = BODY.size * BODY.lineHeight;
  const bodyHeight = bodyLines.length * bodyLine;

  const blockHeight = headHeight + (hasBody ? BODY.gapAbove + bodyHeight : 0);
  const box = contentBox(size);
  let y =
    style.justify === "flex-start"
      ? box.top
      : style.justify === "center"
        ? box.top + (box.height - blockHeight) / 2
        : box.bottom - blockHeight;
  y = Math.max(box.top, y);

  const x = style.align === "center" ? w / 2 : style.align === "right" ? w - PAD : PAD;
  ctx.textAlign = style.align;

  ctx.font = `${style.weight} ${hs}px ${family}`;
  setLetterSpacing(ctx, HEADLINE.letterSpacing, hs);
  headLines.forEach((line, i) => {
    // Nudge by the line-height slack so glyphs sit like the browser lays them.
    ctx.fillText(line, x, y + i * headLine + (headLine - hs) / 2);
  });

  if (hasBody) {
    ctx.font = `400 ${BODY.size}px ${family}`;
    setLetterSpacing(ctx, 0, BODY.size);
    ctx.globalAlpha = BODY.opacity;
    const by = y + headHeight + BODY.gapAbove;
    bodyLines.forEach((line, i) => {
      ctx.fillText(line, x, by + i * bodyLine + (bodyLine - BODY.size) / 2);
    });
    ctx.globalAlpha = 1;
  }

  /* Footer — logo, handle, progress dots. */
  const fy = h - PAD - FOOTER.height;
  const mid = fy + FOOTER.height / 2;
  ctx.globalAlpha = FOOTER.opacity;
  let fx = PAD;
  if (chrome.logo && chrome.logo.naturalWidth > 0) {
    const lh = FOOTER.height;
    const lw = (chrome.logo.naturalWidth / chrome.logo.naturalHeight) * lh;
    ctx.globalAlpha = 1;
    ctx.drawImage(chrome.logo, fx, fy, lw, lh);
    ctx.globalAlpha = FOOTER.opacity;
    fx += lw + FOOTER.logoGap;
  }
  ctx.font = `500 ${FOOTER.size}px ${family}`;
  setLetterSpacing(ctx, 0, FOOTER.size);
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(chrome.handle, fx, mid);

  const dotsWidth =
    (chrome.total - 1) * FOOTER.dotW + FOOTER.dotActiveW + (chrome.total - 1) * FOOTER.dotGap;
  let dx = w - PAD - dotsWidth;
  for (let i = 0; i < chrome.total; i++) {
    const active = i === chrome.index;
    const dw = active ? FOOTER.dotActiveW : FOOTER.dotW;
    ctx.globalAlpha = active ? 1 : 0.35;
    roundRect(ctx, dx, mid - FOOTER.dotH / 2, dw, FOOTER.dotH, FOOTER.dotH / 2);
    ctx.fill();
    dx += dw + FOOTER.dotGap;
  }
  ctx.globalAlpha = 1;

  return canvas;
}

function roundRect(ctx: Ctx, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arc(x + w - r, y + r, r, -Math.PI / 2, Math.PI / 2);
  ctx.lineTo(x + r, y + h);
  ctx.arc(x + r, y + r, r, Math.PI / 2, (3 * Math.PI) / 2);
  ctx.closePath();
}

export function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: "image/png" | "image/jpeg",
  quality?: number,
) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Canvas export failed"))),
      type,
      quality,
    );
  });
}

export function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Logo could not be loaded"));
    img.src = src;
  });
}
