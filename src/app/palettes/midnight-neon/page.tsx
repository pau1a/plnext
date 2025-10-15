import ShowcaseThemeToggle from "@/components/showcase-theme-toggle";
import "@/styles/palettes/shared-demo.scss";
import "@/styles/palettes/midnight-neon.scss";

export const metadata = {
  title: "Midnight & Neon Palette",
  description: "Modern Synth demo spotlighting Paula's most experimental work.",
};

export default function MidnightNeonPalettePage() {
  return (
    <section className="palette-demo palette-demo--midnight-neon">
      <header className="palette-demo__hero">
        <div className="palette-demo__hero-content">
          <span className="palette-demo__badge">Modern Synth</span>
          <h1 className="display-5 fw-bold">Midnight &amp; Neon</h1>
          <p className="lead">
            Sleek night-sky surfaces light up with neon energy, perfect for showcasing Paula&rsquo;s frontier
            experiments and AI prototypes.
          </p>
          <div>
            <button className="btn btn-primary btn-lg">Explore lab console</button>
          </div>
        </div>
        <ShowcaseThemeToggle />
      </header>

      <section className="palette-demo__buttons">
        <h2 className="h5 text-uppercase fw-semibold m-0">Interface buttons</h2>
        <div className="palette-demo__buttons-group">
          <button className="btn btn-primary">Generate insight</button>
          <button className="btn btn-secondary">Queue synthwave</button>
          <button className="btn btn-outline-primary">Broadcast update</button>
        </div>
      </section>

      <section className="palette-demo__cards">
        <h2 className="h5 text-uppercase fw-semibold m-0">Sample cards</h2>
        <div className="row g-3">
          <div className="col-md-4">
            <div className="card h-100">
              <div className="card-body">
                <h3 className="h5 card-title">Signal monitor</h3>
                <p className="card-text">
                  Real-time stream of model telemetry with neon pulses for anomalous activity.
                </p>
                <a href="#" className="btn btn-link p-0">
                  Watch channel <i className="fa-solid fa-arrow-right ms-1" aria-hidden />
                </a>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card h-100">
              <div className="card-body">
                <h3 className="h5 card-title">Prototype queue</h3>
                <p className="card-text">
                  Highlight experiments in motion with crisp hierarchy for cross-discipline reviews.
                </p>
                <a href="#" className="btn btn-link p-0">
                  View backlog <i className="fa-solid fa-arrow-right ms-1" aria-hidden />
                </a>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card h-100">
              <div className="card-body">
                <h3 className="h5 card-title">Launch moments</h3>
                <p className="card-text">
                  Celebrate milestones with gradient overlays that stay accessible in motion.
                </p>
                <a href="#" className="btn btn-link p-0">
                  Plan release <i className="fa-solid fa-arrow-right ms-1" aria-hidden />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="palette-demo__typography">
        <h2 className="h5 text-uppercase fw-semibold m-0">Typography system</h2>
        <div>
          <h3 className="h2 fw-bold">Futuristic theatre with disciplined usability</h3>
          <p className="fs-5">
            Midnight surfaces let neon strokes sing while maintaining enough restraint for complex
            command panels and performance dashboards.
          </p>
          <p className="text-muted">
            Accent magenta punctuates taglines and CTAs, keeping the brand voice bold and unmistakable.
          </p>
        </div>
      </section>

      <footer className="palette-demo__footer">
        <span>
          <strong>Modern Synth</strong> palette preview
        </span>
        <span>
          © {new Date().getFullYear()} Paula Livingstone · Accent: <strong>Midnight &amp; Neon</strong>
        </span>
      </footer>
    </section>
  );
}

