const features = [
  {
    number: "01",
    title: "App Router",
    description: "Organize pages, layouts, and loading states in one clear structure.",
  },
  {
    number: "02",
    title: "TypeScript ready",
    description: "Build with strict types and a path alias for cleaner imports.",
  },
  {
    number: "03",
    title: "Easy to extend",
    description: "Add your product, components, API routes, and design system as you grow.",
  },
];

export default function Home() {
  return (
    <main className="page-shell">
      <nav className="nav container" aria-label="Main navigation">
        <a className="brand" href="/" aria-label="Next Starter home">
          <span className="brand-mark">N</span>
          <span>Next Starter</span>
        </a>
        <a className="nav-link" href="https://nextjs.org/docs" target="_blank" rel="noreferrer">
          Documentation <span aria-hidden="true">↗</span>
        </a>
      </nav>

      <section className="hero container">
        <div className="hero-copy">
          <p className="eyebrow">A clean place to begin</p>
          <h1>Build the next <em>good</em> thing.</h1>
          <p className="hero-description">
            A thoughtfully minimal Next.js foundation with the essentials already in place.
            Bring your idea, then make it yours.
          </p>
          <div className="actions">
            <a className="button button-primary" href="https://nextjs.org/docs" target="_blank" rel="noreferrer">
              Read the docs <span aria-hidden="true">→</span>
            </a>
            <a className="button button-quiet" href="https://github.com/vercel/next.js" target="_blank" rel="noreferrer">
              View Next.js <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>

        <div className="hero-art" aria-label="Abstract orange and blue shapes" role="img">
          <div className="art-orbit orbit-one" />
          <div className="art-orbit orbit-two" />
          <div className="art-sun" />
          <div className="art-card">
            <span className="art-card-dot" />
            <span>ship something</span>
          </div>
        </div>
      </section>

      <section className="features container" aria-labelledby="features-title">
        <div className="section-heading">
          <p className="eyebrow">What&apos;s included</p>
          <h2 id="features-title">A focused starting point.</h2>
        </div>
        <div className="feature-grid">
          {features.map((feature) => (
            <article className="feature" key={feature.number}>
              <span className="feature-number">{feature.number}</span>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      <footer className="footer container">
        <span>Start small. Stay curious.</span>
        <span>Next.js starter · {new Date().getFullYear()}</span>
      </footer>
    </main>
  );
}
