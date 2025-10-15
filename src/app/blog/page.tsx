interface Post {
  title: string;
  date: string;
  description: string;
}

const posts: Post[] = [
  {
    title: "Securing the Modern Web",
    date: "May 14, 2024",
    description:
      "Practical steps to harden your full-stack applications without slowing down delivery.",
  },
  {
    title: "AI-Assisted Incident Response",
    date: "April 30, 2024",
    description:
      "How large language models can accelerate triage workflows while maintaining human oversight.",
  },
  {
    title: "Building a Home Lab for Red Teaming",
    date: "April 12, 2024",
    description:
      "From network segmentation to repeatable attack simulations, here is the gear that earns its keep.",
  },
];

export default function BlogPage() {
  return (
    <section className="py-4">
      <header className="mb-5 text-center">
        <h1 className="display-5 mb-3">Insights &amp; Updates</h1>
        <p className="lead text-muted">
          Notes from the field on cybersecurity, AI, and practical engineering.
        </p>
      </header>

      <div className="row g-4">
        {posts.map((post) => (
          <article key={post.title} className="col-md-4">
            <div className="card h-100 shadow-sm border-0">
              <div className="card-body d-flex flex-column">
                <time className="text-uppercase text-muted small mb-2">{post.date}</time>
                <h2 className="h4">{post.title}</h2>
                <p className="text-muted flex-grow-1">{post.description}</p>
                <a className="stretched-link text-decoration-none" href="#">
                  Read article <i className="fa-solid fa-arrow-right ms-1" />
                </a>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
