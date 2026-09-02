import { newId } from "./id";
import type { Align, BrandKit, Doc, FontPair, Scheme, SlideType } from "./types";

/**
 * Share links carry the whole carousel in the URL fragment, so a viewer needs
 * no account and no server. Logos are left out to keep links short.
 */

interface SharePayload {
  v: 1;
  t: string;
  s: [SlideType, string, string][];
  tpl: number;
  f: FontPair;
  al: Align;
  sc: Scheme | null;
  h: string;
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

export function encodeShare(doc: Doc, brand: BrandKit) {
  const payload: SharePayload = {
    v: 1,
    t: doc.title,
    s: doc.slides.map((s) => [s.type, s.headline, s.body]),
    tpl: doc.templateId,
    f: doc.fontPair,
    al: doc.align,
    sc: doc.scheme,
    h: brand.handle,
  };
  return toBase64Url(JSON.stringify(payload));
}

export function decodeShare(hash: string): { doc: Doc; handle: string } | null {
  try {
    const raw = hash.replace(/^#/, "");
    if (!raw) return null;
    const p = JSON.parse(fromBase64Url(raw)) as SharePayload;
    if (p.v !== 1 || !Array.isArray(p.s)) return null;
    const now = Date.now();
    return {
      handle: p.h,
      doc: {
        id: newId("shared"),
        title: p.t,
        slides: p.s.map(([type, headline, body]) => ({
          id: newId("s"),
          type,
          headline,
          body,
        })),
        templateId: p.tpl,
        scheme: p.sc ?? null,
        fontPair: p.f,
        align: p.al,
        status: "Draft",
        createdAt: now,
        updatedAt: now,
      },
    };
  } catch {
    return null;
  }
}
