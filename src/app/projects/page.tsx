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

const BASE_METADATA: Pick<Metadata, "title" | "description"> = {
  title: "Projects",
  description: "A snapshot of security and AI programmes delivered end-to-end.",
};

type SearchParamsInput = SearchParamRecord | Promise<SearchParamRecord> | undefined;

interface ProjectsPageProps {
  searchParams?: SearchParamsInput;
}

async function resolveSearchParams(
  searchParams: SearchParamsInput,
): Promise<SearchParamRecord | undefined> {
  if (!searchParams) {
    return undefined;
  }

  if (typeof (searchParams as Promise<SearchParamRecord>).then === "function") {
    return searchParams as Promise<SearchParamRecord>;
  }

  return searchParams as SearchParamRecord;
}

export async function generateMetadata({ searchParams }: ProjectsPageProps): Promise<Metadata> {
  const projects = await getProjectSummaries();
  const totalCount = projects.length;
  const resolvedSearchParams = await resolveSearchParams(searchParams);
  const state = resolvePaginationState({
    totalCount,
    pageSize: PAGE_SIZE,
    searchParams: resolvedSearchParams,
    pageParam: PAGE_PARAM,
  });

  const previous = state.currentPage > 1 ? buildPageHref(BASE_PATH, state.currentPage - 1, PAGE_PARAM) : undefined;
  const hasNext = totalCount > 0 && state.currentPage < state.totalPages;
  const next = hasNext ? buildPageHref(BASE_PATH, state.currentPage + 1, PAGE_PARAM) : undefined;

  return {
    ...BASE_METADATA,
    ...(previous || next ? { pagination: { previous, next } } : {}),
  };
}

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
  const projects = await getProjectSummaries();
  const totalCount = projects.length;
  const resolvedSearchParams = await resolveSearchParams(searchParams);
  const state = resolvePaginationState({
    totalCount,
    pageSize: PAGE_SIZE,
    searchParams: resolvedSearchParams,
    pageParam: PAGE_PARAM,
  });

  const hasProjects = totalCount > 0;
  const visibleProjects = hasProjects ? projects.slice(state.startIndex, state.endIndex) : [];

  return (
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
  );
}
