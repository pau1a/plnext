import { getProjectDocument, getProjectSlugs, getProjectSummaries } from "@/lib/mdx";
import { format } from "date-fns";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

interface ProjectPageProps {
  params: { slug: string };
}

export async function generateStaticParams() {
  return getProjectSlugs();
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const project = await getProjectDocument(params.slug);

  if (!project) {
    return {
      title: "Project not found",
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://paulalivingstone.com";

  return {
    title: project.title,
    description: project.summary,
    openGraph: {
      type: "article",
      title: project.title,
      description: project.summary,
      url: `${siteUrl}/projects/${project.slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: project.title,
      description: project.summary,
    },
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const project = await getProjectDocument(params.slug);

  if (!project) {
    notFound();
  }

  const otherProjects = (await getProjectSummaries()).filter((item) => item.slug !== project.slug);

  return (
    <article className="mx-auto" style={{ maxWidth: "760px" }}>
      <nav aria-label="Breadcrumb" className="mb-4 small text-uppercase">
        <Link className="text-decoration-none text-muted" href="/projects">
          ← Back to all projects
        </Link>
      </nav>

      <header className="mb-5">
        <h1 className="display-5 mb-3">{project.title}</h1>
        <p className="lead text-muted">{project.summary}</p>
        <dl className="row small text-muted">
          <div className="col-md-4 mb-2">
            <dt className="text-uppercase">Delivered</dt>
            <dd className="mb-0">{format(new Date(project.date), "MMMM d, yyyy")}</dd>
          </div>
          {project.role ? (
            <div className="col-md-4 mb-2">
              <dt className="text-uppercase">Role</dt>
              <dd className="mb-0">{project.role}</dd>
            </div>
          ) : null}
          {project.status ? (
            <div className="col-md-4 mb-2">
              <dt className="text-uppercase">Status</dt>
              <dd className="mb-0">{project.status}</dd>
            </div>
          ) : null}
        </dl>
        {project.stack?.length ? (
          <ul className="list-inline small text-muted mb-0">
            {project.stack.map((tech) => (
              <li key={tech} className="list-inline-item badge rounded-pill text-bg-dark me-1">
                {tech}
              </li>
            ))}
          </ul>
        ) : null}
      </header>

      <div className="prose mb-5">{project.content}</div>

      {otherProjects.length > 0 ? (
        <aside className="border-top pt-4">
          <h2 className="h5 mb-3">More client work</h2>
          <ul className="list-unstyled">
            {otherProjects.map((other) => (
              <li key={other.slug} className="mb-3">
                <Link className="text-decoration-none" href={`/projects/${other.slug}`}>
                  <span className="fw-semibold d-block">{other.title}</span>
                  <span className="text-muted small">{other.summary}</span>
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      ) : null}
    </article>
  );
}
