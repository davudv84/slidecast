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
import type { Template, TemplateStyle } from "@/lib/types";

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
      <div
        className="relative flex flex-col overflow-hidden"
        style={{
          aspectRatio: "1080 / 1350",
          background: template.bg,
          color: template.fg,
          fontFamily: FONTS[template.font],
          padding: "14%",
          justifyContent: template.justify,
        }}
      >
        <div
          key={frame}
          className="anim-fade"
          style={{
            fontSize: 16,
            fontWeight: template.weight,
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
            textWrap: "pretty",
          }}
        >
          {TEMPLATE_HOVER_FRAMES[frame]}
        </div>
        <div className="absolute bottom-2.5 left-0 right-0 flex justify-center gap-1">
          {TEMPLATE_HOVER_FRAMES.map((_, i) => (
            <span
              key={i}
              className="h-[3px] w-3 rounded-sm bg-current transition-opacity duration-150 ease-out"
              style={{ opacity: i === frame ? 1 : 0.3 }}
            />
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-line p-3 sm:p-3.5">
        <span className="font-medium">{template.name}</span>
        <span className="text-xs text-t3">{template.style}</span>
      </div>
    </div>
  );
}
