// src/utils/canvaSender.ts
// Sends the built mockup plan to the Canva editor via postMessage.
// Contracts:
//   Outbound: { type: "MOCKTSY_BUILD_PLAN", version: 1, plan, meta }
//   Inbound:  { type: "MOCKTSY_BUILD_PLAN_ACK", version: 1, ok: true }

export const MOCKTSY_MSG = "MOCKTSY_BUILD_PLAN" as const;
export const MOCKTSY_ACK = "MOCKTSY_BUILD_PLAN_ACK" as const;

type AckMessage = { type: string; version?: number; ok?: boolean };

export type SendBuildToCanvaOptions = {
  /** Lock to a known Canva origin. Default: https://www.canva.com */
  canvaOrigin?: string;
  /** Timeout (ms) to wait for ACK before failing. Default: 8000 */
  timeoutMs?: number;
};

/**
 * Send the plan to Canva and resolve when an ACK is received (or timeout).
 */
export function sendBuildToCanva(
  plan: unknown,
  opts: SendBuildToCanvaOptions = {}
): Promise<void> {
  const canvaOrigin =
    opts.canvaOrigin ||
    (import.meta?.env?.VITE_CANVA_ORIGIN as string) ||
    "https://www.canva.com";

  const timeoutMs = typeof opts.timeoutMs === "number" ? opts.timeoutMs : 8000;

  const payload = {
    type: MOCKTSY_MSG,
    version: 1,
    plan,
    meta: { from: "mocktsy", ts: Date.now() },
  };

  const targetWindow: Window = window.parent || window;

  return new Promise<void>((resolve, reject) => {
    let settled = false;

    const onMessage = (evt: MessageEvent<AckMessage>) => {
      try {
        if (
          canvaOrigin !== "*" &&
          typeof evt.origin === "string" &&
          !evt.origin.includes("localhost") &&
          evt.origin !== canvaOrigin
        ) {
          return;
        }
        const data = evt.data;
        if (!data || typeof data !== "object") return;

        if (data.type === MOCKTSY_ACK && data.version === 1) {
          settled = true;
          window.removeEventListener("message", onMessage);
          resolve();
        }
      } catch {
        // ignore
      }
    };

    window.addEventListener("message", onMessage, { passive: true });

    try {
const isEmbedded = window !== window.parent;
const targetOrigin = isEmbedded ? canvaOrigin : (window.location.origin || "*");
targetWindow.postMessage(payload, targetOrigin);
    } catch (err) {
      window.removeEventListener("message", onMessage);
      reject(err instanceof Error ? err : new Error("postMessage failed"));
      return;
    }

    const t = window.setTimeout(() => {
      if (settled) return;
      window.removeEventListener("message", onMessage);
      reject(
        new Error(
          "No acknowledgement received from Canva. Is the Canva side listening for MOCKTSY_BUILD_PLAN?"
        )
      );
    }, timeoutMs);

    window.addEventListener(
      "beforeunload",
      () => {
        window.clearTimeout(t);
        window.removeEventListener("message", onMessage);
      },
      { once: true }
    );
  });
}

/** Back-compat aliases for older imports */
export const importToCanva = sendBuildToCanva;

/** Some older code imports this from here; provide a safe helper. */
export function openInNewTab(url: string): void {
  try {
    const w = window.open(url, "_blank", "noopener,noreferrer");
    if (w) w.opener = null;
  } catch {
    // no-op
  }
}
