import { newId } from "./id";
import type { Tone } from "./data";
import type { Bullet, Slide, SlideType } from "./types";

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
  Direct: "Save this. Then post *today*.",
  Story: "Save this for the next time you *doubt* it.",
  Educational: "Save this for your *next* post.",
  Contrarian: "Disagree? Tell me *why* in the comments.",
};

const STOP = new Set([
  "the", "and", "that", "this", "with", "from", "your", "you", "for", "are", "was", "were",
  "have", "has", "not", "but", "they", "them", "their", "about", "into", "than", "then",
  "what", "when", "where", "which", "will", "would", "could", "should", "there", "here",
]);

function truncate(text: string, max: number) {
  const t = text.trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  const at = cut.lastIndexOf(" ");
  return (at > max * 0.5 ? cut.slice(0, at) : cut).replace(/[,;:\-–—]$/, "") + "…";
}

/** Wrap the most striking word of a headline in *asterisks* for the accent. */
export function accentuate(text: string) {
  if (/\*[^*]+\*/.test(text)) return text;
  const words = text.split(/(\s+)/);
  let best = -1;
  let score = 0;
  words.forEach((w, i) => {
    const clean = w.replace(/[^\p{L}\p{N}€%]/gu, "");
    if (!clean || STOP.has(clean.toLowerCase())) return;
    const s = clean.length + (/\d/.test(clean) ? 4 : 0) + (/[A-Z]/.test(clean[0]) && i > 0 ? 1 : 0);
    if (s > score) {
      score = s;
      best = i;
    }
  });
  if (best < 0) return text;
  const w = words[best];
  const m = w.match(/^([^\p{L}\p{N}€]*)(.+?)([^\p{L}\p{N}€%]*)$/u);
  words[best] = m ? `${m[1]}*${m[2]}*${m[3]}` : `*${w}*`;
  return words.join("");
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
  return "point";
}

/** Pull "Title: explanation" or "Title — explanation" rows out of sentences. */
function bulletsFrom(sentences: string[]): Bullet[] {
  return sentences.slice(0, 4).map((s) => {
    const m = s.match(/^(.{6,60}?)(?:\s[—–:-]\s|:\s)(.+)$/);
    if (m) return { title: truncate(m[1], 48), text: truncate(m[2], 90) };
    const words = s.split(/\s+/);
    if (words.length <= 6) return { title: truncate(s, 48), text: "" };
    return { title: truncate(words.slice(0, 5).join(" "), 48), text: truncate(words.slice(5).join(" "), 90) };
  });
}

export function draftSlides(
  text: string,
  opts: { count: number; tone: Tone; handle: string },
): Slide[] {
  const { count, tone, handle } = opts;
  const sentences = splitSentences(text);
  const source = sentences.length ? sentences : [text.trim()];
  const fillers = FILLERS[tone];

  const hookHead = accentuate(truncate(source[0], 90));
  const hookBody = source[1] ? truncate(source[1], 120) : fillers[0];

  // Everything after the hook feeds the middle slides, in order.
  const rest = source.slice(source[1] ? 2 : 1);
  const middle = count - 2;
  const slides: Slide[] = [
    { id: newId("s"), type: "hook", headline: hookHead, body: hookBody },
  ];

  // When there is a lot of material, fold some of it into one list slide.
  const listAt = rest.length >= middle * 2 + 2 && middle >= 3 ? Math.floor(middle / 2) : -1;
  let cursor = 0;
  for (let i = 0; i < middle; i++) {
    if (i === listAt) {
      const chunk = rest.slice(cursor, cursor + 3);
      cursor += 3;
      slides.push({
        id: newId("s"),
        type: "list",
        headline: accentuate(truncate(chunk[0] ? "What to remember" : "The short version", 60)),
        body: "",
        bullets: bulletsFrom(chunk.length ? chunk : source.slice(1, 4)),
      });
      continue;
    }
    const head = rest[cursor] ?? source[(i + 1) % source.length];
    const body = rest[cursor + 1] ?? fillers[(i + 1) % fillers.length];
    cursor += 2;
    slides.push({
      id: newId("s"),
      type: typeFor(head, i + 1, count),
      headline: truncate(head, 84),
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
  const words = first.replace(/[“”"'*]/g, "").split(/\s+/).slice(0, 6).join(" ");
  return words.replace(/[.,;:!?…]+$/, "") || "Untitled carousel";
}
