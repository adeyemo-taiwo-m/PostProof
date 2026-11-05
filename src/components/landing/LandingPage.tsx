"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowDownRight,
  ArrowUp,
  ArrowUpRight,
  Check,
  CheckCircle2,
  ChevronRight,
  CirclePause,
  CirclePlay,
  Clock3,
  Copy,
  Download,
  ImagePlus,
  Camera,
  Mail,
  Menu,
  MessageCircle,
  MoveUpRight,
  Quote,
  ShieldCheck,
  X,
} from "lucide-react";

type Format = "4:5" | "1:1" | "9:16";
type Template = "Minimal" | "Bold" | "Editorial";

const samples = [
  { brand: "Common Ground", quote: "The first time our story looked like our work.", person: "Lena K.", template: "Bold", tone: "ink" },
  { brand: "Moonwell", quote: "The kind of care you feel the difference in.", person: "Maya R.", template: "Bold", tone: "coral" },
  { brand: "Northstar", quote: "They made the complicated feel completely clear.", person: "Jon B.", template: "Editorial", tone: "editorial" },
  { brand: "Bright Studio", quote: "A thoughtful process from the first call to the last.", person: "Ari P.", template: "Minimal", tone: "paper" },
] as const;

const loopSteps = [
  { title: "Make one link", copy: "A simple URL your customers can open anywhere." },
  { title: "Collect the good stuff", copy: "A focused form that makes honest feedback easy." },
  { title: "Share it proudly", copy: "Approve the words you love, then make them yours." },
] as const;

const studioReviews = [
  { name: "Ayo, founder", text: "The work speaks for itself now.", status: "Approved", tone: "sage" },
  { name: "Jane O.", text: "Thoughtful from the first call to the last.", status: "Pending", tone: "coral" },
  { name: "Maya R.", text: "The care you feel the difference in.", status: "Approved", tone: "blue" },
];

const shareOptions = [
  { label: "WhatsApp", icon: MessageCircle },
  { label: "Instagram", icon: Camera },
  { label: "Email", icon: Mail },
  { label: "SMS", icon: MessageCircle },
] as const;

function slugify(value: string) {
  return value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 48) || "your-business";
}

function Wordmark({ footer = false }: { footer?: boolean }) {
  return <Link className={`pp-wordmark ${footer ? "pp-wordmark-footer" : ""}`} href="/" aria-label="Postproof home"><span className="pp-wordmark-mark">“</span><span>Postproof</span></Link>;
}

type CardPosition = "front" | "middle" | "back";
type CardEvents = { onClick?: () => void; onPointerEnter?: () => void; onPointerMove?: (event: React.PointerEvent<HTMLElement>) => void; onPointerLeave?: () => void; onPointerDown?: () => void; onPointerUp?: () => void; onPointerCancel?: () => void; cardRef?: React.RefObject<HTMLElement | null> };

function QuoteCard({ sample, position, format, text, events }: { sample: (typeof samples)[number]; position: CardPosition; format: Format; text?: string; events?: CardEvents }) {
  const cardText = position === "front" && text ? text : sample.quote;
  return <motion.article ref={events?.cardRef} className={`pp-quote-card pp-card-${position} pp-card-${sample.tone} pp-format-${format.replace(":", "-")}`} data-cursor={position === "front" ? "Try me" : "Bring forward"} aria-label={`${sample.template} sample graphic from ${sample.brand}`} onClick={(event) => { event.stopPropagation(); events?.onClick?.(); }} onPointerEnter={events?.onPointerEnter} onPointerMove={events?.onPointerMove} onPointerLeave={events?.onPointerLeave} onPointerDown={events?.onPointerDown} onPointerUp={events?.onPointerUp} onPointerCancel={events?.onPointerCancel} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: .18 }}>
    <div className="pp-card-head" data-card-layer="chrome"><span className="pp-card-mark">“</span><span>{sample.brand.toUpperCase()}</span><span className="pp-card-sample" data-card-layer="sample">SAMPLE</span></div>
    <div className="pp-card-template" data-card-layer="chrome">{sample.template.toUpperCase()}</div>
    <div className="pp-card-quote" data-card-layer="quote">“{cardText}”</div>
    <div className="pp-card-foot" data-card-layer="signature"><span>— {position === "front" && text ? "You" : sample.person}</span><span className="pp-card-rule" /></div>
  </motion.article>;
}

function HeroStack({ paused }: { paused: boolean }) {
  const [deck, setDeck] = useState([0, 1, 3]);
  const format: Format = "4:5";
  const [text, setText] = useState("");
  const [isPrinting, setIsPrinting] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [typingPulse, setTypingPulse] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const [stampKey, setStampKey] = useState(0);
  const touchStart = useRef<number | null>(null);
  const touchActive = useRef(false);
  const frontRef = useRef<HTMLElement | null>(null);
  const frame = useRef<number | null>(null);
  const announcementTimer = useRef<number | null>(null);
  const typingTimer = useRef<number | null>(null);
  const current = samples[deck[0]];
  function announce(message: string) { if (announcementTimer.current) window.clearTimeout(announcementTimer.current); setAnnouncement(message); announcementTimer.current = window.setTimeout(() => setAnnouncement(""), 900); }
  function rotateDeck(offset = 1, message = "Card updated") { setDeck((value) => { const amount = offset % value.length; return [...value.slice(amount), ...value.slice(0, amount)]; }); setStampKey((value) => value + 1); announce(message); }
  function shuffle() { rotateDeck(); }
  function promote(offset: number) { rotateDeck(offset); }
  function printCard() { if (isPrinting) return; setIsPrinting(true); window.setTimeout(() => { setDeck((value) => [...value.slice(1), value[0]]); setStampKey((value) => value + 1); setIsPrinting(false); announce("Fresh card printed"); }, 420); }
  function setTilt(event: React.PointerEvent<HTMLElement>) {
    if (paused || !frontRef.current) return;
    const rect = frontRef.current.getBoundingClientRect();
    const x = Math.max(-1, Math.min(1, (event.clientX - (rect.left + rect.width / 2)) / (rect.width / 2)));
    const y = Math.max(-1, Math.min(1, (event.clientY - (rect.top + rect.height / 2)) / (rect.height / 2)));
    if (frame.current) cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => { frontRef.current?.style.setProperty("--tilt-x", `${x}`); frontRef.current?.style.setProperty("--tilt-y", `${y}`); frontRef.current?.style.setProperty("--glare-x", `${50 + x * 42}%`); frontRef.current?.style.setProperty("--glare-y", `${50 + y * 42}%`); });
  }
  function clearTilt() { if (frame.current) cancelAnimationFrame(frame.current); frontRef.current?.style.setProperty("--tilt-x", "0"); frontRef.current?.style.setProperty("--tilt-y", "0"); frontRef.current?.style.setProperty("--glare-x", "50%"); frontRef.current?.style.setProperty("--glare-y", "50%"); }
  function onType(value: string) { setText(value); setTypingPulse(true); announce("Card updated"); if (typingTimer.current) window.clearTimeout(typingTimer.current); typingTimer.current = window.setTimeout(() => setTypingPulse(false), 120); }
  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) { if (event.key === " " || event.key === "Enter") { event.preventDefault(); shuffle(); } }
  useEffect(() => () => { if (frame.current) cancelAnimationFrame(frame.current); if (announcementTimer.current) window.clearTimeout(announcementTimer.current); if (typingTimer.current) window.clearTimeout(typingTimer.current); }, []);
  useEffect(() => { if (paused || inputFocused || isPrinting || isHovered) return; const timer = window.setInterval(() => rotateDeck(), 6500); return () => window.clearInterval(timer); }, [paused, inputFocused, isPrinting, isHovered]);
  const [frontIndex, middleIndex, backIndex] = deck;
  return <div className={`pp-hero-demo ${paused ? "pp-demo-paused" : ""}`} data-cursor="Try me">
    <div className="pp-orbit pp-orbit-one" aria-hidden="true" /><div className="pp-orbit pp-orbit-two" aria-hidden="true" /><span className="pp-orbit-dot" aria-hidden="true" />
    <div className="pp-hero-sticker">NEW · YOUR WORDS, BETTER PRESENTED</div>
    <div className={`pp-stack-area pp-area-${format.replace(":", "-")}`}>
      <div className={`pp-stack ${isHovered ? "is-hovered" : ""} ${isPressed ? "is-pressed" : ""} ${isPrinting ? "is-printing" : ""} ${typingPulse ? "is-typing" : ""}`} tabIndex={0} role="button" aria-label="Sample testimonial cards" onKeyDown={onKeyDown} onTouchStart={(event) => { touchStart.current = event.touches[0]?.clientX ?? null; }} onTouchEnd={(event) => { const end = event.changedTouches[0]?.clientX ?? 0; const swiped = touchStart.current !== null && Math.abs(end - touchStart.current) > 60; const touchedCard = (event.target as HTMLElement).closest(".pp-quote-card"); if (swiped || !touchedCard) { shuffle(); touchActive.current = swiped; if (swiped) window.setTimeout(() => { touchActive.current = false; }, 400); } touchStart.current = null; }}>
        <QuoteCard key={backIndex} sample={samples[backIndex]} position="back" format={format} events={{ onClick: () => { if (!touchActive.current) promote(2); } }} />
        <QuoteCard key={middleIndex} sample={samples[middleIndex]} position="middle" format={format} events={{ onClick: () => { if (!touchActive.current) promote(1); } }} />
        <QuoteCard key={frontIndex} sample={current} position="front" format={format} text={text} events={{ cardRef: frontRef, onClick: () => { if (!touchActive.current) shuffle(); }, onPointerEnter: () => setIsHovered(true), onPointerMove: setTilt, onPointerLeave: () => { setIsHovered(false); setIsPressed(false); clearTilt(); }, onPointerDown: () => setIsPressed(true), onPointerUp: () => setIsPressed(false), onPointerCancel: () => setIsPressed(false) }} />
        <motion.div key={`${stampKey}-${current.brand}`} className={`pp-approval-stamp pp-stamp-${current.tone}`} initial={{ opacity: 0, scale: 2.2, rotate: -22 }} animate={{ opacity: 1, scale: 1, rotate: -12 }} transition={{ type: "spring", stiffness: 420, damping: 18 }}><Check size={13} /> APPROVED WITH CONSENT</motion.div>
      </div>
      <button className="pp-shuffle" type="button" onClick={shuffle} aria-label="Shuffle cards" title="Shuffle cards"><Quote size={17} /></button>
    </div>
    <div className="pp-hero-controls"><label className={`pp-live-type ${text.length > 80 ? "is-warning" : ""}`}><span className="sr-only">Type something kind about your work</span><MessageCircle size={16} /><input maxLength={90} value={text} onFocus={() => setInputFocused(true)} onBlur={() => setInputFocused(false)} onChange={(event) => onType(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); printCard(); } }} placeholder="Type something kind about your work..." /><span>{text.length}/90</span><button type="button" onClick={printCard} aria-label="Print a fresh testimonial card"><ArrowUpRight size={16} /></button></label><p className="pp-demo-caption">Just a preview. Nothing is sent.</p><span className="sr-only" aria-live="polite">{announcement}</span></div>
  </div>;
}

function LoopDemo({ step, paused }: { step: number; paused: boolean }) {
  const [copied, setCopied] = useState(false);
  const [consent, setConsent] = useState(false);
  const [sent, setSent] = useState(false);
  const [approved, setApproved] = useState(false);
  const [template, setTemplate] = useState<Template>("Bold");
  useEffect(() => { if (step === 0 && !paused) { const timer = window.setTimeout(() => setCopied(true), 1300); return () => window.clearTimeout(timer); } }, [step, paused]);
  return <div className={`pp-loop-demo pp-loop-demo-${step + 1}`}>
    {step === 0 && <><div className="pp-browser-pill"><span>postproof.app/t/</span><b>moonwell</b><i /></div><button className={`pp-copy-action ${copied ? "copied" : ""}`} type="button" onClick={() => setCopied(true)}>{copied ? <><Check size={15} /> Copied</> : <><Copy size={15} /> Copy link</>}</button><span className="pp-burst" aria-hidden="true">“ “ “</span></>}
    {step === 1 && <div className="pp-phone"><div className="pp-phone-notch" /><span className="pp-demo-kicker">A NOTE FROM YOU</span><h3>We&apos;d love to hear about your experience.</h3><p>Your feedback helps us improve.</p><div className="pp-phone-field">The kind of care you feel the difference in.</div><div className="pp-phone-name"><span>How should your name appear?</span><button type="button">First name only</button></div><label className="pp-phone-consent"><input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} /> I give permission to share this.</label><button className={`pp-phone-submit ${sent ? "sent" : ""}`} type="button" onClick={() => setSent(true)}>{sent ? "Thank you for sharing your experience!" : "Submit testimonial"}</button></div>}
    {step === 2 && <div className="pp-share-demo"><div className="pp-share-top"><span className="pp-demo-kicker">YOUR STUDIO · SAMPLE DATA</span><span className={`pp-status-pill ${approved ? "approved" : "pending"}`}>{approved ? <CheckCircle2 size={13} /> : <Clock3 size={13} />}{approved ? "Approved" : "Pending"}</span></div><blockquote>“The kind of care you feel the difference in.”</blockquote><span className="pp-share-person">— Maya R.</span><div className="pp-template-row">{(["Minimal", "Bold", "Editorial"] as Template[]).map((item) => <button className={template === item ? "active" : ""} key={item} type="button" onClick={() => setTemplate(item)}>{item}</button>)}</div><div className="pp-share-actions">{!approved && <button className="pp-approve-small" type="button" onClick={() => setApproved(true)}><Check size={14} /> Approve</button>}{approved && <button className="pp-download-chip" type="button"><Download size={14} /> moonwell-testimonial-2026-11-05.png</button>}</div></div>}
  </div>;
}

function BeforeAfter() {
  const [value, setValue] = useState(50);
  return <div className="pp-before-after-wrap"><div className="pp-before-after" style={{ "--reveal": `${value}%` } as React.CSSProperties}>
    <div className="pp-after-card"><span className="pp-demo-kicker">BOLD · SAMPLE</span><div className="pp-after-quote">“The kind of <i>care</i> you feel the difference in.”</div><span className="pp-after-person">— Maya R.</span></div>
    <div className="pp-before-shot"><span className="pp-shot-status">9:41</span><span className="pp-notification" /><div className="pp-chat-bubble">The kind of care you feel the difference in.</div><span className="pp-shot-file">Screenshot (14).png</span></div>
    <label className="pp-slider-label" data-cursor="Drag"><span className="sr-only">Compare screenshot and polished graphic</span><input type="range" min="0" max="100" value={value} onChange={(event) => setValue(Number(event.target.value))} aria-valuetext={`${value}% polished graphic`} /><span className="pp-slider-handle"><ArrowDownRight size={15} /></span></label>
  </div><div className="pp-before-after-legend"><span>Before</span><span><span className="pp-sample-tag">SAMPLE</span> After</span></div></div>;
}

function StudioMock() {
  const [approved, setApproved] = useState(false);
  const [filter, setFilter] = useState("All");
  const [template, setTemplate] = useState<Template>("Bold");
  const shown = studioReviews.filter((review) => filter === "All" || review.status === filter || (filter === "Pending" && review.name === "Jane O." && !approved) || (filter === "Approved" && (review.status === "Approved" || (review.name === "Jane O." && approved))));
  return <div className="pp-studio-stage"><div className="pp-studio-sticker">TRY ME</div><div className="pp-studio-browser"><div className="pp-browser-chrome"><span /><span /><span /><b>postproof.app/dashboard</b></div><div className="pp-studio-content"><div className="pp-studio-head"><div><span className="pp-demo-kicker">YOUR STUDIO · SAMPLE DATA</span><h3>Good work deserves good proof.</h3></div><span className="pp-studio-avatar">M</span></div><div className="pp-stats-row"><div><span>Total</span><b>24</b></div><div><span>Waiting for review</span><b>{approved ? 5 : 6}</b></div><div><span>Approved to share</span><b>{approved ? 19 : 18}</b></div></div><div className="pp-studio-body"><div className="pp-review-list"><div className="pp-filter-row">{["All", "Pending", "Approved"].map((item) => <button key={item} className={filter === item ? "active" : ""} type="button" onClick={() => setFilter(item)}>{item}</button>)}</div>{shown.map((review) => <div className="pp-review-item" key={review.name}><span className={`pp-review-avatar ${review.tone}`}>{review.name[0]}</span><span><b>{review.name}</b><small>{review.text}</small></span><span className={`pp-status-text ${review.name === "Jane O." && approved ? "is-approved" : review.status === "Approved" ? "is-approved" : ""}`}>{review.name === "Jane O." && approved ? "Approved" : review.status}</span>{review.name === "Jane O." && !approved && <button className="pp-review-approve" type="button" onClick={() => setApproved(true)} aria-label="Approve Jane O testimonial"><Check size={14} /></button>}</div>)}</div><div className="pp-studio-graphic">{approved ? <><span className="pp-demo-kicker">CREATE GRAPHIC</span><div className={`pp-mini-graphic pp-mini-${template.toLowerCase()}`}><span>“</span><b>The kind of care<br />you feel the<br />difference in.</b><small>— Maya R.</small></div><div className="pp-mini-tabs">{(["Minimal", "Bold", "Editorial"] as Template[]).map((item) => <button key={item} className={template === item ? "active" : ""} type="button" onClick={() => setTemplate(item)}>{item}</button>)}</div></> : <><ImagePlus size={22} /><b>Approve a sample<br />to create a graphic</b></>}</div></div></div></div><button className="pp-reset-demo" type="button" onClick={() => { setApproved(false); setFilter("All"); }}>Reset demo</button></div>;
}

function BigQuote() {
  const words = "It finally feels like the work I do, not another template someone handed me.".split(" ");
  const [visible, setVisible] = useState(0);
  const ref = useRef<HTMLElement>(null);
  useEffect(() => { const onScroll = () => { if (!ref.current) return; const rect = ref.current.getBoundingClientRect(); const progress = Math.max(0, Math.min(1, (window.innerHeight - rect.top) / (window.innerHeight + rect.height * .6))); setVisible(Math.floor(progress * (words.length + 3))); }; onScroll(); window.addEventListener("scroll", onScroll, { passive: true }); return () => window.removeEventListener("scroll", onScroll); }, [words.length]);
  return <section className="pp-big-quote" ref={ref} data-section="quote"><div className="pp-quote-corner pp-quote-corner-left">“</div><div className="pp-quote-corner pp-quote-corner-right">“</div><div className="pp-quote-marquee">“　“　“　“　“　“　“　“　“　“　“</div><div className="pp-big-quote-inner"><span className="pp-demo-kicker">A SAMPLE OF WHAT YOU COULD SHARE</span><blockquote>{words.map((word, index) => <span key={`${word}-${index}`} style={{ opacity: visible > index ? 1 : .2 }}>{word} </span>)}</blockquote><div className="pp-attribution"><span className="pp-quote-avatar">A</span><span><b>Ayo, founder</b><small>Independent creative studio</small></span><span className="pp-sample-tag">SAMPLE</span></div></div></section>;
}

export default function LandingPage() {
  const [paused, setPaused] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loopStep, setLoopStep] = useState(0);
  const [business, setBusiness] = useState("");
  const [copied, setCopied] = useState(false);
  const [shareChoice, setShareChoice] = useState("");
  const [progress, setProgress] = useState(0);
  const [cursor, setCursor] = useState({ x: -100, y: -100, label: "" });
  const pageRef = useRef<HTMLElement>(null);
  const slug = useMemo(() => slugify(business), [business]);

  useEffect(() => {
    const onScroll = () => { const max = document.documentElement.scrollHeight - window.innerHeight; setProgress(max ? window.scrollY / max : 0); };
    const onKey = (event: KeyboardEvent) => { if (event.key === "ArrowDown" || event.key === "ArrowRight") setLoopStep((step) => Math.min(2, step + 1)); if (event.key === "ArrowUp" || event.key === "ArrowLeft") setLoopStep((step) => Math.max(0, step - 1)); };
    onScroll(); window.addEventListener("scroll", onScroll, { passive: true }); window.addEventListener("keydown", onKey); return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("keydown", onKey); };
  }, []);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    if (!fine) return;
    const move = (event: PointerEvent) => { const target = event.target as HTMLElement; setCursor({ x: event.clientX, y: event.clientY, label: target.closest<HTMLElement>("[data-cursor]")?.dataset.cursor ?? "" }); };
    window.addEventListener("pointermove", move); return () => window.removeEventListener("pointermove", move);
  }, []);

  async function copyLink() { const link = `https://postproof.app/t/${slug}`; try { await navigator.clipboard.writeText(link); } catch { const area = document.createElement("textarea"); area.value = link; document.body.appendChild(area); area.select(); document.execCommand("copy"); area.remove(); } setCopied(true); document.title = "Copied, now go collect some proof."; window.setTimeout(() => { setCopied(false); document.title = "Postproof — Proof worth posting."; }, 2000); }
  return <main ref={pageRef} className={`pp-page ${paused ? "pp-paused" : ""}`}>
    <div className="pp-scroll-progress" style={{ transform: `scaleX(${progress})` }} aria-hidden="true" />
    <div className="pp-cursor" style={{ transform: `translate3d(${cursor.x}px, ${cursor.y}px, 0)` }} aria-hidden="true"><span>{cursor.label || "“"}</span></div>
    <nav className={`pp-nav ${progress > .04 ? "is-scrolled" : ""}`} aria-label="Main navigation"><Wordmark /><div className="pp-nav-links"><a href="#the-loop">How it works</a><a href="#why-postproof">Why Postproof</a></div><div className="pp-nav-actions"><Link href="/login">Log in</Link><Link className="pp-button pp-button-coral" href="/signup">Start free <ArrowUpRight size={16} /></Link></div><button className="pp-menu-button" type="button" onClick={() => setMenuOpen(true)} aria-label="Open menu"><Menu size={21} /></button></nav>
    {menuOpen && <div className="pp-mobile-sheet"><button className="pp-sheet-close" type="button" onClick={() => setMenuOpen(false)} aria-label="Close menu"><X size={22} /></button><Wordmark /><div><a href="#the-loop" onClick={() => setMenuOpen(false)}>How it works</a><a href="#why-postproof" onClick={() => setMenuOpen(false)}>Why Postproof</a><Link href="/login">Log in</Link><Link className="pp-button pp-button-coral" href="/signup">Start free <ArrowUpRight size={16} /></Link></div></div>}

    <section className="pp-hero pp-section" data-section="hero"><div className="pp-coral-wash" /><div className="pp-container pp-hero-grid"><div className="pp-hero-copy"><span className="pp-sticker"><i /> PROOF WORTH POSTING</span><h1>Turn customer love into <em>proof worth posting.</em></h1><p>Collect customer reviews with one link. Approve the ones you love. Download them as branded, ready-to-post graphics.</p><div className="pp-hero-actions"><Link className="pp-button pp-button-coral pp-button-large" href="/signup">Create your link <ArrowUpRight size={18} /></Link><a className="pp-text-link" href="#the-loop">See how it works <ArrowDown size={16} /></a></div><span className="pp-assurance"><ShieldCheck size={16} /> Real words only · Consent is always your call</span></div><HeroStack paused={paused} /></div></section>

    <section className={`pp-loop pp-section pp-loop-step-${loopStep + 1}`} id="the-loop" data-section="loop"><div className="pp-container"><div className="pp-section-intro"><div><span className="pp-overline">THE SIMPLE LOOP</span><h2>Less admin.<br /><em>More proof.</em></h2></div><div><p>Great work creates great stories. Postproof gives those stories a place to land—and gives you a graceful way to put them back into the world.</p><a className="pp-text-link" href="#link-claim">Build your collection link <ArrowUpRight size={16} /></a></div></div><div className="pp-loop-grid"><div className="pp-step-list" role="tablist" aria-label="How Postproof works">{loopSteps.map((item, index) => <button key={item.title} className={loopStep === index ? "active" : ""} type="button" role="tab" aria-selected={loopStep === index} onClick={() => setLoopStep(index)}><span className="pp-step-number">0{index + 1}</span><span><b>{item.title}</b><small>{item.copy}</small></span><ChevronRight size={18} /></button>)}</div><LoopDemo key={loopStep} step={loopStep} paused={paused} /></div></div></section>

    <section className="pp-best-words pp-section" id="why-postproof" data-section="best-words"><div className="pp-container"><div className="pp-section-intro pp-section-intro-light"><div><span className="pp-overline">THE HOME FOR YOUR BEST WORDS</span><h2>A nice message shouldn&apos;t live in a screenshot.</h2></div><div><p>Give your customer&apos;s words the care they deserve. A calm inbox, a clear approval flow, and graphics that feel designed—not generated.</p></div></div><BeforeAfter /><div className="pp-benefit-rows"><div><span>01</span><b>No more screenshot hunting</b><em>One tidy inbox.</em></div><div><span>02</span><b>No design queue for every kind word</b><em>Graphics in a click.</em></div><div><span>03</span><b>No AI-written customer stories</b><em>Real words only.</em></div></div><Link className="pp-button pp-button-coral" href="/signup">Make it yours <MoveUpRight size={17} /></Link></div></section>

    <section className="pp-studio pp-section" data-section="studio"><div className="pp-container"><div className="pp-section-intro"><div><span className="pp-overline">YOUR STUDIO</span><h2>Good work deserves good proof.</h2></div><div><p>Try the review flow before you sign up. This is sample data, running entirely in your browser.</p></div></div><StudioMock /></div></section>

    <section className="pp-link-claim pp-section" id="link-claim" data-section="link"><div className="pp-container pp-link-claim-inner"><span className="pp-overline">YOUR COLLECTION LINK</span><h2>Make it easy to say something kind.</h2><label className="pp-business-input"><span>What&apos;s your business called?</span><input value={business} onChange={(event) => setBusiness(event.target.value)} placeholder="Bright Smiles Studio" /></label><div className="pp-url-pill" data-cursor="Copy"><span>postproof.app/t/</span><b>{slug}</b><button type="button" onClick={copyLink} aria-label="Copy your Postproof collection link">{copied ? <><Check size={18} /> Copied</> : <><Copy size={18} /> Copy</>}</button></div><p className="pp-copy-announcement" aria-live="polite">{copied ? "Link copied. Your testimonial link is ready to share." : ""}</p><div className="pp-share-row"><span>Share it where people already talk to you</span>{shareOptions.map(({ label, icon: Icon }) => <button key={label} type="button" className={shareChoice === label ? "active" : ""} onClick={() => setShareChoice(label)}><Icon size={16} />{label}</button>)}</div>{shareChoice && <p className="pp-share-note" role="status">You&apos;ll do this from your dashboard.</p>}</div></section>

    <BigQuote />

    <section className="pp-final pp-section" data-section="final"><div className="pp-proof-wall" aria-hidden="true">{Array.from({ length: 15 }).map((_, index) => <span key={index}>“ {samples[index % samples.length].quote.slice(0, 28)}…</span>)}</div><div className="pp-container pp-final-inner"><span className="pp-overline">YOUR TURN</span><h2>Start collecting<br /><em>testimonials today.</em></h2><Link className="pp-button pp-button-coral pp-button-large" href="/signup">Get started free <ArrowUpRight size={18} /></Link><p>Free to start · Real words only · No designer needed</p></div></section>

    <footer className="pp-footer"><div className="pp-container"><div className="pp-footer-rule" /><Wordmark footer /><div className="pp-footer-bottom"><p>Real words. Good design. Better proof.</p><div><Link href="/login">Log in</Link><Link href="/signup">Create account</Link></div><button type="button" onClick={() => window.scrollTo({ top: 0, behavior: paused ? "auto" : "smooth" })} aria-label="Back to top"><ArrowUp size={16} /></button><span>© {new Date().getFullYear()} Postproof</span></div><button className="pp-footer-pause" type="button" onClick={() => setPaused(!paused)}>{paused ? <CirclePlay size={15} /> : <CirclePause size={15} />} {paused ? "Play animations" : "Pause animations"}</button></div></footer>
  </main>;
}
