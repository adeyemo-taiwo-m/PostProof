import Link from "next/link";

export function AuthShell({ children, eyebrow, title, copy }: { children: React.ReactNode; eyebrow: string; title: string; copy: string }) {
  return (
    <main className="auth-page">
      <div className="auth-brand"><Link href="/" className="wordmark"><span className="wordmark-mark">“</span><span className="wordmark-name"><span>Proof</span><span className="wordmark-card-text">Card</span></span></Link></div>
      <section className="auth-card">
        <div className="kicker">{eyebrow}</div>
        <h1>{title}</h1>
        <p className="auth-copy">{copy}</p>
        {children}
      </section>
    </main>
  );
}
