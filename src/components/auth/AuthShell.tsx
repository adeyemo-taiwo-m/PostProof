import AuthVisual from "@/components/auth/AuthVisual";

export function AuthShell({ children, eyebrow, title, copy }: { children: React.ReactNode; eyebrow: string; title: React.ReactNode; copy: string }) {
  return (
    <main className="auth-page">
      <div className="auth-frame">
        <AuthVisual />

        <div className="auth-content">
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
