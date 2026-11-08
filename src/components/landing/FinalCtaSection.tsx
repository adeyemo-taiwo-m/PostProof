"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUp, ArrowUpRight, Check } from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import ProofText from "@/components/ProofText";

const FINAL_TIMING = {
  // Timing: pinned testimonial card visibility in milliseconds.
  pinDuration: 2500,
  // Timing: delayed CTA navigation after the press feedback in milliseconds.
  navigateDelay: 200,
  // Timing: pause toast visibility in milliseconds.
  pauseToast: 1900,
  // Timing: idle CTA arrow nudge delay in milliseconds.
  arrowDelay: 6000,
} as const;

const testimonials = [
  "The kind of care you feel the difference in.",
  "They made the complicated feel simple.",
  "A thoughtful process from the first call to the last.",
  "The first time our story looked this good.",
  "It finally feels like the work I do.",
  "A calm process with a beautiful result.",
  "They understood the quiet details.",
  "The words sound exactly like us.",
  "Good work, made easier to share.",
  "The rare kind of collaboration that feels effortless.",
  "We stopped hiding the best parts of our work.",
  "Clear, thoughtful, and genuinely kind.",
] as const;

const rows = [testimonials.slice(0, 5), testimonials.slice(4, 9), testimonials.slice(7, 12)];

type FinalCtaSectionProps = {
  reducedMotion: boolean;
};

function GhostChip({ quote, rowIndex, hovered, onHover, onPin }: { quote: string; rowIndex: number; hovered: boolean; onHover: (quote: string | null) => void; onPin: (quote: string) => void }) {
  return <motion.button type="button" className={`final-ghost-chip ${hovered ? "is-hovered" : ""}`} style={{ "--chip-row": rowIndex } as CSSProperties} tabIndex={-1} aria-label={`Sample testimonial: ${quote}`} onPointerEnter={() => onHover(quote)} onPointerLeave={() => onHover(null)} onClick={() => onPin(quote)}><span className="final-chip-quote">&ldquo; {quote}</span><span className="final-chip-stars" aria-hidden="true">★★★★★</span></motion.button>;
}

function TestimonialMarquee({ paused, reducedMotion, entered, pointer, hoveredChip, onHover, onPin }: { paused: boolean; reducedMotion: boolean; entered: boolean; pointer: { x: number; y: number }; hoveredChip: string | null; onHover: (quote: string | null) => void; onPin: (quote: string) => void }) {
  return <div className={`final-marquee-field ${entered ? "is-entered" : ""} ${paused || reducedMotion ? "is-paused" : ""}`} style={{ "--marquee-pointer-x": `${(pointer.x - 50) * -0.24}px`, "--marquee-pointer-y": `${(pointer.y - 50) * -0.04}deg` } as CSSProperties}>
    <div className="final-marquee-spotlight" aria-hidden="true" style={{ left: `${pointer.x}%`, top: `${pointer.y}%` }} />
    <div className="final-marquee-perspective" aria-hidden="true">
      {rows.map((row, rowIndex) => <motion.div key={rowIndex} className={`final-marquee-row final-marquee-row-${rowIndex + 1}`} animate={{ x: (pointer.x - 50) * (rowIndex + 1) * -.11, rotateX: 12 + (pointer.y - 50) * -.02 }} transition={{ type: "spring", stiffness: 85, damping: 22 }}><div className="final-marquee-track">{[...row, ...row].map((quote, index) => <GhostChip key={`${rowIndex}-${index}-${quote}`} quote={quote} rowIndex={rowIndex} hovered={hoveredChip === quote} onHover={onHover} onPin={onPin} />)}</div></motion.div>)}
    </div>
    <ul className="sr-only" aria-label="Sample testimonials">{testimonials.slice(0, 6).map((quote) => <li key={quote}>{quote}</li>)}</ul>
  </div>;
}

function SectionHeading({ entered }: { entered: boolean }) {
  return <div className={`final-heading ${entered ? "is-entered" : ""}`}>
    <span className="final-eyebrow"><i aria-hidden="true" />YOUR TURN</span>
    <h1><span className="final-heading-line">Start collecting</span><span className="final-serif-line"><ProofText text="testimonials today." className="final-proof-text" /></span></h1>
  </div>;
}

function CTAButton({ paused, reducedMotion, onClick }: { paused: boolean; reducedMotion: boolean; onClick: () => void }) {
  const [magnet, setMagnet] = useState({ x: 0, y: 0 });
  const [pressed, setPressed] = useState(false);
  const [arrowNudge, setArrowNudge] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (paused || reducedMotion) return;
    const interval = window.setInterval(() => { setArrowNudge(true); window.setTimeout(() => setArrowNudge(false), 520); }, 5000);
    const initial = window.setTimeout(() => setArrowNudge(true), FINAL_TIMING.arrowDelay);
    return () => { window.clearInterval(interval); window.clearTimeout(initial); if (timer.current) window.clearTimeout(timer.current); };
  }, [paused, reducedMotion]);

  return <motion.button type="button" className={`final-cta-button ${pressed ? "is-pressed" : ""}`} style={{ transform: `translate3d(${magnet.x}px, ${magnet.y}px, 0)` }} onPointerMove={(event) => { if (reducedMotion || !window.matchMedia("(pointer: fine)").matches) return; const rect = event.currentTarget.getBoundingClientRect(); setMagnet({ x: Math.max(-8, Math.min(8, (event.clientX - (rect.left + rect.width / 2)) * .12)), y: Math.max(-8, Math.min(8, (event.clientY - (rect.top + rect.height / 2)) * .12)) }); }} onPointerLeave={() => setMagnet({ x: 0, y: 0 })} onPointerDown={() => { setPressed(true); if (timer.current) window.clearTimeout(timer.current); }} onPointerUp={() => { setPressed(false); timer.current = window.setTimeout(onClick, FINAL_TIMING.navigateDelay); }} onPointerCancel={() => setPressed(false)} onClick={(event) => { event.preventDefault(); if (event.detail === 0) timer.current = window.setTimeout(onClick, FINAL_TIMING.navigateDelay); }}><span>Get started free</span><ArrowUpRight className={arrowNudge ? "is-nudging" : ""} size={19} aria-hidden="true" /><span className="final-cta-sparkles" aria-hidden="true"><i /><i /><i /></span></motion.button>;
}

function Microcopy({ entered }: { entered: boolean }) {
  return <div className={`final-microcopy ${entered ? "is-entered" : ""}`}><span><Check size={11} />Free to start</span><b>·</b><span><Check size={11} />Real words only</span><b>·</b><span><Check size={11} />No designer needed</span></div>;
}

function WordmarkHero({ entered, onBackToTop }: { entered: boolean; onBackToTop: () => void }) {
  const word = "Postproof";
  return <div className={`final-wordmark-wrap ${entered ? "is-entered" : ""}`}><button type="button" className="final-wordmark" onClick={onBackToTop} aria-label="Postproof — back to top"><span className="final-wordmark-quote" aria-hidden="true">&ldquo;</span><span className="final-wordmark-letters">{Array.from(word).map((letter, index) => <span key={`${letter}-${index}`} style={{ "--letter-index": index } as CSSProperties}>{letter}</span>)}</span></button><div className="final-wordmark-reflection" aria-hidden="true">{word}</div></div>;
}

function FooterRow({ onBackToTop }: { onBackToTop: () => void }) {
  return <div className="final-footer-row"><p><span>Real words.</span> <span>Good design.</span> <span>Better proof.</span></p><nav aria-label="Footer navigation"><Link href="/login">Log in</Link><Link className="final-create-link" href="/signup">Create account</Link></nav><div className="final-footer-meta"><button type="button" className="final-top-button" onClick={onBackToTop} aria-label="Back to top" title="Back to top"><ArrowUp size={15} /></button><span>© 2026 Postproof</span></div></div>;
}

function AmbientParticles({ paused, reducedMotion }: { paused: boolean; reducedMotion: boolean }) {
  if (paused || reducedMotion) return null;
  return <div className="final-particles" aria-hidden="true">{Array.from({ length: 14 }).map((_, index) => <i key={index} style={{ "--particle-index": index } as CSSProperties}>{index % 4 === 0 ? "✦" : index % 5 === 0 ? "“" : ""}</i>)}</div>;
}

export default function FinalCtaSection({ reducedMotion }: FinalCtaSectionProps) {
  const router = useRouter();
  const sectionRef = useRef<HTMLElement>(null);
  const pinTimer = useRef<number | null>(null);
  const [entered, setEntered] = useState(false);
  const [inView, setInView] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [hoveredChip, setHoveredChip] = useState<string | null>(null);
  const [pinnedChip, setPinnedChip] = useState<string | null>(null);
  const [pointer, setPointer] = useState({ x: 50, y: 50 });
  const motionActive = !reducedMotion && inView && pageVisible;

  useEffect(() => {
    const element = sectionRef.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => { setInView(Boolean(entry?.isIntersecting)); if (entry?.intersectionRatio >= .35) setEntered(true); }, { threshold: [0, .35] });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onVisibility = () => setPageVisible(!document.hidden);
    onVisibility();
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  useEffect(() => () => { if (pinTimer.current) window.clearTimeout(pinTimer.current); }, []);

  const pinChip = (quote: string) => {
    setPinnedChip(quote);
    if (pinTimer.current) window.clearTimeout(pinTimer.current);
    pinTimer.current = window.setTimeout(() => setPinnedChip(null), FINAL_TIMING.pinDuration);
  };
  const backToTop = () => window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
  const goToSignup = () => router.push("/signup");

  return <section ref={sectionRef} className={`final-scene ${entered ? "is-entered" : ""} ${motionActive ? "is-motion-active" : "is-motion-paused"}`} data-section="final" onPointerMove={(event: PointerEvent<HTMLElement>) => { const rect = event.currentTarget.getBoundingClientRect(); setPointer({ x: ((event.clientX - rect.left) / rect.width) * 100, y: ((event.clientY - rect.top) / rect.height) * 100 }); }}>
    <div className="final-top-line" aria-hidden="true" />
    <div className="final-grain" aria-hidden="true" />
    <div className="final-cursor-glow" aria-hidden="true" style={{ left: `${pointer.x}%`, top: `${pointer.y}%` }} />
    <AmbientParticles paused={!motionActive} reducedMotion={reducedMotion} />
    <div className="final-scene-inner">
      <TestimonialMarquee paused={!motionActive} reducedMotion={reducedMotion} entered={entered} pointer={pointer} hoveredChip={hoveredChip} onHover={setHoveredChip} onPin={pinChip} />
      <div className="final-content-block">
        <AnimatePresence>{pinnedChip && <motion.div className="final-pinned-card" initial={{ opacity: 0, y: 24, scale: .86, rotate: -4 }} animate={{ opacity: 1, y: 0, scale: 1, rotate: -2 }} exit={{ opacity: 0, y: -18, scale: .92, rotate: 3 }} transition={{ type: "spring", stiffness: 300, damping: 22 }}><span>&ldquo; {pinnedChip}</span><b>Yours could be next</b></motion.div>}</AnimatePresence>
        <SectionHeading entered={entered} />
        <CTAButton paused={!motionActive} reducedMotion={reducedMotion} onClick={goToSignup} />
        <Microcopy entered={entered} />
      </div>
      <WordmarkHero entered={entered} onBackToTop={backToTop} />
      <FooterRow onBackToTop={backToTop} />
    </div>
    <span className="sr-only" aria-live="polite">{pinnedChip ? "Yours could be next" : ""}</span>
  </section>;
}
