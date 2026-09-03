import { loadImage } from "./render-slide";

const ACCEPTED = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];
const MAX_BYTES = 5 * 1024 * 1024;
const MAX_EDGE = 512;

function readAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.readAsDataURL(file);
  });
}

/**
 * Turn an uploaded logo into a small data URL that fits comfortably in
 * localStorage and renders crisply at footer size on a 3× export.
 */
export async function fileToLogo(file: File): Promise<string> {
  if (!ACCEPTED.includes(file.type)) {
    throw new Error("Use a PNG, JPG, WebP or SVG.");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("Logos must be under 5 MB.");
  }
  const original = await readAsDataUrl(file);
  if (file.type === "image/svg+xml" && file.size < 200_000) return original;

  const img = await loadImage(original);
  const scale = Math.min(1, MAX_EDGE / Math.max(img.naturalWidth, img.naturalHeight));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
  canvas.getContext("2d")?.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/png");
}

export const LOGO_ACCEPT = ACCEPTED.join(",");

const PHOTO_MAX_EDGE = 1080;

/**
 * A slide background or detail picture: downscaled to 1080px on the long
 * edge and re-encoded so a handful of photos still fit in localStorage.
 */
export async function fileToSlideImage(file: File, maxEdge = PHOTO_MAX_EDGE): Promise<string> {
  if (!ACCEPTED.includes(file.type)) {
    throw new Error("Use a PNG, JPG, WebP or SVG.");
  }
  if (file.size > 12 * 1024 * 1024) {
    throw new Error("Pictures must be under 12 MB.");
  }
  const original = await readAsDataUrl(file);
  const img = await loadImage(original);
  const scale = Math.min(1, maxEdge / Math.max(img.naturalWidth, img.naturalHeight));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
  canvas.getContext("2d")?.drawImage(img, 0, 0, canvas.width, canvas.height);
  const hasAlpha = file.type === "image/png" || file.type === "image/svg+xml" || file.type === "image/webp";
  return hasAlpha && maxEdge < PHOTO_MAX_EDGE
    ? canvas.toDataURL("image/png")
    : canvas.toDataURL("image/jpeg", 0.8);
}
