import Link from "next/link";

export function AuthShell({ children, eyebrow, title, copy }: { children: React.ReactNode; eyebrow: string; title: string; copy: string }) {
  return (
    <main className="auth-page">
      <div className="auth-frame">
        <aside className="auth-visual" aria-hidden="true">
          <div className="auth-visual-top">
            <span>POSTPROOF / STUDIO</span>
            <span>01 — 04</span>
          </div>
          <div className="auth-visual-image">
            <span className="auth-visual-glass auth-visual-glass-one" />
            <span className="auth-visual-glass auth-visual-glass-two" />
            <span className="auth-visual-orbit" />
            <span className="auth-visual-orb" />
            <div className="auth-visual-note">
              <span>THE GOOD WORDS</span>
              <strong>Stay close.</strong>
            </div>
          </div>
          <div className="auth-visual-footer">
            <span>Collect. Curate. Share.</span>
            <span>© 2024</span>
          </div>
        </aside>

        <div className="auth-content">
          <div className="auth-brand">
            <Link href="/" className="wordmark" aria-label="Postproof home">
              <span className="wordmark-mark" aria-hidden="true">&ldquo;</span>
              <span className="wordmark-name"><span>Post</span><span className="wordmark-proof-text">proof</span></span>
            </Link>
          </div>
          <section className="auth-card">
            <div className="kicker">{eyebrow}</div>
            <h1>{title}</h1>
            <p className="auth-copy">{copy}</p>
            {children}
          </section>
        </div>
      </div>
    </main>
  );
}
