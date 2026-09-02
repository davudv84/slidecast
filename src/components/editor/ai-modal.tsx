"use client";

import { Loader2 } from "lucide-react";
import { useApp } from "../app-provider";
import { TONES } from "@/lib/data";
import { Modal, ModalHeader } from "../ui/dialog";
import { Button } from "../ui/button";
import { Textarea } from "../ui/input";
import { Meter, Slider } from "../ui/misc";
import { cn } from "@/lib/utils";

const MIN_CHARS = 10;

export function AiModal() {
  const app = useApp();
  const chars = app.aiText.trim().length;
  const tooShort = chars < MIN_CHARS;

  return (
    <Modal
      open={app.aiOpen}
      onOpenChange={(o) => {
        if (!o) app.closeAi();
      }}
      label="Generate carousel"
      className="w-full max-w-140 rounded-modal border border-line bg-surface p-5 shadow-float sm:p-6"
    >
      <div className="flex flex-col gap-[18px]">
        <ModalHeader title="Generate carousel" onClose={app.closeAi} />

        {app.generating ? (
          <GeneratingState />
        ) : (
          <>
            <div className="flex flex-col gap-1.5">
              <Textarea
                value={app.aiText}
                onChange={(e) => app.setAiText(e.target.value)}
                rows={5}
                placeholder="Paste a tweet, a note, or the long version. Slidecast will find the hook."
                aria-label="Source text"
                className="p-3 text-base leading-normal"
                autoFocus
              />
              <span className="text-right text-xs text-t3 tabular">
                {chars < MIN_CHARS ? `${MIN_CHARS - chars} more characters` : `${chars} characters`}
              </span>
            </div>

            <div className="flex flex-col gap-2 text-[13px] text-t2">
              Tone
              <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Tone">
                {TONES.map((tone) => {
                  const on = app.aiTone === tone;
                  return (
                    <button
                      key={tone}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      onClick={() => app.setAiTone(tone)}
                      className={cn(
                        "h-8 cursor-pointer rounded-control border px-3 text-[13px] font-medium transition-colors duration-150 ease-out",
                        on
                          ? "border-accent bg-accent-soft text-accent"
                          : "border-line bg-surface text-t2 hover:bg-hover hover:text-t1",
                      )}
                    >
                      {tone}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-2 text-[13px] text-t2">
              <span className="flex justify-between">
                <span>Slides</span>
                <span className="font-medium text-t1">{app.aiCount}</span>
              </span>
              <Slider value={app.aiCount} onValueChange={app.setAiCount} min={5} max={10} ariaLabel="Slide count" />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={app.closeAi}>
                Cancel
              </Button>
              <Button variant="primary" onClick={app.generate} disabled={tooShort}>
                Generate {app.aiCount} slides
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}

function GeneratingState() {
  const app = useApp();
  const total = app.genSlides.length || app.aiCount;
  const label =
    app.genDone === 0
      ? "Finding the hook…"
      : app.genDone < total
        ? `Writing slide ${app.genDone + 1}…`
        : "Applying brand kit…";

  return (
    <div className="flex flex-col gap-3.5" aria-live="polite">
      <div className="flex justify-between text-[13px] text-t2">
        <span className="flex items-center gap-2">
          <Loader2 size={14} strokeWidth={2} className="anim-spin" />
          {label}
        </span>
        <span className="tabular">
          {app.genDone} / {total}
        </span>
      </div>
      <Meter percent={(app.genDone / total) * 100} />
      <div className="grid grid-cols-5 gap-2">
        {Array.from({ length: total }, (_, k) => {
          const done = k < app.genDone;
          const next = k === app.genDone;
          return (
            <div
              key={k}
              className={cn(
                "flex items-end overflow-hidden rounded-control border border-line p-2 text-[9px] font-semibold leading-[1.15] tracking-[-0.02em] [text-wrap:pretty]",
                done && "anim-fade",
                next && "skel",
              )}
              style={{
                aspectRatio: "4 / 5",
                background: done ? app.style.bg : undefined,
                color: app.style.fg,
                fontFamily: app.style.fontFamily,
              }}
            >
              {done ? app.genSlides[k]?.headline : ""}
            </div>
          );
        })}
      </div>
    </div>
  );
}
