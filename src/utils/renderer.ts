// src/utils/renderer.ts
import { BASE_COORD } from "../config/exportProfiles";

export type FrameDef = { x: number; y: number; w: number; h: number; mode?: "contain" | "cover"; r?: number };
export type TextBoxDef = { token: string; x: number; y: number; w: number; lineHeight: number; align?: CanvasTextAlign; fontToken?: string; maxLines?: number };
export type OverlayDef = { logo?: { x: number; y: number; size: number; padding?: number }; transparencyBg?: boolean; paletteStrip?: { x: number; y: number; w: number; h: number } };
export type LayoutDef = {
  id: number | string;
  name: string;           // e.g., "Main Listing"
  short: string;          // e.g., "main-listing"
  frames?: FrameDef[];
  textBoxes?: TextBoxDef[];
  overlays?: OverlayDef;
};

export type RendererOptions = {
  layout: LayoutDef;
  width: number;
  height: number;
  tokens: Record<string, string>;
  images: string[];       // selected clipart image URLs for the frames; index-mapped
  logoUrl?: string | null;
  background?: string | CanvasGradient | CanvasPattern; // usually white; transparency demo handled via overlays
  fontFamily?: string;    // user-chosen body font
  headingFontFamily?: string; // user-chosen heading font
};

function drawRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r = 0) {
  const radius = Math.min(r, Math.min(w, h) / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function fitRect(
  imgW: number, imgH: number, boxW: number, boxH: number, mode: "contain" | "cover"
) {
  const imgRatio = imgW / imgH;
  const boxRatio = boxW / boxH;
  let w: number, h: number;
  if (mode === "contain" ? imgRatio > boxRatio : imgRatio < boxRatio) {
    w = boxW;
    h = w / imgRatio;
  } else {
    h = boxH;
    w = h * imgRatio;
  }
  const x = (boxW - w) / 2;
  const y = (boxH - h) / 2;
  return { x, y, w, h };
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = (text || "").split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const w of words) {
    const test = current ? current + " " + w : w;
    if (ctx.measureText(test).width <= maxWidth) current = test;
    else {
      if (current) lines.push(current);
      current = w;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export async function renderMockupToBlob(opts: RendererOptions): Promise<Blob> {
  const { width, height, layout, tokens, images, logoUrl, fontFamily, headingFontFamily } = opts;
  const scale = width / BASE_COORD;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  // Background (white)
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  // Transparency demo background (checkerboard) if needed
  if (layout.overlays?.transparencyBg) {
    const size = Math.max(16, Math.round(24 * scale));
    for (let y = 0; y < height; y += size) {
      for (let x = 0; x < width; x += size) {
        const even = ((x / size) + (y / size)) % 2 === 0;
        ctx.fillStyle = even ? "#f3f4f6" : "#e5e7eb";
        ctx.fillRect(x, y, size, size);
      }
    }
  }

  // Draw frames with images
  if (layout.frames?.length) {
    for (let i = 0; i < layout.frames.length; i++) {
      const f = layout.frames[i];
      const imgUrl = images[i];
      if (!imgUrl) continue;
      try {
        const img = await loadImage(imgUrl);
        const bx = f.x * scale, by = f.y * scale, bw = f.w * scale, bh = f.h * scale;
        ctx.save();
        if (f.r && f.r > 0) {
          drawRoundedRect(ctx, bx, by, bw, bh, f.r * scale);
          ctx.clip();
        }
        const fit = fitRect(img.width, img.height, bw, bh, f.mode || "contain");
        ctx.drawImage(img, bx + fit.x, by + fit.y, fit.w, fit.h);
        ctx.restore();
      } catch {
        // skip on error
      }
    }
  }

  // Text boxes
  if (layout.textBoxes?.length) {
    for (const t of layout.textBoxes) {
      const x = t.x * scale, y = t.y * scale, w = t.w * scale;
      // font
      const isHeading = /HEADING/i.test(t.token);
      const fam = isHeading ? (headingFontFamily || "system-ui") : (fontFamily || "system-ui");
      const size = Math.round((isHeading ? 42 : 26) * scale);
      ctx.font = `600 ${size}px ${fam}`;
      ctx.textAlign = t.align || "left";
      ctx.fillStyle = "#111827";

      const value = tokens[t.token] || "";
      const lines = wrapText(ctx, value, w);
      const maxLines = t.maxLines ?? (isHeading ? 2 : 4);
      const lh = (t.lineHeight || 1.25) * size;

      const used = lines.slice(0, maxLines);
      for (let i = 0; i < used.length; i++) {
        const yy = y + i * lh;
        ctx.fillText(used[i], x, yy);
      }
    }
  }

  // Logo overlay
  if (logoUrl && layout.overlays?.logo) {
    try {
      const logo = await loadImage(logoUrl);
      const s = layout.overlays.logo.size * scale;
      const pad = (layout.overlays.logo.padding ?? 16) * scale;
      const x = (layout.overlays.logo.x * scale) - s - pad;
      const y = (layout.overlays.logo.y * scale) - s - pad;
      ctx.save();
      ctx.globalAlpha = 0.95;
      ctx.drawImage(logo, Math.max(0, x), Math.max(0, y), s, s);
      ctx.restore();
    } catch { /* ignore */ }
  }

  return await new Promise<Blob>((resolve) => canvas.toBlob(b => resolve(b!), "image/png"));
}
