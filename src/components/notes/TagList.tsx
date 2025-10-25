import clsx from "clsx";

import { formatTagLabel } from "@/lib/tags";

interface TagListProps {
  tags?: string[];
  className?: string;
  ariaLabel?: string;
}

export function TagList({ tags, className, ariaLabel = "Tags" }: TagListProps) {
  if (!tags?.length) {
    return null;
  }

  return (
    <ul className={clsx("tag-list", className)} aria-label={ariaLabel}>
      {tags.map((tag) => (
        <li key={tag} className="tag-list__item">
          {formatTagLabel(tag)}
        </li>
      ))}
    </ul>
  );
}
