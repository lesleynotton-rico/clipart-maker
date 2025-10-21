// src/config/mockupMapping.ts
// Canonical mapping for Slides 1–26 using your exact names + image rules.

export type ImageSource =
  | "none"                    // no auto image insertion (static or text-only)
  | "selected"                // standard clipart uploads (prep step)
  | "user_fullframe"          // user-provided full-frame image (8a/9a/10a)
  | "user_other_collections"  // user uploads of other collections (17)
  | "logo_fullframe";         // full-frame logo (16)

export interface MockupImageRules {
  slots: number;                // expected image frames (or swatches for palette)
  source: ImageSource;
  repeatAll?: boolean;          // if true, use the SAME image in all frames (Mockup 7)
  uniqueWith?: number[];        // avoid repeating images with these slide IDs (3–6)
  isPalette?: boolean;          // Mockup 12 color palette
}

export interface MockupFields {
  // These keys match your Canva {{ _ }} tokens per latest template.
  heading?: string;
  subhead?: string;
  caption?: string;
  details1?: string;
  details2?: string;
  leftCol?: string;
  rightCol?: string;
}

export interface MockupMappingItem {
  id: number;
  name: string;                 // exact slide name
  fields?: MockupFields;
  images: MockupImageRules;
}

// Helper: common field IDs we know are present in your template
const F = {
  INCLUDED_HEADING: "included_heading",
  INCLUDED_DETAILS: "included_details",
  QUALITY_HEADING_1: "quality_heading_1",
  QUALITY_DETAILS_1: "quality_details_1",
  TRANSPARENT_HEADING: "transparent_heading",
  TRANSPARENT_DETAILS: "transparent_details",
  LICENSE_HEADING: "license_heading",
  LICENSE_DO: "license_do",
  LICENSE_DONT: "license_dont",
  HOW_HEADING: "how_heading",
  CONSISTENCY_HEADING: "consistency_heading",
  BRAND_TRUST_HEADING: "brand_trust_heading",
  SHOP_HEADING: "discount_heading",
  SHOP_DETAILS: "discount_details",
  FREE_GIFT_HEADING: "free_gift_heading",
  FREE_GIFT_SUBHEADING: "free_gift_subheading",
  REVIEWS_HEADING: "reviews_heading",
  INSPIRATION_HEADING: "inspiration_heading",
  FINAL_CTA_HEADING: "final_cta_heading",
  FINAL_CTA_DETAILS: "final_cta_details",
};

// Slides 1–26
export const MOCKUP_MAPPINGS: Record<number, MockupMappingItem> = {
  1: {
    id: 1,
    name: "Hero Mockup: Option 1",
    images: { slots: 1, source: "selected" },
    // Render meta
    frames: [{ x: 160, y: 260, w: 1680, h: 1200, mode: "contain", r: 24 }],
    textBoxes: [
      { token: "clipart_title", x: 160, y: 140, w: 1680, lineHeight: 1.2, align: "left", maxLines: 2 },
      { token: "INCLUDED_DETAILS", x: 160, y: 1540, w: 1680, lineHeight: 1.3, align: "left", maxLines: 3 }
    ],
    overlays: { logo: { x: 2000, y: 2000, size: 120, padding: 24 } }
  },
  2: {
    id: 2,
    name: "Hero Mockup: Option 2",
    images: { slots: 1, source: "selected" },
    frames: [{ x: 160, y: 220, w: 1680, h: 1280, mode: "contain", r: 24 }],
    textBoxes: [
      { token: "clipart_title", x: 160, y: 1560, w: 1680, lineHeight: 1.2, align: "center", maxLines: 2 }
    ],
    overlays: { logo: { x: 2000, y: 2000, size: 120, padding: 24 } }
  },

  // Collection Overview 1 & 2 (3a/3b/4a/4b) – grid from selected, avoid repeats across these
  3: {
    id: 3,
    name: "Mockup 3a: Collection Overview 1 - 3x3",
    fields: { heading: F.INCLUDED_HEADING, caption: F.INCLUDED_DETAILS },
    images: { slots: 9, source: "selected", uniqueWith: [4, 5, 6] },
    frames: [
      { x: 160, y: 360, w: 520, h: 520, r: 20 }, { x: 700, y: 360, w: 520, h: 520, r: 20 }, { x: 1240, y: 360, w: 520, h: 520, r: 20 },
      { x: 160, y: 900, w: 520, h: 520, r: 20 }, { x: 700, y: 900, w: 520, h: 520, r: 20 }, { x: 1240, y: 900, w: 520, h: 520, r: 20 },
      { x: 160, y: 1440, w: 520, h: 520, r: 20 }, { x: 700, y: 1440, w: 520, h: 520, r: 20 }, { x: 1240, y: 1440, w: 520, h: 520, r: 20 }
    ],
    textBoxes: [
      { token: "INCLUDED_HEADING", x: 160, y: 180, w: 1680, lineHeight: 1.2, align: "left", maxLines: 2 },
      { token: "INCLUDED_DETAILS", x: 160, y: 260, w: 1680, lineHeight: 1.3, align: "left", maxLines: 3 }
    ],
    overlays: { logo: { x: 2000, y: 2000, size: 100, padding: 24 } }
  },
  4: {
    id: 4,
    name: "Mockup 3b: Collection Overview 1 - 4x4",
    fields: { heading: F.INCLUDED_HEADING, caption: F.INCLUDED_DETAILS },
    images: { slots: 16, source: "selected", uniqueWith: [3, 5, 6] },
    frames: [
      { x: 160, y: 360, w: 420, h: 420, r: 16 }, { x: 600, y: 360, w: 420, h: 420, r: 16 }, { x: 1040, y: 360, w: 420, h: 420, r: 16 }, { x: 1480, y: 360, w: 420, h: 420, r: 16 },
      { x: 160, y: 800, w: 420, h: 420, r: 16 }, { x: 600, y: 800, w: 420, h: 420, r: 16 }, { x: 1040, y: 800, w: 420, h: 420, r: 16 }, { x: 1480, y: 800, w: 420, h: 420, r: 16 },
      { x: 160, y: 1240, w: 420, h: 420, r: 16 }, { x: 600, y: 1240, w: 420, h: 420, r: 16 }, { x: 1040, y: 1240, w: 420, h: 420, r: 16 }, { x: 1480, y: 1240, w: 420, h: 420, r: 16 },
      { x: 160, y: 1680, w: 420, h: 420, r: 16 }, { x: 600, y: 1680, w: 420, h: 420, r: 16 }, { x: 1040, y: 1680, w: 420, h: 420, r: 16 }, { x: 1480, y: 1680, w: 420, h: 420, r: 16 }
    ],
    textBoxes: [
      { token: "INCLUDED_HEADING", x: 160, y: 180, w: 1680, lineHeight: 1.2, align: "left", maxLines: 2 },
      { token: "INCLUDED_DETAILS", x: 160, y: 260, w: 1680, lineHeight: 1.3, align: "left", maxLines: 3 }
    ],
    overlays: { logo: { x: 2000, y: 2000, size: 90, padding: 24 } }
  },
  5: {
    id: 5,
    name: "Mockup 4a: Collection Overview 2 - 3x3",
    fields: { heading: F.INCLUDED_HEADING, caption: F.INCLUDED_DETAILS },
    images: { slots: 9, source: "selected", uniqueWith: [3, 4, 6] },
    frames: [
      { x: 160, y: 360, w: 520, h: 520, r: 20 }, { x: 700, y: 360, w: 520, h: 520, r: 20 }, { x: 1240, y: 360, w: 520, h: 520, r: 20 },
      { x: 160, y: 900, w: 520, h: 520, r: 20 }, { x: 700, y: 900, w: 520, h: 520, r: 20 }, { x: 1240, y: 900, w: 520, h: 520, r: 20 },
      { x: 160, y: 1440, w: 520, h: 520, r: 20 }, { x: 700, y: 1440, w: 520, h: 520, r: 20 }, { x: 1240, y: 1440, w: 520, h: 520, r: 20 }
    ],
    textBoxes: [
      { token: "INCLUDED_HEADING", x: 160, y: 180, w: 1680, lineHeight: 1.2, align: "left", maxLines: 2 },
      { token: "INCLUDED_DETAILS", x: 160, y: 260, w: 1680, lineHeight: 1.3, align: "left", maxLines: 3 }
    ],
    overlays: { logo: { x: 2000, y: 2000, size: 100, padding: 24 } }
  },
  6: {
    id: 6,
    name: "Mockup 4b: Collection Overview 2 - 4x4",
    fields: { heading: F.INCLUDED_HEADING, caption: F.INCLUDED_DETAILS },
    images: { slots: 16, source: "selected", uniqueWith: [3, 4, 5] },
    frames: [
      { x: 160, y: 360, w: 420, h: 420, r: 16 }, { x: 600, y: 360, w: 420, h: 420, r: 16 }, { x: 1040, y: 360, w: 420, h: 420, r: 16 }, { x: 1480, y: 360, w: 420, h: 420, r: 16 },
      { x: 160, y: 800, w: 420, h: 420, r: 16 }, { x: 600, y: 800, w: 420, h: 420, r: 16 }, { x: 1040, y: 800, w: 420, h: 420, r: 16 }, { x: 1480, y: 800, w: 420, h: 420, r: 16 },
      { x: 160, y: 1240, w: 420, h: 420, r: 16 }, { x: 600, y: 1240, w: 420, h: 420, r: 16 }, { x: 1040, y: 1240, w: 420, h: 420, r: 16 }, { x: 1480, y: 1240, w: 420, h: 420, r: 16 },
      { x: 160, y: 1680, w: 420, h: 420, r: 16 }, { x: 600, y: 1680, w: 420, h: 420, r: 16 }, { x: 1040, y: 1680, w: 420, h: 420, r: 16 }, { x: 1480, y: 1680, w: 420, h: 420, r: 16 }
    ],
    textBoxes: [
      { token: "INCLUDED_HEADING", x: 160, y: 180, w: 1680, lineHeight: 1.2, align: "left", maxLines: 2 },
      { token: "INCLUDED_DETAILS", x: 160, y: 260, w: 1680, lineHeight: 1.3, align: "left", maxLines: 3 }
    ],
    overlays: { logo: { x: 2000, y: 2000, size: 90, padding: 24 } }
  },

  7: {
    id: 7,
    name: "Mockup 5: Close Up Detail",
    fields: { heading: F.QUALITY_HEADING_1, caption: F.QUALITY_DETAILS_1 },
    images: { slots: 1, source: "selected" },
    frames: [{ x: 200, y: 360, w: 1600, h: 1200, r: 24 }],
    textBoxes: [
      { token: "QUALITY_HEADING_1", x: 160, y: 180, w: 1680, lineHeight: 1.2, align: "left", maxLines: 2 },
      { token: "QUALITY_DETAILS_1", x: 160, y: 1600, w: 1680, lineHeight: 1.3, align: "left", maxLines: 3 }
    ],
    overlays: { logo: { x: 2000, y: 2000, size: 110, padding: 24 } }
  },
  8: {
    id: 8,
    name: "Mockup 6: Transparency Demo",
    fields: { heading: F.TRANSPARENT_HEADING, caption: F.TRANSPARENT_DETAILS },
    images: { slots: 1, source: "selected" },
    frames: [{ x: 200, y: 520, w: 1600, h: 1000, r: 24, mode: "contain" }],
    textBoxes: [
      { token: "TRANSPARENT_HEADING", x: 160, y: 200, w: 1680, lineHeight: 1.2, align: "left", maxLines: 2 },
      { token: "TRANSPARENT_DETAILS", x: 160, y: 1680, w: 1680, lineHeight: 1.3, align: "left", maxLines: 3 }
    ],
    overlays: { transparencyBg: true, logo: { x: 2000, y: 2000, size: 100, padding: 24 } }
  },
  9: {
    id: 9,
    name: "Mockup 7: Transparency Demo",
    fields: { heading: F.TRANSPARENT_HEADING, caption: F.TRANSPARENT_DETAILS },
    images: { slots: 3, source: "selected", repeatAll: true }, // same image in all 3
    frames: [
      { x: 160, y: 720, w: 520, h: 520, r: 20, mode: "contain" },
      { x: 740, y: 720, w: 520, h: 520, r: 20, mode: "contain" },
      { x: 1320, y: 720, w: 520, h: 520, r: 20, mode: "contain" }
    ],
    textBoxes: [
      { token: "TRANSPARENT_HEADING", x: 160, y: 220, w: 1680, lineHeight: 1.2, align: "center", maxLines: 2 },
      { token: "TRANSPARENT_DETAILS", x: 160, y: 1360, w: 1680, lineHeight: 1.3, align: "center", maxLines: 3 }
    ],
    overlays: { transparencyBg: true, logo: { x: 2000, y: 2000, size: 90, padding: 24 } }
  },

  // Branding / POD / Crafting – Upload Your Own vs Pre-Made
  10: {
    id: 10,
    name: "Mockup 8a: Branding & Logo Use Case - Upload Your Own",
    images: { slots: 1, source: "user_fullframe" },
    frames: [{ x: 160, y: 220, w: 1680, h: 1400, r: 24, mode: "contain" }],
    overlays: { logo: { x: 2000, y: 2000, size: 110, padding: 24 } }
  },
  11: {
    id: 11,
    name: "Mockup 8b: Branding & Logo Use Case - Pre-Made",
    images: { slots: 1, source: "selected" },
    frames: [{ x: 160, y: 220, w: 1680, h: 1400, r: 24, mode: "contain" }],
    overlays: { logo: { x: 2000, y: 2000, size: 110, padding: 24 } }
  },
  12: {
    id: 12,
    name: "Mockup 9a: POD Use Case - Upload Your Own",
    images: { slots: 1, source: "user_fullframe" },
    frames: [{ x: 200, y: 260, w: 1600, h: 1300, r: 24, mode: "contain" }],
    overlays: { logo: { x: 2000, y: 2000, size: 110, padding: 24 } }
  },
  13: {
    id: 13,
    name: "Mockup 9b: POD Use Case - Pre-Made",
    images: { slots: 1, source: "selected" },
    frames: [{ x: 200, y: 260, w: 1600, h: 1300, r: 24, mode: "contain" }],
    overlays: { logo: { x: 2000, y: 2000, size: 110, padding: 24 } }
  },
  14: {
    id: 14,
    name: "Mockup 10a: Crafting Use Case - Upload Your Own",
    images: { slots: 1, source: "user_fullframe" },
    frames: [{ x: 180, y: 300, w: 1640, h: 1280, r: 24, mode: "contain" }],
    overlays: { logo: { x: 2000, y: 2000, size: 110, padding: 24 } }
  },
  15: {
    id: 15,
    name: "Mockup 10b: Crafting Use Case - Pre-Made",
    images: { slots: 1, source: "selected" },
    frames: [{ x: 180, y: 300, w: 1640, h: 1280, r: 24, mode: "contain" }],
    overlays: { logo: { x: 2000, y: 2000, size: 110, padding: 24 } }
  },

  16: {
    id: 16,
    name: "Mockup 11: Digital / Canva Example",
    images: { slots: 1, source: "selected" },
    frames: [{ x: 200, y: 360, w: 1600, h: 1200, r: 24, mode: "contain" }],
    textBoxes: [
      { token: "PROGRAMS_HEADING", x: 160, y: 180, w: 1680, lineHeight: 1.2, align: "left", maxLines: 2 }
    ],
    overlays: { logo: { x: 2000, y: 2000, size: 100, padding: 24 } }
  },

  // Color Palette – exactly 6 swatches
  17: {
    id: 17,
    name: "Mockup 12: Color Palette",
    images: { slots: 6, source: "selected", isPalette: true },
    // No frames (palette handled separately); reserve a strip area
    textBoxes: [
      { token: "clipart_title", x: 160, y: 160, w: 1680, lineHeight: 1.2, align: "left", maxLines: 2 }
    ],
    overlays: { logo: { x: 2000, y: 2000, size: 90, padding: 24 }, paletteStrip: { x: 160, y: 1680, w: 1680, h: 160 } }
  },

  // License guide – text only bindings
  18: {
    id: 18,
    name: "Mockup 13: License Guide",
    fields: {
      heading: F.LICENSE_HEADING,
      leftCol: F.LICENSE_DO,
      rightCol: F.LICENSE_DONT,
    },
    images: { slots: 0, source: "none" },
    textBoxes: [
      { token: "LICENSE_HEADING", x: 160, y: 200, w: 1680, lineHeight: 1.2, align: "center", maxLines: 2 },
      { token: "LICENSE_DO", x: 160, y: 440, w: 800, lineHeight: 1.3, align: "left", maxLines: 14 },
      { token: "LICENSE_DONT", x: 1040, y: 440, w: 800, lineHeight: 1.3, align: "left", maxLines: 14 }
    ],
    overlays: { logo: { x: 2000, y: 2000, size: 90, padding: 24 } }
  },

  19: {
    id: 19,
    name: "Mockup 14: How It Works",
    fields: { heading: F.HOW_HEADING },
    images: { slots: 0, source: "none" },
    textBoxes: [
      { token: "HOW_HEADING", x: 160, y: 220, w: 1680, lineHeight: 1.2, align: "left", maxLines: 2 },
      // Body steps are static in Canva per your instruction; no token boxes required here.
    ],
    overlays: { logo: { x: 2000, y: 2000, size: 80, padding: 24 } }
  },

  20: {
    id: 20,
    name: "Mockup 15: Consistent Characters",
    fields: { heading: F.CONSISTENCY_HEADING, caption: F.INCLUDED_DETAILS },
    images: { slots: 3, source: "selected" },
    frames: [
      { x: 160, y: 520, w: 520, h: 520, r: 20 },
      { x: 740, y: 520, w: 520, h: 520, r: 20 },
      { x: 1320, y: 520, w: 520, h: 520, r: 20 }
    ],
    textBoxes: [
      { token: "CONSISTENCY_HEADING", x: 160, y: 220, w: 1680, lineHeight: 1.2, align: "left", maxLines: 2 },
      { token: "INCLUDED_DETAILS", x: 160, y: 1200, w: 1680, lineHeight: 1.3, align: "left", maxLines: 3 }
    ],
    overlays: { logo: { x: 2000, y: 2000, size: 90, padding: 24 } }
  },

  // Brand Trust Logo – full-frame logo (no auto insert)
  21: {
    id: 21,
    name: "Mockup 16: Brand Trust Logo Image",
    fields: { heading: F.BRAND_TRUST_HEADING },
    images: { slots: 1, source: "logo_fullframe" },
    frames: [{ x: 160, y: 300, w: 1680, h: 1400, r: 24, mode: "contain" }],
    textBoxes: [
      { token: "BRAND_TRUST_HEADING", x: 160, y: 200, w: 1680, lineHeight: 1.2, align: "center", maxLines: 2 }
    ]
  },

  // Shop Promo – user uploads (other collections)
  22: {
    id: 22,
    name: "Mockup 17: Shop Promo",
    fields: { heading: F.SHOP_HEADING, caption: F.SHOP_DETAILS },
    images: { slots: 3, source: "user_other_collections" },
    frames: [
      { x: 160, y: 480, w: 520, h: 520, r: 20 },
      { x: 740, y: 480, w: 520, h: 520, r: 20 },
      { x: 1320, y: 480, w: 520, h: 520, r: 20 }
    ],
    textBoxes: [
      { token: "SHOP_HEADING", x: 160, y: 220, w: 1680, lineHeight: 1.2, align: "left", maxLines: 2 },
      { token: "SHOP_DETAILS", x: 160, y: 1100, w: 1680, lineHeight: 1.3, align: "left", maxLines: 3 }
    ],
    overlays: { logo: { x: 2000, y: 2000, size: 80, padding: 24 } }
  },

  23: {
    id: 23,
    name: "Mockup 18: Free Gift",
    fields: {
      heading: F.FREE_GIFT_HEADING,
      subhead: F.FREE_GIFT_SUBHEADING,
    },
    images: { slots: 1, source: "selected" },
    frames: [{ x: 200, y: 540, w: 1600, h: 920, r: 24 }],
    textBoxes: [
      { token: "FREE_GIFT_HEADING", x: 160, y: 220, w: 1680, lineHeight: 1.2, align: "left", maxLines: 2 },
      { token: "FREE_GIFT_SUBHEADING", x: 160, y: 320, w: 1680, lineHeight: 1.2, align: "left", maxLines: 2 }
    ],
    overlays: { logo: { x: 2000, y: 2000, size: 90, padding: 24 } }
  },

  24: {
    id: 24,
    name: "Mockup 19: Customer Reviews",
    fields: { heading: F.REVIEWS_HEADING },
    images: { slots: 0, source: "none" },
    textBoxes: [
      { token: "REVIEWS_HEADING", x: 160, y: 220, w: 1680, lineHeight: 1.2, align: "center", maxLines: 2 },
      { token: "Review_1", x: 160, y: 520, w: 1680, lineHeight: 1.3, align: "left", maxLines: 3 },
      { token: "Review_2", x: 160, y: 820, w: 1680, lineHeight: 1.3, align: "left", maxLines: 3 },
      { token: "Review_3", x: 160, y: 1120, w: 1680, lineHeight: 1.3, align: "left", maxLines: 3 }
    ],
    overlays: { logo: { x: 2000, y: 2000, size: 70, padding: 24 } }
  },

  25: {
    id: 25,
    name: "Mockup 20: Inspirational Moodboard",
    fields: { heading: F.INSPIRATION_HEADING },
    images: { slots: 6, source: "selected" },
    frames: [
      { x: 160, y: 360, w: 520, h: 520, r: 20 }, { x: 700, y: 360, w: 520, h: 520, r: 20 }, { x: 1240, y: 360, w: 520, h: 520, r: 20 },
      { x: 160, y: 900, w: 520, h: 520, r: 20 }, { x: 700, y: 900, w: 520, h: 520, r: 20 }, { x: 1240, y: 900, w: 520, h: 520, r: 20 }
    ],
    textBoxes: [
      { token: "INSPIRATION_HEADING", x: 160, y: 200, w: 1680, lineHeight: 1.2, align: "left", maxLines: 2 }
    ],
    overlays: { logo: { x: 2000, y: 2000, size: 90, padding: 24 } }
  },

  26: {
    id: 26,
    name: "Mockup 21: Final CTA",
    fields: { heading: F.FINAL_CTA_HEADING, caption: F.FINAL_CTA_DETAILS },
    images: { slots: 12, source: "selected" },
    frames: [
      { x: 160, y: 420, w: 420, h: 420, r: 16 }, { x: 600, y: 420, w: 420, h: 420, r: 16 }, { x: 1040, y: 420, w: 420, h: 420, r: 16 }, { x: 1480, y: 420, w: 420, h: 420, r: 16 },
      { x: 160, y: 860, w: 420, h: 420, r: 16 }, { x: 600, y: 860, w: 420, h: 420, r: 16 }, { x: 1040, y: 860, w: 420, h: 420, r: 16 }, { x: 1480, y: 860, w: 420, h: 420, r: 16 },
      { x: 160, y: 1300, w: 420, h: 420, r: 16 }, { x: 600, y: 1300, w: 420, h: 420, r: 16 }, { x: 1040, y: 1300, w: 420, h: 420, r: 16 }, { x: 1480, y: 1300, w: 420, h: 420, r: 16 }
    ],
    textBoxes: [
      { token: "FINAL_CTA_HEADING", x: 160, y: 180, w: 1680, lineHeight: 1.2, align: "center", maxLines: 2 },
      { token: "FINAL_CTA_DETAILS", x: 160, y: 1760, w: 1680, lineHeight: 1.3, align: "center", maxLines: 3 },
      { token: "FINAL_CTA_FOOTER",  x: 160, y: 1900, w: 1680, lineHeight: 1.1, align: "center", maxLines: 1 }
    ],
    overlays: { logo: { x: 2000, y: 2000, size: 80, padding: 24 } }
  },
};


export function getMockupMapping(id: number): MockupMappingItem | null {
  return MOCKUP_MAPPINGS[id] ?? null;
}
