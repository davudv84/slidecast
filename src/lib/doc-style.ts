import { FONTS, TEMPLATES } from "./data";
import type { Align, Doc, FontPair, Justify } from "./types";

/** Everything a renderer needs to paint a slide from this document. */
export interface SlideStyle {
  bg: string;
  fg: string;
  fontPair: FontPair;
  fontFamily: string;
  weight: number;
  justify: Justify;
  align: Align;
}

export function docStyle(doc: Doc): SlideStyle {
  const template = TEMPLATES[doc.templateId] ?? TEMPLATES[0];
  return {
    bg: doc.scheme?.bg ?? template.bg,
    fg: doc.scheme?.fg ?? template.fg,
    fontPair: doc.fontPair,
    fontFamily: FONTS[doc.fontPair],
    weight: template.weight,
    justify: template.justify,
    align: doc.align,
  };
}

/** Resolve `var(--x)` references so the stack can be used in a 2D canvas. */
export function resolveFontFamily(stack: string) {
  if (typeof window === "undefined") return stack;
  const root = getComputedStyle(document.documentElement);
  return stack.replace(/var\((--[\w-]+)\)/g, (_, name: string) => {
    const value = root.getPropertyValue(name).trim();
    return value || "sans-serif";
  });
}

/** First family in a CSS stack — what `document.fonts.load` needs. */
export function primaryFamily(stack: string) {
  const first = stack.split(",")[0]?.trim() ?? "sans-serif";
  return first.replace(/^["']|["']$/g, "");
}
