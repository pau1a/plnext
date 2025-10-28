import { ensureSlug } from "./slugify";

export interface CategoryDefinition {
  slug: string;
  name: string;
  description?: string;
}

const CATEGORY_DEFINITIONS: CategoryDefinition[] = [
  {
    slug: "technical",
    name: "Technical",
    description: "Technical content including security, development, and operations.",
  },
  {
    slug: "personal",
    name: "Personal",
    description: "Personal reflections, experiences, and non-technical writing.",
  },
];

const CATEGORIES_BY_KEY = new Map<string, CategoryDefinition>();

for (const category of CATEGORY_DEFINITIONS) {
  CATEGORIES_BY_KEY.set(category.slug, category);
}

export function getAllCategories(): CategoryDefinition[] {
  return CATEGORY_DEFINITIONS.slice();
}

export function getCategoryBySlug(slug: string): CategoryDefinition | undefined {
  return CATEGORIES_BY_KEY.get(slug);
}

export function formatCategoryLabel(slug: string): string {
  return CATEGORIES_BY_KEY.get(slug)?.name ?? slug;
}

export function resolveCategorySlug(value: string): { category: string | null; invalid: boolean } {
  if (typeof value !== "string" || !value) {
    return { category: null, invalid: true };
  }

  const normalized = ensureSlug(value, value);
  const match = CATEGORIES_BY_KEY.get(normalized);

  if (match) {
    return { category: match.slug, invalid: false };
  }

  return { category: null, invalid: true };
}
