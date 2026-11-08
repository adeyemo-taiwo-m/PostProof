import Link from "next/link";
import AuthVisual from "@/components/auth/AuthVisual";

export function AuthShell({ children, eyebrow, title, copy }: { children: React.ReactNode; eyebrow: string; title: React.ReactNode; copy: string }) {
  return (
    <main className="auth-page">
      <div className="auth-frame">
        <AuthVisual />

        <div className="auth-content">
          <div className="auth-brand">
            <Link href="/" className="wordmark" aria-label="Postproof home">
              <span className="wordmark-mark" aria-hidden="true">&ldquo;</span>
              <span className="wordmark-name"><span>Post</span><span className="wordmark-proof-text">proof</span></span>
            </Link>
          </div>
          <section className="auth-card">
            {eyebrow && <div className="kicker">{eyebrow}</div>}
            <h1>{title}</h1>
            <p className="auth-copy">{copy}</p>
            {children}
          </section>
        </div>
      </div>
    </main>
  );
}
