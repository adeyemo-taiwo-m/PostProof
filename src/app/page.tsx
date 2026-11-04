import Link from "next/link";
import {
  ArrowDownRight,
  ArrowUpRight,
  Check,
  Copy,
  Download,
  Link2,
  Menu,
  MessageCircleHeart,
  MoveUpRight,
  Quote,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const steps = [
  { number: "01", icon: Link2, title: "Make one link", copy: "Set up your brand once. Get a simple link your customers can open anywhere." },
  { number: "02", icon: MessageCircleHeart, title: "Collect the good stuff", copy: "A beautiful, no-login form makes it easy for real people to share real experiences." },
  { number: "03", icon: Download, title: "Share it proudly", copy: "Approve the words you love, choose a layout, and download a graphic that feels like you." },
];

const benefits = ["No more screenshot hunting", "No design queue for every kind word", "No AI-written customer stories"];

function Wordmark({ light = false }: { light?: boolean }) {
  return <Link className={`wordmark ${light ? "wordmark-light" : ""}`} href="/" aria-label="ProofCard home"><span className="wordmark-mark">“</span><span className="wordmark-name"><span>Proof</span><span className="wordmark-card-text">Card</span></span></Link>;
}

function HeroGraphic() {
  return <div className="hero-stage" aria-label="Preview of a branded testimonial graphic" role="img"><div className="stage-glow" /><div className="stage-orbit stage-orbit-a" /><div className="stage-orbit stage-orbit-b" /><div className="stage-tag stage-tag-top"><Sparkles size={13} /> NEW · YOUR WORDS, BETTER PRESENTED</div><div className="graphic-card graphic-card-back"><div className="graphic-brand"><span className="graphic-logo">m</span><span>MOONWELL / STUDIO</span></div><div className="back-quote">“</div></div><div className="graphic-card graphic-card-main"><div className="graphic-brand"><span className="graphic-logo graphic-logo-light">m</span><span>MOONWELL / STUDIO</span></div><div className="graphic-quote">“The kind of<br /><i>care</i> you feel<br />the difference in.”</div><div className="graphic-footer"><span>— Maya R.</span><span className="stars">★★★★★</span></div><div className="graphic-accent" /></div><div className="stage-note"><span className="note-dot" /> APPROVED WITH CONSENT</div><div className="stage-arrow"><ArrowDownRight size={18} /></div></div>;
}

function DashboardPreview() {
  return <div className="dashboard-preview"><div className="preview-sidebar"><div className="preview-sidebar-mark">T</div><span className="preview-side-line active" /><span className="preview-side-line" /><span className="preview-side-line" /><span className="preview-side-line short" /><span className="preview-sidebar-bottom" /></div><div className="preview-main"><div className="preview-top"><div><span className="preview-kicker">YOUR STUDIO</span><strong>Good work deserves good proof.</strong></div><span className="preview-avatar">M</span></div><div className="preview-stats"><div><span>Total testimonials</span><b>24</b><small>↑ 18% this month</small></div><div><span>Waiting for review</span><b>06</b><small className="warm">Needs your eye</small></div><div><span>Approved to share</span><b>18</b><small>Ready to post</small></div></div><div className="preview-lower"><div className="preview-list"><div className="preview-list-heading"><span>RECENT FEEDBACK</span><span>VIEW ALL ↗</span></div><div className="preview-row"><span className="preview-row-avatar">A</span><div><b>Ayo, founder</b><p>“The work speaks for itself now.”</p></div><span className="preview-status">APPROVED</span></div><div className="preview-row"><span className="preview-row-avatar peach">J</span><div><b>Jane O.</b><p>“Thoughtful from the first call…”</p></div><span className="preview-status pending">PENDING</span></div><div className="preview-row"><span className="preview-row-avatar blue">M</span><div><b>Maya R.</b><p>“The care you feel the difference in.”</p></div><span className="preview-status">APPROVED</span></div></div><div className="preview-share"><span className="preview-kicker">YOUR COLLECTION LINK</span><b>Make it easy to say something kind.</b><div className="preview-link"><span>testimonials.to/moonwell</span><Copy size={12} /></div></div></div></div></div>;
}

export default function Home() {
  return <main className="home-shell">
    <nav className="home-nav home-container" aria-label="Main navigation"><Wordmark /><div className="home-nav-links"><a href="#how-it-works">How it works</a><a href="#why-studio">Why Studio</a></div><div className="home-nav-actions"><Link className="home-login" href="/login">Log in</Link><Link className="button button-dark button-small" href="/signup">Start free <ArrowUpRight size={15} /></Link></div><details className="mobile-nav"><summary aria-label="Open menu"><Menu size={20} /></summary><div><a href="#how-it-works">How it works</a><a href="#why-studio">Why Studio</a><Link href="/login">Log in</Link><Link className="button button-dark" href="/signup">Start free <ArrowUpRight size={15} /></Link></div></details></nav>

    <section className="home-hero home-container"><div className="hero-copy-home"><div className="hero-eyebrow"><span /> PROOF WORTH POSTING</div><h1>Turn customer love into <em>proof worth posting.</em></h1><p>Collect customer reviews with one link. Approve the ones you love. Download them as branded, ready-to-post graphics.</p><div className="hero-cta-row"><Link className="button button-dark button-large" href="/signup">Create your link <ArrowUpRight size={17} /></Link><a className="under-link" href="#how-it-works">See how it works <ArrowDownRight size={15} /></a></div><div className="hero-assurance"><ShieldCheck size={15} /> Real words only · Consent is always your call</div></div><HeroGraphic /></section>

    <section className="signal-bar home-container"><span>MADE FOR PEOPLE WHO DO GOOD WORK</span><div><b>northstar</b><b className="signal-serif">common ground</b><b>STUDIO / 24</b><b className="signal-light">GOOD COMPANY</b></div></section>

    <section className="intro-section home-container" id="why-studio"><div className="section-label">THE SIMPLE LOOP</div><div className="intro-grid"><h2>Less admin.<br /><em>More proof.</em></h2><div><p>Great work creates great stories. ProofCard gives those stories a place to land—and gives you a graceful way to put them back into the world.</p><Link className="under-link" href="/signup">Build your collection link <ArrowUpRight size={15} /></Link></div></div></section>

    <section className="steps-section home-container" id="how-it-works"><div className="steps-grid">{steps.map(({ number, icon: Icon, title, copy }) => <article className="step-card" key={number}><div className="step-top"><span>{number}</span><Icon size={19} strokeWidth={1.8} /></div><h3>{title}</h3><p>{copy}</p><span className="step-line" /></article>)}</div></section>

    <section className="feature-section home-container"><div className="feature-copy"><div className="section-label section-label-light">THE HOME FOR YOUR BEST WORDS</div><h2>A nice message shouldn&apos;t live in a screenshot.</h2><p>Give your customer&apos;s words the care they deserve. A calm inbox, a clear approval flow, and graphics that feel designed—not generated.</p><ul>{benefits.map((benefit) => <li key={benefit}><Check size={16} />{benefit}</li>)}</ul><Link className="button button-light" href="/signup">Make it yours <MoveUpRight size={16} /></Link></div><DashboardPreview /></section>

    <section className="quote-section home-container"><div className="quote-section-label"><Quote size={21} /> A FEW WORDS FROM THE OTHER SIDE</div><div className="quote-layout"><blockquote>“It finally feels like the work I do, not another template someone handed me.”</blockquote><div className="quote-byline"><span className="quote-avatar">A</span><span><b>Ayo, founder</b><small>Independent creative studio</small></span></div></div></section>

    <section className="final-cta home-container"><div className="final-cta-inner"><div><div className="section-label">READY WHEN YOU ARE</div><h2>Start collecting<br /><em>testimonials today.</em></h2></div><Link className="button button-dark button-large" href="/signup">Get started free <ArrowUpRight size={17} /></Link></div></section>

    <footer className="home-footer home-container"><Wordmark /><p>Real words. Good design. Better proof.</p><div><Link href="/login">Log in</Link><Link href="/signup">Create account</Link></div><span>© {new Date().getFullYear()} ProofCard</span></footer>
  </main>;
}
