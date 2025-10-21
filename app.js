// Temporary entry so Canva can load our app during setup
// Minimal dev UI so we can see something in Canva
document.body.style.margin = "0";
document.body.style.fontFamily = "Inter, system-ui, Arial, sans-serif";
document.body.innerHTML = `
  <div style="padding:16px">
    <h2 style="margin:0 0 8px 0">🎨 Clipart Maker (dev)</h2>
    <p style="margin:0 0 12px 0; color:#666">
      Paste a Google Drive folder link to test the panel.
    </p>

    <input id="folderUrl" type="text" placeholder="https://drive.google.com/drive/folders/..."
           style="width:100%; padding:10px; border:1px solid #ccc; border-radius:8px; font-size:14px" />

    <button id="useBtn"
            style="margin-top:12px; padding:10px 14px; border-radius:8px; border:0; background:#6c5ce7; color:#fff; font-weight:600; cursor:pointer">
      Use This Folder
    </button>

    <div id="status" style="margin-top:12px; font-size:13px; color:#444"></div>
  </div>
`;

const input = document.getElementById("folderUrl");
const btn = document.getElementById("useBtn");
const status = document.getElementById("status");

btn.addEventListener("click", () => {
  const url = (input.value || "").trim();
  if (!/^https?:\/\/drive\.google\.com\/drive\/folders\//.test(url)) {
    status.textContent = "Please paste a valid Google Drive folder URL.";
    status.style.color = "#d63031";
    return;
  }
status.textContent = "Connecting to proxy...";
status.style.color = "#0984e3";

fetch(`https://fruity-trains-relax.loca.lt/fetch?folderUrl=${encodeURIComponent(url)}`, {
  headers: { "Bypass-Tunnel-Reminder": "true" }
})
  .then(r => r.text())
  .then(txt => { status.textContent = "Proxy response: " + txt; status.style.color = "#2d3436"; })
  .catch(err => { status.textContent = "Proxy error: " + err.message; status.style.color = "#d63031"; });
  console.log("Folder URL:", url);
});

console.log("Clipart Maker dev bundle loaded ✅");
