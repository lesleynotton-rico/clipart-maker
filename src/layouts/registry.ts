// src/layouts/registry.ts

export type TextStyle = {
  fontRole: "H1" | "H2" | "Body";
  size: number; // relative to 3000px (e.g., 48 = 48px at 3000px page)
  color: string;
  weight?: number; // 400-800
  align?: "left" | "center" | "right";
};

export type TextBlock = {
  role: "h1" | "h2" | "body";
  content: string; // can include tokens like {title}
  x: number; y: number; w: number; h: number; // absolute px at 3000x3000 base
  style: TextStyle;
};

export type Frame = {
  x: number; y: number; w: number; h: number; // absolute px at 3000x3000 base
  radius?: number;
  fit?: "cover" | "contain";
};

export type LayoutDef = {
  id: string;
  name: string;
  page: { width: number; height: number; padding?: number };
  safeZone: { // 3:4 portrait centered inside 3000x3000
    x: number; y: number; w: number; h: number;
  };
  background: { type: "solid"; color: string } | { type: "gradient"; colors: string[] };
  frames: Frame[];
  texts: TextBlock[];
  extras?: { make_overview?: boolean };
};

const BASE = 3000;
// 3:4 safe zone is 2250 x 3000 centered horizontally
const SAFE_W = 2250;
const SAFE_H = 3000;
const SAFE_X = Math.floor((BASE - SAFE_W) / 2);
const SAFE_Y = 0;

export const layouts: LayoutDef[] = [
  {
    id: "hero-cover",
    name: "Hero / Cover",
    page: { width: BASE, height: BASE, padding: 120 },
    safeZone: { x: SAFE_X, y: SAFE_Y, w: SAFE_W, h: SAFE_H },
    background: { type: "solid", color: "#FFFFFF" },
    frames: [
      // Big hero frame (visuals can go edge-to-edge; captions must stay in safeZone)
      { x: 120, y: 120, w: BASE - 240, h: BASE - 240, radius: 48, fit: "cover" }
    ],
    texts: [
      {
        role: "h1",
        content: "{title}",
        x: SAFE_X + 80, y: SAFE_Y + 120, w: SAFE_W - 160, h: 140,
        style: { fontRole: "H1", size: 96, color: "#111111", weight: 700, align: "center" }
      },
      {
        role: "body",
        content: "{subtitle}",
        x: SAFE_X + 160, y: SAFE_Y + 280, w: SAFE_W - 320, h: 100,
        style: { fontRole: "Body", size: 40, color: "#333333", weight: 500, align: "center" }
      }
    ]
  },
  {
    id: "grid-3up",
    name: "Classic 3-Up",
    page: { width: BASE, height: BASE, padding: 80 },
    safeZone: { x: SAFE_X, y: SAFE_Y, w: SAFE_W, h: SAFE_H },
    background: { type: "solid", color: "#FFFFFF" },
    frames: [
      { x: 100, y: 100, w: BASE - 200, h: 800, radius: 32, fit: "cover" },
      { x: 100, y: 950, w: (BASE - 240) / 2, h: 950, radius: 32, fit: "cover" },
      { x: 100 + (BASE - 240) / 2 + 40, y: 950, w: (BASE - 240) / 2, h: 950, radius: 32, fit: "cover" }
    ],
    texts: [
      {
        role: "h2",
        content: "{cta}",
        x: SAFE_X + 80, y: SAFE_Y + SAFE_H - 320, w: SAFE_W - 160, h: 120,
        style: { fontRole: "H2", size: 56, color: "#111111", weight: 700, align: "center" }
      }
    ]
  }
];

export type { LayoutDef as TLayoutDef };
