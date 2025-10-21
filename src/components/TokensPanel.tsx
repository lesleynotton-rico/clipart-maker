import React, { useMemo } from "react";

export type BgMode = "brand" | "picker" | "neutral";
export type HeroStyle = "option1" | "option2";
export type GridStyle = "shadow" | "outline";

export interface MockupText {
  h1?: string;
  h2?: string;
  body?: string;
  callout?: string;
}

export interface Tokens {
  presetName: string;
  clipartSetName: string;
  numImages: number;

  subtitle: string;
  cta: string;

  bgMode: BgMode;
  bgColor: string;
  useBrandColors: boolean;

  heroStyle: HeroStyle;
  gridDetail: GridStyle;

  logoUrl: string;
  shuffleMockups: boolean;

  overlays: Record<number, MockupText>;
}

const defaultOverlays: Record<number, MockupText> = {
  1: { h1: "{{clipartSetName}}", callout: "{{numImages}} Transparent PNGs", body: "Instant Download · High-Resolution · Commercial Use" },
  2: { h2: "Included In Your Download!", body: "High-Resolution Transparent PNG Files · 300 DPI" },
  3: { h2: "Included In Your Download!", body: "High-Resolution Transparent PNG Files · 300 DPI" },
  4: { h2: "Beautifully Detailed Graphics", body: "Crisp Quality · Perfect for Print or Digital · 300 DPI" },
  5: { h2: "Transparent Backgrounds", body: "Ready To Use · High Quality · Clean Edges" },
  6: { h2: "High Resolution For Every Size", body: "Scale Without Quality Loss · Max ~13.7in / 34.9cm" },
  7: { h2: "Perfect For Branding", body: "Create Logos, Business Cards & Social Posts" },
  8: { h2: "Ready For Print-On-Demand", body: "Use On T-Shirts, Mugs, Tote Bags & More" },
  9: { h2: "Great For Crafts & Printables", body: "Invitations, Scrapbooks, Cards & Planners" },
  10:{ h2: "Easy To Use In Any Program", body: "Drag & Drop in Canva, Photoshop, Procreate" },
  11:{ h2: "Perfectly Coordinated Elements", body: "Designed To Work Seamlessly Together" },
  12:{ h2: "Commercial License Included", body: "You Can: Sell physicals/POD, use in printables (flattened). You Can't: Resell files, share, or offer as freebies." },
  13:{ h2: "How It Works", body: "1) Purchase  2) Download From Your Purchases  3) Get Files From The PDF" },
  14:{ h1: "{{numImages}} High-Quality Clipart Files", body: "Instant Download · Commercial Use Included" },
  15:{ h1: "{{brandName}}", body: "Designed for Creators, Loved by Designers" },
  16:{ h1: "More Collections You’ll Love", callout: "Explore Coordinating Bundles & Themes!" },
  17:{ h1: "Get A Free Design Pack!", h2: "Join For Monthly Freebies", body: "Instant access · New graphics monthly" },
  18:{ h1: "What Our Customers Say", body: "“Absolutely love these designs! So easy to use and beautiful quality.”" },
  19:{ h1: "Endless Creative Possibilities", h2: "See How Others Use These Designs", body: "From branding to POD—create freely" },
  20:{ h1: "Instant Download", h2: "Start Creating Today", body: "Commercial License Included · Lifetime Access" },
};

export const defaultTokens: Tokens = {
  presetName: "",
  clipartSetName: "",
  numImages: 20,
  subtitle: "Watercolor Clipart Pack",
  cta: "Add To Basket & Download Instantly",
  bgMode: "neutral",
  bgColor: "#f5f5f5",
  useBrandColors: false,
  heroStyle: "option1",
  gridDetail: "shadow",
  logoUrl: "",
  shuffleMockups: false,
  overlays: defaultOverlays,
};

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-sm font-semibold text-gray-700 mb-1">{children}</label>;
}
function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={
        "w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white/50 transition-all focus:outline-none focus:border-blue-500 " +
        (props.className || "")
      }
    />
  );
}
function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={
        "w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white/50 transition-all focus:outline-none focus:border-blue-500 " +
        (props.className || "")
      }
    />
  );
}

/** ---------- Helpers for computed preview text ---------- */
function useResolvedOverlays(tokens: Tokens) {
  return useMemo(() => {
    const vars = {
      clipartSetName: tokens.clipartSetName || "Clipart Collection",
      numImages: String(tokens.numImages || 0),
      brandName: "Your Brand",
    };
    const map: Record<number, MockupText> = {};
    for (const [k, v] of Object.entries(tokens.overlays)) {
      map[+k] = {
        h1: v.h1?.replace(/\{\{(\w+)\}\}/g, (_, n) => (vars as any)[n] ?? ""),
        h2: v.h2?.replace(/\{\{(\w+)\}\}/g, (_, n) => (vars as any)[n] ?? ""),
        body: v.body?.replace(/\{\{(\w+)\}\}/g, (_, n) => (vars as any)[n] ?? ""),
        callout: v.callout?.replace(/\{\{(\w+)\}\}/g, (_, n) => (vars as any)[n] ?? ""),
      };
    }
    return map;
  }, [tokens]);
}

/** =========================================================
 *  PANEL A — Global project setup (top of page)
 *  ========================================================= */
export function ProjectSetupPanel({
  tokens,
  setTokens,
  onSavePreset,
  onLoadPreset,
  availablePresets = [],
  onExportJSON,
  onImportJSON,
}: {
  tokens: Tokens;
  setTokens: (t: Tokens) => void;
  onSavePreset?: () => void;
  onLoadPreset?: (name: string) => void;
  availablePresets?: string[];
  onExportJSON?: () => void;
  onImportJSON?: (file: File) => void;
}) {
  function update<K extends keyof Tokens>(key: K, value: Tokens[K]) {
    setTokens({ ...tokens, [key]: value });
  }

  return (
    <div className="glass-card rounded-2xl p-6 md:p-8 card-hover bg-white/70">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-500 text-white">⚙</div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Project Setup</h2>
            <p className="text-gray-600 text-sm">Global details used across all 20 mockups.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onSavePreset && (
            <button className="px-4 py-2 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200" onClick={onSavePreset}>Save Preset</button>
          )}
          {onLoadPreset && (
            <Select defaultValue="" onChange={(e) => onLoadPreset(e.target.value)} className="min-w-[180px]">
              <option value="" disabled>Load Preset…</option>
              {availablePresets.map((p) => <option key={p} value={p}>{p}</option>)}
            </Select>
          )}
          {onExportJSON && (
            <button className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200" onClick={onExportJSON}>Export</button>
          )}
          {onImportJSON && (
            <label className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer">
              Import
              <input type="file" accept="application/json" className="hidden" onChange={(e) => e.target.files && onImportJSON(e.target.files[0])} />
            </label>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div>
          <Label>Preset Name</Label>
          <Input
            placeholder="e.g., florals-v1"
            value={tokens.presetName}
            onChange={(e) => update("presetName", e.target.value)}
          />
        </div>

        <div>
          <Label>Clipart Set Name</Label>
          <Input
            placeholder="e.g., Midnight Peonies"
            value={tokens.clipartSetName}
            onChange={(e) => update("clipartSetName", e.target.value)}
          />
        </div>

        <div>
          <Label>Number of Images</Label>
          <Input
            type="number"
            min={1}
            max={1000}
            value={tokens.numImages}
            onChange={(e) => update("numImages", Math.max(1, Number(e.target.value || 1)))}
          />
          <p className="text-xs text-gray-500 mt-1">Auto-sizes overview grids (Mockups 2 & 3).</p>
        </div>

        <div>
          <Label>Subtitle (default)</Label>
          <Input
            placeholder="Watercolor Clipart Pack"
            value={tokens.subtitle}
            onChange={(e) => update("subtitle", e.target.value)}
          />
        </div>

        <div>
          <Label>CTA (default)</Label>
          <Input
            placeholder="Add To Basket & Download Instantly"
            value={tokens.cta}
            onChange={(e) => update("cta", e.target.value)}
          />
        </div>

        <div>
          <Label>Hero Cover Style</Label>
          <Select value={tokens.heroStyle} onChange={(e) => update("heroStyle", e.target.value as HeroStyle)}>
            <option value="option1">Option 1 - 8 Highlights Around Title</option>
            <option value="option2">Option 2 - 9-Grid Around Title</option>
          </Select>
        </div>

        <div>
          <Label>Grid Image Treatment (Mockups 2 & 3)</Label>
          <Select value={tokens.gridDetail} onChange={(e) => update("gridDetail", e.target.value as GridStyle)}>
            <option value="shadow">Soft Shadow on Image</option>
            <option value="outline">Clean Outline Around Image</option>
          </Select>
        </div>

        <div>
          <Label>Logo Image URL</Label>
          <Input
            placeholder="https://…/logo.png"
            value={tokens.logoUrl}
            onChange={(e) => update("logoUrl", e.target.value)}
          />
        </div>

        <div>
          <Label>Background Mode</Label>
          <Select value={tokens.bgMode} onChange={(e) => update("bgMode", e.target.value as BgMode)}>
            <option value="brand">Use Brand Colors</option>
            <option value="picker">Use Specific Color</option>
            <option value="neutral">Light Neutral</option>
          </Select>
          <p className="text-xs text-gray-500 mt-1">Brand colors require Canva Brand Kit wiring; falls back to picked color when unavailable.</p>
        </div>

        <div>
          <Label>Picked Background Color</Label>
          <input
            type="color"
            value={tokens.bgColor}
            onChange={(e) => update("bgColor", e.target.value)}
            className="w-full h-12 border-2 border-gray-200 rounded-xl cursor-pointer"
          />
        </div>

        <div className="flex items-center gap-3">
          <input
            id="useBrandColors"
            type="checkbox"
            className="h-5 w-5"
            checked={tokens.useBrandColors}
            onChange={(e) => update("useBrandColors", e.target.checked)}
          />
          <Label><span className="inline-block -mt-1">Prefer Brand Kit Colors</span></Label>
        </div>
      </div>
    </div>
  );
}

/** =========================================================
 *  PANEL B — Mockup-specific overlays (place with mockups)
 *  ========================================================= */
export function OverlayTweaksPanel({
  tokens,
  setTokens,
}: {
  tokens: Tokens;
  setTokens: (t: Tokens) => void;
}) {
  const resolved = useResolvedOverlays(tokens);

  function updateOverlay(idx: number, field: keyof MockupText, value: string) {
    setTokens({
      ...tokens,
      overlays: { ...tokens.overlays, [idx]: { ...tokens.overlays[idx], [field]: value } },
    });
  }

  return (
    <div className="glass-card rounded-2xl p-6 md:p-8 card-hover bg-white/70">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-r from-purple-500 to-pink-500 text-white">✏️</div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Quick Overlay Tweaks</h3>
            <p className="text-gray-600 text-sm">Edit per-mockup text. Vars: {"{{clipartSetName}}"}, {"{{numImages}}"}, {"{{brandName}}"}.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <input
            id="shuffle"
            type="checkbox"
            className="h-5 w-5"
            checked={tokens.shuffleMockups}
            onChange={(e) => setTokens({ ...tokens, shuffleMockups: e.target.checked })}
          />
          <label htmlFor="shuffle" className="text-sm text-gray-700">Shuffle Mockups (cover stays #1)</label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array.from({ length: 20 }).map((_, i) => {
          const idx = i + 1;
          const ov = tokens.overlays[idx] || {};
          return (
            <div key={idx} className="bg-white rounded-xl border-2 border-gray-200 p-4 shadow-sm hover:shadow-lg transition-all">
              <div className="flex items-center justify-between mb-2">
                <div className="font-semibold text-gray-800">Mockup {idx}</div>
                <span className="text-xs text-gray-500">
                  {idx === 1 ? "Hero" : idx <= 3 ? "Collection" : idx <= 10 ? "Use/Tech" : "Info/Promo"}
                </span>
              </div>
              <div className="grid grid-cols-1 gap-2">
                <Input placeholder="H1" value={ov.h1 || ""} onChange={(e) => updateOverlay(idx, "h1", e.target.value)} />
                <Input placeholder="H2" value={ov.h2 || ""} onChange={(e) => updateOverlay(idx, "h2", e.target.value)} />
                <Input placeholder="Body" value={ov.body || ""} onChange={(e) => updateOverlay(idx, "body", e.target.value)} />
                <Input placeholder="Callout" value={ov.callout || ""} onChange={(e) => updateOverlay(idx, "callout", e.target.value)} />
                <p className="text-xs text-gray-500">Preview: <span className="text-gray-700">{(resolved[idx]?.h1 || "").slice(0, 60)}</span></p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
