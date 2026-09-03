"use client";

import { useEffect, useState } from "react";
import { DEFAULT_BRAND, DEFAULT_PROFILE, FONTS, HERO_SLIDES } from "@/lib/data";
import { avatarText } from "@/lib/initials";
import { SlidePreview } from "../slide-preview";
import type { SlideStyle } from "@/lib/doc-style";
import type { Slide } from "@/lib/types";

const NAME = `${DEFAULT_PROFILE.name} | ${DEFAULT_BRAND.name}`;

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
      <div className="relative aspect-[1080/1350] w-full max-w-105 overflow-hidden rounded-card border border-line bg-shell">
        <div
          className="flex h-full transition-transform duration-500"
          style={{
            width: `${HERO_SLIDES.length * 100}%`,
            transform: `translateX(-${index * (100 / HERO_SLIDES.length)}%)`,
            transitionTimingFunction: "cubic-bezier(.2,.8,.2,1)",
          }}
        >
          {HERO_SLIDES.map(({ template, type, headline, body, bullets }, i) => {
            const slide: Slide = {
              id: `hero-${i}`,
              type,
              headline,
              body,
              ...(bullets ? { bullets } : {}),
            };
            const style: SlideStyle = {
              bg: template.bg,
              fg: template.fg,
              accent: template.accent,
              fontPair: template.font,
              fontFamily: FONTS[template.font],
              weight: template.weight,
              justify: template.justify,
              align: "left",
              header: true,
              swipeHint: "Swipe",
            };
            return (
              <div key={i} className="h-full flex-none" style={{ width: `${100 / HERO_SLIDES.length}%` }}>
                <SlidePreview
                  slide={slide}
                  style={style}
                  chrome={{
                    handle: DEFAULT_BRAND.handle,
                    name: NAME,
                    initials: avatarText(DEFAULT_BRAND.name, DEFAULT_PROFILE.name),
                    index: i,
                    total: HERO_SLIDES.length,
                  }}
                />
              </div>
            );
          })}
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
