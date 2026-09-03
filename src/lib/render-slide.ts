import {
  ACCENT_SQUARE,
  BODY,
  BULLET,
  FOOTER,
  HEADER,
  HEADLINE,
  KICKER,
  PAD,
  SLIDE_SIZES,
  contentBox,
  headlineSize,
} from "./slide-layout";
import { ACCENT_FONT, parseRich, richWords, type RichToken } from "./rich-text";
import { contrastText } from "./color";
import type { SlideStyle } from "./doc-style";
import type { ExportSize, Slide } from "./types";

export interface RenderChrome {
  handle: string;
  name: string;
  initials: string;
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

/* ------------------------------------------------------- rich headlines */

interface RichWord extends RichToken {
  width: number;
}

function headlineFont(style: SlideStyle, hs: number, accent: boolean) {
  return accent
    ? `italic 400 ${hs}px ${ACCENT_FONT}`
    : `${style.weight} ${hs}px ${style.fontFamily}`;
}

/** Wrap a rich headline into lines of measured words. */
function wrapRich(ctx: Ctx, text: string, style: SlideStyle, hs: number, maxWidth: number) {
  const lines: RichWord[][] = [];
  const spaceWidth = (() => {
    ctx.font = headlineFont(style, hs, false);
    setLetterSpacing(ctx, HEADLINE.letterSpacing, hs);
    return ctx.measureText(" ").width;
  })();

  for (const paragraph of text.replace(/\r/g, "").split("\n")) {
    const words = richWords(parseRich(paragraph)).filter((w) => !/^\s+$/.test(w.text));
    let line: RichWord[] = [];
    let lineWidth = 0;
    for (const w of words) {
      ctx.font = headlineFont(style, hs, w.accent);
      setLetterSpacing(ctx, w.accent ? -0.01 : HEADLINE.letterSpacing, hs);
      const width = ctx.measureText(w.text).width;
      const add = line.length ? spaceWidth + width : width;
      if (line.length && lineWidth + add > maxWidth) {
        lines.push(line);
        line = [{ ...w, width }];
        lineWidth = width;
      } else {
        line.push({ ...w, width });
        lineWidth += add;
      }
    }
    lines.push(line);
  }
  return { lines, spaceWidth };
}

function lineWidth(line: RichWord[], spaceWidth: number) {
  return line.reduce((n, w, i) => n + w.width + (i ? spaceWidth : 0), 0);
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
  const isLast = chrome.index === chrome.total - 1;

  /* Header — avatar, name, handle, page counter. */
  if (style.header) {
    drawHeader(ctx, style, chrome);
  } else {
    ctx.font = `500 ${KICKER.size}px ${family}`;
    setLetterSpacing(ctx, KICKER.letterSpacing, KICKER.size);
    ctx.globalAlpha = KICKER.opacity;
    ctx.textAlign = "right";
    ctx.fillStyle = style.fg;
    ctx.fillText(`${chrome.index + 1} / ${chrome.total}`, w - PAD, PAD);
    ctx.globalAlpha = 1;
  }

  /* Measure the headline + body + bullets block. */
  const hs = headlineSize(slide.type, slide.headline);
  const { lines: headLines, spaceWidth } = wrapRich(ctx, slide.headline, style, hs, innerWidth);
  const headLine = hs * HEADLINE.lineHeight;
  const headHeight = headLines.length * headLine;

  const hasBody = slide.body.trim().length > 0;
  ctx.font = `400 ${BODY.size}px ${family}`;
  setLetterSpacing(ctx, 0, BODY.size);
  const bodyLines = hasBody ? wrapLines(ctx, slide.body, innerWidth) : [];
  const bodyLine = BODY.size * BODY.lineHeight;
  const bodyHeight = bodyLines.length * bodyLine;

  const bullets = slide.type === "list" ? (slide.bullets ?? []) : [];
  const bulletTextWidth = innerWidth - BULLET.marker - BULLET.markerGap;
  const measured = bullets.map((b) => {
    ctx.font = `600 ${BULLET.titleSize}px ${family}`;
    setLetterSpacing(ctx, -0.02, BULLET.titleSize);
    const title = wrapLines(ctx, b.title, bulletTextWidth);
    ctx.font = `400 ${BULLET.textSize}px ${family}`;
    setLetterSpacing(ctx, 0, BULLET.textSize);
    const text = b.text.trim() ? wrapLines(ctx, b.text, bulletTextWidth) : [];
    const height =
      title.length * BULLET.titleSize * BULLET.titleLineHeight +
      (text.length ? BULLET.gapTitleText + text.length * BULLET.textSize * BULLET.textLineHeight : 0);
    return { title, text, height };
  });
  const bulletsHeight = measured.length
    ? BULLET.gapAbove + measured.reduce((n, m) => n + m.height, 0) + (measured.length - 1) * BULLET.gapBetween
    : 0;

  const blockHeight = headHeight + (hasBody ? BODY.gapAbove + bodyHeight : 0) + bulletsHeight;
  const box = contentBox(size, style.header);
  let y =
    style.justify === "flex-start"
      ? box.top
      : style.justify === "center"
        ? box.top + (box.height - blockHeight) / 2
        : box.bottom - blockHeight;
  y = Math.max(box.top, y);

  /* Headline — plain words in the slide font, accent words in italic serif. */
  headLines.forEach((line, li) => {
    const width = lineWidth(line, spaceWidth);
    let x = style.align === "center" ? (w - width) / 2 : style.align === "right" ? w - PAD - width : PAD;
    const ly = y + li * headLine + (headLine - hs) / 2;
    ctx.textAlign = "left";
    line.forEach((word) => {
      ctx.font = headlineFont(style, hs, word.accent);
      setLetterSpacing(ctx, word.accent ? -0.01 : HEADLINE.letterSpacing, hs);
      ctx.fillStyle = word.accent ? style.accent : style.fg;
      ctx.fillText(word.text, x, ly);
      x += word.width + spaceWidth;
    });
    if (li === headLines.length - 1) {
      const sq = hs * ACCENT_SQUARE.size;
      ctx.fillStyle = style.accent;
      ctx.fillRect(x - spaceWidth + hs * ACCENT_SQUARE.gap, ly + hs * 0.78 - sq, sq, sq);
    }
  });
  ctx.fillStyle = style.fg;

  const alignX = style.align === "center" ? w / 2 : style.align === "right" ? w - PAD : PAD;

  if (hasBody) {
    ctx.font = `400 ${BODY.size}px ${family}`;
    setLetterSpacing(ctx, 0, BODY.size);
    ctx.textAlign = style.align;
    ctx.globalAlpha = BODY.opacity;
    const by = y + headHeight + BODY.gapAbove;
    bodyLines.forEach((line, i) => {
      ctx.fillText(line, alignX, by + i * bodyLine + (bodyLine - BODY.size) / 2);
    });
    ctx.globalAlpha = 1;
  }

  if (measured.length) {
    let by = y + headHeight + (hasBody ? BODY.gapAbove + bodyHeight : 0) + BULLET.gapAbove;
    const tx = PAD + BULLET.marker + BULLET.markerGap;
    ctx.textAlign = "left";
    measured.forEach((m) => {
      const titleLine = BULLET.titleSize * BULLET.titleLineHeight;
      ctx.fillStyle = style.accent;
      ctx.fillRect(PAD, by + (titleLine - BULLET.marker) / 2, BULLET.marker, BULLET.marker);
      ctx.fillStyle = style.fg;
      ctx.font = `600 ${BULLET.titleSize}px ${family}`;
      setLetterSpacing(ctx, -0.02, BULLET.titleSize);
      m.title.forEach((line, i) => {
        ctx.fillText(line, tx, by + i * titleLine + (titleLine - BULLET.titleSize) / 2);
      });
      let ty = by + m.title.length * titleLine;
      if (m.text.length) {
        ty += BULLET.gapTitleText;
        const textLine = BULLET.textSize * BULLET.textLineHeight;
        ctx.font = `400 ${BULLET.textSize}px ${family}`;
        setLetterSpacing(ctx, 0, BULLET.textSize);
        ctx.globalAlpha = BULLET.textOpacity;
        m.text.forEach((line, i) => {
          ctx.fillText(line, tx, ty + i * textLine + (textLine - BULLET.textSize) / 2);
        });
        ctx.globalAlpha = 1;
      }
      by += m.height + BULLET.gapBetween;
    });
  }

  /* Footer — swipe hint or handle on the left, progress dots on the right. */
  const fy = h - PAD - FOOTER.height;
  const mid = fy + FOOTER.height / 2;
  ctx.textBaseline = "middle";
  ctx.textAlign = "left";
  const showHint = !isLast && style.swipeHint.trim().length > 0;
  if (showHint) {
    ctx.fillStyle = style.accent;
    ctx.font = `600 ${FOOTER.hintSize}px ${family}`;
    setLetterSpacing(ctx, 0, FOOTER.hintSize);
    ctx.fillText(style.swipeHint, PAD, mid);
    const tw = ctx.measureText(style.swipeHint).width;
    drawArrow(ctx, PAD + tw + FOOTER.arrowGap, mid, FOOTER.hintSize, style.accent);
  } else {
    let fx = PAD;
    if (!style.header && chrome.logo && chrome.logo.naturalWidth > 0) {
      const lh = FOOTER.height;
      const lw = (chrome.logo.naturalWidth / chrome.logo.naturalHeight) * lh;
      ctx.drawImage(chrome.logo, fx, fy, lw, lh);
      fx += lw + FOOTER.logoGap;
    }
    ctx.fillStyle = style.fg;
    ctx.globalAlpha = FOOTER.opacity;
    ctx.font = `500 ${FOOTER.size}px ${family}`;
    setLetterSpacing(ctx, 0, FOOTER.size);
    ctx.fillText(chrome.handle, fx, mid);
    ctx.globalAlpha = 1;
  }

  const dotsWidth =
    (chrome.total - 1) * FOOTER.dotW + FOOTER.dotActiveW + (chrome.total - 1) * FOOTER.dotGap;
  let dx = w - PAD - dotsWidth;
  for (let i = 0; i < chrome.total; i++) {
    const active = i === chrome.index;
    const dw = active ? FOOTER.dotActiveW : FOOTER.dotW;
    ctx.fillStyle = active ? style.accent : style.fg;
    ctx.globalAlpha = active ? 1 : 0.3;
    roundRect(ctx, dx, mid - FOOTER.dotH / 2, dw, FOOTER.dotH, FOOTER.dotH / 2);
    ctx.fill();
    dx += dw + FOOTER.dotGap;
  }
  ctx.globalAlpha = 1;

  return canvas;
}

function drawHeader(ctx: Ctx, style: SlideStyle, chrome: RenderChrome) {
  const family = style.fontFamily;
  const r = HEADER.avatar / 2;
  const cx = PAD + r;
  const cy = PAD + r;

  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.closePath();
  ctx.fillStyle = style.accent;
  ctx.fill();
  if (chrome.logo && chrome.logo.naturalWidth > 0) {
    ctx.clip();
    const s = Math.max(HEADER.avatar / chrome.logo.naturalWidth, HEADER.avatar / chrome.logo.naturalHeight);
    const lw = chrome.logo.naturalWidth * s;
    const lh = chrome.logo.naturalHeight * s;
    ctx.drawImage(chrome.logo, cx - lw / 2, cy - lh / 2, lw, lh);
  } else {
    ctx.fillStyle = contrastText(style.accent);
    ctx.font = `700 ${HEADER.avatar * 0.4}px ${family}`;
    setLetterSpacing(ctx, -0.02, HEADER.avatar * 0.4);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(chrome.initials, cx, cy + 1);
  }
  ctx.restore();

  const tx = PAD + HEADER.avatar + HEADER.gap;
  const nameH = HEADER.nameSize * HEADER.lineHeight;
  const handleH = HEADER.handleSize * HEADER.lineHeight;
  const top = cy - (nameH + handleH) / 2;
  const maxW = SLIDE_SIZES.Post.w - PAD - tx - 160;

  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillStyle = style.fg;
  ctx.font = `600 ${HEADER.nameSize}px ${family}`;
  setLetterSpacing(ctx, -0.01, HEADER.nameSize);
  ctx.fillText(ellipsize(ctx, chrome.name, maxW), tx, top + (nameH - HEADER.nameSize) / 2);
  ctx.globalAlpha = 0.6;
  ctx.font = `400 ${HEADER.handleSize}px ${family}`;
  setLetterSpacing(ctx, 0, HEADER.handleSize);
  ctx.fillText(ellipsize(ctx, chrome.handle, maxW), tx, top + nameH + (handleH - HEADER.handleSize) / 2);
  ctx.globalAlpha = KICKER.opacity;
  ctx.font = `500 ${KICKER.size}px ${family}`;
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  ctx.fillText(`${chrome.index + 1} / ${chrome.total}`, SLIDE_SIZES.Post.w - PAD, cy);
  ctx.globalAlpha = 1;
  ctx.textBaseline = "top";
}

function ellipsize(ctx: Ctx, text: string, maxWidth: number) {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let t = text;
  while (t.length > 1 && ctx.measureText(`${t}…`).width > maxWidth) t = t.slice(0, -1);
  return `${t}…`;
}

function drawArrow(ctx: Ctx, x: number, cy: number, size: number, color: string) {
  const len = size * 0.72;
  const head = size * 0.26;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = size * 0.1;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(x, cy);
  ctx.lineTo(x + len, cy);
  ctx.moveTo(x + len - head, cy - head);
  ctx.lineTo(x + len, cy);
  ctx.lineTo(x + len - head, cy + head);
  ctx.stroke();
  ctx.restore();
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
