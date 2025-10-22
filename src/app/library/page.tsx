import { getLibrary, groupByYear } from "@/lib/library";
import Link from "next/link";

export const metadata = {
  title: "Library | Paula Livingstone",
  description: "Books, papers, and talks that shaped my thinking.",
  alternates: { canonical: "/library" },
};

export default async function LibraryPage() {
  const items = await getLibrary();

  if (!items.length) {
    return (
      <section className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="mb-8 text-3xl font-semibold">Library</h1>
        <p className="text-muted">Nothing logged yet.</p>
      </section>
    );
  }

  const byYear = groupByYear(items);
  const years = Object.keys(byYear).sort((a, b) => Number(b) - Number(a));

  return (
    <section className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="mb-8 text-3xl font-semibold">Library</h1>

      <div className="space-y-12">
        {years.map((year) => (
          <div key={year}>
            <h2 className="mb-4 text-lg font-semibold text-muted">{year}</h2>
            <ul className="space-y-3">
              {byYear[year].map((item) => (
                <li
                  key={`${year}-${item.title}`}
                  className="rounded-xl border border-graphite/40 p-4"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
                    <h3 className="text-base font-medium">
                      {item.link ? (
                        <Link
                          href={item.link}
                          target="_blank"
                          rel="noreferrer"
                          className="text-teal hover:underline"
                        >
                          {item.title}
                        </Link>
                      ) : (
                        item.title
                      )}
                    </h3>
                    <span className="text-sm text-muted">{item.author}</span>
                  </div>
                  {item.note ? (
                    <p className="mt-2 text-sm text-muted">{item.note}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
