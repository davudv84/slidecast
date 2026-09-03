import { newId } from "./id";
import { migrateDoc } from "./data";
import type { Align, BrandKit, Bullet, Doc, FontPair, Scheme, SlideType } from "./types";

/**
 * Share links carry the whole carousel in the URL fragment, so a viewer needs
 * no account and no server. Logos are left out to keep links short.
 */

interface SharePayload {
  v: 1 | 2;
  t: string;
  s: [SlideType, string, string, Bullet[]?][];
  tpl: number;
  f: FontPair;
  al: Align;
  sc: Scheme | null;
  h: string;
  /** v2: accent, header flag, swipe hint, "Name | brand" line. */
  ac?: string | null;
  hd?: boolean;
  sw?: string;
  n?: string;
}

function toBase64Url(text: string) {
  const bytes = new TextEncoder().encode(text);
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(data: string) {
  const b64 = data.replace(/-/g, "+").replace(/_/g, "/");
  const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
  const bin = atob(padded);
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function encodeShare(doc: Doc, brand: BrandKit, name: string) {
  const payload: SharePayload = {
    v: 2,
    t: doc.title,
    s: doc.slides.map((s) =>
      s.bullets?.length ? [s.type, s.headline, s.body, s.bullets] : [s.type, s.headline, s.body],
    ),
    tpl: doc.templateId,
    f: doc.fontPair,
    al: doc.align,
    sc: doc.scheme,
    h: brand.handle,
    ac: doc.accent,
    hd: doc.header,
    sw: doc.swipeHint,
    n: name,
  };
  return toBase64Url(JSON.stringify(payload));
}

export interface SharedCarousel {
  doc: Doc;
  handle: string;
  name: string;
}

export function decodeShare(hash: string): SharedCarousel | null {
  try {
    const raw = hash.replace(/^#/, "");
    if (!raw) return null;
    const p = JSON.parse(fromBase64Url(raw)) as SharePayload;
    if ((p.v !== 1 && p.v !== 2) || !Array.isArray(p.s)) return null;
    const now = Date.now();
    return {
      handle: p.h,
      name: p.n ?? p.h,
      doc: migrateDoc({
        id: newId("shared"),
        title: p.t,
        slides: p.s.map(([type, headline, body, bullets]) => ({
          id: newId("s"),
          type,
          headline,
          body,
          ...(bullets ? { bullets } : {}),
        })),
        templateId: p.tpl,
        scheme: p.sc ?? null,
        accent: p.ac ?? null,
        fontPair: p.f,
        align: p.al,
        header: p.hd,
        swipeHint: p.sw,
        status: "Draft",
        createdAt: now,
        updatedAt: now,
      }),
    };
  } catch {
    return null;
  }
}
