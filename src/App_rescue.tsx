// src/App.tsx
import React, { useCallback, useEffect, useMemo, useState } from "react";

// Existing project utilities & components
import TestPlanButton from "./components/TestPlanButton";
import { buildPlan } from "./utils/buildPlan";
import { sendBuildToCanva } from "./utils/canvaSender";
import { MOCKUP_MAPPINGS } from "./config/mockupMapping";
import ChooseLayouts from "./layouts/ChooseLayouts";
import CustomizeText from "./components/CustomizeText";

type ImageItem = { id: string; url: string };

/** ===== Utilities ===== */
const uid = (() => { let n = 0; return () => `img_${Date.now()}_${n++}`; })();

function Step({
  number, title, children, defaultOpen = true,
}: { number: number; title: string; children: React.ReactNode; defaultOpen?: boolean; }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div
      className="glass-card rounded-2xl p-6 mb-6 shadow-md"
      style={{
        boxShadow: "0 24px 60px rgba(0,0,0,0.10), 0 8px 24px rgba(0,0,0,0.06)",
        background: "var(--mocktsy-card)",
      }}
    >
      <button onClick={() => setOpen((v) => !v)} className="w-full flex items-center justify-between text-left">
        <div className="flex items-center gap-3">
          <span className="pill" style={{ background: "rgba(255,255,255,0.6)" }}>Step {number}</span>
          <h2 className="text-lg sm:text-xl font-bold">{title}</h2>
        </div>
        <span className="text-sm" style={{ color: "var(--mocktsy-muted)" }}>{open ? "Collapse" : "Expand"}</span>
      </button>
      {open && <div className="mt-4">{children}</div>}
    </div>
  );
}

/** ===== Presets (localStorage) ===== */
const PRESETS_KEY = "mocktsy.presets.v1";
type BrandPreset = {
  id: string;
  name: string;
  brandName: string;
  clipartSetName: string;
  numImages: number;
  logoUrl?: string;        // public URL string (persistable)
  primaryColor?: string;
  secondaryColor?: string;
  fontHeading?: string;
  fontBody?: string;
  createdAt: number;
};
const MAX_PRESETS = 5;

function loadPresets(): BrandPreset[] {
  try {
    const raw = localStorage.getItem(PRESETS_KEY);
    return raw ? (JSON.parse(raw) as BrandPreset[]) : [];
  } catch { return []; }
}
function savePresets(next: BrandPreset[]) {
  try { localStorage.setItem(PRESETS_KEY, JSON.stringify(next)); } catch {}
}

/** ===== Fonts ===== */
const FONT_OPTIONS = [
  "Inter", "Poppins", "Nunito", "Rubik", "Montserrat", "Lato", "Work Sans",
  "Karla", "Figtree", "Bricolage Grotesque", "Outfit", "Source Sans 3",
  "Playfair Display", "Merriweather", "Libre Baskerville", "Roboto", "Open Sans",
  "Quicksand", "Raleway", "DM Sans", "Manrope",
];

/** ===== App ===== */
export default function App() {
  // --------------------------------
  // Step 1: Images
  // --------------------------------
  const [images, setImages] = useState<ImageItem[]>([]);
  const [status, setStatus] = useState<string>("");

  const handleUpload = useCallback(async () => {
    try {
      const input = document.createElement("input");
      input.type = "file"; input.accept = "image/*"; input.multiple = true;
      input.onchange = () => {
        if (!input.files || input.files.length === 0) return;
        setStatus("Loading images…");
        const next: ImageItem[] = [];
        Array.from(input.files).forEach((file) => {
          const objectUrl = URL.createObjectURL(file);
          next.push({ id: uid(), url: objectUrl });
        });
        setImages((prev) => [...prev, ...next]);
        setStatus(`Loaded ${next.length} new image${next.length === 1 ? "" : "s"}`);
      };
      input.click();
    } catch (err) { console.error(err); setStatus("Upload failed"); }
  }, []);
  const loadImages = useCallback(async () => { setStatus(`Images in memory: ${images.length}`); }, [images.length]);

  // --------------------------------
  // Step 2: Brand & Presets
  // --------------------------------
  // Editable brand fields
  const [brandName, setBrandName] = useState("");
  const [clipartSetName, setClipartSetName] = useState("");
  const [numImages, setNumImages] = useState<number>(20); // default
  const [primaryColor, setPrimaryColor] = useState("#222222");
  const [secondaryColor, setSecondaryColor] = useState("#ff5ca8");
  const [fontHeading, setFontHeading] = useState(FONT_OPTIONS[0]);
  const [fontBody, setFontBody] = useState(FONT_OPTIONS[1]);
  const [logoUrl, setLogoUrl] = useState("");
  const [logoObjectUrl, setLogoObjectUrl] = useState<string | undefined>(undefined); // preview-only (not persisted)
// Step 4: per-layout text overlays (by layout id)
const [overlays, setOverlays] = useState<Record<number, { h1?: string; h2?: string; body?: string; callout?: string }>>({});

// Step 3 selection handshake (layouts chosen in ChooseLayouts)
const [selectedIds, setSelectedIds] = useState<number[]>([1, 2, 3]); // default: Main + 2 overviews

  // Presets state
  const [presets, setPresets] = useState<BrandPreset[]>(loadPresets());
  const [selectedPresetId, setSelectedPresetId] = useState<string>("");
  const [usePreset, setUsePreset] = useState<boolean>(false);

  // Apply a preset → populate fields & lock
  const applyPresetById = (id: string) => {
    const p = presets.find((x) => x.id === id);
    if (!p) return;
    setSelectedPresetId(id);
    setUsePreset(true);
    setBrandName(p.brandName || "");
    setClipartSetName(p.clipartSetName || "");
    setNumImages(p.numImages || 20);
    setPrimaryColor(p.primaryColor || "#222222");
    setSecondaryColor(p.secondaryColor || "#ff5ca8");
    setFontHeading(p.fontHeading || FONT_OPTIONS[0]);
    setFontBody(p.fontBody || FONT_OPTIONS[1]);
    setLogoUrl(p.logoUrl || "");
    setLogoObjectUrl(undefined); // do not carry temp uploads across
  };

  const onSavePreset = () => {
    if (presets.length >= MAX_PRESETS) {
      alert(`You can save up to ${MAX_PRESETS} presets for now.`);
      return;
    }
    const name = prompt("Name this preset (e.g., 'Clipart Sets', 'Bundles'):");
    if (!name) return;
    const newPreset: BrandPreset = {
      id: `preset_${Date.now()}`,
      name,
      brandName,
      clipartSetName,
      numImages,
      logoUrl: logoUrl || undefined,
      primaryColor,
      secondaryColor,
      fontHeading,
      fontBody,
      createdAt: Date.now(),
    };
    const next = [newPreset, ...presets].slice(0, MAX_PRESETS);
    setPresets(next);
    savePresets(next);
    setSelectedPresetId(newPreset.id);
    setUsePreset(true);
  };

  const onDeletePreset = () => {
    if (!selectedPresetId) return;
    const next = presets.filter((p) => p.id !== selectedPresetId);
    setPresets(next);
    savePresets(next);
    setSelectedPresetId("");
    setUsePreset(false);
  };

  const onUnlockFields = () => setUsePreset(false);

  const disabled = usePreset; // disable brand inputs when a preset is in use

  // Logo upload (preview-only)
  const handleLogoUpload = () => {
    const input = document.createElement("input");
    input.type = "file"; input.accept = "image/*";
    input.onchange = () => {
      if (!input.files || input.files.length === 0) return;
      const file = input.files[0];
      const objUrl = URL.createObjectURL(file);
      setLogoObjectUrl(objUrl);
      // We do NOT overwrite logoUrl (string) here, since object URLs are temporary.
      // If user wants persistence, they should paste a public image URL in the URL field.
    };
    input.click();
  };

  // --------------------------------
  // Plan inputs (tokens/fields) sent to buildPlan
  // --------------------------------
  const basePools = useMemo(() => ({ all: images }), [images]);
  const slideIds = useMemo<string[]>(() => Object.keys(MOCKUP_MAPPINGS || {}), []);
  const smartPools = useMemo(() => {
    return new Proxy(basePools as Record<string, any>, {
      get(target, prop: string) { if (prop in target) return (target as any)[prop]; return target.all || images || []; },
    });
  }, [basePools, images]);

  // Field values delivered to the builder
const fieldValues = useMemo(() => ({
  // Core brand data
  brandName,
  clipartSetName,
  numImages,
  primaryColor,
  secondaryColor,
  fontHeading,
  fontBody,

  // Logo: prefer uploaded preview if present (for preview-only); URL for persisted value
  logoUrl,                 // public URL string (persisted if preset saved)
  logoPreviewUrl: logoObjectUrl, // session-only object URL, for UI previews

  // Flags
  presetInUse: usePreset,
  selectedPresetId,

  // Step 4 overlays (per-layout text)
  overlays,
}), [
  brandName,
  clipartSetName,
  numImages,
  primaryColor,
  secondaryColor,
  fontHeading,
  fontBody,
  logoUrl,
  logoObjectUrl,
  usePreset,
  selectedPresetId,
  overlays,
]);

  // --------------------------------
  // Build + send to Canva (unchanged logic)
  // --------------------------------
  const handleBuildAndSend = useCallback(async () => {
    try {
      if (!images || images.length === 0) {
        console.warn("[UI] No images uploaded yet — cannot build plan.");
        setStatus("Please upload some images first, then try again.");
        return;
      }
      const plan = await buildPlan(slideIds, smartPools, fieldValues);
      sendBuildToCanva(plan);
      console.log("[UI] Sent plan to Canva:", plan);
      setStatus("Plan sent to Canva");
    } catch (err) {
      console.error("[UI] Failed to build/send plan:", err);
      setStatus("Failed to build/send plan (see console)");
    }
  }, [images, slideIds, smartPools, fieldValues]);

  // --------------------------------
  // UI
  // --------------------------------
  return (
    <div
      className="min-h-screen p-6"
      style={{
        background:
          "radial-gradient(1200px 800px at 10% -10%, rgba(102,126,234,0.16), transparent 60%), radial-gradient(1200px 800px at 110% 10%, rgba(255,92,168,0.16), transparent 60%), radial-gradient(900px 700px at 50% 120%, rgba(255,138,76,0.16), transparent 60%), var(--mocktsy-bg)",
      }}
    >
      <div className="max-w-6xl mx-auto">

        {/* Hero header */}
        <div
          className="glass-card rounded-3xl p-8 mb-8"
          style={{
            textAlign: "center",
            boxShadow: "0 30px 80px rgba(0,0,0,0.12), 0 10px 28px rgba(0,0,0,0.07)",
            background: "var(--mocktsy-card)",
          }}
        >
          <div className="flex items-center justify-center">
            <img
              src="/mocktsy-logo.svg"
              alt="Mocktsy logo"
              className="h-10 w-auto"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
                const fallback = document.getElementById("mocktsy-fallback");
                if (fallback) fallback.style.display = "inline-block";
              }}
            />
            <h1 id="mocktsy-fallback" className="text-3xl sm:text-4xl font-extrabold mocktsy-text-gradient" style={{ display: "none" }}>
              Mocktsy
            </h1>
          </div>
          <p className="mt-3 text-sm sm:text-base" style={{ color: "var(--mocktsy-muted)" }}>
            <span className="font-medium">
              Unique, custom mockups that attract buyers — automatically, in minutes.
            </span>
          </p>
        </div>

        {/* Mini progress */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
          {["Upload", "Customize Brand", "Choose Layouts", "Customize Text", "Edit or Download"].map((label, i) => (
            <div key={label} className="pill">{`Step ${i + 1}: ${label}`}</div>
          ))}
        </div>

        {/* STEP 1: Upload Your Clipart */}
        <Step number={1} title="Upload Your Clipart" defaultOpen>
          <div className="flex items-center gap-3">
            <button onClick={handleUpload} className="btn btn--primary">Upload</button>
            <button onClick={loadImages} className="btn btn--accent">Reload</button>
            <span className="text-gray-700">{status}</span>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {images.map((it) => (
              <div key={it.id} className="card-hover rounded-xl p-2" style={{ border: "1px solid var(--mocktsy-border)", background: "#fff" }}>
                <img src={it.url} alt={it.id} className="img-cover" />
                <div className="text-xs mt-2 truncate-1" style={{ color: "var(--mocktsy-muted)" }}>{it.id}</div>
              </div>
            ))}
            {images.length === 0 && (
              <div className="text-sm" style={{ color: "var(--mocktsy-muted)" }}>
                No images yet. Click <b>Upload</b> to add some.
              </div>
            )}
          </div>
        </Step>

        {/* STEP 2: Customize Your Brand */}
        <Step number={2} title="Customize Your Brand" defaultOpen>
          {/* Use Saved Preset */}
          <div className="flex flex-col sm:flex-row sm:items-end gap-3 mb-4">
            <div className="flex-1">
              <label className="block text-sm font-semibold mb-1">Use Saved Preset</label>
              <div className="flex items-center gap-2">
                <select
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl"
                  value={selectedPresetId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setSelectedPresetId(id);
                    if (id) applyPresetById(id);
                    else setUsePreset(false);
                  }}
                >
                  <option value="">— None —</option>
                  {presets.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                <button
                  className="btn btn--primary"
                  onClick={() => {
                    if (selectedPresetId) applyPresetById(selectedPresetId);
                    else if (presets[0]) applyPresetById(presets[0].id);
                    else alert("No presets yet. Save one first.");
                  }}
                >
                  Apply
                </button>
              </div>
              {!!presets.length && (
                <div className="mt-2 text-xs" style={{ color: "var(--mocktsy-muted)" }}>
                  Applying a preset locks the fields below. <button onClick={onUnlockFields} className="underline">Unlock to edit</button>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <button className="btn btn--accent" onClick={onSavePreset}>Save Current as Preset</button>
              <button className="btn btn--outline" onClick={onDeletePreset} disabled={!selectedPresetId} style={{ opacity: selectedPresetId ? 1 : 0.5 }}>
                Delete Preset
              </button>
            </div>
          </div>

          {/* Clipart Set Name (first) */}
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-1">Clipart Set Name</label>
            <input
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl"
              placeholder="e.g., Forest Animals Watercolor Clipart"
              value={clipartSetName}
              onChange={(e) => setClipartSetName(e.target.value)}
              disabled={disabled}
            />
          </div>

          {/* Number of Images */}
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-1">Number of Images</label>
            <input
              type="number"
              min={9}
              max={32}
              className="w-32 px-3 py-2 border-2 border-gray-200 rounded-xl"
              value={numImages}
              onChange={(e) => setNumImages(Math.max(9, Math.min(32, Number(e.target.value) || 9)))}
              disabled={disabled}
            />
            <div className="mt-1 text-xs" style={{ color: "var(--mocktsy-muted)" }}>
              Select how many images are in your clipart pack. (Min 9, Max 32)
            </div>
          </div>

          {/* Logo: URL or Upload */}
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-1">Logo</label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-xl"
                placeholder="Logo image URL (https, publicly accessible)"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                disabled={disabled}
              />
              <div className="flex items-center justify-center text-sm" style={{ color: "var(--mocktsy-muted)" }}>or</div>
              <button className="btn btn--outline" onClick={handleLogoUpload} disabled={disabled}>Upload Logo</button>
            </div>
            <div className="mt-1 text-xs" style={{ color: "var(--mocktsy-muted)" }}>
              If using a URL, ensure it’s a direct, publicly accessible image link (https).
            </div>
            {(logoObjectUrl || logoUrl) && (
              <div className="mt-3 flex items-center gap-3">
                <img
                  src={logoObjectUrl || logoUrl}
                  alt="Logo preview"
                  className="h-12 w-12 object-contain rounded-md"
                  onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = "none")}
                />
                <span className="text-xs" style={{ color: "var(--mocktsy-muted)" }}>
                  {logoObjectUrl ? "Preview from uploaded file (session-only)" : "Preview from URL"}
                </span>
              </div>
            )}
          </div>

          {/* Colors */}
          <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold mb-1">Primary Color</label>
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                disabled={disabled}
                className="h-10 w-16 p-1 border-2 border-gray-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Secondary Color</label>
              <input
                type="color"
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                disabled={disabled}
                className="h-10 w-16 p-1 border-2 border-gray-200 rounded-xl"
              />
            </div>
          </div>

          {/* Fonts */}
          <div className="mb-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold mb-1">Heading Font</label>
              <select
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl"
                value={fontHeading}
                onChange={(e) => setFontHeading(e.target.value)}
                disabled={disabled}
              >
                {FONT_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Body Font</label>
              <select
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl"
                value={fontBody}
                onChange={(e) => setFontBody(e.target.value)}
                disabled={disabled}
              >
                {FONT_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
          </div>
        </Step>

        {/* STEP 3: Choose Layouts (previews/explainer in Pass C) */}
<Step number={3} title="Choose Layouts" defaultOpen>
  <ChooseLayouts
    images={images}
    fieldValues={fieldValues}
    onSelectionChange={(ids) => setSelectedIds(ids)}
  />
  <div className="mt-4">
    <button onClick={handleBuildAndSend} className="btn btn--primary w-full sm:w-auto">
      Generate Mockups
    </button>
  </div>
</Step>

{/* STEP 4: Customize Text */}
<Step number={4} title="Customize Text" defaultOpen>
  <CustomizeText
    selectedIds={selectedIds}
    overlays={overlays}
    setOverlays={setOverlays}
    fieldValues={fieldValues}
  />
</Step>

        {/* STEP 5: Edit or Download */}
        <Step number={5} title="Edit or Download" defaultOpen>
          {/* Preset Name & Box Title move here per your spec, wire in Pass D */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button onClick={handleBuildAndSend} className="btn btn--primary w-full sm:w-auto">
              Edit in Canva
            </button>
            <span style={{ color: "var(--mocktsy-muted)" }}>or</span>
            <button className="btn btn--outline w-full sm:w-auto" onClick={() => alert("Download All Mockups coming in Pass D")}>
              Download All Mockups
            </button>
          </div>
        </Step>

{/* Dev Tools (kept) */}
<div
  className="glass-card rounded-2xl p-6 mb-10 shadow-md"
  style={{
    boxShadow: "0 24px 60px rgba(0,0,0,0.10), 0 8px 24px rgba(0,0,0,0.06)",
    background: "var(--mocktsy-card)",
  }}
>
  <div className="text-gray-900 font-semibold mb-2">Dev Tools</div>
  <div className="text-sm" style={{ color: "var(--mocktsy-muted)" }}>
    Quick test the plan builder or page factory.
  </div>
  <div className="mt-3">
    <TestPlanButton slideIds={slideIds} />
  </div>
</div>

</div>
</div>
);
}
