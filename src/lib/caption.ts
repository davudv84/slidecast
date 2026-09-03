import { stripRich } from "./rich-text";
import type { BrandKit, Doc } from "./types";

export const CAPTION_MAX = 2200;

/**
 * A caption drafted from the slides: the hook, the strongest points as a
 * short list, the CTA line, then hashtags. Editable before publishing.
 */
export function suggestedCaption(doc: Doc, brand: BrandKit) {
  const slides = doc.slides;
  const hook = slides[0];
  const cta = slides[slides.length - 1];
  const middle = slides.slice(1, -1);

  const points = middle
    .flatMap((s) =>
      s.type === "list" && s.bullets?.length
        ? s.bullets.map((b) => b.title)
        : [stripRich(s.headline)],
    )
    .filter((t) => t.trim().length > 0)
    .slice(0, 5);

  const lines: string[] = [];
  if (hook) {
    lines.push(stripRich(hook.headline));
    if (hook.body.trim()) lines.push(hook.body.trim());
  }
  if (points.length) {
    lines.push("");
    lines.push(...points.map((p) => `→ ${p.replace(/[.:]$/, "")}`));
  }
  if (cta && cta !== hook) {
    lines.push("");
    lines.push(stripRich(cta.headline));
    if (cta.body.trim() && !cta.body.includes(brand.handle)) lines.push(cta.body.trim());
  }
  lines.push("");
  lines.push(`Swipe through, then save it for later. More from ${brand.handle}.`);
  lines.push("");
  lines.push(hashtags(doc, brand).join(" "));

  return lines.join("\n").slice(0, CAPTION_MAX);
}

function hashtags(doc: Doc, brand: BrandKit) {
  const base = ["#carousel", "#contentcreator", "#creatortips"];
  const brandTag = brand.name
    ? `#${brand.name.replace(/[^\p{L}\p{N}]/gu, "").toLowerCase()}`
    : null;
  const titleWords = doc.title
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 5)
    .slice(0, 2)
    .map((w) => `#${w}`);
  return Array.from(new Set([...titleWords, ...base, ...(brandTag ? [brandTag] : [])])).slice(0, 8);
}

export function captionFor(doc: Doc, brand: BrandKit) {
  return doc.caption.trim() ? doc.caption : suggestedCaption(doc, brand);
}
