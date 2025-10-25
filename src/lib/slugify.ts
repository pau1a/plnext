const FALLBACK_SLUG = "untitled";

function stripDiacritics(value: string): string {
  // Normalize and remove diacritics so slug generation stays ASCII-friendly.
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
}

export function slugify(input: string | null | undefined, fallback = FALLBACK_SLUG): string {
  if (!input) {
    return fallback;
  }

  const base = stripDiacritics(input)
    .toLowerCase()
    .replace(/[']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return base || fallback;
}

export function ensureSlug(input: string | null | undefined, fallbackSource: string): string {
  const fallback = slugify(fallbackSource ?? FALLBACK_SLUG, FALLBACK_SLUG);
  return slugify(input, fallback);
}
