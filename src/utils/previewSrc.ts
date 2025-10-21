// src/utils/previewSrc.ts
// Vite serves /public at the BASE_URL root. We must URI-encode spaces.

export function previewSrcFor(filename: string): string {
  const base = (import.meta as any).env?.BASE_URL ?? "/";
  // Ensure single slash join
  const prefix = base.endsWith("/") ? base : base + "/";
  // Clean leading slashes to avoid double
  const clean = filename.replace(/^\/+/, "");
  return `${prefix}layout-previews/${encodeURIComponent(clean)}`;
}
