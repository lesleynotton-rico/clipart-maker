// src/utils/palette.ts
// Extract exactly 6 hex colors from a list of image URLs.
// Falls back to sensible defaults if extraction fails.

export async function extractSixColors(imageUrls: string[]): Promise<string[]> {
  const SWATCHES = 6;

  // Simple canvas sampler across a grid of pixels per image, merged & deduped.
  // (No external libs to keep it lightweight.)
  async function sampleImage(url: string): Promise<number[][]> {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const size = 64;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, size, size);

        const samples: number[][] = [];
        const steps = 8; // 8x8 grid
        for (let y = 0; y < steps; y++) {
          for (let x = 0; x < steps; x++) {
            const px = Math.floor((x + 0.5) * (size / steps));
            const py = Math.floor((y + 0.5) * (size / steps));
            const { data } = ctx.getImageData(px, py, 1, 1);
            samples.push([data[0], data[1], data[2]]);
          }
        }
        resolve(samples);
      };
      img.onerror = () => resolve([]);
      img.src = url;
    });
  }

  function toHex([r, g, b]: number[]): string {
    const h = (n: number) => n.toString(16).padStart(2, "0");
    return `#${h(r)}${h(g)}${h(b)}`;
  }

  // K-means-ish tiny clustering (very small, fixed iters) to 6 colors.
  function cluster(samples: number[][], k: number): string[] {
    if (!samples.length) return [];
    // init centroids by picking spread indices
    const centroids = Array.from({ length: k }, (_, i) => samples[(i * samples.length / k) | 0].slice());
    for (let iter = 0; iter < 8; iter++) {
      const buckets: number[][][] = Array.from({ length: k }, () => []);
      for (const s of samples) {
        let bi = 0, bd = Infinity;
        for (let c = 0; c < k; c++) {
          const d = Math.hypot(s[0]-centroids[c][0], s[1]-centroids[c][1], s[2]-centroids[c][2]);
          if (d < bd) { bd = d; bi = c; }
        }
        buckets[bi].push(s);
      }
      for (let c = 0; c < k; c++) {
        const b = buckets[c];
        if (!b.length) continue;
        const sum = b.reduce((a, s) => [a[0]+s[0], a[1]+s[1], a[2]+s[2]], [0,0,0]);
        centroids[c] = [sum[0]/b.length, sum[1]/b.length, sum[2]/b.length];
      }
    }
    return centroids.map(c => toHex(c.map(Math.round) as number[]));
  }

  try {
    const all: number[][] = [];
    for (const url of imageUrls.slice(0, 12)) {
      const s = await sampleImage(url);
      all.push(...s);
      if (all.length > 2048) break;
    }
    const hex = cluster(all, SWATCHES);
    // Ensure exactly 6
    const pad = ["#000000","#ffffff","#cccccc","#666666","#999999","#333333"];
    return [...hex, ...pad].slice(0, SWATCHES);
  } catch {
    return ["#000000","#ffffff","#cccccc","#666666","#999999","#333333"];
  }
}
