import Link from "next/link";

const palettes = [
  {
    slug: "graphite-teal",
    title: "Graphite & Teal",
    subtitle: "Instrumental Clarity",
    description: "Clean teal primaries with graphite neutrals built for dashboards and security tooling.",
  },
  {
    slug: "ink-crimson",
    title: "Ink & Crimson",
    subtitle: "Analyst's Notebook",
    description: "Scholarly warmth with assertive crimson actions for investigative storytelling.",
  },
  {
    slug: "slate-rust",
    title: "Slate & Rust",
    subtitle: "Workshop Elegance",
    description: "Industrial greys with copper warmth ideal for engineering and product case studies.",
  },
  {
    slug: "midnight-neon",
    title: "Midnight & Neon",
    subtitle: "Modern Synth",
    description: "Futuristic contrast with neon highlights that celebrate Paula's cutting-edge experiments.",
  },
];

export const metadata = {
  title: "Palette Prototypes",
  description: "Preview Paula's four colour system candidates in one place.",
};

export default function PaletteIndexPage() {
  return (
    <section className="row g-4">
      {palettes.map((palette) => (
        <div className="col-md-6" key={palette.slug}>
          <div className="card h-100 shadow-sm">
            <div className="card-body d-flex flex-column gap-2">
              <span className="text-uppercase text-muted small fw-semibold">{palette.subtitle}</span>
              <h2 className="h4 m-0">{palette.title}</h2>
              <p className="text-muted flex-grow-1">{palette.description}</p>
              <div>
                <Link href={`/palettes/${palette.slug}`} className="btn btn-dark">
                  View palette demo
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}

