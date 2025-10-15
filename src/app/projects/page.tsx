import { getProjectSummaries } from "@/lib/mdx";
import { format } from "date-fns";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Projects",
  description: "A snapshot of security and AI programmes delivered end-to-end.",
};

export default async function Projects() {
  const projects = await getProjectSummaries();

  return (
    <section className="py-4">
      <header className="mb-5 text-center">
        <h1 className="display-5 mb-3">Projects &amp; Programmes</h1>
        <p className="lead text-muted">
          Selected engagements that blend cyber operations, automation, and measurable business outcomes.
        </p>
      </header>

      {projects.length === 0 ? (
        <p className="text-center text-muted">Project case studies are coming soon.</p>
      ) : (
        <div className="row g-4">
          {projects.map((project) => (
            <article key={project.slug} className="col-md-6">
              <div className="card h-100 shadow-sm border-0">
                <div className="card-body d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <time className="text-uppercase text-muted small">
                      {format(new Date(project.date), "MMMM yyyy")}
                    </time>
                    {project.status ? (
                      <span className="badge text-bg-dark">{project.status}</span>
                    ) : null}
                  </div>
                  <h2 className="h4">
                    <Link className="stretched-link text-decoration-none" href={`/projects/${project.slug}`}>
                      {project.title}
                    </Link>
                  </h2>
                  <p className="text-muted flex-grow-1">{project.summary}</p>
                  <div className="small text-muted mt-3">
                    {project.role ? <span className="d-block mb-1">Role: {project.role}</span> : null}
                    {project.stack?.length ? (
                      <ul className="list-inline mb-0">
                        {project.stack.map((tech) => (
                          <li key={tech} className="list-inline-item badge rounded-pill text-bg-secondary me-1">
                            {tech}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

