import { toPng } from "html-to-image";
import JSZip from "jszip";
import { saveAs } from "file-saver";

/**
 * Exports each selected mockup card to a PNG and bundles them into a ZIP.
 * It looks for either:
 *  - an element with [data-export-id="<id>"]  (preferred, 1-line change in ChooseLayouts)
 *  - or an element with id="preview-<id>"     (fallback if you already have it)
 */
export async function exportSelectedAsZip({
  layoutIds,
  clipartSetName,
}: {
  layoutIds: Array<number | string>;
  clipartSetName: string;
}) {
  if (!layoutIds?.length) return;

  const zip = new JSZip();

  for (const rawId of layoutIds) {
    const id = String(rawId);
    const el =
      (document.querySelector(`[data-export-id="${id}"]`) as HTMLElement | null) ||
      (document.getElementById(`preview-${id}`) as HTMLElement | null);

    if (!el) continue;

    const dataUrl = await toPng(el, {
      cacheBust: true,
      pixelRatio: 2,
      backgroundColor: "#ffffff",
      // If your cards have shadows that clip, add extra padding:
      style: { padding: "8px", background: "#ffffff" },
    });

    const base64 = dataUrl.split(",")[1];
    const filename = `${sanitize(clipartSetName || "Mocktsy")}_${id}.png`;
    zip.file(filename, base64, { base64: true });
  }

  const blob = await zip.generateAsync({ type: "blob" });
  saveAs(blob, `${sanitize(clipartSetName || "Mocktsy")}_mockups.zip`);
}

function sanitize(s: string) {
  return s.replace(/[^a-z0-9\-_]+/gi, "_").slice(0, 80);
}
