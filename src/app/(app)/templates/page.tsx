"use client";

import { useEffect, useRef, useState } from "react";
import { useApp } from "@/components/app-provider";
import {
  FONTS,
  TEMPLATES,
  TEMPLATE_FILTERS,
  TEMPLATE_HOVER_FRAMES,
} from "@/lib/data";
import { Segmented } from "@/components/ui/segmented";
import { Skeleton } from "@/components/ui/misc";
import { SlidePreview } from "@/components/slide-preview";
import type { SlideStyle } from "@/lib/doc-style";
import type { Slide, Template, TemplateStyle } from "@/lib/types";

const FRAME_SLIDES: Slide[] = [
  { id: "tpl-0", type: "hook", headline: TEMPLATE_HOVER_FRAMES[0], body: "The math nobody tells you about consistency." },
  {
    id: "tpl-1",
    type: "list",
    headline: "What to *remember*",
    body: "",
    bullets: [
      { title: "One idea per slide", text: "Cut until it fits." },
      { title: "Saves beat likes", text: "Write for the screenshot." },
    ],
  },
  { id: "tpl-2", type: "cta", headline: TEMPLATE_HOVER_FRAMES[2], body: "Follow for one system a week." },
];

function templateStyle(t: Template): SlideStyle {
  return {
    bg: t.bg,
    fg: t.fg,
    accent: t.accent,
    fontPair: t.font,
    fontFamily: FONTS[t.font],
    weight: t.weight,
    justify: t.justify,
    align: "left",
    header: true,
    swipeHint: "Swipe",
  };
}

type Filter = (typeof TEMPLATE_FILTERS)[number];

const GRID = "grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4";

export default function TemplatesPage() {
  const [filter, setFilter] = useState<Filter>("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(id);
  }, []);

  const shown = TEMPLATES.filter(
    (t) => filter === "All" || t.style === (filter as TemplateStyle),
  );

  return (
    <div className="anim-fade">
      <div className="sticky top-0 z-5 flex flex-wrap items-center gap-3 border-b border-line bg-surface px-4 py-3 sm:px-6">
        <h1 className="m-0 mr-auto text-xl font-semibold">Templates</h1>
        <div className="-mx-4 w-[calc(100%+32px)] overflow-x-auto px-4 no-scrollbar sm:mx-0 sm:w-auto sm:px-0">
          <Segmented
            ariaLabel="Filter templates by style"
            value={filter}
            onChange={setFilter}
            options={TEMPLATE_FILTERS.map((f) => ({ value: f, label: f }))}
            className="w-max"
          />
        </div>
      </div>

      <div className="p-4 sm:p-6">
        {loading ? (
          <div className={GRID}>
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className="overflow-hidden rounded-card border border-line bg-surface">
                <Skeleton className="aspect-[4/5] rounded-none" />
                <div className="flex justify-between gap-2 p-3.5">
                  <Skeleton className="h-3.5 w-1/2" />
                  <Skeleton className="h-3.5 w-1/5" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={GRID}>
            {shown.map((template) => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TemplateCard({ template }: { template: Template }) {
  const app = useApp();
  const [frame, setFrame] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  const startPreview = () => {
    clearInterval(timer.current);
    setFrame(0);
    timer.current = setInterval(
      () => setFrame((f) => (f + 1) % TEMPLATE_HOVER_FRAMES.length),
      800,
    );
  };

  const stopPreview = () => {
    clearInterval(timer.current);
    setFrame(0);
  };

  useEffect(() => () => clearInterval(timer.current), []);

  const use = () => {
    app.createDoc({ templateId: template.id, withAi: true });
    app.toast(`New carousel from “${template.name}”`);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onMouseEnter={startPreview}
      onMouseLeave={stopPreview}
      onFocus={startPreview}
      onBlur={stopPreview}
      onClick={use}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          use();
        }
      }}
      className="flex cursor-pointer flex-col overflow-hidden rounded-card border border-line bg-surface transition-colors duration-150 ease-out hover:border-t3"
    >
      <div className="relative overflow-hidden">
        <div key={frame} className="anim-fade">
          <SlidePreview
            slide={FRAME_SLIDES[frame]}
            style={templateStyle(template)}
            chrome={app.chromeFor(frame, FRAME_SLIDES.length)}
          />
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-line p-3 sm:p-3.5">
        <span className="font-medium">{template.name}</span>
        <span className="text-xs text-t3">{template.style}</span>
      </div>
    </div>
  );
}
