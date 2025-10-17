export const DEFAULT_PAGE_PARAM = "page" as const;

export type SearchParamRecord = Record<string, string | string[] | undefined>;

export interface PaginationState {
  /**
   * Total number of pages available for the provided dataset.
   * Always at least 1 to simplify downstream calculations.
   */
  totalPages: number;
  /**
   * The current page number after clamping to the available range.
   */
  currentPage: number;
  /**
   * Effective page size after guarding against invalid values.
   */
  pageSize: number;
  /**
   * Zero-based index marking the start of the slice for the current page.
   */
  startIndex: number;
  /**
   * Zero-based index marking the end (exclusive) of the slice for the current page.
   */
  endIndex: number;
}

export interface ResolvePaginationStateOptions {
  totalCount: number;
  pageSize: number;
  searchParams?: SearchParamRecord;
  pageParam?: string;
}

function extractPage(searchParams: SearchParamRecord | undefined, key: string) {
  const raw = searchParams?.[key];

  if (Array.isArray(raw)) {
    return raw[0];
  }

  return raw;
}

export function resolvePaginationState({
  totalCount,
  pageSize,
  searchParams,
  pageParam = DEFAULT_PAGE_PARAM,
}: ResolvePaginationStateOptions): PaginationState {
  const safePageSize = Number.isFinite(pageSize) && pageSize > 0 ? Math.floor(pageSize) : 1;

  const totalPagesRaw = totalCount > 0 ? Math.ceil(totalCount / safePageSize) : 0;
  const totalPages = Math.max(totalPagesRaw, 1);

  const parsed = Number.parseInt(extractPage(searchParams, pageParam) ?? "", 10);
  const currentPage = Number.isFinite(parsed) && parsed > 0 ? Math.min(parsed, totalPages) : 1;

  const startIndex = (currentPage - 1) * safePageSize;
  const endIndex = Math.min(startIndex + safePageSize, totalCount);

  return {
    totalPages,
    currentPage,
    pageSize: safePageSize,
    startIndex,
    endIndex,
  } satisfies PaginationState;
}

export function buildPageHref(basePath: string, page: number, pageParam: string = DEFAULT_PAGE_PARAM) {
  const params = new URLSearchParams();

  if (page > 1) {
    params.set(pageParam, String(page));
  }

  const query = params.toString();

  if (!query) {
    return basePath;
  }

  const separator = basePath.includes("?") ? "&" : "?";
  return `${basePath}${separator}${query}`;
}
