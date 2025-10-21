import html2canvas from "html2canvas";
import JSZip from "jszip";
import { saveAs } from "file-saver";

function waitForFonts(): Promise<void> {
  // Ensure web fonts are ready before capture
  // @ts-ignore
  const fonts = (document as any).fonts;
  if (fonts && typeof fonts.ready?.then === "function") {
    return fonts.ready as Promise<void>;
  }
  return Promise.resolve();
}

async function renderNodeToPng(node: HTMLElement, size = 2000): Promise<Blob> {
  const canvas = await html2canvas(node, {
    backgroundColor: null,
    scale: Math.max(1, Math.floor((size / Math.max(node.clientWidth, 1)) * 1.0)),
    useCORS: true,
  });
  return new Promise<Blob>((resolve) => {
    canvas.toBlob((b) => resolve(b as Blob), "image/png", 1.0);
  });
}

/**
 * Given a list of export IDs (matching [data-export-id="..."] on your layout cards),
 * captures each as a PNG and downloads a single ZIP named mocktsy-mockups.zip.
 */
export async function exportSelectedToPngZip(exportIds: string[], zipName = "mocktsy-mockups.zip") {
  await waitForFonts();
  const zip = new JSZip();
  let index = 1;
  for (const id of exportIds) {
    const el = document.querySelector<HTMLElement>(`[data-export-id="${id}"]`);
    if (!el) continue;
    const blob = await renderNodeToPng(el);
    zip.file(`mockup-${String(index).padStart(2, "0")}.png`, blob);
    index++;
  }
  const content = await zip.generateAsync({ type: "blob" });
  saveAs(content, zipName);
}
