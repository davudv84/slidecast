"use client";

import * as React from "react";
import type { SlideStyle } from "@/lib/doc-style";
import {
  ACCENT_SQUARE,
  BODY,
  BULLET,
  DETAIL,
  FOOTER,
  HEADER,
  HEADLINE,
  IMAGE_OVERLAY,
  KICKER,
  PAD,
  RULE,
  SLIDE_SIZES,
  contentBox,
  headlineSize,
} from "@/lib/slide-layout";
import { ACCENT_FONT, parseRich } from "@/lib/rich-text";
import { contrastText, hexToRgb } from "@/lib/color";
import { iconNode } from "@/lib/details";
import type { Align, Detail, ExportSize, Slide } from "@/lib/types";

export interface SlideChrome {
  handle: string;
  /** "Name | brand" line in the header. */
  name: string;
  initials: string;
  logo?: string | null;
  index: number;
  total: number;
}

export interface SlideCanvasProps {
  slide: Slide;
  style: SlideStyle;
  /** Rendered width in CSS pixels; height follows the chosen size's ratio. */
  width: number;
  size?: ExportSize;
  editable?: boolean;
  onHeadlineChange?: (value: string) => void;
  onBodyChange?: (value: string) => void;
  chrome?: SlideChrome;
  className?: string;
  onTap?: () => void;
}

/** rgba() for a hex slide colour at the given alpha. */
export function withAlpha(hex: string, alpha: number) {
  const rgb = hexToRgb(hex) ?? [0, 0, 0];
  return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`;
}

/**
 * A slide at authoring resolution (1080 wide), scaled to `width`. Geometry
 * comes from slide-layout.ts so the PNG export matches this pixel for pixel.
 */
export function SlideCanvas({
  slide,
  style,
  width,
  size = "Post",
  editable = false,
  onHeadlineChange,
  onBodyChange,
  chrome,
  className,
  onTap,
}: SlideCanvasProps) {
  const { w, h } = SLIDE_SIZES[size];
  const scale = width / w;
  const box = contentBox(size, style.header && !!chrome);
  const hs = headlineSize(slide.type, slide.headline);
  const isLast = chrome ? chrome.index === chrome.total - 1 : false;
  const bullets = slide.type === "list" ? (slide.bullets ?? []) : [];
  const hasBody = slide.body.trim().length > 0;
  const overlay = slide.imageOverlay ?? IMAGE_OVERLAY.default;

  return (
    <div
      className={className}
      style={{ width, height: width * (h / w), position: "relative", overflow: "hidden" }}
      onClick={onTap}
    >
      <div
        className="absolute left-0 top-0 transition-colors duration-200 ease-out"
        style={{
          width: w,
          height: h,
          transform: `scale(${scale})`,
          transformOrigin: "0 0",
          background: style.bg,
          color: style.fg,
          fontFamily: style.fontFamily,
        }}
      >
        {slide.image ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={slide.image}
              alt=""
              draggable={false}
              className="absolute inset-0"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(180deg, ${withAlpha(style.bg, overlay * 0.55)} 0%, ${withAlpha(style.bg, overlay)} 55%, ${withAlpha(style.bg, Math.min(1, overlay + 0.1))} 100%)`,
              }}
            />
          </>
        ) : null}

        {chrome && style.header ? (
          <Header chrome={chrome} style={style} />
        ) : chrome ? (
          <div
            className="absolute flex justify-end"
            style={{
              left: PAD,
              right: PAD,
              top: PAD,
              fontSize: KICKER.size,
              lineHeight: KICKER.lineHeight,
              letterSpacing: `${KICKER.letterSpacing}em`,
              opacity: KICKER.opacity,
              fontWeight: 500,
            }}
          >
            <span>
              {chrome.index + 1} / {chrome.total}
            </span>
          </div>
        ) : null}

        <div
          className="absolute flex flex-col"
          style={{
            left: PAD,
            right: PAD,
            top: box.top,
            height: box.height,
            justifyContent: style.justify,
            textAlign: style.align,
          }}
        >
          <EditableHeadline
            key={`h${slide.id}`}
            value={slide.headline}
            editable={editable}
            onCommit={onHeadlineChange}
            accent={style.accent}
            align={style.align}
            style={{
              fontSize: hs,
              fontWeight: style.weight,
              letterSpacing: `${HEADLINE.letterSpacing}em`,
              lineHeight: HEADLINE.lineHeight,
            }}
          />
          <span
            aria-hidden
            style={{
              display: "block",
              width: RULE.width,
              height: RULE.height,
              marginTop: RULE.gapAbove,
              background: style.accent,
              marginLeft: style.align === "left" ? 0 : "auto",
              marginRight: style.align === "right" ? 0 : "auto",
            }}
          />
          {hasBody || (editable && slide.type !== "list") ? (
            <EditableText
              key={`b${slide.id}`}
              value={slide.body}
              editable={editable}
              onCommit={onBodyChange}
              label="Body"
              placeholder={editable && !hasBody ? "Add a line of body copy…" : undefined}
              style={{
                fontSize: BODY.size,
                lineHeight: BODY.lineHeight,
                opacity: hasBody ? BODY.opacity : 0.35,
                marginTop: BODY.gapAbove,
                fontWeight: 400,
              }}
            />
          ) : null}
          {bullets.length ? <Bullets bullets={bullets} accent={style.accent} /> : null}
          {slide.detail ? <DetailView detail={slide.detail} style={style} /> : null}
        </div>

        {chrome ? (
          <Footer chrome={chrome} style={style} isLast={isLast} />
        ) : null}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- header */

function Header({ chrome, style }: { chrome: SlideChrome; style: SlideStyle }) {
  return (
    <div
      className="absolute flex items-center"
      style={{ left: PAD, right: PAD, top: PAD, height: HEADER.avatar, gap: HEADER.gap }}
    >
      <span
        className="grid flex-none place-items-center overflow-hidden rounded-full"
        style={{
          width: HEADER.avatar,
          height: HEADER.avatar,
          background: style.accent,
          color: contrastText(style.accent),
          fontSize: HEADER.avatar * 0.4,
          fontWeight: 700,
          letterSpacing: "-0.02em",
        }}
      >
        {chrome.logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={chrome.logo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          chrome.initials
        )}
      </span>
      <span className="flex min-w-0 flex-1 flex-col" style={{ lineHeight: HEADER.lineHeight }}>
        <span
          className="truncate"
          style={{ fontSize: HEADER.nameSize, fontWeight: 600, letterSpacing: "-0.01em" }}
        >
          {chrome.name}
        </span>
        <span className="truncate" style={{ fontSize: HEADER.handleSize, opacity: 0.6 }}>
          {chrome.handle}
        </span>
      </span>
      <span
        className="flex-none"
        style={{ fontSize: KICKER.size, opacity: KICKER.opacity, fontWeight: 500 }}
      >
        {chrome.index + 1} / {chrome.total}
      </span>
    </div>
  );
}

/* ---------------------------------------------------------------- footer */

function Footer({ chrome, style, isLast }: { chrome: SlideChrome; style: SlideStyle; isLast: boolean }) {
  const showHint = !isLast && style.swipeHint.trim().length > 0;
  return (
    <div
      className="absolute flex items-center justify-between"
      style={{ left: PAD, right: PAD, bottom: PAD, height: FOOTER.height, fontWeight: 500 }}
    >
      {showHint ? (
        <span
          className="flex items-center"
          style={{ color: style.accent, fontSize: FOOTER.hintSize, fontWeight: 600, gap: FOOTER.arrowGap }}
        >
          {style.swipeHint}
          <svg
            width={FOOTER.hintSize}
            height={FOOTER.hintSize}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.4}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </span>
      ) : (
        <span className="flex items-center" style={{ gap: FOOTER.logoGap, fontSize: FOOTER.size }}>
          {!style.header && chrome.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={chrome.logo} alt="" style={{ height: FOOTER.height, width: "auto", display: "block" }} />
          ) : null}
          <span style={{ opacity: FOOTER.opacity }}>{chrome.handle}</span>
        </span>
      )}
      <span className="flex items-center" style={{ gap: FOOTER.dotGap }}>
        {Array.from({ length: chrome.total }, (_, i) => (
          <span
            key={i}
            style={{
              width: i === chrome.index ? FOOTER.dotActiveW : FOOTER.dotW,
              height: FOOTER.dotH,
              borderRadius: FOOTER.dotH / 2,
              background: i === chrome.index ? style.accent : "currentColor",
              opacity: i === chrome.index ? 1 : 0.3,
              transition: "width 150ms ease-out",
            }}
          />
        ))}
      </span>
    </div>
  );
}

/* --------------------------------------------------------------- bullets */

function Bullets({ bullets, accent }: { bullets: { title: string; text: string }[]; accent: string }) {
  return (
    <div className="flex flex-col" style={{ marginTop: BULLET.gapAbove, gap: BULLET.gapBetween }}>
      {bullets.map((b, i) => (
        <div key={i} className="flex" style={{ gap: BULLET.markerGap }}>
          <span
            className="flex-none"
            style={{
              width: BULLET.marker,
              height: BULLET.marker,
              background: accent,
              marginTop: (BULLET.titleSize * BULLET.titleLineHeight - BULLET.marker) / 2,
            }}
          />
          <span className="flex min-w-0 flex-col" style={{ gap: BULLET.gapTitleText, textAlign: "left" }}>
            <span
              style={{
                fontSize: BULLET.titleSize,
                lineHeight: BULLET.titleLineHeight,
                fontWeight: 600,
                letterSpacing: "-0.02em",
              }}
            >
              {b.title}
            </span>
            {b.text ? (
              <span
                style={{
                  fontSize: BULLET.textSize,
                  lineHeight: BULLET.textLineHeight,
                  opacity: BULLET.textOpacity,
                }}
              >
                {b.text}
              </span>
            ) : null}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------- detail */

/** Inline SVG from Lucide node data, sized in slide pixels. */
export function IconGlyph({ name, size, color, strokeWidth = DETAIL.iconStroke }: { name: string; size: number; color: string; strokeWidth?: number }) {
  const node = iconNode(name);
  if (!node) return null;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {node.map(([tag, attrs], i) => React.createElement(tag, { key: i, ...attrs }))}
    </svg>
  );
}

function DetailView({ detail, style }: { detail: Detail; style: SlideStyle }) {
  const alignSelf = style.align === "center" ? "center" : style.align === "right" ? "flex-end" : "flex-start";
  if (detail.kind === "icon") {
    return (
      <div style={{ marginTop: DETAIL.gapAbove, alignSelf, lineHeight: 0 }}>
        <IconGlyph name={detail.name} size={DETAIL.icon} color={style.accent} />
      </div>
    );
  }
  if (detail.kind === "image") {
    return (
      <div style={{ marginTop: DETAIL.gapAbove, alignSelf, lineHeight: 0 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={detail.src}
          alt=""
          draggable={false}
          style={{ maxHeight: DETAIL.imageMax, maxWidth: SLIDE_SIZES.Post.w - PAD * 2, objectFit: "contain", display: "block" }}
        />
      </div>
    );
  }
  const bars = detail.bars;
  return (
    <div
      className="flex items-end"
      style={{ marginTop: DETAIL.gapAbove, alignSelf, gap: DETAIL.barGapText, textAlign: "left" }}
    >
      <div className="flex flex-col" style={{ gap: DETAIL.statGap }}>
        <span
          style={{
            fontSize: DETAIL.statValue,
            lineHeight: 1,
            fontWeight: 700,
            letterSpacing: "-0.03em",
            color: style.accent,
          }}
        >
          {detail.value}
        </span>
        <span style={{ fontSize: DETAIL.statLabel, lineHeight: 1.3, opacity: BODY.opacity, maxWidth: 520 }}>
          {detail.label}
        </span>
      </div>
      {bars ? (
        <div className="flex items-end" style={{ gap: DETAIL.barGap, height: DETAIL.barMaxH }}>
          {bars.map((v, i) => {
            const max = Math.max(...bars);
            return (
              <span
                key={i}
                style={{
                  width: DETAIL.barW,
                  height: Math.max(12, (v / max) * DETAIL.barMaxH),
                  background: i === bars.length - 1 ? style.accent : "currentColor",
                  opacity: i === bars.length - 1 ? 1 : 0.25,
                  borderRadius: 4,
                }}
              />
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

/* ---------------------------------------------------------- editable text */

function EditableHeadline({
  value,
  editable,
  onCommit,
  accent,
  align,
  style,
}: {
  value: string;
  editable: boolean;
  onCommit?: (value: string) => void;
  accent: string;
  align: Align;
  style: React.CSSProperties;
}) {
  const [editing, setEditing] = React.useState(false);
  const tokens = parseRich(value);
  const fontSize = typeof style.fontSize === "number" ? style.fontSize : 84;

  return (
    <div
      contentEditable={editable}
      suppressContentEditableWarning
      role={editable ? "textbox" : undefined}
      aria-label={editable ? "Headline" : undefined}
      title={editable ? "Double-click to edit · wrap a word in *asterisks* to highlight it" : undefined}
      onFocus={editable ? () => setEditing(true) : undefined}
      onBlur={
        editable
          ? (e) => {
              setEditing(false);
              const next = e.currentTarget.innerText.replace(/\n{2,}/g, "\n").trim();
              if (next !== value) onCommit?.(next);
            }
          : undefined
      }
      onDoubleClick={editable ? (e) => e.currentTarget.focus() : undefined}
      onKeyDown={
        editable
          ? (e) => {
              if (e.key === "Escape") e.currentTarget.blur();
            }
          : undefined
      }
      style={{
        whiteSpace: "pre-wrap",
        overflowWrap: "break-word",
        cursor: editable ? "text" : undefined,
        outline: "none",
        textAlign: align,
        ...style,
      }}
    >
      {editing ? (
        value
      ) : (
        <>
          {tokens.map((t, i) =>
            t.accent ? (
              <span
                key={i}
                style={{
                  fontFamily: ACCENT_FONT,
                  fontStyle: "italic",
                  fontWeight: 400,
                  color: accent,
                  letterSpacing: "-0.01em",
                }}
              >
                {t.text}
              </span>
            ) : (
              <React.Fragment key={i}>{t.text}</React.Fragment>
            ),
          )}
          <span
            aria-hidden
            contentEditable={false}
            style={{
              display: "inline-block",
              width: fontSize * ACCENT_SQUARE.size,
              height: fontSize * ACCENT_SQUARE.size,
              marginLeft: fontSize * ACCENT_SQUARE.gap,
              background: accent,
              verticalAlign: "baseline",
            }}
          />
        </>
      )}
    </div>
  );
}

function EditableText({
  value,
  editable,
  onCommit,
  label,
  placeholder,
  style,
}: {
  value: string;
  editable: boolean;
  onCommit?: (value: string) => void;
  label: string;
  placeholder?: string;
  style: React.CSSProperties;
}) {
  return (
    <div
      contentEditable={editable}
      suppressContentEditableWarning
      role={editable ? "textbox" : undefined}
      aria-label={editable ? label : undefined}
      data-placeholder={placeholder}
      onBlur={
        editable
          ? (e) => {
              const next = e.currentTarget.innerText.replace(/\n{2,}/g, "\n").trim();
              if (next !== value) onCommit?.(next);
            }
          : undefined
      }
      onDoubleClick={editable ? (e) => e.currentTarget.focus() : undefined}
      onKeyDown={
        editable
          ? (e) => {
              if (e.key === "Escape") e.currentTarget.blur();
            }
          : undefined
      }
      style={{
        whiteSpace: "pre-wrap",
        overflowWrap: "break-word",
        cursor: editable ? "text" : undefined,
        outline: "none",
        ...style,
      }}
    >
      {value || placeholder || ""}
    </div>
  );
}
