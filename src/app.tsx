import { useRef, useState } from "react";

type Item = {
  id: string;
  file: File;
  status: "queued" | "uploading" | "done" | "error";
  url?: string;
  err?: string;
};

export default function App() {
  const [items, setItems] = useState<Item[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // TODO: Replace this with your existing function that placed images into Canva
  async function insertImagesIntoCurrentDesign(urls: string[]) {
    console.log("Process these image URLs:", urls);
    // Example:
    // await placeImagesInDesign(urls);
  }

  function addFiles(files: FileList | File[]) {
    const accepted = new Set([
      "image/png",
      "image/jpeg",
      "image/webp",
      "image/svg+xml",
    ]);
    const next = Array.from(files)
      .filter((f) => accepted.has(f.type))
      .map((f) => ({ id: crypto.randomUUID(), file: f, status: "queued" as const }));
    if (!next.length) return;
    setItems((prev) => [...prev, ...next]);
  }

  async function uploadAll() {
    const list = [...items];
    for (let i = 0; i < list.length; i++) {
      const it = list[i];
      if (it.status !== "queued") continue;

      list[i] = { ...it, status: "uploading" };
      setItems([...list]);

      try {
        const pre = await fetch("/api/upload/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename: it.file.name,
            type: it.file.type,
            size: it.file.size,
          }),
        }).then((r) => r.json()); // { uploadUrl, publicUrl, headers? }

        const put = await fetch(pre.uploadUrl, {
          method: "PUT",
          headers: pre.headers || {},
          body: it.file,
        });
        if (!put.ok) throw new Error(`Upload failed: ${put.status}`);

        list[i] = { ...it, status: "done", url: pre.publicUrl };
        setItems([...list]);
      } catch (e: any) {
        list[i] = { ...it, status: "error", err: e?.message || "Upload error" };
        setItems([...list]);
      }
    }
  }

  function processImages() {
    const urls = items.filter((i) => i.status === "done" && i.url).map((i) => i.url!) ;
    if (!urls.length) return;
    insertImagesIntoCurrentDesign(urls);
  }

  function clearAll() {
    setItems([]);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div style={{ padding: 12 }}>
      <h3 style={{ margin: "4px 0 8px" }}>Upload Images</h3>

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); addFiles(e.dataTransfer.files); }}
        style={{
          border: "2px dashed #bbb",
          borderRadius: 12,
          padding: 16,
          textAlign: "center",
          cursor: "pointer",
        }}
        onClick={() => inputRef.current?.click()}
      >
        <p style={{ margin: 6 }}>Drag & drop PNG/JPG/WEBP/SVG here</p>
        <p style={{ margin: 6 }}>or click to Browse</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          multiple
          onChange={(e) => e.target.files && addFiles(e.target.files)}
          style={{ display: "none" }}
        />
      </div>

      {!!items.length && (
        <>
          <ul style={{ marginTop: 12, paddingLeft: 16 }}>
            {items.map((it) => (
              <li key={it.id} style={{ marginBottom: 4 }}>
                {it.file.name} - {it.status}{it.err ? ` (${it.err})` : ""}
              </li>
            ))}
          </ul>

          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button onClick={uploadAll} disabled={!items.some((i) => i.status === "queued")}>
              Upload
            </button>
            <button onClick={processImages} disabled={!items.some((i) => i.status === "done")}>
              Process {items.filter((i) => i.status === "done").length} Images
            </button>
            <button onClick={clearAll}>Clear</button>
          </div>
        </>
      )}
    </div>
  );
}
