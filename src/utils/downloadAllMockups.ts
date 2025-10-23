// src/utils/downloadAllMockups.ts
// Always returns a ZIP Blob containing PNGs for each requested mockup.
// This is a pragmatic fallback renderer so App.tsx reliably gets a Blob
// even if a more advanced exporter isn't wired yet.

import { slugify } from "./slugify";

type FieldValues = {
  clipartSetName?: string;
  logoUrl?: string;
  fontFamily?: string;
  headingFontFamily?: string;
};

type LayoutDef = {
  id?: string | number;
  name?: string;
  frames?: Array<{ x: number; y: number; w: number; h: number }>;
};

type Item = {
  layout: LayoutDef;
  index?: number;
  images: string[];        // urls for frames (we'll at least place frame[0])
  tokens?: Record<string, string>;
};

type Args = {
  items: Item[];
  fieldValues: FieldValues;
  width: number;
  height: number;
  onProgress?: (done: number, total: number) => void;
};

/** Load an image as HTMLImageElement (resolves even if it errors, to keep pipeline moving). */
function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve) => {
    const img = new Image();
    // Try to avoid CORS-taint when possible (will be ignored for blob/data urls)
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(img);
    img.src = url;
  });
}

/** Draw `img` into ctx with "contain" fit inside rect (x,y,w,h). */
function drawContain(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number
) {
  const iw = img.naturalWidth || img.width || 1;
  const ih = img.naturalHeight || img.height || 1;
  const scale = Math.min(w / iw, h / ih);
  const dw = Math.max(1, Math.floor(iw * scale));
  const dh = Math.max(1, Math.floor(ih * scale));
  const dx = x + Math.floor((w - dw) / 2);
  const dy = y + Math.floor((h - dh) / 2);
  ctx.drawImage(img, dx, dy, dw, dh);
}

async function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob || new Blob()), "image/png", 0.92);
  });
}

/**
 * Public API used by App.tsx
 * Returns: Promise<Blob>  (ZIP Blob)
 */
export async function downloadAllMockups({
  items,
  fieldValues,
  width,
  height,
  onProgress,
}: Args): Promise<Blob> {
  // Lazy-load JSZip so we don't require it at boot
  const { default: JSZip } = await import("jszip");

  const zip = new JSZip();
  const total = items.length;
  const nameBase = slugify(fieldValues.clipartSetName || "clipart") || "clipart";
  let done = 0;

  // Shared canvas for simple fallback rendering
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.floor(width));
  canvas.height = Math.max(1, Math.floor(height));
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    // If we somehow cannot get a ctx, return an empty zip Blob to avoid JSON stubs
    return zip.generateAsync({ type: "blob" });
  }

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    // Clear background
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Simple, robust fallback:
    // - If the layout has frames, draw the first provided image into the first frame.
    // - Else, draw it centered full-bleed with "contain".
    // This guarantees a PNG gets produced for each item.
    const firstUrl = item.images?.[0];
    if (firstUrl) {
      const img = await loadImage(firstUrl);

      const frame = item.layout?.frames?.[0];
      if (frame) {
        // Frame coords expected as fractions [0..1] of canvas; if they look >1 treat as px.
        const fx = frame.x <= 1 && frame.y <= 1 && frame.w <= 1 && frame.h <= 1
          ? {
              x: Math.round(frame.x * canvas.width),
              y: Math.round(frame.y * canvas.height),
              w: Math.round(frame.w * canvas.width),
              h: Math.round(frame.h * canvas.height),
            }
          : { x: frame.x, y: frame.y, w: frame.w, h: frame.h };
        drawContain(ctx, img, fx.x, fx.y, fx.w, fx.h);
      } else {
        // No frame described: fit the image nicely inside the canvas with padding
        const pad = Math.round(Math.min(canvas.width, canvas.height) * 0.05);
        drawContain(ctx, img, pad, pad, canvas.width - pad * 2, canvas.height - pad * 2);
      }
    } else {
      // No image provided; leave blank (transparent PNG)
    }

    // OPTIONAL: minimal label for debugging (comment out if not desired)
    // ctx.fillStyle = "rgba(0,0,0,0.65)";
    // ctx.font = "24px sans-serif";
    // ctx.fillText(String(item.layout?.name || item.layout?.id || `mockup ${i + 1}`), 16, 32);

    const pngBlob = await canvasToBlob(canvas);
    const idx = item.index || i + 1;
    const filename = `${nameBase}-mockup-${idx}.png`;
    zip.file(filename, pngBlob);

    done++;
    if (onProgress) onProgress(done, total);
  }

  // Generate a ZIP Blob and return it (App.tsx handles saving)
  const zipBlob = await zip.generateAsync({ type: "blob" });
  return zipBlob;
}

export default downloadAllMockups;
