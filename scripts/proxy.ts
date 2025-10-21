// scripts/proxy.ts
import express = require("express");
import cors = require("cors");

const app = express();
const PORT = 5000;

// ⬇️ Paste your Google Apps Script *exec* URL (without any ?folderUrl= on it)
const GAS_URL = "https://script.google.com/macros/s/AKfycbyArvsYfi4_c-NlMBHnNqis78pVwU4M_AO5IHRKM8Vcvl_ygclKysN5xN8IEas0BzgMKg/exec";

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.send("Proxy server is running!");
});

// Forward folder lookups to Apps Script
app.get("/fetch", async (req, res) => {
  const folderUrl = String(req.query.folderUrl || "");
  if (!folderUrl) {
    return res.status(400).json({ error: "Missing folderUrl" });
  }
  try {
    const url = `${GAS_URL}?folderUrl=${encodeURIComponent(folderUrl)}`;
    const r = await fetch(url);
    const text = await r.text();
    try {
      // If Apps Script returns JSON, pass it through
      res.json(JSON.parse(text));
    } catch {
      // Otherwise return plain text
      res.type("text/plain").send(text);
    }
  } catch (err: any) {
    res.status(500).json({ error: err?.message || "Proxy error" });
  }
});

app.listen(PORT, () => {
  console.log(`[proxy] listening on http://localhost:${PORT}`);
});
