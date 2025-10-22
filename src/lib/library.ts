import fs from "fs/promises";

export type LibraryItem = {
  title: string;
  author: string;
  year: number;
  note?: string;
  link?: string;
};

export async function getLibrary(): Promise<LibraryItem[]> {
  const raw = await fs.readFile("content/library.json", "utf8");
  const items = JSON.parse(raw) as LibraryItem[];
  return items
    .filter((item) => item?.title && item?.author && typeof item?.year === "number")
    .sort((a, b) => b.year - a.year || a.title.localeCompare(b.title));
}

export function groupByYear(items: LibraryItem[]): Record<string, LibraryItem[]> {
  return items.reduce((acc, item) => {
    const key = String(item.year);
    (acc[key] ||= []).push(item);
    return acc;
  }, {} as Record<string, LibraryItem[]>);
}
