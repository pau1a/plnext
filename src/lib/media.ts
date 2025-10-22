import fs from "fs/promises";
import path from "path";

export type MediaBios = { oneLiner: string; short: string; long: string };
export type MediaAsset = { label: string; path: string; bytes: number };

export async function getMediaBios(): Promise<MediaBios> {
  const raw = await fs.readFile("content/media/bios.json", "utf8");
  return JSON.parse(raw);
}

export async function getMediaAssets(): Promise<MediaAsset[]> {
  const raw = await fs.readFile("content/media/assets.json", "utf8");
  const items: MediaAsset[] = JSON.parse(raw);
  await Promise.all(
    items.map(async (item) => {
      if (item.bytes === 0 && item.path.startsWith("/")) {
        try {
          const relative = item.path.slice(1);
          const stat = await fs.stat(path.join("public", relative));
          item.bytes = stat.size;
        } catch {
          // ignore missing file sizes
        }
      }
    }),
  );
  return items;
}

export const formatBytes = (n: number) =>
  n
    ? n < 1024
      ? `${n} B`
      : n < 1_048_576
        ? `${(n / 1024).toFixed(1)} KB`
        : `${(n / 1_048_576).toFixed(1)} MB`
    : "";
