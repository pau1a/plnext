import ShowcaseThemeToggle from "@/components/showcase-theme-toggle";
import "@/styles/palettes/shared-demo.scss";
import "@/styles/palettes/ink-crimson.scss";

export const metadata = {
  title: "Ink & Crimson Palette",
  description: "Analyst's Notebook demo balancing archival warmth with confident reds.",
};

export default function InkCrimsonPalettePage() {
  return (
    <section className="palette-demo palette-demo--ink-crimson">
      <header className="palette-demo__hero">
        <div className="palette-demo__hero-content">
          <span className="palette-demo__badge">Analyst&rsquo;s Notebook</span>
          <h1 className="display-5 fw-bold">Ink &amp; Crimson</h1>
          <p className="lead">
            Sober parchment tones pair with assertive crimson moments for storytelling that feels both
            archival and immediate.
          </p>
          <div>
            <button className="btn btn-primary btn-lg">Draft intelligence brief</button>
          </div>
        </div>
        <ShowcaseThemeToggle />
      </header>

      <section className="palette-demo__buttons">
        <h2 className="h5 text-uppercase fw-semibold m-0">Interface buttons</h2>
        <div className="palette-demo__buttons-group">
          <button className="btn btn-primary">Flag escalation</button>
          <button className="btn btn-secondary">Archive finding</button>
          <button className="btn btn-outline-primary">Share notebook</button>
        </div>
      </section>

      <section className="palette-demo__cards">
        <h2 className="h5 text-uppercase fw-semibold m-0">Sample cards</h2>
        <div className="row g-3">
          <div className="col-md-4">
            <div className="card h-100">
              <div className="card-body">
                <h3 className="h5 card-title">Narrative timeline</h3>
                <p className="card-text">
                  Chronicle incidents, responders, and outcomes with graceful spacing for dense notes.
                </p>
                <a href="#" className="btn btn-link p-0">
                  Expand sequence <i className="fa-solid fa-arrow-right ms-1" aria-hidden />
                </a>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card h-100">
              <div className="card-body">
                <h3 className="h5 card-title">Stakeholder log</h3>
                <p className="card-text">
                  Track decision makers with status markers that stay legible for cross-team sharing.
                </p>
                <a href="#" className="btn btn-link p-0">
                  View roster <i className="fa-solid fa-arrow-right ms-1" aria-hidden />
                </a>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card h-100">
              <div className="card-body">
                <h3 className="h5 card-title">Research drawer</h3>
                <p className="card-text">
                  Surface prior art and references without losing the crisp baseline for annotation.
                </p>
                <a href="#" className="btn btn-link p-0">
                  Open archive <i className="fa-solid fa-arrow-right ms-1" aria-hidden />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="palette-demo__typography">
        <h2 className="h5 text-uppercase fw-semibold m-0">Typography system</h2>
        <div>
          <h3 className="h2 fw-bold">Editorial calm with decisive calls-to-action</h3>
          <p className="fs-5">
            Subtle greys keep body copy gentle on the eyes, while crimson anchors attention on the next
            analytical step Paula wants stakeholders to take.
          </p>
          <p className="text-muted">
            Golden accents highlight quotes and metrics without overpowering the core narrative voice.
          </p>
        </div>
      </section>

      <footer className="palette-demo__footer">
        <span>
          <strong>Analyst&rsquo;s Notebook</strong> palette preview
        </span>
        <span>
          © {new Date().getFullYear()} Paula Livingstone · Accent: <strong>Ink &amp; Crimson</strong>
        </span>
      </footer>
    </section>
  );
}

