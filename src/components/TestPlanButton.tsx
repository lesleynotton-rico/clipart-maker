import React from "react";
import { buildPlan } from "../utils/buildPlan";
import { downloadJSON } from "../utils/download";

type Props = {
  slideIds: number[];
};

export default function TestPlanButton({ slideIds }: Props) {
  async function handleClick() {
    // Read latest data at click time
    const pools = {
      selected: (window as any).__selectedImages || [],
      user_fullframe: (window as any).__userFullFrame || [],
      logo_fullframe: (window as any).__logoFullFrame || [],
      user_other_collections: (window as any).__otherCollections || [],
    };
    const fieldValues: Record<string, string> = (window as any).__fieldValues || {};

    const plan = await buildPlan(slideIds, pools, fieldValues);
    downloadJSON("build-plan.json", plan);
  }

  return (
    <button onClick={handleClick} style={{ padding: 8, border: "1px solid #ddd", borderRadius: 6 }}>
      Download Build Plan (Test)
    </button>
  );
}
