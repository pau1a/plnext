import { format, parseISO } from "date-fns";

const DEFAULT_PATTERN = "d MMM yyyy";

export function formatDate(isoDate: string, pattern = DEFAULT_PATTERN) {
  if (!isoDate) {
    return "";
  }

  const parsed = parseISO(isoDate);

  if (Number.isNaN(parsed.getTime())) {
    return isoDate;
  }

  return format(parsed, pattern);
}
