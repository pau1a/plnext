import ShowcaseThemeToggle from "@/components/showcase-theme-toggle";
import "@/styles/palettes/shared-demo.scss";
import "@/styles/palettes/slate-rust.scss";

export const metadata = {
  title: "Slate & Rust Palette",
  description: "Workshop Elegance demo pairing engineered greys with copper warmth.",
};

export default function SlateRustPalettePage() {
  return (
    <section className="palette-demo palette-demo--slate-rust">
      <header className="palette-demo__hero">
        <div className="palette-demo__hero-content">
          <span className="palette-demo__badge">Workshop Elegance</span>
          <h1 className="display-5 fw-bold">Slate &amp; Rust</h1>
          <p className="lead">
            Built for engineering narratives, this palette tempers industrial cool with the optimism of
            copper and electric accent notes.
          </p>
          <div>
            <button className="btn btn-primary btn-lg">Show build roadmap</button>
          </div>
        </div>
        <ShowcaseThemeToggle />
      </header>

      <section className="palette-demo__buttons">
        <h2 className="h5 text-uppercase fw-semibold m-0">Interface buttons</h2>
        <div className="palette-demo__buttons-group">
          <button className="btn btn-primary">Deploy update</button>
          <button className="btn btn-secondary">Stage prototype</button>
          <button className="btn btn-outline-primary">Log decision</button>
        </div>
      </section>

      <section className="palette-demo__cards">
        <h2 className="h5 text-uppercase fw-semibold m-0">Sample cards</h2>
        <div className="row g-3">
          <div className="col-md-4">
            <div className="card h-100">
              <div className="card-body">
                <h3 className="h5 card-title">Build iteration</h3>
                <p className="card-text">
                  Keep sprints accountable with structured updates and highlighted blockers.
                </p>
                <a href="#" className="btn btn-link p-0">
                  Review sprint <i className="fa-solid fa-arrow-right ms-1" aria-hidden />
                </a>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card h-100">
              <div className="card-body">
                <h3 className="h5 card-title">Lab insights</h3>
                <p className="card-text">
                  Surface experimentation notes with accent callouts for key learnings.
                </p>
                <a href="#" className="btn btn-link p-0">
                  Open findings <i className="fa-solid fa-arrow-right ms-1" aria-hidden />
                </a>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card h-100">
              <div className="card-body">
                <h3 className="h5 card-title">Partner updates</h3>
                <p className="card-text">
                  Present vendor status, agreements, and next steps with confident contrasts.
                </p>
                <a href="#" className="btn btn-link p-0">
                  View partners <i className="fa-solid fa-arrow-right ms-1" aria-hidden />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="palette-demo__typography">
        <h2 className="h5 text-uppercase fw-semibold m-0">Typography system</h2>
        <div>
          <h3 className="h2 fw-bold">Confidence for product conversations</h3>
          <p className="fs-5">
            Slate neutrals maintain technical credibility while rust accents echo hardware craft—ideal for
            engineering partnerships and progress recaps.
          </p>
          <p className="text-muted">
            The cobalt highlight keeps data links and CTAs energetic without overwhelming the base tone.
          </p>
        </div>
      </section>

      <footer className="palette-demo__footer">
        <span>
          <strong>Workshop Elegance</strong> palette preview
        </span>
        <span>
          © {new Date().getFullYear()} Paula Livingstone · Accent: <strong>Slate &amp; Rust</strong>
        </span>
      </footer>
    </section>
  );
}

