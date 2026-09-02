"use client";

import * as React from "react";
import type { SlideStyle } from "@/lib/doc-style";
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
} from "@/lib/slide-layout";
import type { Align, ExportSize, Slide } from "@/lib/types";

export interface SlideChrome {
  handle: string;
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
}: SlideCanvasProps) {
  const { w, h } = SLIDE_SIZES[size];
  const scale = width / w;
  const box = contentBox(size);
  const hs = headlineSize(slide.type, slide.headline);

  return (
    <div
      className={className}
      style={{ width, height: width * (h / w), position: "relative", overflow: "hidden" }}
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
        {chrome ? (
          <div
            className="absolute flex justify-between uppercase"
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
            <span>{slideTypeLabel(slide.type)}</span>
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
          <EditableText
            key={`h${slide.id}`}
            value={slide.headline}
            editable={editable}
            onCommit={onHeadlineChange}
            label="Headline"
            style={{
              fontSize: hs,
              fontWeight: style.weight,
              letterSpacing: `${HEADLINE.letterSpacing}em`,
              lineHeight: HEADLINE.lineHeight,
            }}
          />
          <EditableText
            key={`b${slide.id}`}
            value={slide.body}
            editable={editable}
            onCommit={onBodyChange}
            label="Body"
            style={{
              fontSize: BODY.size,
              lineHeight: BODY.lineHeight,
              opacity: BODY.opacity,
              marginTop: BODY.gapAbove,
              fontWeight: 400,
            }}
          />
        </div>

        {chrome ? (
          <div
            className="absolute flex items-center justify-between"
            style={{
              left: PAD,
              right: PAD,
              bottom: PAD,
              height: FOOTER.height,
              fontSize: FOOTER.size,
              fontWeight: 500,
            }}
          >
            <span className="flex items-center" style={{ gap: FOOTER.logoGap }}>
              {chrome.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={chrome.logo}
                  alt=""
                  style={{ height: FOOTER.height, width: "auto", display: "block" }}
                />
              ) : null}
              <span style={{ opacity: FOOTER.opacity }}>{chrome.handle}</span>
            </span>
            <span className="flex items-center" style={{ gap: FOOTER.dotGap }}>
              {Array.from({ length: chrome.total }, (_, i) => (
                <span
                  key={i}
                  style={{
                    width: i === chrome.index ? FOOTER.dotActiveW : FOOTER.dotW,
                    height: FOOTER.dotH,
                    borderRadius: FOOTER.dotH / 2,
                    background: "currentColor",
                    opacity: i === chrome.index ? 1 : 0.35,
                    transition: "width 150ms ease-out",
                  }}
                />
              ))}
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function EditableText({
  value,
  editable,
  onCommit,
  label,
  style,
}: {
  value: string;
  editable: boolean;
  onCommit?: (value: string) => void;
  label: string;
  style: React.CSSProperties;
}) {
  return (
    <div
      contentEditable={editable}
      suppressContentEditableWarning
      role={editable ? "textbox" : undefined}
      aria-label={editable ? label : undefined}
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
      {value}
    </div>
  );
}

/**
 * Small static preview — dashboard cards, template cards, rail thumbnails.
 * Type and padding scale with the card, so no transform is needed.
 */
export function SlideThumb({
  headline,
  bg,
  fg,
  fontFamily,
  justify,
  weight,
  align = "left",
  fontSize = 15,
  padding = "10%",
  className,
  children,
}: {
  headline: React.ReactNode;
  bg: string;
  fg: string;
  fontFamily: string;
  justify: string;
  weight: number;
  align?: Align;
  fontSize?: number;
  padding?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={className}
      style={{
        aspectRatio: "1080 / 1350",
        background: bg,
        color: fg,
        fontFamily,
        padding,
        display: "flex",
        flexDirection: "column",
        justifyContent: justify,
        textAlign: align,
        fontSize,
        fontWeight: weight,
        letterSpacing: "-0.03em",
        lineHeight: 1.1,
        textWrap: "pretty",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {headline}
      {children}
    </div>
  );
}
