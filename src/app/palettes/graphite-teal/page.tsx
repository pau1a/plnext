import ShowcaseThemeToggle from "@/components/showcase-theme-toggle";
import "@/styles/palettes/shared-demo.scss";
import "@/styles/palettes/graphite-teal.scss";

export const metadata = {
  title: "Graphite & Teal Palette",
  description: "Instrumental Clarity demo with teal primaries and graphite neutrals.",
};

export default function GraphiteTealPalettePage() {
  return (
    <section className="palette-demo palette-demo--graphite-teal">
      <header className="palette-demo__hero">
        <div className="palette-demo__hero-content">
          <span className="palette-demo__badge">Instrumental Clarity</span>
          <h1 className="display-5 fw-bold">Graphite &amp; Teal</h1>
          <p className="lead">
            Precision-led teal actions sit on calm graphite foundations, keeping Paula&rsquo;s dashboards
            surgical and legible when the workday stretches long.
          </p>
          <div>
            <button className="btn btn-primary btn-lg">Launch instrumentation</button>
          </div>
        </div>
        <ShowcaseThemeToggle />
      </header>

      <section className="palette-demo__buttons">
        <h2 className="h5 text-uppercase fw-semibold m-0">Interface buttons</h2>
        <div className="palette-demo__buttons-group">
          <button className="btn btn-primary">Run live scan</button>
          <button className="btn btn-secondary">Save baseline</button>
          <button className="btn btn-outline-primary">Share insight</button>
        </div>
      </section>

      <section className="palette-demo__cards">
        <h2 className="h5 text-uppercase fw-semibold m-0">Sample cards</h2>
        <div className="row g-3">
          <div className="col-md-4">
            <div className="card h-100">
              <div className="card-body">
                <h3 className="h5 card-title">Threat surfaces</h3>
                <p className="card-text">
                  Monitor the organisation&rsquo;s live attack surface with anomaly markers for fast triage.
                </p>
                <a href="#" className="btn btn-link p-0">
                  Review heatmap <i className="fa-solid fa-arrow-right ms-1" aria-hidden />
                </a>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card h-100">
              <div className="card-body">
                <h3 className="h5 card-title">Device hygiene</h3>
                <p className="card-text">
                  Drill into compliance posture and remediate devices before they drift into risk zones.
                </p>
                <a href="#" className="btn btn-link p-0">
                  Audit endpoints <i className="fa-solid fa-arrow-right ms-1" aria-hidden />
                </a>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card h-100">
              <div className="card-body">
                <h3 className="h5 card-title">Executive summary</h3>
                <p className="card-text">
                  Give leaders clarity with risk scoring that balances technical depth and readability.
                </p>
                <a href="#" className="btn btn-link p-0">
                  Export report <i className="fa-solid fa-arrow-right ms-1" aria-hidden />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="palette-demo__typography">
        <h2 className="h5 text-uppercase fw-semibold m-0">Typography system</h2>
        <div>
          <h3 className="h2 fw-bold">Operational clarity without the glare</h3>
          <p className="fs-5">
            The graphite neutrals maintain contrast for charts, while teal signals reassure analysts that
            every click moves investigations forward.
          </p>
          <p className="text-muted">
            Supporting copy retains warmth thanks to the brass accent, ideal for stakeholder communications.
          </p>
        </div>
      </section>

      <footer className="palette-demo__footer">
        <span>
          <strong>Instrumental Clarity</strong> palette preview
        </span>
        <span>
          © {new Date().getFullYear()} Paula Livingstone · Accent: <strong>Graphite &amp; Teal</strong>
        </span>
      </footer>
    </section>
  );
}

