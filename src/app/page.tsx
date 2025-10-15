import Link from "next/link";

export default function Home() {
  return (
    <section className="u-stack u-gap-xl u-text-center u-pad-block-3xl">
      <h1 className="heading-display-xl u-text-balance u-center u-max-w-md">
        <span className="u-inline-flex u-items-center u-gap-sm u-justify-center">
          <i className="fa-solid fa-lock" aria-hidden="true" />
          <span>Cybersecurity, AI, Engineering</span>
        </span>
      </h1>
      <p className="u-text-lead u-center u-max-w-sm">
        Practical builds. Solid outcomes.
      </p>
      <Link href="/projects" className="button button--primary button--lg">
        <i className="fa-solid fa-diagram-project" aria-hidden="true" />
        <span>View Projects</span>
      </Link>
    </section>
  );
}
