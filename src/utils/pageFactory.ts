// src/utils/pageFactory.ts
import type { BuildPlan } from "./buildPlan";

/**
 * Converts a BuildPlan into a neutral "pages" spec your Canva code can consume.
 * - Leaves blank frames ("") as literal placeholders (no repeat).
 * - Adds bottom-right logo overlay meta where required (most slides except 12/13/14/16).
 */
export type Frame = { src: string; };
export type Page = {
  id: number;
  name: string;
  fields?: Record<string,string>;
  frames?: Frame[];
  palette6?: string[];
  overlayLogoBR?: boolean; // bottom-right logo
};

const NO_LOGO = new Set<number>([12,13,14,16]); // 12 palette, 13 license, 14 how-to, 16 full logo

export function planToPages(plan: BuildPlan): Page[] {
  return plan.items.map(it => ({
    id: it.id,
    name: it.name,
    fields: it.fields,
    frames: it.images?.map(src => ({ src })) ?? [],
    palette6: it.palette6,
    overlayLogoBR: !NO_LOGO.has(it.id),
  }));
}
