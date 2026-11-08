"use client";

import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import {
  ArrowDownRight,
  Check,
  CheckCircle2,
  Clipboard,
  Download,
  ExternalLink,
  ImagePlus,
  LockKeyhole,
  MoreHorizontal,
  MousePointer2,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { DragEvent, KeyboardEvent, PointerEvent } from "react";
import ProofText from "@/components/ProofText";
import { Button } from "@/components/ui";

type StudioStatus = "Pending" | "Approved";
type StudioFilter = "All" | "Pending" | "Approved";
type StudioStyle = "Minimal" | "Bold" | "Editorial" | "Dark";
type StudioFormat = "Square" | "Story" | "Wide";
type ToastTone = "coral" | "mint";
type DownloadStatus = "idle" | "loading" | "done";

type Testimonial = {
  id: string;
  initial: string;
  name: string;
  role: string;
  quote: string;
  preview: string;
  status: StudioStatus;
  tone: "peach" | "mint" | "blue" | "lavender" | "yellow";
};

const STUDIO_TIMING = {
  // Timing: first-view stat count-up in milliseconds.
  countUp: 900,
  // Timing: generated graphic shimmer duration in milliseconds.
  generate: 600,
  // Timing: reset reverse cascade and browser refresh pulse in milliseconds.
  reset: 520,
  // Timing: copied label stays visible in milliseconds.
  copied: 1600,
  // Timing: download feedback stays in the done state in milliseconds.
  downloaded: 1800,
  // Timing: toast visibility in milliseconds.
  toast: 2800,
  // Timing: idle auto-demo replay delay after the scripted run finishes.
  autoReplay: 12000,
} as const;

const TESTIMONIALS: Testimonial[] = [
  {
    id: "ayo",
    initial: "A",
    name: "Ayo, founder",
    role: "Common Ground",
    quote: "The work speaks for itself now.",
    preview: "The work speaks for itself now.",
    status: "Approved",
    tone: "mint",
  },
  {
    id: "jane",
    initial: "J",
    name: "Jane O.",
    role: "Northstar Studio",
    quote: "Thoughtful from the first call to the last. I always knew what was happening and why.",
    preview: "Thoughtful from the first call to the la…",
    status: "Pending",
    tone: "peach",
  },
  {
    id: "maya",
    initial: "M",
    name: "Maya R.",
    role: "Moonwell",
    quote: "The care you feel the difference in.",
    preview: "The care you feel the difference in.",
    status: "Approved",
    tone: "blue",
  },
  {
    id: "leo",
    initial: "L",
    name: "Leo M.",
    role: "Field Notes",
    quote: "A calm, clear process that made the whole project feel lighter.",
    preview: "A calm, clear process that made the whole…",
    status: "Pending",
    tone: "lavender",
  },
  {
    id: "sana",
    initial: "S",
    name: "Sana K.",
    role: "Kindred Care",
    quote: "It looks like us, sounds like us, and finally feels easy to share.",
    preview: "It looks like us, sounds like us, and finally…",
    status: "Approved",
    tone: "yellow",
  },
  {
    id: "tom",
    initial: "T",
    name: "Tom B.",
    role: "Atelier 11",
    quote: "You made the complicated feel completely clear.",
    preview: "You made the complicated feel completely…",
    status: "Approved",
    tone: "peach",
  },
  {
    id: "rhea",
    initial: "R",
    name: "Rhea P.",
    role: "Sunday Objects",
    quote: "A thoughtful process from the first call to the last.",
    preview: "A thoughtful process from the first call to…",
    status: "Approved",
    tone: "mint",
  },
];

const STUDIO_STYLES: StudioStyle[] = ["Minimal", "Bold", "Editorial", "Dark"];
const STUDIO_FORMATS: StudioFormat[] = ["Square", "Story", "Wide"];

type StudioState = {
  testimonials: Testimonial[];
  filter: StudioFilter;
  selectedId: string | null;
  style: StudioStyle;
  format: StudioFormat;
  approvedDelta: number;
  generating: boolean;
  graphicReady: boolean;
  toast: { id: number; message: string; tone: ToastTone } | null;
  copied: boolean;
  downloadStatus: DownloadStatus;
  refreshing: boolean;
  toastId: number;
};

const initialStudioState: StudioState = {
  testimonials: TESTIMONIALS,
  filter: "All",
  selectedId: null,
  style: "Bold",
  format: "Square",
  approvedDelta: 0,
  generating: false,
  graphicReady: false,
  toast: null,
  copied: false,
  downloadStatus: "idle",
  refreshing: false,
  toastId: 0,
};

type StudioAction =
  | { type: "select"; id: string }
  | { type: "clearSelection" }
  | { type: "filter"; filter: StudioFilter }
  | { type: "style"; style: StudioStyle }
  | { type: "format"; format: StudioFormat }
  | { type: "approve"; id: string }
  | { type: "generationComplete" }
  | { type: "showToast"; message: string; tone?: ToastTone }
  | { type: "clearToast"; id: number }
  | { type: "copied"; value: boolean }
  | { type: "download"; status: DownloadStatus }
  | { type: "refreshing"; value: boolean }
  | { type: "reset" };

function studioReducer(state: StudioState, action: StudioAction): StudioState {
  switch (action.type) {
    case "select":
      return { ...state, selectedId: action.id };
    case "clearSelection":
      return { ...state, selectedId: null };
    case "filter":
      return { ...state, filter: action.filter };
    case "style":
      return { ...state, style: action.style };
    case "format":
      return { ...state, format: action.format };
    case "approve": {
      const testimonial = state.testimonials.find((item) => item.id === action.id);
      if (!testimonial || testimonial.status === "Approved") return state;
      return {
        ...state,
        testimonials: state.testimonials.map((item) => item.id === action.id ? { ...item, status: "Approved" } : item),
        approvedDelta: state.approvedDelta + 1,
        selectedId: action.id,
        generating: true,
        graphicReady: false,
      };
    }
    case "generationComplete":
      return { ...state, generating: false, graphicReady: true };
    case "showToast": {
      const toastId = state.toastId + 1;
      return { ...state, toastId, toast: { id: toastId, message: action.message, tone: action.tone ?? "coral" } };
    }
    case "clearToast":
      return state.toast?.id === action.id ? { ...state, toast: null } : state;
    case "copied":
      return { ...state, copied: action.value };
    case "download":
      return { ...state, downloadStatus: action.status };
    case "refreshing":
      return { ...state, refreshing: action.value };
    case "reset":
      return { ...initialStudioState, testimonials: TESTIMONIALS, toastId: state.toastId + 1 };
    default:
      return state;
  }
}

function useStudioStore() {
  const [state, dispatch] = useStateReducer(studioReducer, initialStudioState);
  return { state, dispatch };
}

function useStateReducer<T, A>(reducer: (state: T, action: A) => T, initialState: T) {
  const [state, setState] = useState(initialState);
  const dispatch = useCallback((action: A) => setState((current) => reducer(current, action)), [reducer]);
  return [state, dispatch] as const;
}

function getFilteredTestimonials(testimonials: Testimonial[], filter: StudioFilter) {
  return testimonials.filter((item) => filter === "All" || item.status === filter);
}

function SectionHeader({ revealed }: { revealed: boolean }) {
  return (
    <div className="studio-section-header">
      <motion.div
        className="studio-header-copy"
        initial={{ opacity: 0, y: 24 }}
        animate={revealed ? { opacity: 1, y: 0 } : undefined}
        transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
      >
        <span className="studio-eyebrow"><span className="studio-eyebrow-caret" aria-hidden="true" />YOUR STUDIO</span>
        <h2 id="studio-section-heading" className="studio-heading">
          <span className="studio-word-mask"><span className="studio-heading-word" style={{ transitionDelay: "60ms" }}>Good work deserves</span></span>{" "}
          <span className="studio-proof-word studio-word-mask"><ProofText text="good proof." className="studio-proof-text" /><svg className={revealed ? "is-visible" : ""} aria-hidden="true" viewBox="0 0 240 18" preserveAspectRatio="none"><path d="M3 12.5C42 4 73 14 109 9.5s71-3 128-7" /></svg><Sparkles className={`studio-heading-sparkle ${revealed ? "is-visible" : ""}`} aria-hidden="true" /></span>
        </h2>
      </motion.div>
      <motion.p
        className="studio-header-description"
        initial={{ opacity: 0, y: 18 }}
        animate={revealed ? { opacity: 1, y: 0 } : undefined}
        transition={{ duration: 0.55, delay: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
      >
        Try the review flow before you sign up. This is <span className="studio-sample-data" tabIndex={0} aria-describedby="studio-sample-tooltip">sample data<span id="studio-sample-tooltip" className="studio-tooltip" role="tooltip">Nothing is saved or sent anywhere.</span></span>, running entirely in your browser.
      </motion.p>
    </div>
  );
}

function SelectionFrame({ focus }: { focus: "stats" | "row" | "graphic" }) {
  return (
    <motion.div layout className={`studio-selection-frame studio-selection-${focus}`} aria-hidden="true">
      <i /><i /><i /><i />
    </motion.div>
  );
}

function GhostCursor({ active, x, y }: { active: boolean; x: number; y: number }) {
  return (
    <motion.div
      className="studio-ghost-cursor"
      aria-hidden="true"
      animate={{ left: `${x}%`, top: `${y}%`, opacity: active ? 1 : 0, scale: active ? 1 : 0.8 }}
      transition={{ type: "spring", stiffness: 110, damping: 18, mass: 0.7 }}
    >
      <MousePointer2 size={21} fill="#FFF7F3" strokeWidth={1.5} />
      <span className="studio-ghost-halo" />
    </motion.div>
  );
}

function AnimatedCount({ value, reducedMotion }: { value: number; reducedMotion: boolean }) {
  const [displayValue, setDisplayValue] = useState(0);
  const previousValue = useRef(0);

  useEffect(() => {
    const start = previousValue.current;
    const target = value;
    previousValue.current = target;
    if (reducedMotion) return;
    const startedAt = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / STUDIO_TIMING.countUp);
      const eased = 1 - Math.pow(1 - progress, 4);
      setDisplayValue(Math.round(start + (target - start) * eased));
      if (progress < 1) frame = window.requestAnimationFrame(tick);
    };
    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [reducedMotion, value]);

  const digits = String(reducedMotion ? value : displayValue).padStart(String(value).length, "0").split("");
  return <span className="studio-rolling-number" aria-label={String(value)}>{digits.map((digit, index) => <span className="studio-digit" key={`${index}-${digit}`}><AnimatePresence initial={false} mode="popLayout"><motion.span key={`${index}-${digit}`} initial={{ y: "100%", opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: "-100%", opacity: 0 }} transition={{ duration: 0.24, ease: [0.2, 0.8, 0.2, 1] }}>{digit}</motion.span></AnimatePresence></span>)}</span>;
}

function Sparkline() {
  return <svg className="studio-sparkline" aria-hidden="true" viewBox="0 0 120 30" preserveAspectRatio="none"><path d="M2 25C15 23 15 16 27 19s14 2 22-6 12 3 21 1 11-10 19-7 14-7 29-5" /></svg>;
}

function StatCard({ label, value, filter, active, reducedMotion, flash, onFilter }: { label: string; value: number; filter: StudioFilter; active: boolean; reducedMotion: boolean; flash: boolean; onFilter: (filter: StudioFilter) => void }) {
  return (
    <motion.button
      type="button"
      className={`studio-stat-card ${active ? "is-active" : ""} ${flash ? "is-flashing" : ""}`}
      onClick={() => onFilter(filter)}
      whileTap={{ scale: 0.97 }}
      aria-pressed={active}
    >
      <span className="studio-stat-label">{label}</span>
      <strong><AnimatedCount value={value} reducedMotion={reducedMotion} /></strong>
      <span className="studio-stat-caption">{filter === "All" ? "Across your studio" : filter === "Pending" ? "Ready for your eye" : "Ready to share"}</span>
      <Sparkline />
    </motion.button>
  );
}

function StatCards({ state, reducedMotion, onFilter }: { state: StudioState; reducedMotion: boolean; onFilter: (filter: StudioFilter) => void }) {
  const waiting = Math.max(0, 6 - state.approvedDelta);
  const approved = 18 + state.approvedDelta;
  return (
    <div className="studio-stats-grid" aria-label="Studio summary">
      <StatCard label="Total" value={24} filter="All" active={state.filter === "All"} reducedMotion={reducedMotion} flash={false} onFilter={onFilter} />
      <StatCard label="Waiting for review" value={waiting} filter="Pending" active={state.filter === "Pending"} reducedMotion={reducedMotion} flash={state.approvedDelta > 0 && state.approvedDelta % 2 === 1} onFilter={onFilter} />
      <StatCard label="Approved to share" value={approved} filter="Approved" active={state.filter === "Approved"} reducedMotion={reducedMotion} flash={state.approvedDelta > 0 && state.approvedDelta % 2 === 1} onFilter={onFilter} />
    </div>
  );
}

function FilterTabs({ state, counts, onFilter }: { state: StudioState; counts: Record<StudioFilter, number>; onFilter: (filter: StudioFilter) => void }) {
  return (
    <LayoutGroup id="studio-filter-tabs">
      <div className="studio-filter-tabs" role="tablist" aria-label="Testimonial status">
        {(["All", "Pending", "Approved"] as StudioFilter[]).map((filter) => (
          <button key={filter} type="button" role="tab" aria-selected={state.filter === filter} aria-controls="studio-testimonial-list" tabIndex={state.filter === filter ? 0 : -1} className={state.filter === filter ? "is-active" : ""} data-studio-filter={filter} onClick={() => onFilter(filter)} onKeyDown={(event) => {
            if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
            event.preventDefault();
            const index = ["All", "Pending", "Approved"].indexOf(filter);
            const next = event.key === "ArrowRight" ? (index + 1) % 3 : (index + 2) % 3;
            const nextFilter = (["All", "Pending", "Approved"] as StudioFilter[])[next];
            onFilter(nextFilter);
            window.requestAnimationFrame(() => document.querySelector<HTMLButtonElement>(`[data-studio-filter="${nextFilter}"]`)?.focus());
          }}>{state.filter === filter && <motion.span className="studio-tab-indicator" layoutId="studio-filter-indicator" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}<span>{filter}</span><sup>{counts[filter]}</sup></button>
        ))}
      </div>
    </LayoutGroup>
  );
}

function TestimonialRow({ testimonial, selected, reducedMotion, rowRef, onSelect, onApprove, onMessage, onKeyDown }: { testimonial: Testimonial; selected: boolean; reducedMotion: boolean; rowRef: (element: HTMLDivElement | null) => void; onSelect: () => void; onApprove: () => void; onMessage: (message: string) => void; onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => void }) {
  const [hovered, setHovered] = useState(false);
  const expanded = hovered || selected;
  return (
    <motion.div
      ref={rowRef}
      layout
      role="group"
      tabIndex={0}
      aria-label={`${testimonial.name}: ${testimonial.quote}. ${testimonial.status}${selected ? ". Selected" : ""}`}
      className={`studio-testimonial-row ${selected ? "is-selected" : ""} ${expanded ? "is-expanded" : ""}`}
      draggable
      onDragStartCapture={(event: DragEvent<HTMLDivElement>) => event.dataTransfer.setData("text/postproof-testimonial", testimonial.id)}
      onClick={onSelect}
      onKeyDown={onKeyDown}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      transition={{ layout: { duration: reducedMotion ? 0.15 : 0.36, ease: [0.2, 0.8, 0.2, 1] } }}
    >
      <span className={`studio-avatar studio-avatar-${testimonial.tone}`} aria-hidden="true">{testimonial.initial}</span>
      <span className="studio-testimonial-copy"><strong>{testimonial.name}</strong><small>{testimonial.preview}</small><AnimatePresence initial={false}>{expanded && <motion.span className="studio-full-quote" initial={reducedMotion ? { opacity: 0 } : { height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={reducedMotion ? { opacity: 0 } : { height: 0, opacity: 0 }} transition={{ duration: reducedMotion ? 0.15 : 0.24 }}>&ldquo;{testimonial.quote}&rdquo;</motion.span>}</AnimatePresence></span>
      <motion.span className={`studio-status studio-status-${testimonial.status.toLowerCase()}`} layout="position" aria-live="polite">{testimonial.status === "Approved" ? <><Check size={12} aria-hidden="true" /> Approved</> : "Pending"}</motion.span>
      <motion.span className="studio-row-actions" initial={false} animate={{ opacity: expanded ? 1 : 0, x: expanded ? 0 : 8 }} transition={{ duration: reducedMotion ? 0.15 : 0.2 }}>
        {testimonial.status === "Pending" && <button type="button" className="studio-row-approve" onClick={(event) => { event.stopPropagation(); onApprove(); }}><Check size={13} /> Approve</button>}
        <button type="button" onClick={(event) => { event.stopPropagation(); onSelect(); onMessage("Edit is local to this sample."); }}>Edit</button>
        <button type="button" onClick={(event) => { event.stopPropagation(); onMessage("Hidden from this sample view."); }}>Hide</button>
      </motion.span>
    </motion.div>
  );
}

function EmptyGraphic({ selected }: { selected: Testimonial | undefined }) {
  return (
    <div className="studio-empty-graphic">
      <div className="studio-empty-border"><span className="studio-empty-icon"><ImagePlus size={22} /></span><strong>Approve a sample to create a graphic</strong>{selected && <small>Selected: {selected.name}</small>}<span className="studio-drop-note">or drag a row here</span></div>
    </div>
  );
}

function GraphicSkeleton() {
  return <div className="studio-graphic-skeleton" aria-label="Creating graphic"><span /><span /><span /><span /></div>;
}

function GraphicCard({ testimonial, style, format, reducedMotion }: { testimonial: Testimonial; style: StudioStyle; format: StudioFormat; reducedMotion: boolean }) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const handleMove = (event: PointerEvent<HTMLDivElement>) => {
    if (reducedMotion) return;
    const rect = event.currentTarget.getBoundingClientRect();
    setTilt({ x: ((event.clientX - rect.left) / rect.width - 0.5) * 8, y: ((event.clientY - rect.top) / rect.height - 0.5) * -8 });
  };
  return (
    <motion.div
      className={`studio-graphic-card studio-graphic-${style.toLowerCase()} studio-format-${format.toLowerCase()}`}
      layout
      initial={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.92, y: 14 }}
      animate={{ opacity: 1, scale: 1, y: 0, rotateX: tilt.y, rotateY: tilt.x }}
      transition={{ duration: reducedMotion ? 0.15 : 0.6, ease: [0.2, 0.8, 0.2, 1] }}
      onPointerMove={handleMove}
      onPointerLeave={() => setTilt({ x: 0, y: 0 })}
      aria-label={`${style} testimonial graphic for ${testimonial.name}`}
    >
      <span className="studio-card-kicker">POSTPROOF <i>·</i> SAMPLE</span>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.blockquote key={`${style}-${format}-${testimonial.id}`} className="studio-card-quote" initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reducedMotion ? 0.15 : 0.45, delay: reducedMotion ? 0 : 0.1 }}>&ldquo;{testimonial.quote}&rdquo;</motion.blockquote>
      </AnimatePresence>
      <motion.span className="studio-card-author" key={`${testimonial.id}-author`} initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reducedMotion ? 0.15 : 0.42, delay: reducedMotion ? 0 : 0.35 }}>— {testimonial.name}</motion.span>
      <motion.span className="studio-postproof-mark" initial={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.6, rotate: -14 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 420, damping: 18, delay: reducedMotion ? 0 : 0.5 }}>“</motion.span>
      <span className="studio-card-sparkles" aria-hidden="true"><i /><i /><i /><i /></span>
    </motion.div>
  );
}

function StyleChips({ style, onChange }: { style: StudioStyle; onChange: (style: StudioStyle) => void }) {
  return <LayoutGroup id="studio-style-chips"><div className="studio-style-chips" role="radiogroup" aria-label="Graphic style">{STUDIO_STYLES.map((item) => <button type="button" key={item} role="radio" aria-checked={style === item} className={style === item ? "is-active" : ""} onClick={() => onChange(item)}>{style === item && <motion.span layoutId="studio-style-indicator" className="studio-chip-indicator" transition={{ type: "spring", stiffness: 420, damping: 32 }} />}<span>{item}</span></button>)}</div></LayoutGroup>;
}

function FormatToggle({ format, onChange }: { format: StudioFormat; onChange: (format: StudioFormat) => void }) {
  return <div className="studio-format-toggle" role="radiogroup" aria-label="Graphic format">{STUDIO_FORMATS.map((item) => <button type="button" key={item} role="radio" aria-checked={format === item} className={format === item ? "is-active" : ""} onClick={() => onChange(item)}>{item}</button>)}</div>;
}

function ActionRow({ state, onCopy, onDownload, onShare }: { state: StudioState; onCopy: () => void; onDownload: () => void; onShare: () => void }) {
  return <div className="studio-action-row"><motion.button type="button" whileTap={{ scale: 0.97 }} onClick={onCopy}><AnimatePresence mode="wait" initial={false}>{state.copied ? <motion.span key="copied" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}><Check size={14} /> Copied</motion.span> : <motion.span key="copy" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}><Clipboard size={14} /> Copy embed</motion.span>}</AnimatePresence></motion.button><motion.button type="button" whileTap={{ scale: 0.97 }} onClick={onDownload} disabled={state.downloadStatus === "loading"}><span className={`studio-download-icon studio-download-${state.downloadStatus}`}>{state.downloadStatus === "done" ? <Check size={14} /> : <Download size={14} />}</span>{state.downloadStatus === "loading" ? "Creating…" : state.downloadStatus === "done" ? "Downloaded" : "Download PNG"}</motion.button><motion.button type="button" whileTap={{ scale: 0.97 }} onClick={onShare}><ExternalLink size={14} /> Share link</motion.button></div>;
}

function GraphicPanel({ state, selected, reducedMotion, onStyle, onFormat, onCopy, onDownload, onShare, onDrop, onMessage }: { state: StudioState; selected: Testimonial | undefined; reducedMotion: boolean; onStyle: (style: StudioStyle) => void; onFormat: (format: StudioFormat) => void; onCopy: () => void; onDownload: () => void; onShare: () => void; onDrop: (id: string) => void; onMessage: (message: string) => void }) {
  const [dragOver, setDragOver] = useState(false);
  const graphicTestimonial = TESTIMONIALS.find((item) => item.id === "maya") ?? TESTIMONIALS[0];
  return (
    <div className={`studio-graphic-panel ${dragOver ? "is-drag-over" : ""}`} onDragOver={(event) => { event.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={(event) => { event.preventDefault(); setDragOver(false); const id = event.dataTransfer.getData("text/postproof-testimonial"); if (id) onDrop(id); }}>
      <div className="studio-panel-heading"><span className="studio-panel-kicker">CREATE GRAPHIC</span><span className="studio-panel-dots"><i /><i /><i /></span></div>
      <div className="studio-graphic-reserved">
        <AnimatePresence mode="wait" initial={false}>{state.generating ? <motion.div key="generating" className="studio-generating-state" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><GraphicSkeleton /><span>Composing the good stuff…</span></motion.div> : state.graphicReady ? <motion.div key="ready" className="studio-ready-state" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><GraphicCard testimonial={graphicTestimonial} style={state.style} format={state.format} reducedMotion={reducedMotion} /><StyleChips style={state.style} onChange={onStyle} /><FormatToggle format={state.format} onChange={onFormat} /></motion.div> : <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><EmptyGraphic selected={selected} /></motion.div>}</AnimatePresence>
      </div>
      {state.graphicReady && <motion.div className="studio-actions-wrap" initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}><ActionRow state={state} onCopy={onCopy} onDownload={onDownload} onShare={onShare} /></motion.div>}
      {dragOver && <span className="studio-drop-label"><ArrowDownRight size={14} /> Drop to approve &amp; design</span>}
      {!state.graphicReady && !state.generating && <span className="studio-panel-help">Approve a pending row to unlock the graphic.</span>}
      {state.graphicReady && <button type="button" className="studio-secondary-message" onClick={() => onMessage("This graphic is sample data — make one yours when you sign up.")}>Sample graphic <MoreHorizontal size={14} /></button>}
    </div>
  );
}

function Toast({ toast }: { toast: StudioState["toast"] }) {
  return <AnimatePresence>{toast && <motion.div key={toast.id} className={`studio-toast studio-toast-${toast.tone}`} role="status" aria-live="polite" initial={{ opacity: 0, y: 18, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.98 }} transition={{ type: "spring", stiffness: 380, damping: 28 }}><span>{toast.tone === "mint" ? <CheckCircle2 size={16} /> : <Sparkles size={16} />}</span>{toast.message}</motion.div>}</AnimatePresence>;
}

function ResetButton({ refreshing, onReset }: { refreshing: boolean; onReset: () => void }) {
  return <Button type="button" variant="primary" size="md" shape="pill" className="studio-reset-button" leftIcon={<RefreshCw size={14} className={refreshing ? "is-spinning" : ""} />} onClick={onReset}>Reset demo</Button>;
}

function copyText(value: string) {
  if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(value).then(() => true).catch(() => false);
  try {
    const area = document.createElement("textarea");
    area.value = value;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    const result = document.execCommand("copy");
    document.body.removeChild(area);
    return Promise.resolve(result);
  } catch {
    return Promise.resolve(false);
  }
}

function wrapCanvasText(context: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  words.forEach((word) => {
    const next = line ? `${line} ${word}` : word;
    if (context.measureText(next).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  });
  if (line) lines.push(line);
  return lines;
}

async function exportGraphic(testimonial: Testimonial, style: StudioStyle, format: StudioFormat) {
  const dimensions = format === "Story" ? { width: 900, height: 1600 } : format === "Wide" ? { width: 1600, height: 900 } : { width: 1200, height: 1200 };
  const canvas = document.createElement("canvas");
  canvas.width = dimensions.width;
  canvas.height = dimensions.height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas unavailable");
  const palette = style === "Bold" || style === "Dark" ? { background: "#1A1613", ink: "#FFF7F3", accent: "#F0522D" } : style === "Editorial" ? { background: "#F6F1E8", ink: "#1A1613", accent: "#F0522D" } : { background: "#FFFFFF", ink: "#1A1613", accent: "#F0522D" };
  context.fillStyle = palette.background;
  context.fillRect(0, 0, dimensions.width, dimensions.height);
  const pad = dimensions.width * 0.1;
  context.fillStyle = palette.accent;
  context.font = "700 28px Arial";
  context.fillText("POSTPROOF · SAMPLE", pad, pad + 8);
  context.fillStyle = palette.ink;
  context.font = style === "Editorial" ? "italic 76px Georgia" : style === "Minimal" ? "500 70px Arial" : "800 76px Arial";
  const lines = wrapCanvasText(context, `“${testimonial.quote}”`, dimensions.width - pad * 2);
  const lineHeight = style === "Editorial" ? 92 : 84;
  const quoteStart = dimensions.height * 0.34;
  lines.forEach((line, index) => context.fillText(line, pad, quoteStart + index * lineHeight));
  context.font = "500 30px Arial";
  context.fillText(`— ${testimonial.name}`, pad, dimensions.height - pad * 1.25);
  context.fillStyle = palette.accent;
  context.beginPath();
  context.arc(dimensions.width - pad, dimensions.height - pad, 29, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = palette.ink;
  context.font = "700 34px Georgia";
  context.fillText("“", dimensions.width - pad - 11, dimensions.height - pad + 12);
  const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((result) => result ? resolve(result) : reject(new Error("Could not create PNG")), "image/png"));
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `postproof-${testimonial.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.png`;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function BrowserChrome({ loadingKey }: { loadingKey: string }) {
  return <div className="studio-browser-chrome"><span className="studio-chrome-dots"><i /><i /><i /></span><span className="studio-url-pill"><LockKeyhole size={12} /> postproof.app/dashboard</span><motion.span key={loadingKey} className="studio-loading-bar" initial={{ scaleX: 0, opacity: 0 }} animate={{ scaleX: 1, opacity: [0, 1, 1, 0] }} transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1], times: [0, 0.12, 0.8, 1] }} /></div>;
}

export default function StudioSection() {
  const { state, dispatch } = useStudioStore();
  const sectionRef = useRef<HTMLElement>(null);
  const browserRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const timelineTimers = useRef<number[]>([]);
  const replayTimer = useRef<number | null>(null);
  const generationTimer = useRef<number | null>(null);
  const copyTimer = useRef<number | null>(null);
  const downloadTimer = useRef<number | null>(null);
  const toastTimer = useRef<number | null>(null);
  const autoRunning = useRef(false);
  const autoHasPlayed = useRef(false);
  const runAutoDemoRef = useRef<(() => void) | null>(null);
  const hasRealInteraction = useRef(false);
  const [revealed, setRevealed] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [pointer, setPointer] = useState({ x: 50, y: 50 });
  const [ghost, setGhost] = useState({ active: false, x: 10, y: 82 });
  const [hintVisible, setHintVisible] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);

  const visibleTestimonials = useMemo(() => getFilteredTestimonials(state.testimonials, state.filter), [state.filter, state.testimonials]);
  const selected = state.testimonials.find((item) => item.id === state.selectedId);
  const counts = useMemo(() => ({
    All: state.testimonials.length,
    Pending: state.testimonials.filter((item) => item.status === "Pending").length,
    Approved: state.testimonials.filter((item) => item.status === "Approved").length,
  }), [state.testimonials]);
  const focus = state.graphicReady ? "graphic" : state.selectedId ? "row" : "stats";
  const loadingKey = `${state.filter}-${state.selectedId ?? "none"}-${state.style}-${state.format}-${state.generating}-${state.graphicReady}-${state.approvedDelta}`;

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const element = sectionRef.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) {
        setRevealed(true);
        observer.disconnect();
      }
    }, { threshold: 0.25 });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const clearTimeline = useCallback(() => {
    timelineTimers.current.forEach((timer) => window.clearTimeout(timer));
    timelineTimers.current = [];
  }, []);

  const cancelAutoDemo = useCallback(() => {
    clearTimeline();
    if (replayTimer.current) window.clearTimeout(replayTimer.current);
    replayTimer.current = null;
    autoRunning.current = false;
    setGhost((current) => ({ ...current, active: false }));
    if (!hasRealInteraction.current) {
      hasRealInteraction.current = true;
      setHintVisible(false);
    }
  }, [clearTimeline]);

  const showMessage = useCallback((message: string, tone: ToastTone = "coral") => {
    dispatch({ type: "showToast", message, tone });
  }, [dispatch]);

  const approveTestimonial = useCallback((id: string, scripted = false) => {
    if (!scripted) cancelAutoDemo();
    const testimonial = state.testimonials.find((item) => item.id === id);
    if (!testimonial || testimonial.status === "Approved") return;
    dispatch({ type: "approve", id });
    if (generationTimer.current) window.clearTimeout(generationTimer.current);
    generationTimer.current = window.setTimeout(() => {
      dispatch({ type: "generationComplete" });
      showMessage("Approved. Graphic ready.");
    }, STUDIO_TIMING.generate);
  }, [cancelAutoDemo, dispatch, showMessage, state.testimonials]);

  const selectFilter = useCallback((filter: StudioFilter) => {
    cancelAutoDemo();
    dispatch({ type: "filter", filter });
  }, [cancelAutoDemo, dispatch]);

  const selectRow = useCallback((id: string) => {
    cancelAutoDemo();
    dispatch({ type: "select", id });
  }, [cancelAutoDemo, dispatch]);

  const scheduleAuto = useCallback((callback: () => void, delay: number) => {
    const timer = window.setTimeout(() => {
      timelineTimers.current = timelineTimers.current.filter((item) => item !== timer);
      if (autoRunning.current) callback();
    }, delay);
    timelineTimers.current.push(timer);
  }, []);

  const runAutoDemo = useCallback(() => {
    if (reducedMotion || autoRunning.current || hasRealInteraction.current) return;
    clearTimeline();
    autoRunning.current = true;
    setHintVisible(false);
    setGhost({ active: true, x: 11, y: 84 });
    // Timing: ghost cursor drift into the review row.
    scheduleAuto(() => { setGhost({ active: true, x: 31, y: 59 }); dispatch({ type: "select", id: "jane" }); }, 700);
    // Timing: leave the row expanded long enough for the action affordances to be read.
    scheduleAuto(() => setGhost({ active: true, x: 48, y: 68 }), 1500);
    // Timing: scripted approval moment.
    scheduleAuto(() => approveTestimonial("jane", true), 2200);
    // Timing: wait through the generation shimmer.
    scheduleAuto(() => setGhost({ active: true, x: 73, y: 52 }), 3100);
    // Timing: move across the style chips after the graphic assembles.
    scheduleAuto(() => { dispatch({ type: "style", style: "Editorial" }); setGhost({ active: true, x: 66, y: 78 }); }, 3900);
    scheduleAuto(() => { dispatch({ type: "style", style: "Bold" }); setGhost({ active: true, x: 75, y: 78 }); }, 4550);
    // Timing: finish on the copy action.
    scheduleAuto(() => { setGhost({ active: true, x: 33, y: 91 }); dispatch({ type: "copied", value: true }); showMessage("Embed copied to your clipboard.", "mint"); }, 5300);
    // Timing: ghost cursor fades after the complete scripted loop.
    scheduleAuto(() => {
      autoRunning.current = false;
      setGhost((current) => ({ ...current, active: false }));
      setHintVisible(true);
      if (!hasRealInteraction.current) {
        replayTimer.current = window.setTimeout(() => {
          if (hasRealInteraction.current) return;
          dispatch({ type: "reset" });
          setHintVisible(false);
          autoHasPlayed.current = true;
          runAutoDemoRef.current?.();
        }, STUDIO_TIMING.autoReplay);
      }
    }, 6500);
  }, [approveTestimonial, clearTimeline, dispatch, reducedMotion, scheduleAuto, showMessage]);

  useEffect(() => {
    runAutoDemoRef.current = runAutoDemo;
  }, [runAutoDemo]);

  useEffect(() => {
    const element = sectionRef.current;
    if (!element || reducedMotion) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting && entry.intersectionRatio >= 0.5 && !autoHasPlayed.current && !hasRealInteraction.current) {
        autoHasPlayed.current = true;
        runAutoDemo();
        observer.disconnect();
      }
    }, { threshold: [0.5] });
    observer.observe(element);
    return () => observer.disconnect();
  }, [reducedMotion, runAutoDemo]);

  useEffect(() => {
    if (!state.toast) return;
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    const id = state.toast.id;
    toastTimer.current = window.setTimeout(() => dispatch({ type: "clearToast", id }), STUDIO_TIMING.toast);
    return () => { if (toastTimer.current) window.clearTimeout(toastTimer.current); };
  }, [dispatch, state.toast]);

  useEffect(() => () => {
    clearTimeline();
    if (replayTimer.current) window.clearTimeout(replayTimer.current);
    if (generationTimer.current) window.clearTimeout(generationTimer.current);
    if (copyTimer.current) window.clearTimeout(copyTimer.current);
    if (downloadTimer.current) window.clearTimeout(downloadTimer.current);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
  }, [clearTimeline]);

  const onStagePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    cancelAutoDemo();
    if (!reducedMotion) {
      const rect = event.currentTarget.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      setPointer({ x: x * 100, y: y * 100 });
      setTilt({ x: Math.max(-5, Math.min(5, (x - 0.5) * 10)), y: Math.max(-5, Math.min(5, (0.5 - y) * 10)) });
    }
  };

  const onStagePointerLeave = () => {
    if (reducedMotion) return;
    setTilt({ x: 0, y: 0 });
    setPointer({ x: 50, y: 50 });
  };

  const resetDemo = () => {
    cancelAutoDemo();
    if (generationTimer.current) window.clearTimeout(generationTimer.current);
    dispatch({ type: "reset" });
    dispatch({ type: "refreshing", value: true });
    window.setTimeout(() => dispatch({ type: "refreshing", value: false }), STUDIO_TIMING.reset);
  };

  const onCopy = async () => {
    cancelAutoDemo();
    await copyText("<blockquote data-postproof>Good work deserves good proof.</blockquote>");
    dispatch({ type: "copied", value: true });
    showMessage("Embed copied to your clipboard.", "mint");
    if (copyTimer.current) window.clearTimeout(copyTimer.current);
    copyTimer.current = window.setTimeout(() => dispatch({ type: "copied", value: false }), STUDIO_TIMING.copied);
  };

  const onDownload = async () => {
    cancelAutoDemo();
    if (state.downloadStatus === "loading") return;
    dispatch({ type: "download", status: "loading" });
    try {
      await exportGraphic(TESTIMONIALS.find((item) => item.id === "maya") ?? TESTIMONIALS[0], state.style, state.format);
      dispatch({ type: "download", status: "done" });
      showMessage("PNG downloaded.", "mint");
      if (downloadTimer.current) window.clearTimeout(downloadTimer.current);
      downloadTimer.current = window.setTimeout(() => dispatch({ type: "download", status: "idle" }), STUDIO_TIMING.downloaded);
    } catch {
      dispatch({ type: "download", status: "idle" });
      showMessage("PNG export is unavailable in this browser.");
    }
  };

  const onShare = async () => {
    cancelAutoDemo();
    await copyText("https://postproof.app/studio/sample");
    showMessage("Sample link copied.", "mint");
  };

  const onRowKeyDown = (event: KeyboardEvent<HTMLDivElement>, id: string) => {
    cancelAutoDemo();
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const index = visibleTestimonials.findIndex((item) => item.id === id);
      const next = event.key === "ArrowDown" ? Math.min(visibleTestimonials.length - 1, index + 1) : Math.max(0, index - 1);
      const nextId = visibleTestimonials[next]?.id;
      if (nextId) {
        dispatch({ type: "select", id: nextId });
        rowRefs.current[nextId]?.focus();
      }
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      dispatch({ type: "select", id });
      return;
    }
    if (event.key.toLowerCase() === "a") {
      event.preventDefault();
      approveTestimonial(id);
      return;
    }
    if (event.key === "Escape") dispatch({ type: "clearSelection" });
  };

  return (
    <section ref={sectionRef} className={`studio-section pp-section ${revealed ? "is-revealed" : ""}`} data-section="studio" aria-labelledby="studio-section-heading">
      <div className="studio-section-glow" aria-hidden="true" />
      <div className="studio-section-inner pp-container">
        <SectionHeader revealed={revealed} />
        <div className="studio-stage-wrap" onPointerMove={onStagePointerMove} onPointerLeave={onStagePointerLeave} onTouchStart={cancelAutoDemo} onKeyDown={() => cancelAutoDemo()}>
          <div className="studio-confetti" aria-hidden="true">{[0, 1, 2, 3, 4, 5].map((item) => <i key={item} style={{ left: `${14 + item * 14}%`, top: `${18 + (item % 3) * 27}%`, transform: `translate3d(${(pointer.x - 50) * (0.12 + item * 0.01)}px, ${(pointer.y - 50) * (0.12 + item * 0.01)}px, 0)` }} />)}</div>
          <SelectionFrame focus={focus} />
          <GhostCursor {...ghost} />
          <motion.div
            ref={browserRef}
            className={`studio-browser ${state.refreshing ? "is-refreshing" : ""}`}
            initial={{ opacity: 0, y: 40, scale: 0.94, filter: "blur(8px)" }}
            animate={revealed ? { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", rotateX: reducedMotion ? 0 : 6 + tilt.y, rotateY: reducedMotion ? 0 : -4 + tilt.x, rotateZ: reducedMotion ? 0 : -1.5 } : undefined}
            transition={{ duration: reducedMotion ? 0.15 : 0.7, ease: [0.2, 0.8, 0.2, 1] }}
            style={{ transformPerspective: 1400 }}
            onPointerEnter={() => { if (!hasRealInteraction.current) cancelAutoDemo(); }}
          >
            <BrowserChrome loadingKey={loadingKey} />
            <motion.div className="studio-dashboard" initial={{ opacity: 0, y: 8 }} animate={revealed ? { opacity: 1, y: 0 } : undefined} transition={{ duration: reducedMotion ? 0.15 : 0.5, delay: reducedMotion ? 0 : 0.18, ease: [0.2, 0.8, 0.2, 1] }}>
              <header className="studio-dashboard-header">
                <div><span className="studio-dashboard-kicker">YOUR STUDIO <i>·</i> SAMPLE DATA</span><h3 id="studio-dashboard-title">Good work deserves good proof.</h3></div>
                <div className="studio-avatar-menu-wrap" onPointerEnter={() => setAvatarOpen(true)} onPointerLeave={() => setAvatarOpen(false)}>
                  <button type="button" className="studio-owner-avatar" aria-label="Open Maya's studio menu" aria-expanded={avatarOpen} onClick={() => setAvatarOpen((value) => !value)}>M</button>
                  <AnimatePresence>{avatarOpen && <motion.div className="studio-avatar-menu" initial={{ opacity: 0, y: -5, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -5, scale: 0.96 }}><strong>Maya&apos;s studio</strong><button type="button" onClick={resetDemo}>Reset demo</button></motion.div>}</AnimatePresence>
                </div>
              </header>
              <StatCards state={state} reducedMotion={reducedMotion} onFilter={selectFilter} />
              <div className="studio-dashboard-body">
                <section className="studio-list-panel" aria-label="Testimonials">
                  <div className="studio-list-heading"><span>RECENT TESTIMONIALS</span><span>{counts.All} samples</span></div>
                  <FilterTabs state={state} counts={counts} onFilter={selectFilter} />
                  <div id="studio-testimonial-list" className="studio-testimonial-list" role="list" aria-label={`${state.filter} testimonials`}>
                    <AnimatePresence initial={false} mode="popLayout">{visibleTestimonials.map((testimonial) => <TestimonialRow key={testimonial.id} testimonial={testimonial} selected={state.selectedId === testimonial.id} reducedMotion={reducedMotion} rowRef={(element) => { rowRefs.current[testimonial.id] = element; }} onSelect={() => selectRow(testimonial.id)} onApprove={() => approveTestimonial(testimonial.id)} onMessage={showMessage} onKeyDown={(event) => onRowKeyDown(event, testimonial.id)} />)}</AnimatePresence>
                  </div>
                  <span className="studio-scroll-fade studio-scroll-fade-top" aria-hidden="true" /><span className="studio-scroll-fade studio-scroll-fade-bottom" aria-hidden="true" />
                </section>
                <GraphicPanel state={state} selected={selected} reducedMotion={reducedMotion} onStyle={(style) => { cancelAutoDemo(); dispatch({ type: "style", style }); }} onFormat={(format) => { cancelAutoDemo(); dispatch({ type: "format", format }); }} onCopy={onCopy} onDownload={onDownload} onShare={onShare} onDrop={(id) => approveTestimonial(id)} onMessage={showMessage} />
              </div>
            </motion.div>
            <Toast toast={state.toast} />
          </motion.div>
          <div className="studio-stage-dots" aria-hidden="true"><i /><i /><i /></div>
        </div>
        <div className={`studio-try-hint ${hintVisible ? "is-visible" : ""}`} aria-hidden={!hintVisible}><span>Try it yourself</span><ArrowDownRight size={15} /></div>
        <ResetButton refreshing={state.refreshing} onReset={resetDemo} />
      </div>
    </section>
  );
}
