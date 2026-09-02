/**
 * Minimal PDF writer: one JPEG image per page (DCTDecode), sized to the slide.
 * Enough for a LinkedIn document post, with no dependency.
 */

export interface PdfPage {
  jpeg: Uint8Array;
  width: number;
  height: number;
}

export function buildPdf(pages: PdfPage[], title: string): Blob {
  const enc = new TextEncoder();
  const chunks: Uint8Array[] = [];
  const offsets: number[] = [];
  let length = 0;

  const push = (part: string | Uint8Array) => {
    const bytes = typeof part === "string" ? enc.encode(part) : part;
    chunks.push(bytes);
    length += bytes.length;
  };

  const beginObj = (n: number) => {
    offsets[n] = length;
    push(`${n} 0 obj\n`);
  };

  // Object numbering: 1 catalog, 2 pages, 3 info, then 3 objects per page.
  const pageObj = (i: number) => 4 + i * 3;
  const contentObj = (i: number) => 5 + i * 3;
  const imageObj = (i: number) => 6 + i * 3;
  const total = 3 + pages.length * 3;

  push("%PDF-1.4\n%âãÏÓ\n");

  beginObj(1);
  push("<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");

  beginObj(2);
  push(
    `<< /Type /Pages /Count ${pages.length} /Kids [${pages
      .map((_, i) => `${pageObj(i)} 0 R`)
      .join(" ")}] >>\nendobj\n`,
  );

  beginObj(3);
  const safeTitle = title.replace(/[()\\]/g, "");
  push(
    `<< /Title (${safeTitle}) /Producer (Slidecast) /Creator (Slidecast) >>\nendobj\n`,
  );

  pages.forEach((page, i) => {
    const { width, height } = page;

    beginObj(pageObj(i));
    push(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${width} ${height}] ` +
        `/Resources << /XObject << /Im${i} ${imageObj(i)} 0 R >> >> ` +
        `/Contents ${contentObj(i)} 0 R >>\nendobj\n`,
    );

    const content = `q ${width} 0 0 ${height} 0 0 cm /Im${i} Do Q\n`;
    beginObj(contentObj(i));
    push(`<< /Length ${enc.encode(content).length} >>\nstream\n`);
    push(content);
    push("endstream\nendobj\n");

    beginObj(imageObj(i));
    push(
      `<< /Type /XObject /Subtype /Image /Width ${width} /Height ${height} ` +
        `/ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode ` +
        `/Length ${page.jpeg.length} >>\nstream\n`,
    );
    push(page.jpeg);
    push("\nendstream\nendobj\n");
  });

  const xref = length;
  push(`xref\n0 ${total + 1}\n`);
  push("0000000000 65535 f \n");
  for (let n = 1; n <= total; n++) {
    push(`${String(offsets[n]).padStart(10, "0")} 00000 n \n`);
  }
  push(
    `trailer\n<< /Size ${total + 1} /Root 1 0 R /Info 3 0 R >>\nstartxref\n${xref}\n%%EOF\n`,
  );

  return new Blob(chunks as BlobPart[], { type: "application/pdf" });
}
