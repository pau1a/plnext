import fs from "node:fs/promises";
import path from "node:path";
import type { ReactElement } from "react";
import { compileMDX } from "next-mdx-remote/rsc";
import { format, parseISO } from "date-fns";
import remarkGfm from "remark-gfm";

import { resolveTagSlugs } from "./tags";

import { mdxComponents } from "./mdx-components";

const STREAM_FILE = path.join(process.cwd(), "content", "stream", "stream.jsonl");

export type Visibility = "PRIVATE" | "LIMITED" | "PUBLIC";

export type StreamSourceRecord = {
  id: string;
  timestamp: string;
  body: string;
  visibility?: Visibility;
  tags?: string[];
  media?: string[];
};

export type StreamEntry = {
  id: string;
  timestamp: string;
  body: string;
  visibility: Visibility;
  tags: string[];
  media?: string[];
  anchor: string;
  content: ReactElement;
};

function normaliseVisibility(value: Visibility | undefined): Visibility {
  if (value === "PUBLIC" || value === "LIMITED" || value === "PRIVATE") {
    return value;
  }

  return "PRIVATE";
}

async function readFileSafe(filePath: string) {
  try {
    return await fs.readFile(filePath, "utf8");
  } catch (error: unknown) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return "";
    }

    throw error;
  }
}

export async function parseJSONL(filePath: string): Promise<StreamSourceRecord[]> {
  const raw = await readFileSafe(filePath);
  if (!raw) {
    return [];
  }

  const lines = raw.split(/\r?\n/);
  const records: StreamSourceRecord[] = [];

  for (let index = 0; index < lines.length; index += 1) {
    const candidate = lines[index]?.trim();

    if (!candidate || candidate.startsWith("//") || candidate.startsWith("#")) {
      continue;
    }

    try {
      const parsed = JSON.parse(candidate) as StreamSourceRecord;
      records.push(parsed);
    } catch (error) {
      throw new Error(`Invalid JSON on line ${index + 1} of ${filePath}: ${(error as Error).message}`);
    }
  }

  return records;
}

export async function renderMarkdown(source: string): Promise<ReactElement> {
  const { content } = await compileMDX({
    source,
    components: mdxComponents,
    options: {
      parseFrontmatter: false,
      mdxOptions: {
        remarkPlugins: [remarkGfm],
      },
    },
  });

  return content as ReactElement;
}

const HASHTAG_PATTERN = /(^|[^\w])#([\p{L}\p{N}_-]{1,64})/gu;

export function extractHashtags(body: string): string[] {
  const tags = new Set<string>();
  let match: RegExpExecArray | null;

  while ((match = HASHTAG_PATTERN.exec(body)) !== null) {
    const [, prefix, tag] = match;

    if (prefix && /[`\[]/.test(prefix)) {
      continue;
    }

    tags.add(tag);
  }

  return Array.from(tags);
}

export function formatDateTime(isoDate: string) {
  if (!isoDate) {
    return "";
  }

  const parsed = parseISO(isoDate);

  if (Number.isNaN(parsed.getTime())) {
    return isoDate;
  }

  return format(parsed, "d MMM yyyy, HH:mm");
}

function compareByTimestampDesc(a: StreamEntry, b: StreamEntry) {
  return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
}

export async function loadStream(): Promise<StreamEntry[]> {
  const sources = await parseJSONL(STREAM_FILE);

  const entries = await Promise.all(
    sources.map(async (record): Promise<StreamEntry | null> => {
      const visibility = normaliseVisibility(record.visibility);

      if (visibility !== "PUBLIC") {
        return null;
      }

      const hashtags = extractHashtags(record.body);
      const { tags: resolvedTags } = resolveTagSlugs([...(record.tags ?? []), ...hashtags]);
      const content = await renderMarkdown(record.body);

      return {
        ...record,
        visibility,
        tags: resolvedTags,
        anchor: `#${record.id}`,
        content,
      } satisfies StreamEntry;
    }),
  );

  return entries
    .filter((entry): entry is StreamEntry => entry !== null)
    .sort(compareByTimestampDesc);
}
