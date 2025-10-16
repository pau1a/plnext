import { ProjectCard } from "@/components/project-card";
import cardStyles from "@/components/card.module.scss";
import { getProjectSummaries } from "@/lib/mdx";
import type { Metadata } from "next";

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
        <div className={`${cardStyles.cardGrid} ${cardStyles.cardGridProjects}`}>
          {projects.map((project) => (
            <ProjectCard key={project.slug} summary={project} />
          ))}
        </div>
      )}
    </section>
  );
}
