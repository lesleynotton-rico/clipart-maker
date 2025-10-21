// src/config/textPositionsByLayout.ts
// AUTO-GENERATED from Canva measurements (normalized by 2000×2000).
// All text renders black via COLOR_ROLES_BLACK.

export type TextRect = {
  token: string;
  x: number; y: number; w: number; h: number;
  align?: "left" | "center" | "right";
  lineHeight?: number;
  maxLines?: number;
  fontRole?: "display" | "heading" | "body";
  colorRole?: "primary" | "secondary" | "neutral" | "accent";
};

export type LayoutKey = string;

export const COLOR_ROLES_BLACK: Record<NonNullable<TextRect["colorRole"]>, string> = {
  primary: "#000000",
  secondary: "#000000",
  neutral: "#000000",
  accent: "#000000",
};

// ---------- Per-token typography overrides ----------
// Defaults: fontWeight 700 (bold), fontStyle "normal".
export const TEXT_STYLE_BY_TOKEN: Record<
  string,
  { fontWeight?: number | string; fontStyle?: "normal" | "italic" }
> = {
  // not bold
  discount_badge:    { fontWeight: 400, fontStyle: "normal" },
  license_do_list:   { fontWeight: 400, fontStyle: "normal" },
  license_dont_list: { fontWeight: 400, fontStyle: "normal" },

  // italic (not bold)
  Review_1: { fontWeight: 400, fontStyle: "italic" },
  Review_2: { fontWeight: 400, fontStyle: "italic" },
  Review_3: { fontWeight: 400, fontStyle: "italic" },

  // italic + bold
  FREE_GIFT_SUBHEADING: { fontWeight: 700, fontStyle: "italic" },
  TAGLINE:               { fontWeight: 700, fontStyle: "italic" },
};

export const TEXT_POSITIONS: Record<LayoutKey, TextRect[]> = {
  "Hero Mockup_ Option 1.png": [
    { token: "clipart_title", x: 0.0876, y: 0.4056, w: 0.825, h: 0.1356, align: "center", lineHeight: 170, colorRole: "neutral" },
    { token: "clipart_number", x: 0.426, y: 0.1671, w: 0.148, h: 0.1506, align: "center", lineHeight: 189, colorRole: "neutral" },
    { token: "CLIPART_DETAILS", x: 0.1, y: 0.9308, w: 0.7984, h: 0.034, align: "center", lineHeight: 43, colorRole: "neutral" }
  ],
  "Hero Mockup_ Option 2.png": [
    { token: "clipart_title", x: 0.1062, y: 0.0905, w: 0.7878, h: 0.1067, align: "center", lineHeight: 160, colorRole: "neutral" },
    { token: "clipart_number", x: 0.4385, y: 0.2148, w: 0.1326, h: 0.1208, align: "center", lineHeight: 170, colorRole: "neutral" },
    { token: "CLIPART_DETAILS", x: 0.1293, y: 0.2121, w: 0.7414, h: 0.0693, align: "center", lineHeight: 80, colorRole: "neutral" }
  ],
  "Mockup 3a_ Collection Overview 1 - 3x3.png": [
    { token: "INCLUDED_HEADING", x: 0.0638, y: 0.0251, w: 0.8724, h: 0.0639, align: "center", lineHeight: 80, colorRole: "neutral" },
    { token: "INCLUDED_DETAILS", x: 0.1, y: 0.9308, w: 0.7984, h: 0.034, align: "center", lineHeight: 43, colorRole: "neutral" }
  ],
  "Mockup 3b_ Collection Overview 1 - 4x4.png": [
    { token: "INCLUDED_HEADING", x: 0.0675, y: 0.022, w: 0.865, h: 0.063, align: "center", lineHeight: 80, colorRole: "neutral" },
    { token: "INCLUDED_DETAILS", x: 0.1, y: 0.9308, w: 0.7984, h: 0.034, align: "center", lineHeight: 43, colorRole: "neutral" }
  ],
  "Mockup 4a_ Collection Overview 2 - 3x3.png": [
    { token: "INCLUDED_DETAILS", x: 0.1, y: 0.9308, w: 0.7984, h: 0.034, align: "center", lineHeight: 43, colorRole: "neutral" },
    { token: "INCLUDED_HEADING", x: 0.0638, y: 0.0251, w: 0.8724, h: 0.0639, align: "center", lineHeight: 80, colorRole: "neutral" }
  ],
  "Mockup 4b_ Collection Overview 2 - 4x4.png": [
    { token: "INCLUDED_HEADING", x: 0.0675, y: 0.022, w: 0.865, h: 0.063, align: "center", lineHeight: 80, colorRole: "neutral" },
    { token: "INCLUDED_DETAILS", x: 0.1, y: 0.9308, w: 0.7984, h: 0.034, align: "center", lineHeight: 43, colorRole: "neutral" }
  ],
  "Mockup 5_ Close Up Detail.png": [
    { token: "QUALITY_HEADING_1", x: 0.08, y: 0.08, w: 0.84, h: 0.08, align: "center", lineHeight: 90, colorRole: "neutral" },
    { token: "QUALITY_DETAILS_1", x: 0.1, y: 0.89, w: 0.8, h: 0.06, align: "center", lineHeight: 80, colorRole: "neutral" }
  ],
  "Mockup 6_ Transparency Demo.png": [
    { token: "TRANSPARENT_HEADING", x: 0.08, y: 0.08, w: 0.84, h: 0.08, align: "center", lineHeight: 90, colorRole: "neutral" },
    { token: "transparent_details", x: 0.1, y: 0.89, w: 0.8, h: 0.06, align: "center", lineHeight: 80, colorRole: "neutral" }
  ],
  "Mockup 7_ Transparency Demo.png": [
    { token: "QUALITY_HEADING_2", x: 0.08, y: 0.08, w: 0.84, h: 0.08, align: "center", lineHeight: 90, colorRole: "neutral" },
    { token: "QUALITY_DETAILS", x: 0.1, y: 0.89, w: 0.8, h: 0.06, align: "center", lineHeight: 80, colorRole: "neutral" }
  ],
  "Mockup 8a_ Branding & Logo Use Case - Upload Your Own.png": [
    { token: "MOCKUP_8_A_HEADING", x: 0.08, y: 0.08, w: 0.84, h: 0.08, align: "center", lineHeight: 90, colorRole: "neutral" },
    { token: "MOCKUP_8_A_DETAILS", x: 0.1, y: 0.89, w: 0.8, h: 0.06, align: "center", lineHeight: 80, colorRole: "neutral" }
  ],
  "Mockup 8b_ Branding & Logo Use Case - Pre-Made.png": [
    { token: "MOCKUP_8_B_HEADING", x: 0.08, y: 0.08, w: 0.84, h: 0.08, align: "center", lineHeight: 90, colorRole: "neutral" },
    { token: "MOCKUP_8_B_DETAILS", x: 0.1, y: 0.89, w: 0.8, h: 0.06, align: "center", lineHeight: 80, colorRole: "neutral" }
  ],
  "Mockup 9a_ POD Use Case - Upload Your Own.png": [
    { token: "MOCKUP_9_A_HEADING", x: 0.08, y: 0.08, w: 0.84, h: 0.08, align: "center", lineHeight: 90, colorRole: "neutral" },
    { token: "MOCKUP_9_A_DETAILS", x: 0.1, y: 0.89, w: 0.8, h: 0.06, align: "center", lineHeight: 80, colorRole: "neutral" }
  ],
  "Mockup 9b_ POD Use Case - Pre-Made.png": [
    { token: "MOCKUP_9_B_HEADING", x: 0.08, y: 0.08, w: 0.84, h: 0.08, align: "center", lineHeight: 90, colorRole: "neutral" },
    { token: "MOCKUP_9_B_DETAILS", x: 0.1, y: 0.89, w: 0.8, h: 0.06, align: "center", lineHeight: 80, colorRole: "neutral" }
  ],
  "Mockup 10a_ Crafting Use Case - Upload Your Own.png": [
    { token: "MOCKUP_10_a_HEADING", x: 0.08, y: 0.08, w: 0.84, h: 0.08, align: "center", lineHeight: 90, colorRole: "neutral" },
    { token: "MOCKUP_10_a_DETAILS", x: 0.1, y: 0.89, w: 0.8, h: 0.06, align: "center", lineHeight: 80, colorRole: "neutral" }
  ],
  "Mockup 10b_ Crafting Use Case - Pre-Made.png": [
    { token: "MOCKUP_10_B_HEADING", x: 0.08, y: 0.08, w: 0.84, h: 0.08, align: "center", lineHeight: 90, colorRole: "neutral" },
    { token: "MOCKUP_10_B_DETAILS", x: 0.1, y: 0.89, w: 0.8, h: 0.06, align: "center", lineHeight: 80, colorRole: "neutral" }
  ],
  "Mockup 11_ Digital _ Canva Example.png": [
    { token: "PROGRAMS_HEADING", x: 0.08, y: 0.08, w: 0.84, h: 0.08, align: "center", lineHeight: 90, colorRole: "neutral" },
    { token: "PROGRAM_DETAILS", x: 0.1, y: 0.89, w: 0.8, h: 0.06, align: "center", lineHeight: 80, colorRole: "neutral" }
  ],
  "Mockup 12_ Color Cohesion.png": [
    { token: "COORDINATED_HEADING", x: 0.08, y: 0.08, w: 0.84, h: 0.08, align: "center", lineHeight: 90, colorRole: "neutral" },
    { token: "COORDINATED_DETAILS", x: 0.1, y: 0.89, w: 0.8, h: 0.06, align: "center", lineHeight: 80, colorRole: "neutral" }
  ],
  "Mockup 13_ License Guide.png": [
    { token: "LICENSE_HEADING", x: 0.08, y: 0.08, w: 0.84, h: 0.08, align: "center", lineHeight: 90, colorRole: "neutral" },
    { token: "LICENSE_DETAILS", x: 0.1, y: 0.15, w: 0.8, h: 0.1, align: "center", lineHeight: 80, colorRole: "neutral" },
    { token: "license_do", x: 0.08, y: 0.28, w: 0.84, h: 0.06, align: "left", lineHeight: 70, colorRole: "neutral" },
    { token: "license_do_list", x: 0.08, y: 0.35, w: 0.84, h: 0.2, align: "left", lineHeight: 60, colorRole: "neutral" },
    { token: "license_dont", x: 0.08, y: 0.58, w: 0.84, h: 0.06, align: "left", lineHeight: 70, colorRole: "neutral" },
    { token: "license_dont_list", x: 0.08, y: 0.65, w: 0.84, h: 0.2, align: "left", lineHeight: 60, colorRole: "neutral" }
  ],
  "Mockup 14_ How It Works.png": [
    { token: "HOW_HEADING", x: 0.08, y: 0.08, w: 0.84, h: 0.08, align: "center", lineHeight: 90, colorRole: "neutral" }
  ],
  "Mockup 15_ Consistent Characters.png": [
    { token: "CONSISTENCY_HEADING", x: 0.08, y: 0.08, w: 0.84, h: 0.08, align: "center", lineHeight: 90, colorRole: "neutral" },
    { token: "CONSISTENCY_DETAILS", x: 0.1, y: 0.89, w: 0.8, h: 0.06, align: "center", lineHeight: 80, colorRole: "neutral" }
  ],
  "Mockup 16_ Brand Trust Logo Image.png": [
    { token: "TAGLINE", x: 0.08, y: 0.08, w: 0.84, h: 0.08, align: "center", lineHeight: 90, colorRole: "neutral" }
  ],
  "Mockup 17_ Shop Promo.png": [
    { token: "DISCOUNT_HEADING", x: 0.08, y: 0.08, w: 0.84, h: 0.08, align: "center", lineHeight: 90, colorRole: "neutral" },
    { token: "DISCOUNT_DETAILS", x: 0.1, y: 0.15, w: 0.8, h: 0.08, align: "center", lineHeight: 80, colorRole: "neutral" },
    { token: "discount_badge", x: 0.75, y: 0.05, w: 0.2, h: 0.1, align: "center", lineHeight: 60, colorRole: "neutral" },
    { token: "SHOP_LINK", x: 0.1, y: 0.9, w: 0.8, h: 0.06, align: "center", lineHeight: 70, colorRole: "neutral" }
  ],
  "Mockup 18_ Free Gift.png": [
    { token: "FREE_GIFT_HEADING", x: 0.08, y: 0.08, w: 0.84, h: 0.08, align: "center", lineHeight: 90, colorRole: "neutral" },
    { token: "FREE_GIFT_SUBHEADING", x: 0.1, y: 0.17, w: 0.8, h: 0.06, align: "center", lineHeight: 80, colorRole: "neutral" },
    { token: "FREE_GIFT_NAME", x: 0.1, y: 0.24, w: 0.8, h: 0.06, align: "center", lineHeight: 80, colorRole: "neutral" }
  ],
  "Mockup 19_ Customer Reviews.png": [
    { token: "REVIEWS_HEADING", x: 0.08, y: 0.08, w: 0.84, h: 0.08, align: "center", lineHeight: 90, colorRole: "neutral" },
    { token: "Review_1", x: 0.08, y: 0.2, w: 0.84, h: 0.14, align: "left", lineHeight: 70, colorRole: "neutral" },
    { token: "Review_2", x: 0.08, y: 0.36, w: 0.84, h: 0.14, align: "left", lineHeight: 70, colorRole: "neutral" },
    { token: "Review_3", x: 0.08, y: 0.52, w: 0.84, h: 0.14, align: "left", lineHeight: 70, colorRole: "neutral" }
  ],
  "Mockup 20_ INSPIRATIONAL MOCKUPS.png": [
    { token: "INSPIRATION_HEADING", x: 0.08, y: 0.08, w: 0.84, h: 0.08, align: "center", lineHeight: 90, colorRole: "neutral" },
    { token: "INSPIRATION_DETAILS", x: 0.1, y: 0.89, w: 0.8, h: 0.06, align: "center", lineHeight: 80, colorRole: "neutral" }
  ],
  "Mockup 21_ FINAL CTA.png": [
    { token: "FINAL_CTA_HEADING", x: 0.08, y: 0.08, w: 0.84, h: 0.08, align: "center", lineHeight: 90, colorRole: "neutral" },
    { token: "FINAL_CTA_DETAILS", x: 0.1, y: 0.15, w: 0.8, h: 0.08, align: "center", lineHeight: 80, colorRole: "neutral" },
    { token: "FINAL_CTA_FOOTER", x: 0.1, y: 0.92, w: 0.8, h: 0.05, align: "center", lineHeight: 70, colorRole: "neutral" }
  ]
};

export function getTextRectsForLayout(previewFilename: LayoutKey): TextRect[] {
  return TEXT_POSITIONS[previewFilename] ?? [];
}
