// src/canva/bridge.ts
// A tiny abstraction over Canva's App SDK.
// In dev (outside Canva), this runs in "mock mode" so you can test the flow end-to-end.

export type FrameSpec = {
  x: number; y: number; w: number; h: number;
  radius?: number; fit?: "cover" | "contain";
  image?: { id: string; url: string; w?: number; h?: number };
};

export type TextSpec = {
  role: "h1" | "h2" | "body";
  content: string;
  x: number; y: number; w: number; h: number;
  style: any;
};

export type PageSpec = {
  layoutId: string;
  page: { width: number; height: number; background: any; safeZone: { x: number; y: number; w: number; h: number } };
  frames: FrameSpec[];
  texts: TextSpec[];
};

export type InsertResult = { inserted: number };

function isInCanva(): boolean {
  // Basic heuristic; we’ll replace with Canva’s actual detection when wiring the SDK.
  // @ts-ignore
  return !!(window as any).Canva;
}

async function mockInsertPages(pages: PageSpec[]): Promise<InsertResult> {
  // Simulate latency a bit
  await new Promise((r) => setTimeout(r, 250));
  console.log("[MOCK] Would insert pages into Canva:", pages);
  // Show a minimal toast
  try {
    // @ts-ignore
    if (window?.toast) window.toast(`Mock-inserted ${pages.length} page(s)`);
  } catch {}
  return { inserted: pages.length };
}

// Placeholder for real Canva SDK wiring.
// When we add the SDK, replace the body of this function.
async function realInsertPages(pages: PageSpec[]): Promise<InsertResult> {
  // Example shape (pseudo):
  // const canva = await CanvaApp.init();
  // for (const p of pages) {
  //   const page = await canva.design.createPage({ width: p.page.width, height: p.page.height });
  //   // background...
  //   for (const f of p.frames) {
  //     const frame = await page.addFrame({ x: f.x, y: f.y, w: f.w, h: f.h, radius: f.radius });
  //     if (f.image) await frame.fillImage(f.image.url, { fit: f.fit || "cover" });
  //   }
  //   for (const t of p.texts) {
  //     await page.addText({ x: t.x, y: t.y, w: t.w, h: t.h, content: t.content, style: t.style });
  //   }
  // }
  // return { inserted: pages.length };
  return mockInsertPages(pages); // until we wire the SDK, keep mock
}

export async function insertPages(pages: PageSpec[]): Promise<InsertResult> {
  return isInCanva() ? realInsertPages(pages) : mockInsertPages(pages);
}
