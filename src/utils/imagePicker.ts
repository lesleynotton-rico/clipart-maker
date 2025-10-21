// src/utils/imagePicker.ts
import { MockupMappingItem } from "../config/mockupMapping";

export interface ImagePools {
  selected: string[];              // standard clipart uploads (prep step)
  user_fullframe?: string[];       // 8a/9a/10a full-frame uploads
  logo_fullframe?: string[];       // 16 full-frame logo upload(s)
  user_other_collections?: string[]; // 17 uploads (other collections)
}

export interface UniquenessState {
  usedBySlide: Record<number, Set<string>>;
}

export function createUniquenessState(): UniquenessState {
  return { usedBySlide: {} };
}

function takeFrom(pool: string[] = [], n: number): string[] {
  const out: string[] = [];
  for (let i = 0; i < n && pool.length; i++) out.push(pool.shift()!);
  return out;
}

/**
 * Picks image URLs for a mockup based on mapping rules.
 * - repeatAll: same image in all frames (Mockup 7)
 * - uniqueWith: avoid repeats across the specified slide IDs (3–6)
 */
export function pickImagesForMockup(
  slide: MockupMappingItem,
  pools: ImagePools,
  uniq: UniquenessState
): string[] {
  const src = slide.images.source;
  if (slide.images.slots === 0 || src === "none") return [];

  const sourcePool =
    src === "selected" ? pools.selected :
    src === "user_fullframe" ? (pools.user_fullframe || []) :
    src === "logo_fullframe" ? (pools.logo_fullframe || []) :
    src === "user_other_collections" ? (pools.user_other_collections || []) :
    [];

  const slots = slide.images.slots;

  // Repeat same image in all frames (Mockup 7)
  if (slide.images.repeatAll) {
    const img = sourcePool[0] || "";
    return Array.from({ length: slots }, () => img);
  }

  // Enforce uniqueness with related slides (3–6)
  const avoid = new Set<string>();
  (slide.images.uniqueWith || []).forEach((sid) => {
    const used = uniq.usedBySlide[sid];
    if (used) for (const u of used) avoid.add(u);
  });

  const picked: string[] = [];
  for (let i = 0; i < slots; i++) {
    const next = sourcePool.find((u) => u && !avoid.has(u) && !picked.includes(u));
    if (next) {
      picked.push(next);
      avoid.add(next);
    } else {
      // fallback: allow repeats if we run out
      picked.push(sourcePool[i % Math.max(1, sourcePool.length)] || "");
    }
  }

  // record for this slide
  uniq.usedBySlide[slide.id] = new Set(picked.filter(Boolean));
  return picked;
}
