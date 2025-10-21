import React from "react";
import { buildPlan } from "../utils/buildPlan";
import { planToPages } from "../utils/pageFactory";

export default function TestPageFactory() {
  async function handleClick() {
    const pools = {
      selected: (window as any).__selectedImages || [],
      user_fullframe: (window as any).__userFullFrame || [],
      logo_fullframe: (window as any).__logoFullFrame || [],
      user_other_collections: (window as any).__otherCollections || [],
    };
    const fieldValues: Record<string, string> = (window as any).__fieldValues || {};

    const slideIds = Array.from({ length: 26 }, (_, i) => i + 1);
    const plan = await buildPlan(slideIds, pools, fieldValues);
    const pages = planToPages(plan);
    console.log("🧩 Canva-page spec", pages);
    alert(`Created ${pages.length} pages; check console for detail.`);
  }

  return (
    <button onClick={handleClick} style={{ padding: 8, border: "1px solid #ccc", borderRadius: 6 }}>
      Preview Canva Pages In Console
    </button>
  );
}
