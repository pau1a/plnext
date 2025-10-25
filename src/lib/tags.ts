import { ensureSlug } from "./slugify";

export interface TagDefinition {
  slug: string;
  name: string;
  description?: string;
  aliases?: string[];
}

const TAG_DEFINITIONS: TagDefinition[] = [
  {
    slug: "application-security",
    name: "Application Security",
    description: "Hardening web platforms and application layers.",
  },
  {
    slug: "devsecops",
    name: "DevSecOps",
    description: "Blending delivery speed with security automation.",
  },
  {
    slug: "operations",
    name: "Operations",
    description: "Operational playbooks, telemetry, and incident response.",
    aliases: ["ops"],
  },
  {
    slug: "writing",
    name: "Writing",
    description: "Meta updates about the writing process and publishing pipeline.",
  },
  {
    slug: "stream",
    name: "Stream",
    description: "Short-form updates that land in the public stream.",
  },
  {
    slug: "process",
    name: "Process",
    description: "Improving workflows and collaboration.",
  },
  {
    slug: "experiments",
    name: "Experiments",
    description: "Trials, prototypes, and in-flight explorations.",
  },
];

const TAGS_BY_KEY = new Map<string, TagDefinition>();

for (const tag of TAG_DEFINITIONS) {
  TAGS_BY_KEY.set(tag.slug, tag);
  if (tag.aliases) {
    for (const alias of tag.aliases) {
      TAGS_BY_KEY.set(alias, tag);
    }
  }
}

export function getAllTags(): TagDefinition[] {
  return TAG_DEFINITIONS.slice();
}

export function getTagBySlug(slug: string): TagDefinition | undefined {
  return TAGS_BY_KEY.get(slug);
}

export function formatTagLabel(slug: string): string {
  return TAGS_BY_KEY.get(slug)?.name ?? slug;
}

export function resolveTagSlugs(values: Iterable<string>): { tags: string[]; invalid: string[] } {
  const resolved = new Set<string>();
  const invalid: string[] = [];

  for (const value of values) {
    if (typeof value !== "string") {
      continue;
    }

    const normalized = ensureSlug(value, value);
    const match = TAGS_BY_KEY.get(normalized);

    if (match) {
      resolved.add(match.slug);
    } else if (normalized) {
      invalid.push(normalized);
    }
  }

  return { tags: Array.from(resolved), invalid };
}
