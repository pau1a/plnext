import { extractH2H3 } from "@/lib/mdx";

type Item = { id: string; text: string; level: 2 | 3 };

export default function LocalToc({ content }: { content: string }) {
  const items: Item[] = extractH2H3(content);

  if (!items.length) {
    return null;
  }

  return (
    <nav
      aria-label="On this page"
      className="mb-8 rounded-xl border border-graphite/40 p-4 text-sm"
    >
      <p className="mb-2 font-medium text-muted">On this page</p>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.id} className={item.level === 3 ? "pl-4" : undefined}>
            <a className="text-teal hover:underline" href={`#${item.id}`}>
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
