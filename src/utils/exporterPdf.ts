import html2canvas from "html2canvas";
import { PDFDocument, rgb } from "pdf-lib";

function waitForFonts(): Promise<void> {
  // @ts-ignore
  const fonts = (document as any).fonts;
  if (fonts && typeof fonts.ready?.then === "function") {
    return fonts.ready as Promise<void>;
  }
  return Promise.resolve();
}

/**
 * Builds a square, one-mockup-per-page PDF from the rendered DOM nodes.
 * Returns Uint8Array of PDF bytes.
 */
export async function exportSelectedToMultiPagePdf(
  exportIds: string[],
  pageSize = 2000
): Promise<Uint8Array> {
  await waitForFonts();
  const pdf = await PDFDocument.create();

  for (const id of exportIds) {
    const el = document.querySelector<HTMLElement>(`[data-export-id="${id}"]`);
    if (!el) continue;

    // Render DOM to canvas
    const canvas = await html2canvas(el, {
      backgroundColor: "#ffffff",
      scale: Math.max(1, Math.floor((pageSize / Math.max(el.clientWidth, 1)) * 1.0)),
      useCORS: true,
    });

    // Canvas → PNG bytes
    const pngBlob: Blob = await new Promise((resolve) =>
      canvas.toBlob((b) => resolve(b as Blob), "image/png", 1)
    );
    const pngBytes = new Uint8Array(await pngBlob.arrayBuffer());
    const embedded = await pdf.embedPng(pngBytes);

    // Square page
    const page = pdf.addPage([pageSize, pageSize]);
    page.drawRectangle({ x: 0, y: 0, width: pageSize, height: pageSize, color: rgb(1, 1, 1) });

    // Fit image centered
    const scale = Math.min(pageSize / embedded.width, pageSize / embedded.height);
    const w = embedded.width * scale;
    const h = embedded.height * scale;
    const x = (pageSize - w) / 2;
    const y = (pageSize - h) / 2;

    page.drawImage(embedded, { x, y, width: w, height: h });
  }

  return await pdf.save();
}
