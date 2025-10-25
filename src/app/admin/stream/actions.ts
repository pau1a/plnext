"use server";

import fs from "node:fs/promises";
import path from "node:path";

import { revalidatePath } from "next/cache";

import { requirePermission } from "@/lib/auth/server";
import { resolveTagSlugs } from "@/lib/tags";
import { parseJSONL } from "@/lib/stream";
import type { StreamSourceRecord } from "@/lib/stream";

const STREAM_FILE = path.join(process.cwd(), "content", "stream", "stream.jsonl");

interface StreamActionState {
  status: "idle" | "success" | "error";
  message?: string;
}

export async function updateStreamAction(
  _prevState: StreamActionState,
  formData: FormData,
): Promise<StreamActionState> {
  await requirePermission("audit:read");

  const existingRecords = await parseJSONL(STREAM_FILE);
  const existingMap = new Map(existingRecords.map((record) => [record.id, record]));
  const entryIds = formData.getAll("entryId").map((value) => String(value));

  const nextRecords: StreamSourceRecord[] = [];

  for (let index = 0; index < entryIds.length; index += 1) {
    const id = entryIds[index];
    const timestampField = formData.get(`timestamp-${index}`);
    const bodyField = formData.get(`body-${index}`);
    const visibilityField = formData.get(`visibility-${index}`);
    const tagsField = formData.get(`tags-${index}`);

    const resolved = normaliseEntry({
      id,
      timestamp: typeof timestampField === "string" ? timestampField : "",
      body: typeof bodyField === "string" ? bodyField : "",
      visibility: typeof visibilityField === "string" ? visibilityField : "",
      tags: typeof tagsField === "string" ? tagsField : "",
    });

    if (!resolved.ok) {
      return { status: "error", message: resolved.error };
    }

    const existing = existingMap.get(id);
    const merged: StreamSourceRecord = {
      ...resolved.entry,
      media: existing?.media,
    };

    nextRecords.push(merged);
    existingMap.delete(id);
  }

  for (const record of existingMap.values()) {
    nextRecords.push(record);
  }

  nextRecords.sort((a, b) => b.timestamp.localeCompare(a.timestamp));

  try {
    await fs.mkdir(path.dirname(STREAM_FILE), { recursive: true });
    const serialized = nextRecords.map((entry) => JSON.stringify(entry)).join("\n");
    await fs.writeFile(STREAM_FILE, serialized ? `${serialized}\n` : "", "utf8");
  } catch {
    return { status: "error", message: "Failed to write stream file." };
  }

  revalidatePath("/admin/stream");
  revalidatePath("/stream");
  revalidatePath("/");

  return { status: "success", message: "Stream updated successfully." };
}

function normaliseEntry(entry: { id: string; timestamp: string; body: string; visibility: string; tags: string }):
  | { ok: true; entry: StreamSourceRecord }
  | { ok: false; error: string } {
  const id = entry.id.trim();
  const timestampRaw = entry.timestamp.trim();
  const body = entry.body;
  const visibility = normaliseVisibility(entry.visibility);

  if (!id) {
    return { ok: false, error: "Stream entry ID is required." };
  }

  if (!timestampRaw || Number.isNaN(Date.parse(timestampRaw))) {
    return { ok: false, error: "Timestamp must be a valid ISO date." };
  }

  const timestamp = new Date(timestampRaw).toISOString();

  if (!body.trim()) {
    return { ok: false, error: "Stream entry body cannot be empty." };
  }

  const tagValues = entry.tags
    .split(/[\n,]+/)
    .map((tag) => tag.trim())
    .filter(Boolean);
  const { tags, invalid } = resolveTagSlugs(tagValues);
  if (invalid.length > 0) {
    return {
      ok: false,
      error: `Unknown tags: ${invalid.join(", ")}. Update the tag registry before using new tags.`,
    };
  }

  return {
    ok: true,
    entry: {
      id,
      timestamp,
      body,
      visibility,
      tags,
    },
  };
}

function normaliseVisibility(value: string | null | undefined): "PUBLIC" | "LIMITED" | "PRIVATE" {
  if (value === "PUBLIC" || value === "LIMITED" || value === "PRIVATE") {
    return value;
  }
  return "PRIVATE";
}
