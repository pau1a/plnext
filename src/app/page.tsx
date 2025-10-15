import Link from "next/link";

export default function Home() {
  return (
    <section className="text-center py-5">
      <h1 className="display-4 mb-3">
        <i className="fa-solid fa-lock me-2" />
        Cybersecurity, AI, Engineering
      </h1>
      <p className="lead">Practical builds. Solid outcomes.</p>
      <Link href="/projects" className="btn btn-primary btn-lg mt-3">
        <i className="fa-solid fa-diagram-project me-2" />
        View Projects
      </Link>
    </section>
  );
}

