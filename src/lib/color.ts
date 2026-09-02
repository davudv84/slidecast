/** Parse #rgb / #rrggbb into 0–255 channels. Returns null when malformed. */
export function hexToRgb(hex: string): [number, number, number] | null {
  const m = hex.trim().replace(/^#/, "");
  const full =
    m.length === 3
      ? m
          .split("")
          .map((c) => c + c)
          .join("")
      : m;
  if (!/^[0-9a-f]{6}$/i.test(full)) return null;
  const n = parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function isHexColor(value: string) {
  return hexToRgb(value) !== null;
}

/** WCAG relative luminance. */
export function luminance(hex: string) {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;
  const [r, g, b] = rgb.map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Slide ink colours — the two text tones templates are built from. */
export const SLIDE_INK = { dark: "#0A0A0A", light: "#FAFAFA" } as const;

/** Near-black or near-white text, whichever reads better on `bg`. */
export function contrastText(bg: string) {
  return luminance(bg) > 0.4 ? SLIDE_INK.dark : SLIDE_INK.light;
}

export function normalizeHex(value: string) {
  const rgb = hexToRgb(value);
  if (!rgb) return null;
  return (
    "#" +
    rgb
      .map((c) => c.toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase()
  );
}
