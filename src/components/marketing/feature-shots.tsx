"use client";

import { ChevronDown } from "lucide-react";
import { GEN_HEADS, TEMPLATES, TONES } from "@/lib/data";

/* Feature sections show the real product surfaces, not stock illustrations. */

/** The "Ink" template — slide artwork colours for the editor mock. */
const INK = TEMPLATES[1];

export function GenerateShot() {
  const swatches = [0, 1, 5, 10].map((id) => TEMPLATES[id]);
  return (
    <div className="flex flex-col gap-3.5 rounded-card border border-line bg-surface p-5">
      <div className="text-sm font-medium">New carousel</div>
      <div className="rounded-control border border-line p-3 text-sm leading-normal text-t1">
        Most creators post 3× a week and wonder why nothing sticks. The ones who
        win post one carousel every day for 90 days. Here&rsquo;s the system I
        used to go from 800 to 41k followers.
      </div>
      <div className="flex flex-wrap gap-2">
        {TONES.map((tone, i) => (
          <span
            key={tone}
            className={
              i === 0
                ? "rounded-control border border-accent bg-accent-soft px-2.5 py-1.5 text-[13px] text-accent"
                : "rounded-control border border-line px-2.5 py-1.5 text-[13px] text-t2"
            }
          >
            {tone}
          </span>
        ))}
      </div>
      <div className="flex items-center justify-between text-[13px] text-t2">
        <span>8 slides</span>
        <span className="relative mx-3 h-1 flex-1 rounded-full bg-line">
          <span className="absolute left-0 top-0 h-full w-[60%] rounded-full bg-accent" />
          <span className="absolute -top-1 left-[60%] h-3 w-3 -translate-x-1/2 rounded-full border-2 border-accent bg-surface" />
        </span>
        <span>10</span>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {swatches.map((t, i) => (
          <div
            key={t.id}
            className="flex items-end rounded-control border border-line p-2 text-[9px] font-semibold leading-tight tracking-[-0.02em]"
            style={{
              aspectRatio: "4 / 5",
              background: t.bg,
              color: t.fg,
              opacity: i < 3 ? 1 : 0.35,
            }}
          >
            {GEN_HEADS[i]}
          </div>
        ))}
      </div>
    </div>
  );
}

export function EditorShot() {
  return (
    <div className="overflow-hidden rounded-card border border-line bg-surface">
      <div className="flex items-center justify-between border-b border-line px-3.5 py-2.5 text-[13px]">
        <span className="font-medium">90-day carousel system</span>
        <span className="text-t3">Saved</span>
      </div>
      <div className="grid h-65 grid-cols-[48px_1fr] sm:grid-cols-[56px_1fr_180px]">
        <div className="flex flex-col gap-1.5 border-r border-line p-2">
          <span
            className="rounded-[4px] border-2 border-accent"
            style={{ aspectRatio: "4 / 5", background: INK.bg }}
          />
          <span
            className="rounded-[4px] border border-line bg-shell"
            style={{ aspectRatio: "4 / 5" }}
          />
          <span
            className="rounded-[4px] border border-line bg-shell"
            style={{ aspectRatio: "4 / 5" }}
          />
        </div>
        <div className="grid place-items-center bg-shell">
          <div
            className="flex w-35 max-w-[80%] items-end rounded-[4px] p-3.5 text-[13px] font-semibold leading-none tracking-[-0.03em]"
            style={{ aspectRatio: "4 / 5", background: INK.bg, color: INK.fg }}
          >
            Post one carousel a day. Not three a week.
          </div>
        </div>
        <div className="hidden flex-col gap-2.5 border-l border-line p-3 text-xs sm:flex">
          <div className="flex gap-1 border-b border-line pb-2">
            <span className="-mb-[9px] border-b-2 border-accent pb-1.5 font-medium">
              Content
            </span>
            <span className="px-2 text-t3">Style</span>
            <span className="text-t3">Brand</span>
          </div>
          <div className="text-t3">Headline</div>
          <div className="rounded-control border border-line px-2 py-1.5">
            Post one carousel a day.
          </div>
          <div className="text-t3">Slide type</div>
          <div className="flex justify-between rounded-control border border-line px-2 py-1.5">
            Hook
            <ChevronDown size={12} strokeWidth={1.5} className="text-t3" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ExportShot() {
  return (
    <div className="flex flex-col gap-3.5 rounded-card border border-line bg-surface p-5 text-[13px]">
      <div className="text-sm font-medium">Export</div>
      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col gap-0.5 rounded-control border border-accent bg-accent-soft p-2.5">
          <span className="font-medium">PNG</span>
          <span className="text-t2">8 files · 1080×1350</span>
        </div>
        <div className="flex flex-col gap-0.5 rounded-control border border-line p-2.5">
          <span className="font-medium">PDF</span>
          <span className="text-t2">1 file · LinkedIn ready</span>
        </div>
      </div>
      <div className="flex gap-2">
        <span className="flex-1 rounded-control border border-accent bg-accent-soft p-2 text-center">
          Post 4:5
        </span>
        <span className="flex-1 rounded-control border border-line p-2 text-center text-t2">
          Story 9:16
        </span>
      </div>
      <div className="grid h-10 place-items-center rounded-control bg-accent text-sm font-medium text-accent-fg">
        Download all as .zip · 3.2 MB
      </div>
      <div className="grid h-10 place-items-center rounded-control border border-line text-sm font-medium">
        Schedule via Buffer
      </div>
    </div>
  );
}
