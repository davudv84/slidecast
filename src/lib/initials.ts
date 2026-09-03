/** "Marisol Reyes" → "MR" for avatars. */
export function initials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? "")
      .join("") || "?"
  );
}

/**
 * Text for the slide-header avatar when no logo is uploaded. A short brand
 * mark like "du." is shown as-is; longer names ("reyes.studio", "Reyes
 * Studio") collapse to two letters.
 */
export function avatarText(brandName: string, fallbackName: string) {
  const brand = brandName.trim();
  if (brand && brand.length <= 4) return brand;
  const source = brand || fallbackName;
  const parts = source.split(/[\s.\-_|/]+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return initials(source);
}
