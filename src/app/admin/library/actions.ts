"use server";

import fs from "node:fs/promises";
import path from "node:path";

import { revalidatePath } from "next/cache";

import { requirePermission } from "@/lib/auth/server";
import type { LibraryItem } from "@/lib/library";

const LIBRARY_PATH = path.join(process.cwd(), "content", "library.json");

interface LibraryActionState {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Partial<Record<"title" | "author" | "year" | "link" | "note", string>>;
}

export async function createLibraryItemAction(
  _prevState: LibraryActionState,
  formData: FormData,
): Promise<LibraryActionState> {
  await requirePermission("audit:read");

  const rawTitle = formData.get("title");
  const rawAuthor = formData.get("author");
  const rawYear = formData.get("year");
  const rawLink = formData.get("link");
  const rawNote = formData.get("note");

  const fieldErrors: LibraryActionState["fieldErrors"] = {};

  const title = typeof rawTitle === "string" ? rawTitle.trim() : "";
  if (!title) {
    fieldErrors.title = "Title is required.";
  }

  const author = typeof rawAuthor === "string" ? rawAuthor.trim() : "";
  if (!author) {
    fieldErrors.author = "Author is required.";
  }

  const yearValue = typeof rawYear === "string" ? rawYear.trim() : "";
  let yearNumber: number | undefined;
  if (yearValue) {
    yearNumber = Number(yearValue);
    if (!Number.isFinite(yearNumber) || !Number.isInteger(yearNumber)) {
      fieldErrors.year = "Year must be a whole number.";
    } else if (yearNumber < 0 || yearNumber > 9999) {
      fieldErrors.year = "Year must be between 0 and 9999.";
    }
  }

  const link = typeof rawLink === "string" ? rawLink.trim() : "";
  if (link) {
    try {
      new URL(link);
    } catch {
      fieldErrors.link = "Provide a valid URL or leave this blank.";
    }
  }

  const note = typeof rawNote === "string" ? rawNote.trim() : "";

  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: "error",
      message: "Please correct the highlighted fields.",
      fieldErrors,
    };
  }

  let items: LibraryItem[];
  try {
    items = await readLibraryFile();
  } catch (error) {
    console.error("Failed to read library.json", error);
    return {
      status: "error",
      message: "Unable to load the existing library entries. Try again shortly.",
    };
  }

  const duplicate = items.find(
    (item) =>
      item.title.toLocaleLowerCase() === title.toLocaleLowerCase() &&
      item.author.toLocaleLowerCase() === author.toLocaleLowerCase() &&
      item.year === yearNumber &&
      (yearNumber !== undefined || item.year === undefined),
  );

  if (duplicate) {
    return {
      status: "error",
      message: "This item already exists in the library.",
    };
  }

  const newItem: LibraryItem = {
    title,
    author,
    ...(yearNumber !== undefined ? { year: yearNumber } : {}),
    ...(link ? { link } : {}),
    ...(note ? { note } : {}),
  };

  const updatedItems = [...items, newItem].sort((a, b) => {
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

  try {
    await writeLibraryFile(updatedItems);
  } catch (error) {
    console.error("Failed to write library.json", error);
    return {
      status: "error",
      message: "Could not save the new item. Please try again.",
    };
  }

  revalidatePath("/library");
  revalidatePath("/admin/library");

  return {
    status: "success",
    message: "Library item saved.",
  };
}

async function readLibraryFile(): Promise<LibraryItem[]> {
  const raw = await fs.readFile(LIBRARY_PATH, "utf8");
  const parsed: unknown = JSON.parse(raw);

  if (!Array.isArray(parsed)) {
    throw new Error("Library data is not an array.");
  }

  return parsed
    .map((entry) => normalizeLibraryEntry(entry))
    .filter((entry): entry is LibraryItem => Boolean(entry));
}

function normalizeLibraryEntry(entry: unknown): LibraryItem | null {
  if (typeof entry !== "object" || entry === null) {
    return null;
  }

  const candidate = entry as Record<string, unknown>;
  const title = typeof candidate.title === "string" ? candidate.title.trim() : "";
  const author = typeof candidate.author === "string" ? candidate.author.trim() : "";
  const rawYear = typeof candidate.year === "number" ? candidate.year : Number(candidate.year);
  const year = Number.isFinite(rawYear) ? Math.trunc(rawYear) : undefined;
  const link = typeof candidate.link === "string" ? candidate.link.trim() : undefined;
  const note = typeof candidate.note === "string" ? candidate.note.trim() : undefined;

  if (!title || !author) {
    return null;
  }

  const normalized: LibraryItem = {
    title,
    author,
  };

  if (year !== undefined) {
    normalized.year = year;
  }

  if (link) {
    normalized.link = link;
  }

  if (note) {
    normalized.note = note;
  }

  return normalized;
}

async function writeLibraryFile(items: LibraryItem[]): Promise<void> {
  const serialized = `${JSON.stringify(items, null, 2)}\n`;
  const tempPath = `${LIBRARY_PATH}.tmp`;

  await fs.writeFile(tempPath, serialized, "utf8");
  await fs.rename(tempPath, LIBRARY_PATH);
}
