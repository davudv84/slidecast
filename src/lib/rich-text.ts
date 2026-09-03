/**
 * Headline mark-up: a word wrapped in *asterisks* is the accent word — set in
 * an italic serif and the slide's accent colour, the way "Bilder" reads on a
 * du.digital post. Everything else is plain.
 */
export interface RichToken {
  text: string;
  accent: boolean;
}

export function parseRich(text: string): RichToken[] {
  const tokens: RichToken[] = [];
  const re = /\*([^*\n]+)\*/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) tokens.push({ text: text.slice(last, m.index), accent: false });
    tokens.push({ text: m[1], accent: true });
    last = m.index + m[0].length;
  }
  if (last < text.length) tokens.push({ text: text.slice(last), accent: false });
  return tokens.length ? tokens : [{ text, accent: false }];
}

/** Plain text with the asterisks removed. */
export function stripRich(text: string) {
  return text.replace(/\*([^*\n]+)\*/g, "$1");
}

/** Split tokens into words that keep their accent flag (spaces preserved). */
export function richWords(tokens: RichToken[]): RichToken[] {
  const out: RichToken[] = [];
  for (const t of tokens) {
    const parts = t.text.split(/(\s+)/);
    for (const p of parts) {
      if (p.length) out.push({ text: p, accent: t.accent && !/^\s+$/.test(p) });
    }
  }
  return out;
}

/** Serif used for the accent word, on screen and in exports. */
export const ACCENT_FONT = 'Georgia, "Times New Roman", "Iowan Old Style", serif';
