// Minimal Canva bridge – receives build plans from Mocktsy and ACKs.
// File that compiles to your single JS upload (e.g., dist/app.js).

import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

const MSG = "MOCKTSY_BUILD_PLAN";
const ACK = "MOCKTSY_BUILD_PLAN_ACK";

function CanvaBridge() {
  const [lastEventAt, setLastEventAt] = useState<number | null>(null);
  const [lastBytes, setLastBytes] = useState<number>(0);
  const [ok, setOk] = useState<boolean>(false);

  useEffect(() => {
    const isLocal = location.hostname === "localhost" || location.hostname === "127.0.0.1";

    const onMessage = (evt: MessageEvent) => {
      try {
        // In production, accept Canva host only. Loosen locally for dev.
        if (!isLocal) {
          if (typeof evt.origin === "string" && !evt.origin.includes("canva.com")) return;
        }

        const data = evt.data;
        if (!data || typeof data !== "object") return;

        if (data.type === MSG && data.version === 1) {
          // Record for display
          setLastEventAt(Date.now());
          try {
            const json = JSON.stringify(data.plan);
            setLastBytes(json.length);
          } catch {
            setLastBytes(0);
          }

          // ACK back to the sender (the Canva editor parent)
          try {
            evt.source &&
              (evt.source as Window).postMessage(
                { type: ACK, version: 1, ok: true },
                evt.origin || "*"
              );
            setOk(true);
          } catch {
            setOk(false);
          }
        }
      } catch {
        // ignore
      }
    };

    window.addEventListener("message", onMessage, { passive: true });
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const box: React.CSSProperties = {
    fontFamily: "Inter, system-ui, sans-serif",
    padding: 16,
    lineHeight: 1.4,
  };
  const pill: React.CSSProperties = {
    display: "inline-block",
    padding: "2px 8px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 600,
    background: ok ? "#e6ffed" : "#fff3cd",
    color: ok ? "#18794e" : "#8a6d3b",
    border: `1px solid ${ok ? "#abefc6" : "#ffe08a"}`,
    marginLeft: 8,
  };

  return (
    <div style={box}>
      <h3 style={{ margin: 0 }}>Mocktsy Canva Bridge <span style={pill as any}>{ok ? "ACK Ready" : "Waiting"}</span></h3>
      <p style={{ marginTop: 8 }}>
        This app is controlled by <strong>Mocktsy</strong>. Open Mocktsy and click “Edit in Canva” to send a build plan.
      </p>
      <ul style={{ marginTop: 8, paddingLeft: 18 }}>
        <li>Listening for: <code>{MSG}</code> (version 1)</li>
        <li>Will respond with: <code>{ACK}</code></li>
      </ul>
      {lastEventAt && (
        <p style={{ marginTop: 8, fontSize: 12, color: "#555" }}>
          Last plan received: {new Date(lastEventAt).toLocaleTimeString()} · ~{lastBytes.toLocaleString()} bytes
        </p>
      )}
    </div>
  );
}

// Ensure a mount node exists when Canva loads only a JS file
const rootEl =
  document.getElementById("root") ||
  (() => {
    const d = document.createElement("div");
    d.id = "root";
    document.body.appendChild(d);
    return d;
  })();

createRoot(rootEl).render(
  <React.StrictMode>
    <CanvaBridge />
  </React.StrictMode>
);
