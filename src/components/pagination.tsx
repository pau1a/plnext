"use client";

import clsx from "clsx";
import Link from "next/link";

import { buildPageHref, DEFAULT_PAGE_PARAM } from "@/lib/pagination";

import styles from "./pagination.module.scss";

export interface PaginationProps {
  totalCount: number;
  pageSize: number;
  currentPage: number;
  basePath: string;
  pageParam?: string;
  className?: string;
  ariaLabel?: string;
}

const DEFAULT_ARIA_LABEL = "Pagination";

function createPageNumbers(totalPages: number) {
  return Array.from({ length: totalPages }, (_, index) => index + 1);
}

export function Pagination({
  totalCount,
  pageSize,
  currentPage,
  basePath,
  pageParam = DEFAULT_PAGE_PARAM,
  className,
  ariaLabel = DEFAULT_ARIA_LABEL,
}: PaginationProps) {
  if (pageSize <= 0 || totalCount <= pageSize) {
    return null;
  }

  const totalPages = Math.ceil(totalCount / pageSize);

  if (totalPages <= 1) {
    return null;
  }

  const safeCurrentPage = Math.min(Math.max(currentPage, 1), totalPages);
  const pages = createPageNumbers(totalPages);
  const previousPage = safeCurrentPage - 1;
  const nextPage = safeCurrentPage + 1;
  const previousHref = previousPage >= 1 ? buildPageHref(basePath, previousPage, pageParam) : null;
  const nextHref = safeCurrentPage < totalPages ? buildPageHref(basePath, nextPage, pageParam) : null;

  return (
    <nav aria-label={ariaLabel} className={clsx(styles.pagination, className)}>
      <ul className={styles.list}>
        <li className={styles.item}>
          {previousHref ? (
            <Link
              className={styles.button}
              href={previousHref}
              aria-label="Go to previous page"
              prefetch={false}
            >
              Previous
            </Link>
          ) : (
            <span className={clsx(styles.button, styles.buttonDisabled)} aria-disabled="true">
              Previous
            </span>
          )}
        </li>

        {pages.map((page) => {
          const isCurrent = page === safeCurrentPage;
          const href = buildPageHref(basePath, page, pageParam);

          return (
            <li key={page} className={styles.item}>
              {isCurrent ? (
                <span className={clsx(styles.button, styles.buttonActive)} aria-current="page">
                  {page}
                </span>
              ) : (
                <Link className={styles.button} href={href} aria-label={`Go to page ${page}`} prefetch={false}>
                  {page}
                </Link>
              )}
            </li>
          );
        })}

        <li className={styles.item}>
          {nextHref ? (
            <Link
              className={styles.button}
              href={nextHref}
              aria-label="Go to next page"
              prefetch={false}
            >
              Next
            </Link>
          ) : (
            <span className={clsx(styles.button, styles.buttonDisabled)} aria-disabled="true">
              Next
            </span>
          )}
        </li>
      </ul>
    </nav>
  );
}
