"use client";

import { useEffect, useState } from "react";
import { DEFAULT_BRAND, FONTS, HERO_SLIDES } from "@/lib/data";

/** The live hero preview — pages through five real slides on a 2.6s loop. */
export function HeroCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(
      () => setIndex((i) => (i + 1) % HERO_SLIDES.length),
      2600,
    );
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex flex-col items-center gap-3">
      {/* @container lets slide padding scale with the card, not the 500% strip. */}
      <div className="@container relative aspect-[1080/1350] w-full max-w-105 overflow-hidden rounded-card border border-line bg-shell">
        <div
          className="flex h-full transition-transform duration-500"
          style={{
            width: `${HERO_SLIDES.length * 100}%`,
            transform: `translateX(-${index * (100 / HERO_SLIDES.length)}%)`,
            transitionTimingFunction: "cubic-bezier(.2,.8,.2,1)",
          }}
        >
          {HERO_SLIDES.map(({ template, type, headline, body }, i) => (
            <div
              key={i}
              className="flex h-full flex-none flex-col px-[9cqw] pb-[8cqw] pt-[9cqw]"
              style={{
                width: `${100 / HERO_SLIDES.length}%`,
                background: template.bg,
                color: template.fg,
                fontFamily: FONTS[template.font],
                justifyContent: template.justify,
              }}
            >
              <div className="mb-auto text-[11px] uppercase tracking-[0.08em] opacity-60">
                {type}
              </div>
              <div
                className="text-[7.2cqw] leading-[1.05] tracking-[-0.03em] [text-wrap:pretty]"
                style={{ fontWeight: template.weight }}
              >
                {headline}
              </div>
              <div className="mt-3.5 text-[3.4cqw] leading-snug opacity-[0.78] [text-wrap:pretty]">
                {body}
              </div>
              <div className="mt-auto flex justify-between pt-4 text-[11px] opacity-60">
                <span>{DEFAULT_BRAND.handle}</span>
                <span>
                  {i + 1} / {HERO_SLIDES.length}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex gap-1.5" aria-hidden>
        {HERO_SLIDES.map((_, i) => (
          <span
            key={i}
            className="h-1.5 rounded-full transition-all duration-300 ease-out"
            style={{
              width: i === index ? 20 : 6,
              background: i === index ? "var(--accent)" : "var(--border)",
            }}
          />
        ))}
      </div>
    </div>
  );
}
