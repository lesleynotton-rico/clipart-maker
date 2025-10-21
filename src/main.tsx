import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css"; // ✅ Tailwind + theme classes

console.log("[main] main.tsx loaded");  // <— ADD THIS

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

console.log("[main] React root rendered");  // <— ADD THIS
