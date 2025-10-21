// src/layouts/ChooseLayouts.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { TOKENS_BY_LAYOUT } from "../config/tokensByLayout";
import { DEFAULT_TEXT_BY_TOKEN } from "../config/textDefaults";
import { PRETTY_LABELS } from "../config/tokenLabels";
import { getTextRectsForLayout, COLOR_ROLES_BLACK } from "../config/textPositionsByLayout";
import { TextOverlay } from "../components/TextOverlay";
import { useElementSize } from "../hooks/useElementSize";


/** ----------------------------------------------------------------
 * Types & Props
 * -------------------------------------------------------------- */
type ImageItem = { id: string; url: string };

type MockupKind = "main" | "collection" | "use" | "info" | "promo";
interface MockupDef {
  id: number;
  title: string;
  kind: MockupKind;
  frames?: Array<{ x: number; y: number; w: number; h: number }>;
}

interface Props {
  images: ImageItem[];
  /** Live values from Steps 2 & 4 (colors, fonts, overlays, etc.) */
  fieldValues?: Record<string, any>;
  /** Report selected layout defs (plus per-item tokens/custom image) back to App */
  onSelectionChange?: (
    selected: {
      id: string | number;
      def: any;
      tokens?: Record<string, string>;
      customImage?: string;
    }[]
  ) => void;

  /** Inline editing (Step 3) */
  overlays?: Record<number, Record<string, string>>; // per-layout → { token: value }
  setOverlays?: React.Dispatch<
    React.SetStateAction<Record<number, Record<string, string>>>
  >;
}

/** ----------------------------------------------------------------
 * Helpers
 * -------------------------------------------------------------- */
function useDebouncedEffect(effect: () => void, deps: any[], ms = 200) {
  const t = useRef<number | undefined>(undefined);
  useEffect(() => {
    window.clearTimeout(t.current);
    t.current = window.setTimeout(effect, ms);
    return () => window.clearTimeout(t.current);
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps
}

function shuffleKeepFirst<T>(arr: T[]): T[] {
  if (arr.length <= 2) return arr.slice();
  const [first, ...rest] = arr;
  for (let i = rest.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [rest[i], rest[j]] = [rest[j], rest[i]];
  }
  return [first, ...rest];
}

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

function gridColsFor(n: number) {
  if (n <= 9) return 3;
  if (n <= 16) return 4;
  if (n <= 25) return 5;
  if (n <= 36) return 6;
  if (n <= 49) return 7;
  if (n <= 64) return 8;
  if (n <= 81) return 9;
  return 10;
}

function bgFromFieldValues(fieldValues?: Record<string, any>) {
  const neutral = "#f7f7fb";
  const bgMode = fieldValues?.bgMode || "neutral";
  if (bgMode === "neutral") return neutral;
  return fieldValues?.bgColor || "#ffffff";
}

/** Turn a mockup title into a filename-friendly slug */
function slugifyTitle(title: string): string {
  return String(title)
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Map our layout titles to the exact PNG filenames in /public/layout-previews */
const BG_BY_TITLE: Record<string, string> = {
  "Main Listing Image (A)": "Hero Mockup_ Option 1.png",
  "Main Listing Image (B)": "Hero Mockup_ Option 2.png",
  "Transparency Demo": "Mockup 6_ Transparency Demo.png",
  "Collection Overview A": "Mockup 3a_ Collection Overview 1 - 3x3.png",
  "Collection Overview B": "Mockup 3b_ Collection Overview 1 - 4x4.png",
  "Collection Overview C": "Mockup 4a_ Collection Overview 2 - 3x3.png",
  "Collection Overview D": "Mockup 4b_ Collection Overview 2 - 4x4.png",
  "Detail Beauty": "Mockup 5_ Close Up Detail.png",
  "Resolution / Sizing": "Mockup 7_ Transparency Demo.png",
  "Programs / Compatibility": "Mockup 11_ Digital _ Canva Example.png",
  "Coordinated Elements": "Mockup 12_ Color Cohesion.png",
  "License Summary": "Mockup 13_ License Guide.png",
  "How It Works": "Mockup 14_ How It Works.png",
  "Consistency": "Mockup 15_ Consistent Characters.png",
  "Tagline": "Mockup 16_ Brand Trust Logo Image.png",
  "Discount / Offer": "Mockup 17_ Shop Promo.png",
  "Freebie CTA": "Mockup 18_ Free Gift.png",
  "Reviews": "Mockup 19_ Customer Reviews.png",
  "Inspiration / Ideas": "Mockup 20_ INSPIRATIONAL MOCKUPS.png",
  "Final CTA": "Mockup 21_ FINAL CTA.png",
  // The three special “Upload Your Own” mockups (UI currently labeled 1A/2A/3A).
  "Mockup 1A": "Mockup 8a_ Branding and Logo Use Case - Upload Your Own.png",
  "Mockup 2A": "Mockup 9a_ POD Use Case - Upload Your Own.png",
  "Mockup 3A": "Mockup 10a_ Crafting Use Case - Upload Your Own.png",
  // Non-upload companions:
  "Mockup 1B": "Mockup 8b_ Branding and Logo Use Case - Pre-Made.png",
  "Mockup 2B": "Mockup 9b_ POD Use Case - Pre-Made.png",
  "Mockup 3B": "Mockup 10b_ Crafting Use Case - Pre-Made.png",
};

/**
 * Minimal frame geometry per layout id (0..1 coordinates).
 * If a definition lacks frames, we’ll fall back to these.
 */
const FRAMES_BY_ID: Record<number, Array<{ x: number; y: number; w: number; h: number }>> = {
  // Main listing: single centered frame
  1: [{ x: 0.08, y: 0.08, w: 0.84, h: 0.84 }],
  2: [{ x: 0.08, y: 0.08, w: 0.84, h: 0.84 }],
  // Collection overviews
  // 3x3
  3: Array.from({ length: 9 }, (_, i) => {
    const r = Math.floor(i / 3);
    const c = i % 3;
    const pad = 0.04;
    const cellW = (1 - pad * 4) / 3;
    const cellH = (1 - pad * 4) / 3;
    return { x: pad + c * (cellW + pad), y: pad + r * (cellH + pad), w: cellW, h: cellH };
  }),
  6: Array.from({ length: 9 }, (_, i) => {
    const r = Math.floor(i / 3);
    const c = i % 3;
    const pad = 0.04;
    const cellW = (1 - pad * 4) / 3;
    const cellH = (1 - pad * 4) / 3;
    return { x: pad + c * (cellW + pad), y: pad + r * (cellH + pad), w: cellW, h: cellH };
  }),
  // 4x4
  4: Array.from({ length: 16 }, (_, i) => {
    const r = Math.floor(i / 4);
    const c = i % 4;
    const pad = 0.035;
    const cellW = (1 - pad * 5) / 4;
    const cellH = (1 - pad * 5) / 4;
    return { x: pad + c * (cellW + pad), y: pad + r * (cellH + pad), w: cellW, h: cellH };
  }),
  5: Array.from({ length: 16 }, (_, i) => {
    const r = Math.floor(i / 4);
    const c = i % 4;
    const pad = 0.035;
    const cellW = (1 - pad * 5) / 4;
    const cellH = (1 - pad * 5) / 4;
    return { x: pad + c * (cellW + pad), y: pad + r * (cellH + pad), w: cellW, h: cellH };
  }),
  // All other “use/info/promo”: single frame
  7: [{ x: 0.08, y: 0.1, w: 0.84, h: 0.8 }],
  8: [{ x: 0.08, y: 0.1, w: 0.84, h: 0.8 }],
  9: [{ x: 0.08, y: 0.1, w: 0.84, h: 0.8 }],
  10: [{ x: 0.08, y: 0.1, w: 0.84, h: 0.8 }],
  11: [{ x: 0.08, y: 0.1, w: 0.84, h: 0.8 }],
  12: [{ x: 0.08, y: 0.1, w: 0.84, h: 0.8 }],
  13: [{ x: 0.08, y: 0.1, w: 0.84, h: 0.8 }],
  14: [{ x: 0.08, y: 0.1, w: 0.84, h: 0.8 }],
  15: [{ x: 0.08, y: 0.1, w: 0.84, h: 0.8 }],
  16: [{ x: 0.1, y: 0.15, w: 0.8, h: 0.7 }], // Brand Trust (large logo frame)
  17: [{ x: 0.08, y: 0.1, w: 0.84, h: 0.8 }],
  18: [{ x: 0.08, y: 0.1, w: 0.84, h: 0.8 }],
  19: [{ x: 0.08, y: 0.1, w: 0.84, h: 0.8 }],
  20: [{ x: 0.08, y: 0.1, w: 0.84, h: 0.8 }],
  21: [{ x: 0.08, y: 0.1, w: 0.84, h: 0.8 }],
  22: [{ x: 0.08, y: 0.1, w: 0.84, h: 0.8 }],
  23: [{ x: 0.08, y: 0.1, w: 0.84, h: 0.8 }],
  24: [{ x: 0.08, y: 0.1, w: 0.84, h: 0.8 }],
  25: [{ x: 0.08, y: 0.1, w: 0.84, h: 0.8 }],
  26: [{ x: 0.08, y: 0.1, w: 0.84, h: 0.8 }],
};

/** ----------------------------------------------------------------
 * Mockup catalog (26 total, aligned with use.pdf)
 * -------------------------------------------------------------- */
const BASE_MOCKUPS: MockupDef[] = [
  { id: 1, title: "Main Listing Image (A)", kind: "main" },
  { id: 2, title: "Main Listing Image (B)", kind: "main" },
  { id: 3, title: "Collection Overview A", kind: "collection" },
  { id: 4, title: "Collection Overview B", kind: "collection" },
  { id: 6, title: "Collection Overview C", kind: "collection" },
  { id: 5, title: "Collection Overview D", kind: "collection" },
  { id: 7, title: "Detail Beauty", kind: "use" },
  { id: 8, title: "Transparency Demo", kind: "use" },
  { id: 9, title: "Resolution / Sizing", kind: "use" },
  { id: 10, title: "Mockup 1A", kind: "use" },
  { id: 11, title: "Mockup 1B", kind: "use" },
  { id: 12, title: "Mockup 2A", kind: "use" },
  { id: 13, title: "Mockup 2B", kind: "use" },
  { id: 14, title: "Mockup 3A", kind: "use" },
  { id: 15, title: "Mockup 3B", kind: "use" },
  { id: 16, title: "Programs / Compatibility", kind: "info" },
  { id: 17, title: "Coordinated Elements", kind: "use" },
  { id: 18, title: "License Summary", kind: "info" },
  { id: 19, title: "How It Works", kind: "info" },
  { id: 20, title: "Consistency", kind: "info" },
  { id: 21, title: "Tagline", kind: "promo" },
  { id: 22, title: "Discount / Offer", kind: "promo" },
  { id: 23, title: "Freebie CTA", kind: "promo" },
  { id: 24, title: "Reviews", kind: "info" },
  { id: 25, title: "Inspiration / Ideas", kind: "info" },
  { id: 26, title: "Final CTA", kind: "promo" },
];

/** ----------------------------------------------------------------
 * UI Bits
 * -------------------------------------------------------------- */
function looksLong(token: string) {
  return /DETAILS|body|Review_|FOOTER|transparent_details|PROGRAM_DETAILS|CONSISTENCY_DETAILS/i.test(
    token
  );
}

/** Canvas preview that draws user images into the layout's frames + draws live text */
function CardPreview({
  def,
  bg,
  logoUrl,
  logoMode,
  customImage,
  previewImages,
  bgImageUrl,
  liveText,
}: {
  def: any;
  bg: string;
  logoUrl?: string;
  logoMode?: "corner" | "full";
  customImage?: string;
  previewImages?: string[];
  bgImageUrl?: string;
  liveText?: string[];
}) {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

  const drawCover = (
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    x: number,
    y: number,
    w: number,
    h: number
  ) => {
    const ir = img.width / img.height;
    const r = w / h;
    let dw = w,
      dh = h,
      dx = 0,
      dy = 0;
    if (ir > r) {
      dh = h;
      dw = h * ir;
      dx = (w - dw) / 2;
      dy = 0;
    } else {
      dw = w;
      dh = w / ir;
      dx = 0;
      dy = (h - dh) / 2;
    }
    ctx.drawImage(img, x + dx, y + dy, dw, dh);
  };

  React.useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;

    const frames: Array<{ x: number; y: number; w: number; h: number }> =
      (Array.isArray((def as any)?.frames) && (def as any).frames.length
        ? (def as any).frames
        : FRAMES_BY_ID[def.id]) || [];

    const imgs = Array.isArray(previewImages) ? previewImages : [];

    const paintBase = () => {
      ctx.clearRect(0, 0, c.width, c.height);
      ctx.fillStyle = bg || "#ffffff";
      ctx.fillRect(0, 0, c.width, c.height);
    };

    const loadImage = (src: string) =>
      new Promise<HTMLImageElement>((resolve, reject) => {
        const im = new Image();
        im.onload = () => resolve(im);
        im.onerror = reject;
        im.crossOrigin = "anonymous";
        im.src = src;
      });

 const drawBackground = async () => {
  if (!bgImageUrl) {
    console.warn("[Mocktsy] drawBackground: no bgImageUrl for", def?.title);
    return;
  }
  try {
    const src = new URL(bgImageUrl, window.location.origin).toString();
    console.log("[Mocktsy] drawBackground: start", def?.title, src);

    const bgIm = await new Promise<HTMLImageElement>((resolve, reject) => {
      const im = new Image();
      im.onload = () => resolve(im);
      im.onerror = (e) => {
        console.error("[Mocktsy] drawBackground: onerror", def?.title, src, e);
        reject(e);
      };
      // Same-origin public assets → no crossOrigin to avoid HTTPS taint quirks
      im.src = src;
    });

    // Draw full-bleed background
    ctx.globalCompositeOperation = "source-over";
    ctx.drawImage(bgIm, 0, 0, c.width, c.height);


    console.log(
      "[Mocktsy] drawBackground: done",
      def?.title,
      { imgW: bgIm.width, imgH: bgIm.height, canvasW: c.width, canvasH: c.height }
    );
  } catch (err) {
    console.error("[Mocktsy] drawBackground: catch", def?.title, err);
  }
};



    const drawFrames = async () => {
      // If this layout is an Upload-Your-Own and has a custom image, paint it across first frame/full
      if (customImage) {
        try {
          const im = await loadImage(customImage);
          const f = frames[0] || { x: 0, y: 0, w: 1, h: 1 };
          const x = Math.round(f.x * c.width);
          const y = Math.round(f.y * c.height);
          const w = Math.round(f.w * c.width);
          const h = Math.round(f.h * c.height);
          drawCover(ctx, im, x, y, w, h);
        } catch {
          /* ignore */
        }
      }

      if (frames.length && imgs.length) {
        const loaded = await Promise.allSettled(
          imgs.slice(0, frames.length).map((src) => loadImage(src))
        );
        loaded.forEach((res, i) => {
          if (res.status !== "fulfilled") return;
          const im = res.value;
          const f = frames[i];
          const x = Math.round(f.x * c.width);
          const y = Math.round(f.y * c.height);
          const w = Math.round(f.w * c.width);
          const h = Math.round(f.h * c.height);
          drawCover(ctx, im, x, y, w, h);
        });
      }

      // Logo full-frame mode (Mockup 16)
      if (logoMode === "full" && logoUrl) {
        try {
          const im = await loadImage(logoUrl);
          const f = frames[0] || { x: 0, y: 0, w: 1, h: 1 };
          const x = Math.round(f.x * c.width);
          const y = Math.round(f.y * c.height);
          const w = Math.round(f.w * c.width);
          const h = Math.round(f.h * c.height);
          drawCover(ctx, im, x, y, w, h);
        } catch {
          /* ignore */
        }
      }
    };

    const drawLiveText = () => {
      if (!liveText || !liveText.length) return;
      const pad = 16;
      const lineH = 18;
      ctx.save();
      ctx.font = "600 14px Inter, system-ui, sans-serif";
      ctx.textBaseline = "bottom";
      ctx.fillStyle = "rgba(0,0,0,0.8)";
      const lines = liveText.slice(0, 6);
      lines.forEach((txt, idx) => {
        ctx.fillText(txt, pad, c.height - pad - (lines.length - 1 - idx) * lineH);
      });
      ctx.restore();
    };

    (async () => {
      paintBase();
      await drawBackground();
      await drawFrames();
      drawLiveText();
    })();
  }, [def, bg, customImage, logoUrl, logoMode, bgImageUrl, JSON.stringify(previewImages || []), JSON.stringify(liveText || [])]);

  return (
<div className="absolute inset-0">
      <canvas
        ref={canvasRef}
        width={1000}
        height={1000}
className="w-full h-full"
        aria-label="mockup preview"
      />
      {/* Corner logo overlay (bottom-right) except when logoMode is full (Mockup 16) */}
      {!!logoUrl && logoMode !== "full" && (
        <img
          src={logoUrl}
          alt="logo"
          className="absolute bottom-3 right-3 w-10 h-10 object-contain opacity-80 pointer-events-none"
        />
      )}
    </div>
  );
}

/** One preview card */
function MockupCard({
  def,
  fieldValues,
  tokens,
  overlays,
  setOverlays,
  gridCols,
  selected,
  onToggle,
  onMagnify,
  customImage,
  onUploadCustomImage,
  previewImages,
  bgImageUrl,
}: {
  def: MockupDef;
  fieldValues?: Record<string, any>;
  tokens: string[];
  overlays?: Record<number, Record<string, string>>;
  setOverlays?: React.Dispatch<React.SetStateAction<Record<number, Record<string, string>>>>;
  gridCols: number;
  selected: boolean;
  onToggle: () => void;
  onMagnify: () => void;
  customImage?: string;
  onUploadCustomImage?: (url: string) => void;
  previewImages?: string[];
  bgImageUrl?: string;
}) {
  const bg = bgFromFieldValues(fieldValues);
  const logoUrl = fieldValues?.logoPreviewUrl || fieldValues?.logoUrl;
  const { ref: overlayBoxRef, width: overlayW, height: overlayH } = useElementSize<HTMLDivElement>();


  // read current values for this card's tokens
  const valuesForCard = overlays?.[def.id] || {};

  const updateToken = (token: string, val: string) => {
    if (!setOverlays) return;
    setOverlays((prev) => {
      const prevForId = prev?.[def.id] || {};
      return { ...prev, [def.id]: { ...prevForId, [token]: val } };
    });
  };

  // Upload-Your-Own should be on the “A” variants (current UI titles 1A/2A/3A)
  const isUploadYourOwn =
    def.title === "Mockup 1A" || def.title === "Mockup 2A" || def.title === "Mockup 3A";

  const onUploadA = () => {
    if (!isUploadYourOwn || !onUploadCustomImage) return;
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;
      const url = URL.createObjectURL(file);
      onUploadCustomImage(url);
    };
    input.click();
  };

  // Build a simple set of “live text” lines to display in the preview
  const liveTextLines = useMemo(() => {
    const vals: string[] = [];
    const v = valuesForCard || {};
    (tokens || []).forEach((t) => {
      const fallback =
        (t === "clipart_title" && fieldValues?.clipartSetName) ||
        (t === "clipart_number" && (fieldValues?.numImages != null ? String(fieldValues.numImages) : "")) ||
        DEFAULT_TEXT_BY_TOKEN[t] ||
        "";
      const txt = v[t] ?? fallback;
      if (txt) vals.push(String(txt));
    });
    return vals;
  }, [tokens, valuesForCard, fieldValues?.clipartSetName, fieldValues?.numImages]);

  const tokenValuesForOverlay = useMemo(() => {
  const map: Record<string, string> = {};
  const v = valuesForCard || {};
  (tokens || []).forEach((t) => {
    const fallback =
      (t === "clipart_title"  && fieldValues?.clipartSetName) ||
      (t === "clipart_number" && (fieldValues?.numImages != null ? String(fieldValues.numImages) : "")) ||
      DEFAULT_TEXT_BY_TOKEN[t] || "";
    const txt = v[t] ?? fallback ?? "";
    if (txt) map[t] = String(txt);
  });
  return map;
}, [tokens, valuesForCard, fieldValues?.clipartSetName, fieldValues?.numImages]);


  // Tagline (id 21) → Mockup 16 Brand Trust Logo Image uses full-logo frame
  const logoMode: "corner" | "full" = def.title === "Tagline" ? "full" : "corner";

  return (
    <div
      className="card-hover rounded-xl p-2 relative"
      data-export-id={def.id}
      style={{
        border: `1px solid var(--mocktsy-border)`,
        background: "#fff",
        boxShadow: selected ? "0 0 0 3px rgba(102,126,234,0.35)" : "none",
      }}
      onClick={onToggle}
    >
      {/* Preview */}
      <div
className="aspect-square w-full relative rounded-lg overflow-hidden"
        style={{ background: bg, cursor: "pointer" }}
        onClick={onToggle}
      >
                {/* Hidden fetch to force the template PNG to load via the normal image loader.
            This makes it visible in Network → Img, and logs the exact failing URL if any. */}
        {bgImageUrl && (
          <img
            src={bgImageUrl}
            alt=""
            style={{ display: "none" }}
            onError={(e) => {
              const u = (e.target as HTMLImageElement).src;
              console.error("[Mocktsy] Template PNG 404 (hidden preload):", u);
            }}
            onLoad={(e) => {
              const u = (e.target as HTMLImageElement).src;
              // optional: uncomment if you want to see successes
              // console.log("[Mocktsy] Template PNG OK:", u);
            }}
          />
        )}

<>
  <CardPreview
    def={def}
    bg={bg}
    logoUrl={logoUrl}
    logoMode={logoMode}
    customImage={customImage}
    previewImages={previewImages}
    bgImageUrl={bgImageUrl}
    liveText={liveTextLines}
  />

  {/* Live text overlay (absolute over the preview) */}
  <div ref={overlayBoxRef} className="absolute inset-0 pointer-events-none">
    <TextOverlay
rects={getTextRectsForLayout(BG_BY_TITLE[def.title] ?? `${slugifyTitle(def.title)}.png`)}
tokenValues={tokenValuesForOverlay}
      fontRoles={{
        display: fieldValues?.fonts?.display ?? fieldValues?.fonts?.heading ?? "inherit",
        heading: fieldValues?.fonts?.heading ?? "inherit",
        body:    fieldValues?.fonts?.body    ?? "inherit",
      }}
      colorRoles={COLOR_ROLES_BLACK}
      previewWidth={overlayW || 600}
      previewHeight={overlayH || 600}
    />
  </div>
</>


        {/* Grid badge for collection cards */}
        {def.kind === "collection" && (
          <div className="absolute bottom-3 left-3 text-[11px] bg-white/85 rounded px-2 py-1 border">
            Grid: {def.id === 3 || def.id === 6 ? "3×3" : "4×4"}
          </div>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            onMagnify();
          }}
          title="Enlarge preview"
          className="absolute top-2 right-10 rounded-lg px-2 py-1 text-xs"
          style={{ background: "rgba(255,255,255,0.85)", border: "1px solid var(--mocktsy-border)" }}
        >
          🔍
        </button>
        <a
  href={bgImageUrl || undefined}
  target="_blank"
  rel="noreferrer"
  onClick={(e) => e.stopPropagation()}
  title="Open template PNG"
  className="absolute top-2 right-2 rounded-lg px-2 py-1 text-xs z-20"
  style={{ background: "rgba(255,255,255,0.85)", border: "1px solid var(--mocktsy-border)", textDecoration: "none" }}
>
  🔗
</a>


      </div>

{/* TEMP: show background image URL for debugging */}
      <div className="mt-1 text-[10px] text-gray-500 break-all">
        {bgImageUrl || "no bgImageUrl"}
    
      </div>

      {/* Caption row */}
      <div className="mt-2 flex items-center justify-between">
        <div className="text-sm font-semibold text-gray-800">{def.title}</div>
        {isUploadYourOwn && (
          <button
            className="text-xs px-2 py-1 rounded-lg border"
            style={{ borderColor: "var(--mocktsy-border)", background: "#fff" }}
            onClick={(e) => {
              e.stopPropagation();
              onUploadA();
            }}
          >
            Upload
          </button>
        )}
      </div>

      {/* Inline text inputs (under this preview) – labels match Canva */}
      <div className="mt-3 space-y-2" onClick={(e) => e.stopPropagation()}>
        {tokens.map((token) => {
          const value =
            valuesForCard[token] ??
            (token === "clipart_title" && fieldValues?.clipartSetName ? fieldValues.clipartSetName : undefined) ??
            (token === "clipart_number" && fieldValues?.numImages ? String(fieldValues.numImages) : undefined) ??
            DEFAULT_TEXT_BY_TOKEN[token] ??
            "";
          const id = `${def.id}_${token}`;

          return (
            <div key={id}>
              <label className="block text-[11px] font-semibold mb-1">
                {PRETTY_LABELS[token] || token}
              </label>

              {looksLong(token) ? (
                <textarea
                  className="w-full px-3 py-2 rounded-xl bg-[#fff8fb]
                             outline-none focus:outline-none focus-visible:outline-none
                             border-0 focus:border-transparent
                             ring-0 focus:ring-2 focus:ring-pink-200 focus:ring-offset-0
                             shadow-none focus:shadow-none appearance-none"
                  rows={2}
                  value={value}
                  onChange={(e) => updateToken(token, e.target.value)}
                  placeholder={DEFAULT_TEXT_BY_TOKEN[token] || ""}
                />
              ) : (
                <input
                  className="w-full px-3 py-2 rounded-xl bg-[#fff8fb]
                             outline-none focus:outline-none focus-visible:outline-none
                             border-0 focus:border-transparent
                             ring-0 focus:ring-2 focus:ring-pink-200 focus:ring-offset-0
                             shadow-none focus:shadow-none appearance-none"
                  value={value}
                  onChange={(e) => updateToken(token, e.target.value)}
                  placeholder={DEFAULT_TEXT_BY_TOKEN[token] || ""}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Selection dot */}
      <div
        className="absolute top-2 left-2 h-4 w-4 rounded-full"
        style={{
          border: "2px solid #fff",
          boxShadow: "0 0 0 1px var(--mocktsy-border)",
          background: selected ? "linear-gradient(90deg, var(--mocktsy-g1), var(--mocktsy-g2))" : "#fff",
        }}
      />
    </div>
  );
}

/** Zoom modal (unchanged visuals) */
function ZoomModal(props: {
  open: boolean;
  onClose: () => void;
  def?: MockupDef;
  fieldValues?: Record<string, any>;
  gridCols: number;
}) {
  const { open, onClose, def, fieldValues, gridCols } = props;

  if (!open || !def) return null;
  const bg = bgFromFieldValues(fieldValues);
  const logoUrl = fieldValues?.logoPreviewUrl || fieldValues?.logoUrl;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(15, 18, 34, 0.55)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl rounded-2xl overflow-hidden"
        style={{ background: "#fff" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative aspect-[5/4]" style={{ background: bg }}>
          {!!logoUrl && (
            <img src={logoUrl} alt="logo" className="absolute bottom-4 right-4 w-14 h-14 object-contain opacity-85" />
          )}
          {def.kind === "collection" && (
            <div className="absolute bottom-4 left-4 text-xs bg-white/90 rounded px-2 py-1 border">
              Grid: {gridCols}×{gridCols}
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center px-10 text-center">
            <div className="text-base md:text-lg font-semibold px-3 py-1 bg-white/70 border rounded">
              {def.id}. {def.title}
            </div>
          </div>
        </div>
        <div className="p-3 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {def.id}. {def.title}
          </div>
          <button className="btn btn--outline" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/** ----------------------------------------------------------------
 * Main Component (Step 3)
 * -------------------------------------------------------------- */

export default function ChooseLayouts({
  images,
  fieldValues,
  onSelectionChange,
  overlays,
  setOverlays,
}: Props) {
  // derived grid detail from number of images
  const gridCols = useMemo(
    () => gridColsFor(clamp(Number(fieldValues?.numImages || 20), 1, 100)),
    [fieldValues?.numImages]
  );

  // Build a simple pool of image URLs for quick previews
  const previewPool = React.useMemo(() => (images ?? []).map((i) => i.url).filter(Boolean), [images]);

  // Force the grid to refresh when images change.
  const containerKey = previewPool.length;


  // order + selection state
  const [order, setOrder] = useState<MockupDef[]>(BASE_MOCKUPS);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set([1, 2, 3]));

  // Per-layout custom image for Upload-Your-Own A variants (Mockup 1A/2A/3A)
  const [customMockupImages, setCustomMockupImages] = useState<Record<number, string>>({});

  // Build quick lookup so we can send selected layouts upward
  const defsById = useMemo(() => {
    return Object.fromEntries(order.map((def) => [def.id, def])) as Record<number, MockupDef>;
  }, [order]);

  // Assign preview images per card with the Collection Overview non-repeat rule
  const assignedPreviewById = useMemo(() => {
    const map: Record<number, string[]> = {};
    const usedInCollections = new Set<string>();

    order.forEach((def) => {
      const framesForDef =
        (Array.isArray(def.frames) && def.frames.length ? def.frames : FRAMES_BY_ID[def.id]) || [];
      const frameCount = Math.max(1, framesForDef.length || 1);

      if (def.kind === "collection") {
        const uniques: string[] = [];
        for (let i = 0; i < previewPool.length && uniques.length < frameCount; i++) {
          const candidate = previewPool[i];
          if (!usedInCollections.has(candidate)) {
            usedInCollections.add(candidate);
            uniques.push(candidate);
          }
        }
        // If we run out of unique images, leave remaining frames empty (skip)
        map[def.id] = uniques;
      } else {
        // Other mockups can repeat; just use the first N images (or none)
        map[def.id] = previewPool.slice(0, frameCount);
      }
    });

    return map;
  }, [order, previewPool]);

  // Tell parent whenever selection/order/overlays/customImages change
  const lastEmit = useRef<string>("");
  useEffect(() => {
    const idsInOrder = order.map((d) => d.id).filter((id) => selectedIds.has(id));
    const payloadKey =
      JSON.stringify(idsInOrder) + "|" + JSON.stringify(overlays) + "|" + JSON.stringify(customMockupImages);
    if (payloadKey !== lastEmit.current) {
      lastEmit.current = payloadKey;
      onSelectionChange?.(
        idsInOrder.map((id) => ({
          id,
          def: defsById[id],
          tokens: overlays?.[id] || {},
          customImage: customMockupImages[id],
        }))
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order, selectedIds, overlays, customMockupImages, defsById]);

  const [zoom, setZoom] = useState<{ open: boolean; def?: MockupDef }>({ open: false });

  // light debounce hook for any preview recalcs
  useDebouncedEffect(() => {}, [fieldValues, images], 150);

  // selection helpers
  const maxSelected = 20;
  const selectedCount = selectedIds.size;
  const collectionsSelected = useMemo(
    () => order.filter((d) => d.kind === "collection" && selectedIds.has(d.id)).length,
    [order, selectedIds]
  );
  const mainSelected = selectedIds.has(1) || selectedIds.has(2);

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        return next;
      }
      if (next.size >= maxSelected) {
        alert("You can select up to 20 mockups total.");
        return next;
      }
      next.add(id);
      return next;
    });
  };

  const onShuffle = () => {
    setOrder((old) => {
      const mains = old.filter((d) => d.id === 1 || d.id === 2);
      const others = old.filter((d) => d.id !== 1 && d.id !== 2);
      const shuffled = shuffleKeepFirst([...(mains.length ? [mains[0]] : []), ...others]);
      return shuffled;
    });
  };
  const onResetOrder = () => {
    setOrder(() => BASE_MOCKUPS.slice());
  };

  // rule validations
  const needsMain = !mainSelected;
  const needsCollections = collectionsSelected < 1 || collectionsSelected > 4;
  const canProceed = selectedCount > 0 && !needsMain && !needsCollections && selectedCount <= maxSelected;

  return (
    <div key={containerKey}>
      <div className="space-y-4">
        {/* Explainer and controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="text-sm" style={{ color: "var(--mocktsy-muted)" }}>
            Select the mockup layouts you want to include below. Include at least one <b>“Main Listing Image”</b> and{" "}
            <b>1–4 “Collection Overview”</b> pages. You can select up to <b>20</b> mockups in total.
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="pill">Selected: {selectedCount} / 20</div>
            <button className="btn btn--outline" onClick={onShuffle}>
              Shuffle Mockups
            </button>
            <div className="w-full text-xs" style={{ color: "var(--mocktsy-muted)" }}>
              Shuffle will keep your selected <b>Main Listing Image</b> in slot <b>#1</b>.
            </div>
            <button className="btn btn--outline" onClick={onResetOrder}>
              Reset order
            </button>
          </div>
        </div>

        {/* Validation messages */}
        {(needsMain || needsCollections) && (
          <div
            className="rounded-xl px-3 py-2 text-sm"
            style={{
              background: "rgba(255, 92, 168, 0.08)",
              border: "1px solid rgba(255,92,168,0.25)",
              color: "#8a1c58",
            }}
          >
            {!mainSelected && (
              <>
                • Please select a <b>Main Listing Image</b> (required).
              </>
            )}{" "}
            {(collectionsSelected < 1 || collectionsSelected > 4) && (
              <>
                • Select between <b>1 and 4</b> <b>Collection Overview</b> pages.
              </>
            )}
          </div>
        )}

        {/* Responsive grid of previews with inline inputs per card */}
        <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}>
         {order.map((def) => {
  const framesForDef =
    (Array.isArray(def.frames) && def.frames.length ? def.frames : FRAMES_BY_ID[def.id]) || [];
  const frameCount = Math.max(1, framesForDef.length || 1);

  // Respect non-repeat rule for the four collection layouts
  const previewForDef = assignedPreviewById[def.id] || [];

  // Build clean preview URL from def.title → fileName
const fileName = BG_BY_TITLE[def.title] ?? `${slugifyTitle(def.title)}.png`;


// Build “/<base>/layout-previews/<encoded filename>”
const base = (import.meta as any).env?.BASE_URL ?? "/";
const prefix = base.endsWith("/") ? base : base + "/";
const bgUrl = `${prefix}layout-previews/${encodeURIComponent(fileName)}`;


  // DEV: log exact id text (to check hyphen vs en dash, etc.)
  console.log("Mockup ID:", def.id);

  // Return only the card (no extra JSX after this inside the map)
  return (
    <MockupCard
      key={def.id}
      def={{ ...def, frames: framesForDef }}
      fieldValues={fieldValues}
      tokens={TOKENS_BY_LAYOUT[def.id] || []}
      overlays={overlays}
      setOverlays={setOverlays}
      gridCols={gridCols}
      selected={selectedIds.has(def.id)}
      onToggle={() => toggleSelect(def.id)}
      onMagnify={() => setZoom({ open: true, def })}
      customImage={customMockupImages[def.id]}
      onUploadCustomImage={(url) =>
        setCustomMockupImages((prev) => ({ ...prev, [def.id]: url }))
      }
      previewImages={previewForDef.slice(0, frameCount)}
      bgImageUrl={bgUrl}
    />
  );
})}
</div>

{/* Proceed/Generate helper — render ONCE, outside the map */}
{!canProceed && (
  <div className="text-xs" style={{ color: "var(--mocktsy-muted)" }}>
    Tip: Once your selection follows the rules above, you can click <b>Generate Mockups</b>.
  </div>
)}

{/* Zoom modal — render ONCE, outside the map */}
<ZoomModal
  open={zoom.open}
  onClose={() => setZoom({ open: false })}
  def={zoom.def}
  fieldValues={fieldValues}
  gridCols={gridCols}
/>

      </div>
    </div>
  );
}
