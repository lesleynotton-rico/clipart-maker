// src/components/MockupCard.tsx
import React, { useMemo, useState } from "react";

type FrameRect = { x: number; y: number; w: number; h: number }; // fractions 0..1 of 2000x2000 (future overlay use)

type MockupDef = {
  id: string;               // e.g., "Main Listing Image (A)" or internal id
  name?: string;            // optional display name
  frames?: FrameRect[];     // optional — used later for overlay positioning
};

type Props = {
  def: MockupDef;
  fieldValues?: any;
  tokens?: string[];
  overlays?: any;
  setOverlays?: (val: any) => void;
  gridCols?: number;
  selected: boolean;
  onToggle: () => void;
  onMagnify: () => void;
  customImage?: string | null;
  onUploadCustomImage?: (url: string) => void;
  previewImages?: string[];  // uploaded user images for frames (future use)
  bgImageUrl?: string;       // **clean preview PNG URL** (from ChooseLayouts)
};

/**
 * MockupCard
 * - Shows the clean Canva preview image (bgImageUrl) in a dashed "canvas" box
 * - Handles 404s with a clear fallback message
 * - Click anywhere on the card to select/deselect (onToggle)
 * - Has a top-right "magnify" button (onMagnify)
 * - Optional "Upload Your Own" button for special mockups (8A/9A/10A) via onUploadCustomImage
 */
export default function MockupCard({
  def,
  selected,
  onToggle,
  onMagnify,
  customImage,
  onUploadCustomImage,
  bgImageUrl,
}: Props) {
  const [errored, setErrored] = useState(false);

  // Decide what to show in the preview:
  // 1) If this layout supports a custom upload and the user provided one, show that.
  // 2) Else show the clean Canva preview PNG from bgImageUrl.
  const previewSrc = useMemo(() => {
    return (customImage && customImage.length > 0) ? customImage : (bgImageUrl ?? "");
  }, [customImage, bgImageUrl]);

  const title = def.name || def.id;

  // Simple detection: show "Upload Your Own" button if the parent passed a handler
  const supportsCustomUpload = typeof onUploadCustomImage === "function";

  return (
    <div
      className={`layout-thumbnail bg-white rounded-xl p-4 border-2 transition-all shadow-sm hover:shadow-lg cursor-pointer ${
        selected ? "selected border-blue-500" : "border-gray-200 hover:border-blue-400"
      }`}
      onClick={onToggle}
      role="button"
      aria-pressed={selected}
      title={title}
    >
      {/* Header row: title + actions */}
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-semibold text-gray-700 pr-2 truncate">{title}</div>

        <div className="flex items-center gap-2">
          {/* Magnify */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onMagnify();
            }}
            className="px-3 py-1.5 rounded-lg text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 transition-all"
            aria-label={`Magnify ${title}`}
            title="Magnify"
          >
            Preview
          </button>

          {/* Custom upload (for 8A/9A/10A etc.) */}
          {supportsCustomUpload && (
            <label
              onClick={(e) => e.stopPropagation()}
              className="px-3 py-1.5 rounded-lg text-xs bg-purple-100 text-purple-700 hover:bg-purple-200 transition-all cursor-pointer"
              title="Upload your own image"
            >
              Upload
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (ev) => {
                  const file = ev.target.files?.[0];
                  if (!file) return;
                  // Create a local object URL so it previews immediately
                  const url = URL.createObjectURL(file);
                  onUploadCustomImage!(url);
                }}
              />
            </label>
          )}
        </div>
      </div>

      {/* Canvas / Preview area */}
      <div className="glass-card rounded-2xl p-4 mb-3">
        <div className="border-2 border-dashed border-gray-300 rounded-2xl p-4 text-center min-h-[240px] bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
          {!previewSrc ? (
            <div className="text-sm text-gray-500">No preview available for “{title}”.</div>
          ) : errored ? (
            <div className="text-sm text-red-500">
              Couldn’t load preview.
              <div className="text-xs text-gray-500 mt-1 break-all">{previewSrc}</div>
            </div>
          ) : (
            <img
              src={previewSrc}
              alt={title}
              className="max-w-full max-h-[320px] rounded-xl"
              loading="lazy"
              decoding="async"
              onError={() => setErrored(true)}
            />
          )}
        </div>
      </div>

      {/* Selection hint */}
      <div className="flex items-center justify-between">
        <div className="text-xs" style={{ color: "var(--mocktsy-muted)" }}>
          {selected ? "Selected" : "Click to select"}
        </div>
      </div>
    </div>
  );
}
