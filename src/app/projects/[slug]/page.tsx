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
    <div className="l-container motion-fade-in u-pad-block-3xl">
      <article className="u-stack u-gap-2xl u-max-w-lg u-center">
        <nav aria-label="Breadcrumb" className="u-text-sm u-text-muted">
          <Link className="u-inline-flex u-items-center u-gap-xs" href="/projects">
            <i className="fa-solid fa-arrow-left" aria-hidden="true" />
            <span>Back to all projects</span>
          </Link>
        </nav>

        <header className="u-stack u-gap-md">
          <h1 className="heading-display-lg">{project.title}</h1>
          <p className="u-text-lead">{project.summary}</p>
          <dl className="u-flex u-flex-wrap u-gap-lg u-text-sm u-text-muted">
            <div className="u-stack u-gap-2xs">
              <dt className="u-text-uppercase u-letter-wide u-text-xs">Delivered</dt>
              <dd>{format(new Date(project.date), "MMMM d, yyyy")}</dd>
            </div>
            {project.role ? (
              <div className="u-stack u-gap-2xs">
                <dt className="u-text-uppercase u-letter-wide u-text-xs">Role</dt>
                <dd>{project.role}</dd>
              </div>
            ) : null}
            {project.status ? (
              <div className="u-stack u-gap-2xs">
                <dt className="u-text-uppercase u-letter-wide u-text-xs">Status</dt>
                <dd>{project.status}</dd>
              </div>
            ) : null}
          </dl>
          {project.stack?.length ? (
            <ul className="tag-list">
              {project.stack.map((tech) => (
                <li key={tech} className="tag-list__item">
                  {tech}
                </li>
              ))}
            </ul>
          ) : null}
        </header>

        <div className="prose u-stack u-gap-lg">{project.content}</div>

        {otherProjects.length > 0 ? (
          <aside className="surface u-pad-xl u-stack u-gap-sm">
            <h2 className="heading-subtitle u-text-muted">More client work</h2>
            <ul className="u-stack u-gap-sm">
              {otherProjects.map((other) => (
                <li key={other.slug}>
                  <Link className="u-stack u-gap-2xs" href={`/projects/${other.slug}`}>
                    <span className="u-font-semibold">{other.title}</span>
                    <span className="u-text-muted u-text-sm">{other.summary}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        ) : null}
      </article>
    </div>
  );
}
