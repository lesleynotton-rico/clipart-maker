// src/config/layoutPreviewFilenames.ts
// Maps your LayoutKey / UI name to the exact clean preview PNG filename
// stored under /public/layout-previews (spaces included).
// Filenames must match exactly.

export const LAYOUT_PREVIEW_FILENAME: Record<string, string> = {
  "Main Listing Image (A)": "Hero Mockup_ Option 1.png",
  "Main Listing Image (B)": "Hero Mockup_ Option 2.png",

  "Crafting Use Case - Upload Your Own": "Mockup 10a_ Crafting Use Case - Upload Your Own.png",
  "Crafting Use Case - Pre-Made": "Mockup 10b_ Crafting Use Case - Pre-Made.png",

  "Digital - Canva Example": "Mockup 11_ Digital _ Canva Example.png",
  "Color Cohesion": "Mockup 12_ Color Cohesion.png",
  "License Guide": "Mockup 13_ License Guide.png",
  "How It Works": "Mockup 14_ How It Works.png",
  "Consistent Characters": "Mockup 15_ Consistent Characters.png",
  "Brand Trust Logo Image": "Mockup 16_ Brand Trust Logo Image.png",
  "Shop Promo": "Mockup 17_ Shop Promo.png",
  "Free Gift": "Mockup 18_ Free Gift.png",
  "Customer Reviews": "Mockup 19_ Customer Reviews.png",
  "INSPIRATIONAL MOCKUPS": "Mockup 20_ INSPIRATIONAL MOCKUPS.png",
  "FINAL CTA": "Mockup 21_ FINAL CTA.png",


  "Collection Overview 1 – 3x3": "Mockup 3a_ Collection Overview 1 - 3x3.png",
  "Collection Overview 1 – 4x4": "Mockup 3b_ Collection Overview 1 - 4x4.png",
  "Collection Overview 2 – 3x3": "Mockup 4a_ Collection Overview 2 - 3x3.png",
  "Collection Overview 2 – 4x4": "Mockup 4b_ Collection Overview 2 - 4x4.png",

  "Close Up Detail": "Mockup 5_ Close Up Detail.png",
  "Transparency Demo (A)": "Mockup 6_ Transparency Demo.png",
  "Transparency Demo (B)": "Mockup 7_ Transparency Demo.png",

  "Branding & Logo Use Case - Upload Your Own": "Mockup 8a_ Branding & Logo Use Case - Upload Your Own.png",
  "Branding & Logo Use Case - Pre-Made": "Mockup 8b_ Branding & Logo Use Case - Pre-Made.png",
  "POD Use Case - Upload Your Own": "Mockup 9a_ POD Use Case - Upload Your Own.png",
  "POD Use Case - Pre-Made": "Mockup 9b_ POD Use Case - Pre-Made.png",
};

// Optional helper to list keys you expect in the UI grid:
export const LAYOUT_KEYS_IN_UI = Object.keys(LAYOUT_PREVIEW_FILENAME);
