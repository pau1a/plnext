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
    <section className="u-stack u-gap-2xl">
      <header className="u-stack u-gap-sm u-text-center u-mb-3xl">
        <h1 className="heading-display-lg">Projects &amp; Programmes</h1>
        <p className="u-text-lead u-center u-max-w-md">
          Selected engagements that blend cyber operations, automation, and measurable business outcomes.
        </p>
      </header>

      {projects.length === 0 ? (
        <p className="u-text-center u-text-muted">Project case studies are coming soon.</p>
      ) : (
        <div className="layout-grid layout-grid--two">
          {projects.map((project) => (
            <article key={project.slug} className="surface surface--interactive">
              <Link className="surface__link" href={`/projects/${project.slug}`}>
                <div className="u-flex u-justify-between u-items-center u-gap-md">
                  <time className="u-text-uppercase u-text-xs u-text-muted">
                    {format(new Date(project.date), "MMMM yyyy")}
                  </time>
                  {project.status ? <span className="chip chip--contrast">{project.status}</span> : null}
                </div>
                <h2 className="heading-section">{project.title}</h2>
                <p className="u-text-muted u-flex-grow-1">{project.summary}</p>
                <div className="u-stack u-gap-xs u-text-sm u-text-muted">
                  {project.role ? <span className="u-font-medium">Role: {project.role}</span> : null}
                  {project.stack?.length ? (
                    <ul className="tag-list">
                      {project.stack.map((tech) => (
                        <li key={tech} className="tag-list__item">
                          {tech}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </Link>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
