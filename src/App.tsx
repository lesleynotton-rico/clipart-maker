// src/App.tsx
import React, { useCallback, useMemo, useState } from "react";

// Existing project utilities & components
import TestPlanButton from "./components/TestPlanButton";
import { buildPlan } from "./utils/buildPlan";
import { sendBuildToCanva } from "./utils/canvaSender";
import { MOCKUP_MAPPINGS } from "./config/mockupMapping";
import ChooseLayouts from "./layouts/ChooseLayouts";
import CustomizeText from "./components/CustomizeText";

// Export profiles + download/export helpers
import { EXPORT_PROFILES } from "./config/exportProfiles";
import { downloadAllMockups } from "./utils/downloadAllMockups";
import { slugify } from "./utils/slugify";

type ImageItem = { id: string; url: string };

/** ===== Utilities ===== */
const uid = (() => { let n = 0; return () => `img_${Date.now()}_${n++}`; })();

/** ===== Status Toast (UI Foundations → Toast / Status) ===== */
type ToastKind = "success" | "error" | "info";
function StatusToast({ kind, message, visible }: { kind: ToastKind; message: string; visible: boolean }) {
  const grad =
    kind === "success"
      ? "from-green-500 to-emerald-500"
      : kind === "error"
      ? "from-rose-500 to-pink-500"
      : "from-blue-500 to-purple-500";
  return (
    <div
      className={`fixed bottom-6 right-6 z-50 transform transition-all duration-300 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3 pointer-events-none"
      }`}
    >
      <div className={`bg-gradient-to-r ${grad} text-white px-6 py-3 rounded-2xl shadow-2xl`}>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
          <span className="font-medium">{message}</span>
        </div>
      </div>
    </div>
  );
}

function Step({
  number, title, children, defaultOpen = true,
}: { number: number; title: string; children: React.ReactNode; defaultOpen?: boolean; }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div
      className="glass-card rounded-2xl p-8 mb-8 shadow-md"
      style={{
        boxShadow: "0 40px 120px rgba(0,0,0,0.08), 0 16px 48px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.04)",
        background: "rgba(255,255,255,0.70)",
        backdropFilter: "blur(18px) saturate(160%)",
        WebkitBackdropFilter: "blur(18px) saturate(160%)",
        border: "1px solid rgba(255,255,255,0.45)",
        backgroundClip: "padding-box",
      }}
    >
      <button onClick={() => setOpen((v) => !v)} className="w-full flex items-center justify-between text-left">
        <div className="flex items-center gap-3">
          <span className="pill" style={{ background: "rgba(255,255,255,0.6)" }}>Step {number}</span>
          <h2 className="text-2xl font-bold">{title}</h2>
        </div>
        <span className="text-sm" style={{ color: "var(--mocktsy-muted)" }}>{open ? "Collapse" : "Expand"}</span>
      </button>
      <div className="h-px bg-gradient-to-r from-blue-500 to-purple-500 opacity-20 mt-3" />
      {open && <div className="mt-4 text-gray-700">{children}</div>}
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
  platformKey?: string;    // ← also save the chosen Platform
  overlays?: Record<number, Record<string, string>>; // ← Step 3 text inputs
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

  // NEW: Platform + selected mockups (for downloads)
  const [platformKey, setPlatformKey] = useState("etsy_square");
  const [selectedDefs, setSelectedDefs] = useState<Array<{ id: number | string; def: any }>>([]);
// Busy state just for the generate/download actions
const [busy, setBusy] = useState<"none" | "canva" | "download">("none");

// Guard to enable/disable the two main action buttons
// TODO: DEBUG ONLY — force-enable buttons so we can test flows even if state isn’t wired.
// After confirming both flows work, revert to the real guard below and fix the state wiring.
const canGenerate = true;

/*
 // Real guard (restore this after debugging)
 // Enable when EITHER new (selectedDefs) OR legacy (selectedIds as used previously) selection has items AND images exist
 const canGenerate =
   (((selectedDefs as any)?.length ?? 0) > 0 || ((selectedIds as any)?.length ?? 0) > 0) &&
   ((images as any)?.length ?? 0) > 0;
*/

// Helper: decode base64 string into Uint8Array
function base64ToUint8Array(base64: string): Uint8Array {
  // strip any data URL prefix
  const cleaned = base64.replace(/^data:.*;base64,/, "");
  const binary = atob(cleaned);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// Tiny helper to trigger a client download from a Blob
function downloadBlob(blob: Blob, filename: string) {
  const a = document.createElement("a");
  const url = URL.createObjectURL(blob);
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

  // Toast state
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastKind, setToastKind] = useState<ToastKind>("info");
  const showToast = useCallback((kind: ToastKind, message: string, ms = 2500) => {
    setToastKind(kind);
    setToastMessage(message);
    setToastVisible(true);
    window.clearTimeout((showToast as any)._t);
    (showToast as any)._t = window.setTimeout(() => setToastVisible(false), ms);
  }, []);

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
        const msg = `Loaded ${next.length} image${next.length === 1 ? "" : "s"}`;
        setStatus(msg);
        showToast("success", msg);
      };
      input.click();
    } catch (err) {
      console.error(err);
      setStatus("Upload failed");
      showToast("error", "Upload failed");
    }
  }, [showToast]);

  const loadImages = useCallback(async () => {
    const msg = `Images in memory: ${images.length}`;
    setStatus(msg);
    showToast("info", msg);
  }, [images.length, showToast]);

  // --------------------------------
  // Step 2: Brand & Presets
  // --------------------------------
  const [brandName, setBrandName] = useState("");
  const [clipartSetName, setClipartSetName] = useState("");
  const [numImages, setNumImages] = useState<number>(20); // default
  const [primaryColor, setPrimaryColor] = useState("#222222");
  const [secondaryColor, setSecondaryColor] = useState("#ff5ca8");
  const [fontHeading, setFontHeading] = useState(FONT_OPTIONS[0]);
  const [fontBody, setFontBody] = useState(FONT_OPTIONS[1]);
  const [logoUrl, setLogoUrl] = useState("");
  const [logoObjectUrl, setLogoObjectUrl] = useState<string | undefined>(undefined); // preview-only (not persisted)

  // Step 4: per-layout token → value mappings (by layout id)
  const [overlays, setOverlays] = useState<Record<number, Record<string, string>>>({});

  // Step 3 selection handshake (legacy ids, still used for “Edit in Canva” flow)
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
    setOverlays(p.overlays || {});          // restore Step 3 text inputs
    setPlatformKey(p.platformKey || "etsy_square"); // restore Platform

    showToast("success", `Preset "${p.name}" applied`);
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
    platformKey,   // ← include Platform
    overlays,      // ← include Step 3 text inputs
    createdAt: Date.now(),
  };

  const next = [newPreset, ...presets].slice(0, MAX_PRESETS);
  setPresets(next);
  savePresets(next);
  setSelectedPresetId(newPreset.id);
  setUsePreset(true);
  showToast("success", `Preset "${name}" saved`);
};

  const onDeletePreset = () => {
    if (!selectedPresetId) return;
    const p = presets.find((x) => x.id === selectedPresetId);
    const next = presets.filter((pr) => pr.id !== selectedPresetId);
    setPresets(next);
    savePresets(next);
    setSelectedPresetId("");
    setUsePreset(false);
    showToast("info", `Preset${p ? ` "${p.name}"` : ""} deleted`);
  };

  const onUnlockFields = () => { setUsePreset(false); showToast("info", "Fields unlocked"); };

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
      showToast("success", "Logo uploaded (preview)");
      // We do NOT overwrite logoUrl (string) here.
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
    const hasImages = !!images && images.length > 0;
    const hasSelection =
      ((selectedDefs as any)?.length ?? 0) > 0 || ((selectedIds as any)?.length ?? 0) > 0;

    if (!hasImages || !hasSelection) {
      const msg = !hasImages
        ? "Please upload some images first"
        : "Please select at least one mock-up first";
      console.warn("[UI] Guard: ", msg);
      setStatus(msg);
      showToast("error", msg);
      return;
    }

    const plan = await buildPlan(slideIds, smartPools, fieldValues);

    // Await the sender; if it returns a URL, open it as a fallback.
    const maybeUrl: any = await sendBuildToCanva(plan);
    if (typeof maybeUrl === "string" && maybeUrl.startsWith("http")) {
      try {
        window.open(maybeUrl, "_blank", "noopener,noreferrer");
      } catch {}
    }

    console.log("[UI] Sent plan to Canva:", plan);
    setStatus("Plan sent to Canva");
    showToast("success", "Sent to Canva");
  } catch (err) {
    console.error("[UI] Failed to build/send plan:", err);
    setStatus("Failed to build/send plan (see console)");
    showToast("error", "Failed to send to Canva");
  }
}, [images, selectedIds, selectedDefs, slideIds, smartPools, fieldValues, showToast]);

  // --------------------------------
  // Helpers for Select All / Deselect All (Step 3)
  // --------------------------------
  const allNumericLayoutIds = useMemo<number[]>(() => {
    try {
      const keys = Object.keys(MOCKUP_MAPPINGS || {});
      return keys.map((k) => Number(k)).filter((n) => !Number.isNaN(n));
    } catch {
      return [];
    }
  }, []);

  // --------------------------------
  // UI
  // --------------------------------
  return (
    <div
      className="min-h-screen p-6"
      style={{
        background: "var(--mocktsy-bg)",
      }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Hero header */}
        <div
        id="hero-card"
          className="glass-card rounded-3xl p-8 mb-8"
          style={{
            textAlign: "center",
            boxShadow: "0 40px 120px rgba(0,0,0,0.22), 0 16px 48px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.04)",
            background: "rgba(255,255,255,0.70)",
            backdropFilter: "blur(18px) saturate(160%)",
            WebkitBackdropFilter: "blur(18px) saturate(160%)",
            border: "1px solid rgba(255,255,255,0.45)",
            backgroundClip: "padding-box",
          }}
        >
<div className="flex items-center justify-center">
  <img
    src="Mocksty_Digital_Product_Mockup_Maker_Etsy.png"
    alt="Your brand logo"
    className="h-40 w-auto"
    style={{ marginBottom: "0.5rem" }}
  />
</div>

        
          <p className="mt-3 text-lg" style={{ color: "var(--mocktsy-muted)", fontSize: "1.3rem" }}>
            <span className="font-medium">
 Transform your artwork into gorgeous, high-impact mock-ups - fast, easy, and beautifully yours!
</span>
          </p>
        </div>

        {/* STEP 1: Upload Your Clipart */}
        <Step number={1} title="Upload Your Clipart" defaultOpen>
          <div className="flex items-center gap-3">
            <button onClick={handleUpload} className="btn btn--primary">Upload</button>
            <button onClick={loadImages} className="btn btn--accent">Reload</button>
            <span className="text-gray-700">{status}</span>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((it) => (
              <div
                key={it.id}
                className="card-hover rounded-xl p-2"
                style={{ border: "1px solid var(--mocktsy-border)", background: "#fff" }}
              >
                <img src={it.url} alt={it.id} className="img-cover" />
                <div className="text-xs mt-2 truncate-1" style={{ color: "var(--mocktsy-muted)" }}>
                  {it.id}
                </div>
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
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
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
                  Applying a preset locks the fields below.{" "}
                  <button onClick={onUnlockFields} className="underline">
                    Unlock to edit
                  </button>
                </div>
              )}
            </div>
            <div className="flex gap-2">
  <button
    className="btn btn--outline"
    onClick={onDeletePreset}
    disabled={!selectedPresetId}
    style={{ opacity: selectedPresetId ? 1 : 0.5 }}
  >
    Delete Preset
  </button>
</div>

          </div>

          {/* Clipart Set Name + Number of Images (same row) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold mb-1">Clipart Set Name</label>
              <input
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl"
                placeholder="e.g., Forest Animals Watercolor Clipart"
                value={clipartSetName}
                onChange={(e) => setClipartSetName(e.target.value)}
                disabled={disabled}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Number of Images</label>
              <input
                type="number"
                min={9}
                max={32}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl"
                value={numImages}
                onChange={(e) => setNumImages(Math.max(9, Math.min(32, Number(e.target.value) || 9)))}
                disabled={disabled}
              />
              <div className="mt-1 text-xs" style={{ color: "var(--mocktsy-muted)" }}>
                Select how many images are in your clipart pack. (Min 9, Max 32)
              </div>
            </div>
          </div>

          {/* Logo */}
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
              <div className="flex items-center justify-center text-sm" style={{ color: "var(--mocktsy-muted)" }}>
                or
              </div>
              <button className="btn btn--outline" onClick={handleLogoUpload} disabled={disabled}>
                Upload Logo
              </button>
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

{/* Platform (moved here from Step 4) */}
<div className="mb-4">
  <label className="block text-sm font-semibold mb-1">Platform</label>
  <p className="text-xs text-gray-500 italic">
    Choose where you’ll use your mock-ups. We’ll size everything for you. Other platforms are coming soon.
  </p>
  <div className="mt-2">
    <select
      value={platformKey}
      onChange={(e) => setPlatformKey(e.target.value)}
      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white/50 transition-all input-focus focus:outline-none focus:border-blue-500"
    >
      {EXPORT_PROFILES.map((p) => (
        <option key={p.key} value={p.key} disabled={!p.enabled}>
          {p.label}{!p.enabled ? " · Coming soon" : ""}
        </option>
      ))}
    </select>
  </div>
</div>

          {/* Colors */}
          <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          <div className="mb-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Heading Font</label>
              <select
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl"
                value={fontHeading}
                onChange={(e) => setFontHeading(e.target.value)}
                disabled={disabled}
              >
                {FONT_OPTIONS.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
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
                {FONT_OPTIONS.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Step>

        {/* STEP 3: Customize Your Mockups (selection + per-layout text lives in ChooseLayouts) */}
        <Step number={3} title="Customize Your Mockups" defaultOpen>
          
          <ChooseLayouts
  key={images.length}  // ← forces a fresh render when images change
  images={images}
  fieldValues={fieldValues}
  onSelectionChange={(arr) => setSelectedDefs(arr)}
  overlays={overlays}
  setOverlays={setOverlays}
  />
...

  // The remainder of the file is unchanged except for:
  // - the Canva button's className fixed to "btn btn--primary w-full sm:w-auto"
  // - the download handler now includes the robust zip-handling branch (see below)
  // Note: For brevity the rest of the UI remains identical other than the replaced sections

  {/* STEP 3: Generate or Download */}
  <div className="glass-card p-4 sm:p-6 rounded-2xl flex flex-col gap-4">
    <div className="flex items-center gap-3 flex-wrap">
      {/* Generate Mockups & Edit in Canva */}
     <button
       type="button"
       className="btn btn--primary w-full sm:w-auto"
       onClick={async (ev) => {
         ev.preventDefault();

         // guard + spinner
         if (!canGenerate) {
           showToast("error", "Please select at least one mock-up and upload images first.");
           return;
         }
         if (busy !== "none") return;

         try {
           setBusy("canva");
           showToast("info", "Creating your Canva design…");

           // Ensure this actually runs the current plan → Canva bridge
           await handleBuildAndSend();

           showToast("success", "Sent to Canva!");
         } catch (e) {
           console.error(e);
           showToast("error", "Could not create the Canva design. Please try again.");
         } finally {
           setBusy("none");
         }
       }}
       disabled={!canGenerate || busy !== "none"}
       data-state={busy === "canva" ? "loading" : "idle"}
     >
       {busy === "canva" ? "Working…" : "Generate Mockups & Edit in Canva"}
     </button>

     <span style={{ color: "var(--mocktsy-muted)" }}>or</span>

     {/* Generate Mockups & Download All */}
     <button
       type="button"
       className="btn btn--outline w-full sm:w-auto"
       onClick={async (ev) => {
         ev.preventDefault();

         if (!canGenerate) {
           showToast("error", "Please select at least one mock-up and upload images first.");
           return;
         }
         if (busy !== "none") return;

         try {
           setBusy("download");
           showToast("info", "Working on your mock-ups…");

           const profile = EXPORT_PROFILES.find((p) => p.key === platformKey)!;

           // Build items per selected layout, honoring any custom image on upload-your-own variants
           const urls = images.map((im) => im.url);
           // Prefer new selection (selectedDefs); otherwise, build from legacy ids
 const defsArray =
   ((selectedDefs as any)?.length ?? 0) > 0
     ? (selectedDefs as any[])
     : ((selectedIds as any[]) || [])
         .map((id: any) => ({ def: (MOCKUP_MAPPINGS as any)?.[String(id)], tokens: {}, customImage: undefined }))
         .filter((x) => !!x.def);

 const items = defsArray.map((entry: any, idx: number) => {
   const def = entry.def;
   const frameCount = (def.frames || []).length;
   let chosen = frameCount > 0 ? urls.slice(0, frameCount) : [];
   if (entry.customImage) {
     if (chosen.length === 0) chosen = [entry.customImage];
     else chosen[0] = entry.customImage;
   }
   return {
     layout: def,
     index: idx + 1, // optional metadata for naming
     images: chosen,
     tokens: entry.tokens || {},
   };
 });

  const result = await downloadAllMockups({
  items,
  fieldValues: {
    clipartSetName: clipartSetName,
    logoUrl: logoUrl || (logoObjectUrl ?? undefined),
    fontFamily: fontBody,
    headingFontFamily: fontHeading,
  },
  width: profile.width,
  height: profile.height,
  onProgress: (done: number, total: number) => {
    if (done === total) {
      showToast("success", "Your ZIP is ready!");
    }
  },
});

// Debug: show exactly what downloadAllMockups returned
console.log("downloadAllMockups result:", result);

           // Normalize return shapes to a Blob and download it
           if (result instanceof Blob) {
             const fname = `${slugify(clipartSetName || "clipart")}-mockups.zip`;
             downloadBlob(result, fname);
           } else if (result?.blob instanceof Blob) {
             const fname = result?.filename || `${slugify(clipartSetName || "clipart")}-mockups.zip`;
             downloadBlob(result.blob, fname);
           } else if (result?.type === "zip" && result?.data) {
  // Log for debugging so we can inspect the response shape in console
  console.log("ZIP response (raw):", result);

  // Normalize common shapes into a payload we can convert to bytes:
  // - base64 string (result.data is string)
  // - object with .data being array-of-bytes (Buffer-like)
  // - object with .data being base64 string
  // - object with .base64 property
  // - Array<number>
  // - Uint8Array or ArrayBuffer
  let payload: any = result.data;

  // If payload is an object, try to extract common nested forms
  if (payload && typeof payload === "object") {
    // Buffer-like { type: "Buffer", data: [...] }
    if (Array.isArray((payload as any).data)) {
      payload = new Uint8Array((payload as any).data);
    }
    // Some backends embed base64 under data (string)
    else if (typeof (payload as any).data === "string") {
      payload = (payload as any).data;
    }
    // Some backends put base64 under .base64
    else if (typeof (payload as any).base64 === "string") {
      payload = (payload as any).base64;
    }
    // Some backends use { data: { data: [...] } } weird nesting
    else if ((payload as any).data && Array.isArray((payload as any).data?.data)) {
      payload = new Uint8Array((payload as any).data.data);
    }
  }

  // Now create a Blob based on the normalized payload type
  let blob: Blob;
  try {
    if (typeof payload === "string") {
      // payload is base64
      const bytes = base64ToUint8Array(payload);
      blob = new Blob([bytes], { type: "application/zip" });
    } else if (payload instanceof ArrayBuffer) {
      blob = new Blob([payload], { type: "application/zip" });
    } else if (payload instanceof Uint8Array) {
      blob = new Blob([payload], { type: "application/zip" });
    } else if (Array.isArray(payload) && payload.every((n) => typeof n === "number")) {
      blob = new Blob([new Uint8Array(payload as number[])], { type: "application/zip" });
    } else if (payload && typeof payload === "object" && (payload as any).type === "Buffer" && Array.isArray((payload as any).data)) {
      blob = new Blob([new Uint8Array((payload as any).data)], { type: "application/zip" });
    } else {
      // Last resort: if it's something else (e.g. plain JSON), stringify it and log it - we'll see it in downloads if required
      console.warn("Unrecognized ZIP payload shape, falling back to wrapping it:", payload);
      blob = new Blob([JSON.stringify(payload)], { type: "application/zip" });
    }
  } catch (err) {
    console.error("Failed to construct ZIP blob from payload:", payload, err);
    showToast("error", "Failed to prepare ZIP. See console for details.");
    setBusy("none");
    return;
  }

  const fname = result?.filename || `${slugify(clipartSetName || "clipart")}-mockups.zip`;
  downloadBlob(blob, fname);
} else {
  console.warn("Exporter returned unexpected result:", result);
  showToast(
    "error",
    "Exporter returned JSON instead of a ZIP. Next step: fix utils/downloadAllMockups to return a Blob ZIP."
  );
}
           }
         } catch (e) {
           console.error(e);
           showToast("error", "Something went wrong while preparing your ZIP. Please try again.");
         } finally {
           setBusy("none");
         }
       }}
       disabled={!canGenerate || busy !== "none"}
       data-state={busy === "download" ? "loading" : "idle"}
     >
       {busy === "download" ? "Preparing ZIP…" : "Generate Mockups & Download All"}
     </button>
   </div>

   <p className="text-sm opacity-70">
     Files will be named like:{" "}
     <span className="font-mono">
       {slugify(clipartSetName || "clipart")}-mockup-1.png
     </span>
   </p>
 </div>

     {/* Global Toast */}
<StatusToast
  kind={toastKind}
  message={toastMessage}
  visible={toastVisible}
  onClose={() => setToastVisible(false)}
/>
</div>
);
}
