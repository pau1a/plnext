import fs from "fs/promises";

export type LibraryItem = {
  title: string;
  author: string;
  year?: number;
  note?: string;
  link?: string;
};

export async function getLibrary(): Promise<LibraryItem[]> {
  const raw = await fs.readFile("content/library.json", "utf8");
  const items = JSON.parse(raw) as LibraryItem[];
  return items
    .filter((item) => item?.title && item?.author)
    .sort((a, b) => {
      // Items with year come before items without year
      if (typeof a.year === "number" && typeof b.year !== "number") return -1;
      if (typeof a.year !== "number" && typeof b.year === "number") return 1;
      // Both have years: sort by year descending, then title ascending
      if (typeof a.year === "number" && typeof b.year === "number") {
        return b.year - a.year || a.title.localeCompare(b.title);
      }
      // Neither has year: sort by title ascending
      return a.title.localeCompare(b.title);
    });
}

export function groupByYear(items: LibraryItem[]): Record<string, LibraryItem[]> {
  return items.reduce((acc, item) => {
    const key = typeof item.year === "number" ? String(item.year) : "Unknown";
    (acc[key] ||= []).push(item);
    return acc;
  }, {} as Record<string, LibraryItem[]>);
}
