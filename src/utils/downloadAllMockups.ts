// src/utils/downloadAllMockups.ts
import JSZip from "jszip";
import { renderMockupToBlob, LayoutDef } from "./renderer";
import { slugify } from "./slugify";

export type DownloadItem = {
  layout: LayoutDef;
  images: string[]; // clipart URLs for this layout's frames
  // (tokens are optional per-item and handled in the function signature below)
};

export async function downloadAllMockups({
  items,
  fieldValues,
  tokens = {},
  width,
  height,
  onProgress,
}: {
  items: Array<{ layout: any; images: string[]; tokens?: Record<string, string> }>;
  fieldValues: any;
  tokens?: Record<string, string>; // global fallback
  width: number;
  height: number;
  onProgress?: (done: number, total: number) => void;
}) {
  const total = items.length;
  const zip = new JSZip();

  const slug = slugify(fieldValues.clipartSetName || "clipart");
  let index = 1;

  for (const it of items) {
    // Merge global tokens with per-item override (per-layout Step 3 text)
    const tokensForThis = { ...tokens, ...(it.tokens || {}) };

    const blob = await renderMockupToBlob({
      layout: it.layout,
      width,
      height,
      tokens: tokensForThis,
      images: it.images,
      logoUrl: fieldValues.logoUrl || undefined,
      fontFamily: fieldValues.fontFamily,
      headingFontFamily: fieldValues.headingFontFamily,
    });

    // Per user spec: just clipart name + "mockup" + number
    const filename = `${slug}-mockup-${index}.png`;
    zip.file(filename, blob);
    onProgress?.(index, total);
    index++;
  }

  const content = await zip.generateAsync({ type: "blob" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(content);
  a.download = `${slug}-mockups.zip`;
  document.body.appendChild(a);
  a.click();
  a.remove();
}
