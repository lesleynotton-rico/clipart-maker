// src/utils/canvaSender.ts
// Minimal, reliable sender for Mocktsy → Canva.
// - If running inside an iframe (Canva), postMessage the plan and resolve true.
// - If NOT embedded (local dev), return a URL string so caller can window.open() it.
//   (This at least lands the user on Canva to log in / connect.)

export type BuildPlan = any; // keep loose here to avoid type coupling

const MESSAGE_TYPE = "MOCKTSY_BUILD_PLAN";

export function inIframe(): boolean {
  try {
    return window && window.parent && window.parent !== window;
  } catch {
    return false;
  }
}

/**
 * Send the build plan to Canva host.
 * Returns:
 *  - true  → message posted to parent (embedded scenario)
 *  - string URL → a URL that the caller can open as a fallback when not embedded
 */
export async function sendBuildToCanva(plan: BuildPlan): Promise<true | string> {
  // Basic validation so we never throw in the UI layer
  if (!plan || typeof plan !== "object") {
    console.warn("[canvaSender] Empty or invalid plan passed:", plan);
  }

  // Embedded → post to parent and resolve true
  if (inIframe()) {
    try {
      window.parent.postMessage(
        {
          type: MESSAGE_TYPE,
          payload: plan,
          // keep versioned so future handlers can discriminate
          meta: { source: "mocktsy", version: 1 }
        },
        "*"
      );
      return true;
    } catch (err) {
      console.error("[canvaSender] Failed to postMessage to parent:", err);
      // Fall through to URL fallback
    }
  }

  // Fallback when not embedded (local dev). We can't create a design URL here
  // without a backend, so we return Canva Home/Editor as a gentle landing.
  // App.tsx will window.open(thisUrl) if it receives a string.
  const fallbackUrl = "https://www.canva.com/";
  return fallbackUrl;
}

/**
 * Optional helper if you later want to listen for acks from Canva.
 * Not used right now, but handy to keep around.
 */
export function waitForAck(timeoutMs = 5000): Promise<boolean> {
  return new Promise((resolve) => {
    let settled = false;
    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        resolve(false);
      }
    }, timeoutMs);

    function onMessage(ev: MessageEvent) {
      try {
        const data = ev?.data || {};
        if (data?.type === MESSAGE_TYPE + "_ACK") {
          if (!settled) {
            settled = true;
            clearTimeout(timer);
            window.removeEventListener("message", onMessage);
            resolve(true);
          }
        }
      } catch {
        // ignore
      }
    }

    window.addEventListener("message", onMessage);
  });
}
