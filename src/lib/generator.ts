import { newId } from "./id";
import type { Tone } from "./data";
import type { Slide, SlideType } from "./types";

/**
 * Local, deterministic drafting: turns pasted text into a hook, points and a
 * CTA in the creator's own words. Runs entirely in the browser.
 */

const FILLERS: Record<Tone, string[]> = {
  Direct: [
    "Read that again.",
    "No caveats. That’s the whole point.",
    "Write it down before you scroll.",
    "This is the part people skip.",
  ],
  Story: [
    "I didn’t believe it either, at first.",
    "That was the moment it clicked.",
    "Nobody told me this part.",
    "It took me longer than I’d like to admit.",
  ],
  Educational: [
    "Here’s why it works.",
    "Try it on your next post.",
    "A small change with a measurable effect.",
    "Most people learn this the slow way.",
  ],
  Contrarian: [
    "Unpopular, but true.",
    "The usual advice gets this backwards.",
    "You’ve been told the opposite. Test it.",
    "Nobody will say this out loud.",
  ],
};

const CTA: Record<Tone, string> = {
  Direct: "Save this. Then post today.",
  Story: "Save this for the next time you doubt it.",
  Educational: "Save this for your next post.",
  Contrarian: "Disagree? Tell me why in the comments.",
};

function truncate(text: string, max: number) {
  const t = text.trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  const at = cut.lastIndexOf(" ");
  return (at > max * 0.5 ? cut.slice(0, at) : cut).replace(/[,;:\-–—]$/, "") + "…";
}

export function splitSentences(text: string): string[] {
  return text
    .replace(/\r/g, "")
    .split(/\n+|(?<=[.!?…])\s+(?=[A-Z“"'(0-9])/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 12)
    .filter((s, i, all) => all.indexOf(s) === i);
}

function typeFor(sentence: string, index: number, total: number): SlideType {
  if (index === 0) return "hook";
  if (index === total - 1) return "cta";
  if (/^[“"']/.test(sentence)) return "quote";
  if (/^\d+[.)]\s/.test(sentence) || /:\s.*,.*,/.test(sentence)) return "list";
  return "point";
}

export function draftSlides(
  text: string,
  opts: { count: number; tone: Tone; handle: string },
): Slide[] {
  const { count, tone, handle } = opts;
  const sentences = splitSentences(text);
  const source = sentences.length ? sentences : [text.trim()];
  const fillers = FILLERS[tone];

  const hookHead = truncate(source[0], 90);
  const hookBody = source[1] ? truncate(source[1], 120) : fillers[0];

  // Everything after the hook feeds the middle slides, in order.
  const rest = source.slice(source[1] ? 2 : 1);
  const middle = count - 2;
  const slides: Slide[] = [
    { id: newId("s"), type: "hook", headline: hookHead, body: hookBody },
  ];

  for (let i = 0; i < middle; i++) {
    const head = rest[i * 2] ?? rest[i] ?? source[i % source.length];
    const body = rest[i * 2 + 1] ?? fillers[(i + 1) % fillers.length];
    const headline = truncate(head, 84);
    slides.push({
      id: newId("s"),
      type: typeFor(head, i + 1, count),
      headline,
      body: body === head ? fillers[i % fillers.length] : truncate(body, 120),
    });
  }

  slides.push({
    id: newId("s"),
    type: "cta",
    headline: CTA[tone],
    body: `Follow ${handle} for more like this.`,
  });

  return slides;
}

/** A title for the new carousel: the first few words of the hook. */
export function titleFrom(text: string) {
  const first = splitSentences(text)[0] ?? text.trim();
  const words = first.replace(/[“”"']/g, "").split(/\s+/).slice(0, 6).join(" ");
  return words.replace(/[.,;:!?…]+$/, "") || "Untitled carousel";
}
