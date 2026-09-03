"use client";

import { useMemo, useRef, useState } from "react";
import { BarChart3, ImagePlus, Sparkles, Trash2, Upload, X } from "lucide-react";
import { useApp } from "../app-provider";
import { Button } from "../ui/button";
import { IconGlyph } from "../slide-canvas";
import { autoDetail, findDetailIcons, iconLabel, statFromSlide } from "@/lib/details";
import { IMAGE_OVERLAY } from "@/lib/slide-layout";
import { LOGO_ACCEPT, fileToSlideImage } from "@/lib/upload";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------- background */

/** Per-slide background photo with the readability overlay. */
export function BackgroundEditor() {
  const app = useApp();
  const slide = app.activeSlide;
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const overlay = slide.imageOverlay ?? IMAGE_OVERLAY.default;

  const accept = async (file?: File | null) => {
    if (!file) return;
    setBusy(true);
    try {
      const image = await fileToSlideImage(file);
      app.updateActive({ image });
      app.toast("Background added — the text keeps its layout.");
    } catch (err) {
      app.toast(err instanceof Error ? err.message : "Could not read that file.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 text-[13px] text-t2">
      <span className="flex items-center justify-between">
        Background photo
        {slide.image ? (
          <Button variant="ghost" size="sm" className="h-7 px-2 text-[12px]" onClick={() => app.updateActive({ image: null })}>
            <Trash2 size={13} strokeWidth={1.5} />
            Remove
          </Button>
        ) : null}
      </span>
      <input
        ref={input}
        type="file"
        accept={LOGO_ACCEPT}
        className="sr-only"
        aria-label="Upload background photo"
        onChange={(e) => {
          void accept(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      {slide.image ? (
        <div className="flex items-center gap-3 rounded-control border border-line p-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={slide.image} alt="" className="h-14 w-11 flex-none rounded-[4px] object-cover" />
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <label className="flex items-center justify-between text-[12px] text-t2">
              Overlay
              <span className="tabular text-t3">{Math.round(overlay * 100)}%</span>
            </label>
            <input
              type="range"
              min={IMAGE_OVERLAY.min * 100}
              max={IMAGE_OVERLAY.max * 100}
              value={Math.round(overlay * 100)}
              onChange={(e) => app.updateActive({ imageOverlay: Number(e.target.value) / 100 })}
              aria-label="Overlay strength"
              className="h-1 w-full cursor-pointer accent-[var(--accent)]"
            />
            <button type="button" onClick={() => input.current?.click()} className="w-fit cursor-pointer text-[12px] text-accent hover:underline">
              Replace photo
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => input.current?.click()}
          disabled={busy}
          className="flex h-16 cursor-pointer items-center justify-center gap-2 rounded-control border border-dashed border-line text-t2 transition-colors duration-150 ease-out hover:border-accent hover:text-t1 disabled:opacity-60"
        >
          <ImagePlus size={16} strokeWidth={1.5} />
          {busy ? "Reading…" : "Add a photo behind this slide"}
        </button>
      )}
      <span className="text-t3">Photos sit behind a dark-to-darker overlay so the headline stays readable.</span>
    </div>
  );
}

/* ----------------------------------------------------------------- detail */

/**
 * The visual under the text. "Find" matches the copy against the icon
 * library, "Stat" lifts the strongest number, "Upload" takes a picture.
 */
export function DetailEditor() {
  const app = useApp();
  const slide = app.activeSlide;
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const detail = slide.detail ?? null;

  const candidates = useMemo(() => findDetailIcons(slide, expanded ? 24 : 8), [slide, expanded]);
  const stat = useMemo(() => statFromSlide(slide), [slide]);

  const accept = async (file?: File | null) => {
    if (!file) return;
    setBusy(true);
    try {
      const src = await fileToSlideImage(file, 640);
      app.updateActive({ detail: { kind: "image", src } });
    } catch (err) {
      app.toast(err instanceof Error ? err.message : "Could not read that file.");
    } finally {
      setBusy(false);
    }
  };

  const find = () => {
    const next = autoDetail(slide);
    app.updateActive({ detail: next });
    app.toast(
      next.kind === "stat"
        ? `Stat graphic from “${next.value}”`
        : next.kind === "icon"
          ? `Detail: ${iconLabel(next.name)} — tap another to swap`
          : "Detail added",
    );
  };

  return (
    <div className="flex flex-col gap-2 text-[13px] text-t2">
      <span className="flex items-center justify-between">
        Detail visual
        {detail ? (
          <Button variant="ghost" size="sm" className="h-7 px-2 text-[12px]" onClick={() => app.updateActive({ detail: null })}>
            <X size={13} strokeWidth={1.5} />
            Remove
          </Button>
        ) : null}
      </span>

      <div className="flex flex-wrap gap-2">
        <Button variant="primary" size="sm" onClick={find}>
          <Sparkles size={14} strokeWidth={1.5} />
          Find a fitting detail
        </Button>
        {stat ? (
          <Button
            variant="secondary"
            size="sm"
            aria-pressed={detail?.kind === "stat"}
            onClick={() => app.updateActive({ detail: stat })}
          >
            <BarChart3 size={14} strokeWidth={1.5} />
            Stat: {stat.value}
          </Button>
        ) : null}
        <Button variant="secondary" size="sm" onClick={() => input.current?.click()} loading={busy}>
          <Upload size={14} strokeWidth={1.5} />
          Upload
        </Button>
        <input
          ref={input}
          type="file"
          accept={LOGO_ACCEPT}
          className="sr-only"
          aria-label="Upload detail picture"
          onChange={(e) => {
            void accept(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </div>

      <div className="grid grid-cols-4 gap-1.5">
        {candidates.map((name) => {
          const on = detail?.kind === "icon" && detail.name === name;
          return (
            <button
              key={name}
              type="button"
              title={iconLabel(name)}
              aria-label={`Use ${iconLabel(name)} icon`}
              aria-pressed={on}
              onClick={() => app.updateActive({ detail: { kind: "icon", name } })}
              className={cn(
                "grid aspect-square cursor-pointer place-items-center rounded-control border transition-colors duration-150 ease-out hover:border-t3",
                on ? "border-accent bg-accent-soft" : "border-line bg-surface",
              )}
            >
              <IconGlyph name={name} size={22} color={on ? "var(--accent)" : "var(--t1)"} strokeWidth={1.6} />
            </button>
          );
        })}
      </div>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-fit cursor-pointer text-[12px] text-accent hover:underline"
      >
        {expanded ? "Fewer icons" : "More icons that fit this slide"}
      </button>

      {detail?.kind === "stat" ? (
        <div className="grid grid-cols-[1fr_2fr] gap-2">
          <label className="flex flex-col gap-1 text-[12px] text-t2">
            Figure
            <input
              defaultValue={detail.value}
              aria-label="Stat figure"
              className="h-8 rounded-control border border-line bg-surface px-2 text-sm text-t1 focus:border-accent focus:outline-none"
              onBlur={(e) => app.updateActive({ detail: { ...detail, value: e.target.value } })}
            />
          </label>
          <label className="flex flex-col gap-1 text-[12px] text-t2">
            Label
            <input
              defaultValue={detail.label}
              aria-label="Stat label"
              className="h-8 rounded-control border border-line bg-surface px-2 text-sm text-t1 focus:border-accent focus:outline-none"
              onBlur={(e) => app.updateActive({ detail: { ...detail, label: e.target.value } })}
            />
          </label>
        </div>
      ) : null}

      <span className="text-t3">
        Icons are matched to the words on this slide; the stat graphic is built from the numbers in it.
      </span>
    </div>
  );
}
