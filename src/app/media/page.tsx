import { getMediaBios, getMediaAssets, formatBytes } from "@/lib/media";

export const metadata = {
  title: "Media | Paula Livingstone",
  description: "Press bios, headshots, and logos.",
  robots: { index: false, follow: true },
  alternates: { canonical: "/media" },
};

export default async function MediaPage() {
  const bios = await getMediaBios();
  const assets = await getMediaAssets();

  return (
    <section className="mx-auto max-w-3xl space-y-10 px-6 py-16">
      <header>
        <h1 className="text-3xl font-semibold">Media</h1>
        <p className="text-muted mt-2">Press bios, headshots, and logos for publication.</p>
      </header>

      <div className="space-y-4">
        <h2 className="text-lg font-medium">Bios</h2>
        <div className="space-y-3">
          <div>
            <h3 className="text-sm text-muted">One-liner</h3>
            <p>{bios.oneLiner}</p>
          </div>
          <div>
            <h3 className="text-sm text-muted">Short</h3>
            <p>{bios.short}</p>
          </div>
          <div>
            <h3 className="text-sm text-muted">Long</h3>
            <p>{bios.long}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-medium">Assets</h2>
        <ul className="grid gap-3">
          {assets.map((asset) => (
            <li
              key={asset.path}
              className="flex items-center justify-between rounded-xl border border-graphite/40 p-3"
            >
              <a
                href={asset.path}
                className="text-teal hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-teal focus-visible:ring-offset-neutral-950"
              >
                {asset.label}
              </a>
              <span className="text-xs text-muted">{formatBytes(asset.bytes)}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
