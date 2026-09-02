import { docStyle, primaryFamily, resolveFontFamily } from "./doc-style";
import { buildPdf, type PdfPage } from "./pdf";
import { canvasToBlob, loadImage, renderSlide } from "./render-slide";
import { SLIDE_SIZES } from "./slide-layout";
import { buildZip, type ZipEntry } from "./zip";
import type {
  BrandKit,
  Doc,
  ExportFormat,
  ExportQuality,
  ExportSize,
} from "./types";

export const QUALITY_SCALE: Record<ExportQuality, number> = {
  "1x": 1,
  "2x": 2,
  "3x": 3,
};

export interface ExportRequest {
  doc: Doc;
  brand: BrandKit;
  format: ExportFormat;
  size: ExportSize;
  quality: ExportQuality;
  onProgress?: (done: number, total: number, label: string) => void;
}

export interface ExportResult {
  blob: Blob;
  filename: string;
  fileCount: number;
}

export function slugify(title: string) {
  return (
    title
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "carousel"
  );
}

/** Wait until the slide fonts are usable by the 2D canvas. */
async function ensureFonts(stack: string) {
  if (!("fonts" in document)) return;
  const family = primaryFamily(stack);
  await Promise.all(
    [400, 500, 600, 700].map((w) =>
      document.fonts.load(`${w} 40px "${family}"`).catch(() => undefined),
    ),
  );
  await document.fonts.ready;
}

/** The post caption — every slide's copy in order, ready to paste. */
function captionText(doc: Doc, brand: BrandKit) {
  const lines = doc.slides.map((s, i) => `${i + 1}. ${s.headline}\n${s.body}`);
  return `${doc.title}\n\n${lines.join("\n\n")}\n\n${brand.handle}\n`;
}

export async function exportCarousel(req: ExportRequest): Promise<ExportResult> {
  const { doc, brand, format, size, quality, onProgress } = req;
  const style = { ...docStyle(doc), fontFamily: resolveFontFamily(docStyle(doc).fontFamily) };
  const scale = QUALITY_SCALE[quality];
  const total = doc.slides.length;
  const slug = slugify(doc.title);

  onProgress?.(0, total, "Loading fonts…");
  await ensureFonts(style.fontFamily);
  const logo = brand.logo ? await loadImage(brand.logo).catch(() => null) : null;

  if (format === "PNG") {
    const entries: ZipEntry[] = [];
    for (let i = 0; i < total; i++) {
      onProgress?.(i, total, `Rendering slide ${i + 1} of ${total}…`);
      const canvas = renderSlide({
        slide: doc.slides[i],
        style,
        size,
        scale,
        chrome: { handle: brand.handle, logo, index: i, total },
      });
      const blob = await canvasToBlob(canvas, "image/png");
      entries.push({
        name: `${slug}-${String(i + 1).padStart(2, "0")}.png`,
        data: new Uint8Array(await blob.arrayBuffer()),
      });
      // Yield so the progress UI can paint between slides.
      await new Promise((r) => setTimeout(r, 0));
    }
    entries.push({
      name: "caption.txt",
      data: new TextEncoder().encode(captionText(doc, brand)),
    });
    onProgress?.(total, total, "Zipping…");
    return { blob: buildZip(entries), filename: `${slug}.zip`, fileCount: total };
  }

  const pages: PdfPage[] = [];
  const dims = SLIDE_SIZES[size];
  for (let i = 0; i < total; i++) {
    onProgress?.(i, total, `Rendering page ${i + 1} of ${total}…`);
    const canvas = renderSlide({
      slide: doc.slides[i],
      style,
      size,
      scale,
      chrome: { handle: brand.handle, logo, index: i, total },
    });
    const blob = await canvasToBlob(canvas, "image/jpeg", 0.92);
    pages.push({
      jpeg: new Uint8Array(await blob.arrayBuffer()),
      width: dims.w,
      height: dims.h,
    });
    await new Promise((r) => setTimeout(r, 0));
  }
  onProgress?.(total, total, "Writing PDF…");
  return { blob: buildPdf(pages, doc.title), filename: `${slug}.pdf`, fileCount: 1 };
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

/** Rough size estimate shown in the drawer before rendering. */
export function estimateMegabytes(
  slides: number,
  format: ExportFormat,
  quality: ExportQuality,
) {
  const perSlide = { "1x": 0.22, "2x": 0.41, "3x": 0.78 }[quality];
  return (slides * perSlide * (format === "PDF" ? 0.6 : 1)).toFixed(1);
}
