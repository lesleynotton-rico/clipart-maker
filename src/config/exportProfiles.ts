// src/config/exportProfiles.ts
export type ExportProfile = {
  key: string;
  label: string;      // shown in UI helper if needed
  width: number;
  height: number;
  enabled: boolean;   // UI uses this to grey out & lock
};

export const EXPORT_PROFILES: ExportProfile[] = [
  { key: "etsy_square", label: "Etsy – Square (2000 × 2000)", width: 2000, height: 2000, enabled: true },
  { key: "cf_square", label: "Creative Fabrica – Square (2800 × 2800)", width: 2800, height: 2800, enabled: false },
  { key: "cm_square", label: "Creative Market – Square (3000 × 3000)", width: 3000, height: 3000, enabled: false },
  { key: "tpt_square", label: "Teachers Pay Teachers – Square (2400 × 2400)", width: 2400, height: 2400, enabled: false },
  { key: "shopify_rect", label: "Shopify – Rectangle (2500 × 2000)", width: 2500, height: 2000, enabled: false },
];

export const BASE_COORD = 2000; // our mapping space (x/y/w/h measured in this)
