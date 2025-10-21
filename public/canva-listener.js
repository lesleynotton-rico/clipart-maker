// public/canva-listener.js
// Minimal listener for the Canva host to receive Mocktsy's build plan and ACK it.

(function () {
  const isLocal = location.hostname === "localhost" || location.hostname === "127.0.0.1";

  window.addEventListener("message", function onMessage(evt) {
    try {
      if (!evt || !evt.data || typeof evt.data !== "object") return;

      // Optional origin check: strict in prod, relaxed locally
      if (!isLocal) {
        // Only accept messages from Canva editor
        if (typeof evt.origin === "string" && evt.origin !== "https://www.canva.com") {
          return;
        }
      }

      const msg = evt.data;

      if (msg.type === "MOCKTSY_BUILD_PLAN" && msg.version === 1) {
        // ACK back to the sender (Canva editor)
        evt.source && evt.source.postMessage(
          { type: "MOCKTSY_BUILD_PLAN_ACK", version: 1, ok: true },
          evt.origin || "*"
        );

        // For now just log; we’ll build pages in a later step.
        console.log("[Canva Listener] Received build plan:", msg.plan);
      }
    } catch (e) {
      console.warn("[Canva Listener] Error handling message:", e);
    }
  }, { passive: true });
})();
