import { Pagination } from "@/components/pagination";
import { ProjectCard } from "@/components/project-card";
import cardStyles from "@/components/card.module.scss";
import { getProjectSummaries } from "@/lib/mdx";
import {
  buildPageHref,
  DEFAULT_PAGE_PARAM,
  resolvePaginationState,
  type SearchParamRecord,
} from "@/lib/pagination";
import type { Metadata } from "next";

const BASE_PATH = "/projects";
const PAGE_SIZE = 6;
const PAGE_PARAM = DEFAULT_PAGE_PARAM;

const BASE_METADATA: Metadata = {
  title: "Projects",
  description: "A snapshot of security and AI programmes delivered end-to-end.",
  alternates: {
    canonical: BASE_PATH,
  },
  openGraph: {
    title: "Projects",
    description: "A snapshot of security and AI programmes delivered end-to-end.",
    url: BASE_PATH,
    images: [
      {
        url: "/window.svg",
        width: 1200,
        height: 630,
        alt: "Paula Livingstone window mark",
      },
    ],
  },
  twitter: {
    title: "Projects",
    description: "A snapshot of security and AI programmes delivered end-to-end.",
    images: ["/window.svg"],
  },
};

type SearchParamsInput = SearchParamRecord | Promise<SearchParamRecord> | undefined;

interface ProjectsPageProps {
  searchParams?: SearchParamsInput;
}

async function normalizeSearchParams(
  searchParams: SearchParamsInput,
): Promise<SearchParamRecord | undefined> {
  if (!searchParams) {
    return undefined;
  }

  const candidate = searchParams as Promise<SearchParamRecord> | SearchParamRecord;
  return typeof (candidate as Promise<SearchParamRecord>)?.then === "function"
    ? await (candidate as Promise<SearchParamRecord>)
    : (candidate as SearchParamRecord);
}

export async function generateMetadata({ searchParams }: ProjectsPageProps): Promise<Metadata> {
  const projects = await getProjectSummaries();
  const totalCount = projects.length;
  const resolvedSearchParams = await normalizeSearchParams(searchParams);
  const state = resolvePaginationState({
    totalCount,
    pageSize: PAGE_SIZE,
    searchParams: resolvedSearchParams,
    pageParam: PAGE_PARAM,
  });

  const previous = state.currentPage > 1 ? buildPageHref(BASE_PATH, state.currentPage - 1, PAGE_PARAM) : undefined;
  const hasNext = totalCount > 0 && state.currentPage < state.totalPages;
  const next = hasNext ? buildPageHref(BASE_PATH, state.currentPage + 1, PAGE_PARAM) : undefined;
  const canonicalPath = state.currentPage > 1 ? buildPageHref(BASE_PATH, state.currentPage, PAGE_PARAM) : BASE_PATH;

  return {
    ...BASE_METADATA,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      ...BASE_METADATA.openGraph,
      url: canonicalPath,
    },
    twitter: {
      ...BASE_METADATA.twitter,
    },
    ...(previous || next ? { pagination: { previous, next } } : {}),
  };
}

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
  const projects = await getProjectSummaries();
  const totalCount = projects.length;
  const resolvedSearchParams = await normalizeSearchParams(searchParams);
  const state = resolvePaginationState({
    totalCount,
    pageSize: PAGE_SIZE,
    searchParams: resolvedSearchParams,
    pageParam: PAGE_PARAM,
  });

  const hasProjects = totalCount > 0;
  const visibleProjects = hasProjects ? projects.slice(state.startIndex, state.endIndex) : [];

  return (
    <div className="l-container motion-fade-in u-pad-block-3xl">
      <section className="u-stack u-gap-2xl">
        <header className="u-stack u-gap-sm u-text-center u-mb-3xl">
          <h1 className="heading-display-lg">Projects &amp; Programmes</h1>
          <p className="u-text-lead u-center u-max-w-md">
            Selected engagements that blend cyber operations, automation, and measurable business outcomes.
          </p>
        </header>

        {hasProjects ? (
          <div className={`${cardStyles.cardGrid} ${cardStyles.cardGridProjects}`}>
            {visibleProjects.map((project) => (
              <ProjectCard key={project.slug} summary={project} />
            ))}
          </div>
        ) : (
          <p className="u-text-center u-text-muted">Project case studies are coming soon.</p>
        )}

        {hasProjects ? (
          <Pagination
            totalCount={totalCount}
            pageSize={state.pageSize}
            currentPage={state.currentPage}
            basePath={BASE_PATH}
            pageParam={PAGE_PARAM}
          />
        ) : null}
      </section>
    </div>
  );
}
