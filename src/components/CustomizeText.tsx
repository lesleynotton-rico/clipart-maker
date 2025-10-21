// src/components/CustomizeText.tsx
import React, { useMemo } from "react";

type Over = { h1?: string; h2?: string; body?: string; callout?: string };
type OverMap = Record<number, Over>;

type MockupKind = "main" | "collection" | "use" | "info";
interface MockupDef { id: number; title: string; kind: MockupKind; }

const CATALOG: MockupDef[] = [
  { id: 1, title: "Main Listing Image", kind: "main" },
  { id: 2, title: "Collection Overview A", kind: "collection" },
  { id: 3, title: "Collection Overview B", kind: "collection" },
  { id: 4, title: "Detail Beauty", kind: "use" },
  { id: 5, title: "Transparency Demo", kind: "use" },
  { id: 6, title: "Resolution / Sizing", kind: "use" },
  { id: 7, title: "Branding Use", kind: "use" },
  { id: 8, title: "POD Use", kind: "use" },
  { id: 9, title: "Crafts & Printables", kind: "use" },
  { id: 10, title: "Software Ease", kind: "use" },
  { id: 11, title: "Coordinated Elements", kind: "use" },
  { id: 12, title: "License Summary", kind: "info" },
  { id: 13, title: "How It Works", kind: "info" },
  { id: 14, title: "Pack Value", kind: "info" },
  { id: 15, title: "Brand Trust", kind: "info" },
  { id: 16, title: "Cross-Sell / More", kind: "info" },
  { id: 17, title: "Freebie CTA", kind: "info" },
  { id: 18, title: "Testimonial", kind: "info" },
  { id: 19, title: "Inspiration / Board", kind: "info" },
  { id: 20, title: "Final CTA", kind: "info" },
];

const FIELDS_BY_KIND: Record<MockupKind, (keyof Over)[]> = {
  main: ["callout", "h1", "h2", "body"],
  collection: ["h1", "body"], // lean
  use: ["h1", "body"],
  info: ["h1", "body", "callout"],
};

function Panel({
  def, value, onChange, fieldValues,
}: {
  def: MockupDef;
  value: Over;
  onChange: (next: Over) => void;
  fieldValues?: Record<string, any>;
}) {
  const primary = fieldValues?.primaryColor || "#222222";
  const secondary = fieldValues?.secondaryColor || "#ff5ca8";
  const fontHeading = fieldValues?.fontHeading || "Inter";
  const fontBody = fieldValues?.fontBody || "Poppins";

  const fields = FIELDS_BY_KIND[def.kind];

  return (
    <div className="glass-card rounded-2xl p-4 md:p-5 card-hover"
         style={{ background: "var(--mocktsy-card)", border: "1px solid var(--mocktsy-border)" }}>
      {/* Preview header */}
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-semibold">{def.id}. {def.title}</div>
        <div className="pill">{def.kind === "main" ? "Main Listing Image" :
          def.kind === "collection" ? "Collection Overview" :
          def.kind === "use" ? "Use Case" : "Info"}</div>
      </div>

      {/* Minimal “preview” text stack (uses brand fonts/colors) */}
      <div className="rounded-xl p-4 mb-3" style={{ background: "#fff", border: "1px solid var(--mocktsy-border)" }}>
        {value.callout ? (
          <div className="mb-2 inline-block rounded-full px-2 py-1 text-xs"
               style={{ background: "rgba(255,255,255,0.85)", border: "1px solid var(--mocktsy-border)" }}>
            {value.callout}
          </div>
        ) : null}
        {value.h1 ? (
          <div className="text-lg md:text-xl font-extrabold"
               style={{ color: primary, fontFamily: fontHeading }}>{value.h1}</div>
        ) : null}
        {value.h2 ? (
          <div className="text-sm md:text-base mt-1"
               style={{ color: secondary, fontFamily: fontHeading }}>{value.h2}</div>
        ) : null}
        {value.body ? (
          <div className="text-xs md:text-sm mt-2 max-w-[60ch]"
               style={{ color: "#4b5563", fontFamily: fontBody }}>{value.body}</div>
        ) : null}
        {!value.h1 && !value.h2 && !value.body && !value.callout && (
          <div className="text-xs" style={{ color: "var(--mocktsy-muted)" }}>
            No text added yet. Use the fields below to customize copy for this layout.
          </div>
        )}
      </div>

      {/* Inputs (only relevant ones) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {fields.includes("callout") && (
          <div>
            <label className="block text-sm font-semibold mb-1">Callout</label>
            <input
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl"
              placeholder="e.g., 20 PNGs • 300 DPI • Transparent"
              value={value.callout || ""}
              onChange={(e) => onChange({ ...value, callout: e.target.value })}
            />
          </div>
        )}
        {fields.includes("h1") && (
          <div>
            <label className="block text-sm font-semibold mb-1">Heading (H1)</label>
            <input
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl"
              placeholder="e.g., Forest Animals Watercolor"
              value={value.h1 || ""}
              onChange={(e) => onChange({ ...value, h1: e.target.value })}
            />
          </div>
        )}
        {fields.includes("h2") && (
          <div>
            <label className="block text-sm font-semibold mb-1">Subheading (H2)</label>
            <input
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl"
              placeholder="e.g., Clipart Set • 20 Elements"
              value={value.h2 || ""}
              onChange={(e) => onChange({ ...value, h2: e.target.value })}
            />
          </div>
        )}
        {fields.includes("body") && (
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold mb-1">Body</label>
            <textarea
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl"
              rows={3}
              placeholder="Short descriptive line to help buyers understand what they get."
              value={value.body || ""}
              onChange={(e) => onChange({ ...value, body: e.target.value })}
            />
          </div>
        )}
      </div>

      {/* Helper */}
      <div className="mt-2 text-xs" style={{ color: "var(--mocktsy-muted)" }}>
        Tip: You can use variables like {"{{clipartSetName}}"} or {"{{numImages}}"} in any field.
      </div>
    </div>
  );
}

export default function CustomizeText({
  selectedIds,
  overlays,
  setOverlays,
  fieldValues,
}: {
  selectedIds: number[];
  overlays: OverMap;
  setOverlays: (updater: (prev: OverMap) => OverMap) => void | ((next: OverMap) => void);
  fieldValues?: Record<string, any>;
}) {
  const selectedDefs = useMemo(
    () => CATALOG.filter((c) => selectedIds.includes(c.id)),
    [selectedIds]
  );

  return (
    <div className="space-y-4">
      {selectedDefs.length === 0 ? (
        <div className="text-sm" style={{ color: "var(--mocktsy-muted)" }}>
          No layouts selected yet. Pick your layouts in <b>Step 3</b>, then customize text here.
        </div>
      ) : (
        selectedDefs.map((def) => {
          const current = overlays[def.id] || {};
          return (
            <Panel
              key={def.id}
              def={def}
              value={current}
              fieldValues={fieldValues}
              onChange={(next) =>
                setOverlays((prev) => ({ ...prev, [def.id]: next }))
              }
            />
          );
        })
      )}
    </div>
  );
}
