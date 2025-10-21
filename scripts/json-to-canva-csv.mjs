import fs from "fs";

const inPath = process.argv[2] || "mockup-build-plan.json";
const outPath = process.argv[3] || "canva-bulk.csv";

// Load JSON
const plan = JSON.parse(fs.readFileSync(inPath, "utf8"));

// Normalize a safe CSV cell
const cell = (v) => {
  if (v === null || v === undefined) return "";
  const s = String(v);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
};

// Collect all overlay keys that appear anywhere so columns are stable
const overlayKeys = new Set();
for (const p of plan.pages || []) {
  if (p.overlays) Object.keys(p.overlays).forEach((k) => overlayKeys.add(k));
}
const overlayCols = Array.from(overlayKeys); // e.g., h1,h2,body,callout

// Fixed columns we’ll export
const baseCols = [
  "page_id",
  "page_title",
  "page_kind",
  "bg_mode",
  "bg_color",
  "layout_gridCols",
  "layout_gridDetail"
];

// Header row
const header = [...baseCols, ...overlayCols].join(",") + "\n";

// Rows
const rows = (plan.pages || []).map((p) => {
  const base = [
    p.id,
    p.title || "",
    p.kind || "",
    p.background?.mode || "",
    p.background?.color || "",
    p.layout?.gridCols ?? "",
    p.layout?.gridDetail ?? ""
  ].map(cell);

  const overlays = overlayCols.map((k) => cell(p.overlays?.[k] ?? ""));
  return [...base, ...overlays].join(",");
});

// Write CSV
fs.writeFileSync(outPath, header + rows.join("\n"));
console.log(`✅ Wrote ${outPath}`);
console.log(`Columns: ${[...baseCols, ...overlayCols].join(", ")}`);
