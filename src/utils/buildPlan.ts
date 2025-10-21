// src/utils/buildPlan.ts
import { getMockupMapping, MockupMappingItem } from "../config/mockupMapping";
import { extractSixColors } from "./palette";
import { createUniquenessState, pickImagesForMockup, ImagePools } from "./imagePicker";

export interface BuildPlanItem {
  id: number;
  name: string;
  fields?: Record<string, string>;
  images: string[];          // ordered image URLs for frames
  palette6?: string[];       // only for Mockup 12
}

export interface BuildPlan {
  items: BuildPlanItem[];
  createdAt: string;
}

export async function buildPlan(
  slideIds: number[],
  pools: ImagePools,
  fieldValues: Record<string, string>
): Promise<BuildPlan> {
  const uniq = createUniquenessState();
  const items: BuildPlanItem[] = [];

// --- Allocate chosen pages among {3,4,5,6} with NO repeats between chosen slides.
// If we run out of uniques, leave empty frames ("") instead of repeating.
const CO_IDS = new Set([3,4,5,6]);
const chosenCO = slideIds.filter(id => CO_IDS.has(id));
const otherSlides = slideIds.filter(id => !CO_IDS.has(id));

if (chosenCO.length) {
  const pool = [...(pools.selected || [])]; // copy of selected uploads
  const per: Record<number,string[]> = {};
  const slotsById: Record<number,number> =
    Object.fromEntries(chosenCO.map(id => [id, getMockupMapping(id)!.images.slots]));

  // Global set to prevent any image appearing in more than one chosen slide
  const globallyUsed = new Set<string>();

  // Round-robin fill; skip if image already used globally
  let i = 0;
  while (pool.length && Object.values(slotsById).some(n => n > 0)) {
    const sid = chosenCO[i % chosenCO.length];
    if (slotsById[sid] > 0) {
      const img = pool.shift()!;
      if (!globallyUsed.has(img)) {
        (per[sid] ||= []).push(img);
        globallyUsed.add(img);
        slotsById[sid]--;
      }
    }
    i++;
  }

  // Fill remaining slots with blanks (no repeats)
  for (const sid of chosenCO) {
    const need = getMockupMapping(sid)!.images.slots;
    (per[sid] ||= []);
    while (per[sid].length < need) per[sid].push(""); // leave frame empty
    uniq.usedBySlide[sid] = new Set(per[sid].filter(Boolean));

    const map = getMockupMapping(sid)!;
    const fields = map.fields
      ? Object.fromEntries(Object.entries(map.fields).map(([k,t]) => [k, fieldValues[t] ?? ""]))
      : undefined;

    items.push({ id: map.id, name: map.name, fields, images: per[sid] });
  }
}
// --- End chosen-only allocation ---

  // Build the rest normally
  for (const id of otherSlides) {
    const map = getMockupMapping(id);
    if (!map) continue;

    const images = pickImagesForMockup(map, pools, uniq);

    // Palette for Mockup 12
    let palette6: string[] | undefined;
    if (map.images.isPalette) {
      const selected = pools.selected || [];
      palette6 = await extractSixColors(selected.slice(0, 12));
    }

    const fields: Record<string, string> | undefined = map.fields
      ? Object.fromEntries(Object.entries(map.fields).map(([k,t]) => [k, fieldValues[t] ?? ""]))
      : undefined;

    items.push({ id: map.id, name: map.name, fields, images, palette6 });
  }

  return { items, createdAt: new Date().toISOString() };
}
