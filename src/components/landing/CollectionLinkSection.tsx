"use client";

import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import {
  Check,
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  Camera,
  Heart,
  Link2,
  Mail,
  MessageCircle,
  MessageSquareText,
  Pencil,
  Sparkles,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import type { CSSProperties, PointerEvent } from "react";
import CurvedInput from "@/components/CurvedInput";

type Channel = "WhatsApp" | "Instagram" | "Email" | "SMS";
type Availability = "idle" | "checking" | "available" | "taken";
type ToastTone = "mint" | "coral";

type LinkState = {
  businessName: string;
  slug: string;
  channel: Channel | null;
  copied: boolean;
  messageCopied: boolean;
  availability: Availability;
  toast: { id: number; message: string; tone: ToastTone } | null;
  copyPulse: number;
  toastId: number;
};

const LINK_TIMING = {
  // Timing: rotating empty input placeholder in milliseconds.
  placeholder: 3000,
  // Timing: local availability check after typing stops in milliseconds.
  availability: 500,
  // Timing: copied label and mint button state in milliseconds.
  copied: 1800,
  // Timing: typed message character reveal in milliseconds per character.
  messageCharacter: 12,
  // Timing: toast visibility in milliseconds.
  toast: 2800,
  // Timing: reset of the input shake in milliseconds.
  shake: 240,
  // Timing: guided demo character cadence in milliseconds.
  demoCharacter: 70,
  // Timing: idle replay delay after the guided demo finishes in milliseconds.
  autoReplay: 12000,
} as const;

const PLACEHOLDERS = ["Bright Smiles Studio", "Moonwell Coffee", "Ayo Fitness", "Lumen Photography"];
const RESERVED_SLUGS = new Set(["admin", "test", "postproof"]);
const CHANNELS: Channel[] = ["WhatsApp", "Instagram", "Email", "SMS"];

const initialLinkState: LinkState = {
  businessName: "",
  slug: "",
  channel: null,
  copied: false,
  messageCopied: false,
  availability: "idle",
  toast: null,
  copyPulse: 0,
  toastId: 0,
};

type LinkAction =
  | { type: "business"; value: string }
  | { type: "slug"; value: string }
  | { type: "availability"; value: Availability }
  | { type: "channel"; value: Channel | null }
  | { type: "copied"; value: boolean }
  | { type: "messageCopied"; value: boolean }
  | { type: "toast"; message: string; tone?: ToastTone }
  | { type: "clearToast"; id: number }
  | { type: "copyPulse" };

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 40);
}

function linkReducer(state: LinkState, action: LinkAction): LinkState {
  switch (action.type) {
    case "business":
      return { ...state, businessName: action.value, slug: slugify(action.value), availability: "idle" };
    case "slug":
      return { ...state, slug: slugify(action.value), availability: "idle" };
    case "availability":
      return { ...state, availability: action.value };
    case "channel":
      return { ...state, channel: action.value, messageCopied: false };
    case "copied":
      return { ...state, copied: action.value };
    case "messageCopied":
      return { ...state, messageCopied: action.value };
    case "toast": {
      const toastId = state.toastId + 1;
      return { ...state, toastId, toast: { id: toastId, message: action.message, tone: action.tone ?? "coral" } };
    }
    case "clearToast":
      return state.toast?.id === action.id ? { ...state, toast: null } : state;
    case "copyPulse":
      return { ...state, copyPulse: state.copyPulse + 1 };
    default:
      return state;
  }
}

function IconForChannel({ channel }: { channel: Channel }) {
  if (channel === "WhatsApp") return <MessageCircle size={16} aria-hidden="true" />;
  if (channel === "Instagram") return <Camera size={16} aria-hidden="true" />;
  if (channel === "Email") return <Mail size={16} aria-hidden="true" />;
  return <MessageSquareText size={16} aria-hidden="true" />;
}

function SectionHeader({ revealed }: { revealed: boolean }) {
  return (
    <div className="collection-header">
      <motion.span className="collection-eyebrow" initial={{ opacity: 0 }} animate={revealed ? { opacity: 1 } : undefined} transition={{ duration: 0.45 }}><i aria-hidden="true" />YOUR COLLECTION LINK</motion.span>
      <motion.h2 id="collection-heading" className="collection-heading" initial={{ opacity: 0, y: 18 }} animate={revealed ? { opacity: 1, y: 0 } : undefined} transition={{ duration: 0.6, delay: 0.08, ease: [0.2, 0.8, 0.2, 1] }}>Make it easy to say something <span className="collection-kind">kind<svg aria-hidden="true" viewBox="0 0 110 16" preserveAspectRatio="none"><path d="M2 11.5C24 4 44 14 66 8s25 2 42-4" /></svg><Heart className="collection-heart" size={17} fill="currentColor" /></span>.</motion.h2>
    </div>
  );
}

function NameInput({ value, onChange, onEnter, reducedMotion, realInteraction }: { value: string; onChange: (value: string) => void; onEnter: () => void; reducedMotion: boolean; realInteraction: () => void }) {
  const [focused, setFocused] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [shake, setShake] = useState(false);
  const [emptyFlash, setEmptyFlash] = useState(false);

  useEffect(() => {
    if (value || focused || reducedMotion) return;
    const timer = window.setInterval(() => setPlaceholderIndex((current) => (current + 1) % PLACEHOLDERS.length), LINK_TIMING.placeholder);
    return () => window.clearInterval(timer);
  }, [focused, reducedMotion, value]);

  const submit = () => {
    if (!value.trim()) {
      setShake(true);
      setEmptyFlash(true);
      window.setTimeout(() => setShake(false), LINK_TIMING.shake);
      window.setTimeout(() => setEmptyFlash(false), LINK_TIMING.shake + 120);
      document.getElementById("collection-business")?.focus();
      return;
    }
    onEnter();
  };

  return (
    <div className={`collection-input-wrap ${shake ? "is-shaking" : ""}`}>
      <label htmlFor="collection-business" className={focused || value ? "is-floating" : ""}>What&apos;s your business called?</label>
      <div className={`collection-input-curved-shell ${focused ? "is-focused" : ""} ${emptyFlash ? "is-empty-flash" : ""}`}>
        <CurvedInput id="collection-business" className="collection-name-input" value={value} maxLength={40} onChange={(nextValue) => { realInteraction(); onChange(nextValue); }} onSubmit={submit} onFocus={() => { realInteraction(); setFocused(true); }} onBlur={() => setFocused(false)} placeholder={PLACEHOLDERS[placeholderIndex]} ariaLabel="What&apos;s your business called?" type="text" width="100%" bend={8} height={64} cornerRadius={28} fontSize={14} backgroundColor="#FAF7F2" textColor="#1A1613" placeholderColor="#8C847A" borderColor="rgba(26,22,19,.35)" buttonColor="#F0522D" iconColor="#F0522D" shadowSize="none" showIcon={false} showButton={false} />
        {value && <span className="collection-input-valid" aria-hidden="true">{value.trim().length > 1 ? <Check size={16} /> : <Sparkles size={15} />}</span>}
      </div>
      <span id="collection-business-counter" className={`collection-counter ${value.length >= 30 ? "is-visible" : ""}`}>{value.length}/40</span>
    </div>
  );
}

function SlugText({ slug, editing, onBeginEdit, onCommit, reducedMotion }: { slug: string; editing: boolean; onBeginEdit: () => void; onCommit: (value: string) => void; reducedMotion: boolean }) {
  const [draft, setDraft] = useState(slug);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);
  const commit = () => onCommit(draft);
  if (editing) return <input ref={inputRef} className="collection-slug-editor" value={draft} aria-label="Edit collection slug" onChange={(event) => setDraft(event.target.value)} onBlur={commit} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); commit(); } if (event.key === "Escape") onCommit(slug); }} />;
  return <button type="button" className={`collection-slug-text ${slug ? "is-filled" : "is-empty"}`} onClick={onBeginEdit} aria-label={slug ? `Edit slug ${slug}` : "Edit your collection slug"}><AnimatePresence initial={false} mode="popLayout">{slug ? [...slug].map((character, index) => <motion.span key={`${index}-${character}`} initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 8 }} transition={{ duration: reducedMotion ? 0.15 : 0.24, delay: reducedMotion ? 0 : index * 0.02 }}>{character}</motion.span>) : <motion.span key="yourname" className="collection-slug-ghost" initial={{ opacity: 0 }} animate={{ opacity: .25 }} exit={{ opacity: 0 }}>yourname</motion.span>}</AnimatePresence><Pencil className="collection-slug-pencil" size={13} aria-hidden="true" /></button>;
}

function AvailabilityBadge({ availability, slug, onSuggestion }: { availability: Availability; slug: string; onSuggestion: () => void }) {
  if (availability === "idle" || !slug) return null;
  if (availability === "checking") return <span className="collection-availability is-checking" role="status" aria-live="polite"><i /> Checking…</span>;
  if (availability === "available") return <span className="collection-availability is-available" role="status" aria-live="polite"><Check size={12} /> Available</span>;
  return <button type="button" className="collection-availability is-taken" onClick={onSuggestion} role="status" aria-live="polite">Taken. Try {slug}-co</button>;
}

function CopyButton({ disabled, copied, onClick }: { disabled: boolean; copied: boolean; onClick: () => void }) {
  return <motion.button type="button" className={`collection-copy-button ${copied ? "is-copied" : ""}`} disabled={disabled} onClick={onClick} whileTap={{ scale: .96 }} aria-label={disabled ? "Type your business name first" : copied ? "Link copied" : "Copy collection link"}>{copied ? <Check size={17} /> : <Copy size={17} />}<span>{copied ? "Copied" : "Copy"}</span>{disabled && <span className="collection-copy-tooltip">Type your business name first</span>}</motion.button>;
}

function LinkPill({ state, reducedMotion, onSlug, onCopy, onRealInteraction }: { state: LinkState; reducedMotion: boolean; onSlug: (value: string) => void; onCopy: () => void; onRealInteraction: () => void }) {
  const [editing, setEditing] = useState(false);
  const slug = state.slug;
  return (
    <div className={`collection-link-area ${state.copyPulse ? "has-pulse" : ""}`}>
      <div className="collection-link-underglow" aria-hidden="true" />
      <motion.div className="collection-link-pill" animate={state.copyPulse ? { scale: [1, 1.01, 1] } : undefined} transition={{ duration: reducedMotion ? .15 : .36, ease: [0.2, 0.8, 0.2, 1] }}>
        <span className="collection-link-icon"><Link2 size={18} /></span>
        <button type="button" className="collection-url-display" onClick={() => { if (!editing && slug) onCopy(); }} onMouseEnter={onRealInteraction} aria-label={slug ? "Copy collection link" : "Your empty collection link"}>
          <span>postproof.app/t/</span>
          <SlugText key={slug} slug={slug} editing={editing} onBeginEdit={() => { onRealInteraction(); setEditing(true); }} onCommit={(value) => { setEditing(false); onSlug(value); }} reducedMotion={reducedMotion} />
        </button>
        <div className="collection-link-actions"><AvailabilityBadge availability={state.availability} slug={slug} onSuggestion={() => onSlug(`${slug}-co`)} /><CopyButton disabled={!slug} copied={state.copied} onClick={onCopy} /></div>
      </motion.div>
      <ConfettiBurst pulse={state.copyPulse} />
    </div>
  );
}

const QR_SIZE = 21;

function createQrMatrix(value: string) {
  const matrix = Array.from({ length: QR_SIZE }, () => Array.from({ length: QR_SIZE }, () => false));
  const reserved = Array.from({ length: QR_SIZE }, () => Array.from({ length: QR_SIZE }, () => false));
  const addFinder = (startX: number, startY: number) => {
    for (let y = -1; y < 8; y += 1) for (let x = -1; x < 8; x += 1) {
      const px = startX + x;
      const py = startY + y;
      if (px < 0 || py < 0 || px >= QR_SIZE || py >= QR_SIZE) continue;
      reserved[py][px] = true;
      matrix[py][px] = x >= 0 && x <= 6 && y >= 0 && y <= 6 && (x === 0 || x === 6 || y === 0 || y === 6 || (x >= 2 && x <= 4 && y >= 2 && y <= 4));
    }
  };
  addFinder(0, 0); addFinder(QR_SIZE - 7, 0); addFinder(0, QR_SIZE - 7);
  let seed = 0;
  for (const character of value) seed = (seed * 31 + character.charCodeAt(0)) >>> 0;
  const random = () => { seed = (1664525 * seed + 1013904223) >>> 0; return seed / 4294967296; };
  for (let y = 0; y < QR_SIZE; y += 1) for (let x = 0; x < QR_SIZE; x += 1) if (!reserved[y][x]) matrix[y][x] = random() > .52;
  for (let i = 8; i < QR_SIZE - 8; i += 1) { matrix[6][i] = i % 2 === 0; matrix[i][6] = i % 2 === 0; }
  return matrix;
}

function downloadQr(value: string, matrix: boolean[][]) {
  const canvas = document.createElement("canvas");
  const size = 420;
  const quiet = 36;
  const moduleSize = (size - quiet * 2) / QR_SIZE;
  canvas.width = size; canvas.height = size;
  const context = canvas.getContext("2d");
  if (!context) return;
  context.fillStyle = "#FFFFFF"; context.fillRect(0, 0, size, size);
  context.fillStyle = "#F0522D";
  matrix.forEach((row, y) => row.forEach((filled, x) => { if (filled) context.fillRect(quiet + x * moduleSize, quiet + y * moduleSize, moduleSize + .5, moduleSize + .5); }));
  context.fillStyle = "#FFFFFF"; context.fillRect(size / 2 - 26, size / 2 - 26, 52, 52);
  context.fillStyle = "#1A1613"; context.beginPath(); context.arc(size / 2, size / 2, 21, 0, Math.PI * 2); context.fill();
  context.fillStyle = "#F0522D"; context.font = "bold 29px Georgia"; context.fillText("“", size / 2 - 11, size / 2 + 11);
  canvas.toBlob((blob) => { if (!blob) return; const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = `${slugify(value) || "postproof"}-qr.png`; link.click(); window.setTimeout(() => URL.revokeObjectURL(url), 1000); }, "image/png");
}

function QRTicket({ url, visible, reducedMotion }: { url: string; visible: boolean; reducedMotion: boolean }) {
  const matrix = useMemo(() => createQrMatrix(url), [url]);
  return <div className={`collection-qr-slot ${visible ? "is-visible" : ""}`}><motion.div className="collection-qr-ticket" initial={false} animate={visible ? { opacity: 1, y: 0, rotate: 0 } : { opacity: 0, y: -15, rotate: 4 }} transition={reducedMotion ? { duration: .15 } : { type: "spring", stiffness: 280, damping: 22 }}><div className="collection-qr-code" role="img" aria-label="QR code for your Postproof collection link">{matrix.flatMap((row, y) => row.map((filled, x) => filled ? <i key={`${x}-${y}`} style={{ left: `${(x / QR_SIZE) * 100}%`, top: `${(y / QR_SIZE) * 100}%` }} /> : null))}<span className="collection-qr-mark">“</span></div><span>Scan to leave a kind word</span><button type="button" onClick={() => downloadQr(url, matrix)}><Download size={13} /> Download PNG</button></motion.div></div>;
}

function TypedMessage({ prefix, link, reducedMotion }: { prefix: string; link: string; reducedMotion: boolean }) {
  const full = `${prefix}${link}`;
  const [count, setCount] = useState(reducedMotion ? full.length : 0);
  useEffect(() => {
    let timer: number | undefined;
    if (reducedMotion) { timer = window.setTimeout(() => setCount(full.length), 0); return () => { if (timer) window.clearTimeout(timer); }; }
    const resetTimer = window.setTimeout(() => setCount(0), 0);
    let index = 0;
    const interval = window.setInterval(() => { index += 1; setCount(index); if (index >= full.length) window.clearInterval(interval); }, LINK_TIMING.messageCharacter);
    return () => { window.clearTimeout(resetTimer); window.clearInterval(interval); };
  }, [full, reducedMotion]);
  const visible = full.slice(0, count);
  const linkStart = prefix.length;
  return <>{visible.slice(0, linkStart)}{visible.length > linkStart && <span className="collection-message-link">{visible.slice(linkStart)}</span>}</>;
}

function messageFor(channel: Channel, businessName: string, url: string) {
  const name = businessName || "your business";
  if (channel === "WhatsApp") return { prefix: `Hi! Thanks again for choosing ${name}. Would you share a few kind words? It takes 30 seconds: `, action: "Open WhatsApp", href: `https://wa.me/?text=${encodeURIComponent(`Hi! Thanks again for choosing ${name}. Would you share a few kind words? It takes 30 seconds: ${url}`)}` };
  if (channel === "Instagram") return { prefix: `We loved working with you at ${name}. If you have 30 seconds, we’d be grateful for a kind word: `, action: "Open Instagram", href: "https://instagram.com/direct/inbox" };
  if (channel === "Email") return { prefix: `Hi! A quick favor from ${name}: would you share a few words about your experience? `, action: "Open Email", href: `mailto:?subject=${encodeURIComponent(`A quick favor from ${name}`)}&body=${encodeURIComponent(`${name} would love a few kind words: ${url}`)}` };
  return { prefix: `Thanks for choosing ${name}! Would you share a few kind words? `, action: "Open Messages", href: `sms:?body=${encodeURIComponent(`Thanks for choosing ${name}! Share a few kind words: ${url}`)}` };
}

function MessagePreview({ channel, businessName, slug, reducedMotion, copied, onCopy, onMessage }: { channel: Channel; businessName: string; slug: string; reducedMotion: boolean; copied: boolean; onCopy: () => void; onMessage: (message: string, tone?: ToastTone) => void }) {
  const url = `postproof.app/t/${slug || "yourname"}`;
  const message = messageFor(channel, businessName, url);
  return <motion.div className={`collection-message-preview collection-message-${channel.toLowerCase()}`} layout initial={reducedMotion ? { opacity: 0 } : { opacity: 0, filter: "blur(6px)", y: 8 }} animate={{ opacity: 1, filter: "blur(0px)", y: 0 }} exit={{ opacity: 0, filter: "blur(6px)", y: -8 }} transition={{ duration: reducedMotion ? .15 : .35, ease: [0.2, 0.8, 0.2, 1] }}>
    <div className="collection-message-visual">
      {channel === "Instagram" && <span className="collection-instagram-sticker">LINK STICKER<br /><b>Leave a kind word ↗</b></span>}
      {channel === "Email" && <span className="collection-email-subject">Subject: A quick favor from {businessName || "your business"}</span>}
      <p><TypedMessage prefix={message.prefix} link={url} reducedMotion={reducedMotion} /></p>
      {channel === "WhatsApp" && <span className="collection-message-ticks">✓✓</span>}
    </div>
    <div className="collection-message-actions"><motion.button type="button" whileTap={{ scale: .97 }} onClick={onCopy}>{copied ? <Check size={14} /> : <Copy size={14} />}{copied ? "Copied" : "Copy message"}</motion.button><a href={message.href} target={channel === "Instagram" ? "_blank" : undefined} rel={channel === "Instagram" ? "noreferrer" : undefined} onClick={() => onMessage(`${message.action} is ready to open.`, "mint")}><ExternalLink size={14} />{message.action}</a></div>
  </motion.div>;
}

function ChannelChips({ channel, onChange, onRealInteraction }: { channel: Channel | null; onChange: (channel: Channel) => void; onRealInteraction: () => void }) {
  const chipRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const move = (current: Channel, direction: 1 | -1) => { const index = CHANNELS.indexOf(current); const next = CHANNELS[(index + direction + CHANNELS.length) % CHANNELS.length]; onChange(next); window.requestAnimationFrame(() => chipRefs.current[next]?.focus()); };
  return <div className="collection-channels" role="tablist" aria-label="Share channel"><span className="collection-channel-caption">Share it where people already talk to you</span><LayoutGroup id="collection-channels">{CHANNELS.map((item) => <button key={item} ref={(element) => { chipRefs.current[item] = element; }} type="button" role="tab" aria-selected={channel === item} tabIndex={channel === item || (!channel && item === CHANNELS[0]) ? 0 : -1} className={`collection-channel-chip collection-channel-${item.toLowerCase()} ${channel === item ? "is-selected" : ""}`} onClick={() => { onRealInteraction(); onChange(item); }} onKeyDown={(event) => { if (event.key === "ArrowRight") { event.preventDefault(); move(item, 1); } if (event.key === "ArrowLeft") { event.preventDefault(); move(item, -1); } }}><span className="collection-channel-icon">{channel === item && <motion.i layoutId="collection-channel-highlight" transition={{ type: "spring", stiffness: 420, damping: 30 }} /> }<IconForChannel channel={item} /></span>{item}</button>)}</LayoutGroup></div>;
}

function ConfettiBurst({ pulse }: { pulse: number }) {
  return <AnimatePresence>{pulse > 0 && <motion.span key={pulse} className="collection-confetti" aria-hidden="true">{Array.from({ length: 12 }).map((_, index) => <i key={index} style={{ "--confetti-angle": `${index * 30}deg`, "--confetti-distance": `${24 + (index % 4) * 8}px` } as CSSProperties} />)}</motion.span>}</AnimatePresence>;
}

function Toast({ toast }: { toast: LinkState["toast"] }) {
  return <AnimatePresence>{toast && <motion.div key={toast.id} className={`collection-toast collection-toast-${toast.tone}`} role="status" aria-live="polite" initial={{ opacity: 0, y: 14, scale: .95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8 }} transition={{ type: "spring", stiffness: 420, damping: 26 }}><CheckCircle2 size={16} />{toast.message}</motion.div>}</AnimatePresence>;
}

function GhostCursor({ active, x, y }: { active: boolean; x: number; y: number }) {
  return <motion.span className="collection-ghost-cursor" aria-hidden="true" animate={{ left: `${x}%`, top: `${y}%`, opacity: active ? 1 : 0, scale: active ? 1 : .7 }} transition={{ type: "spring", stiffness: 115, damping: 18 }}><span /><svg viewBox="0 0 22 26" width="18" height="22"><path d="M3 2.5 19 15l-6.4 1.3 4.2 6.4-2.8 1.6-4.1-6.3L5.1 24Z" fill="#FFF7F3" stroke="#1A1613" strokeWidth="1.2" strokeLinejoin="round" /></svg></motion.span>;
}

export default function CollectionLinkSection() {
  const [state, dispatch] = useReducer(linkReducer, initialLinkState);
  const sectionRef = useRef<HTMLElement>(null);
  const autoTimers = useRef<number[]>([]);
  const replayTimer = useRef<number | null>(null);
  const copiedTimer = useRef<number | null>(null);
  const messageCopiedTimer = useRef<number | null>(null);
  const toastTimer = useRef<number | null>(null);
  const autoRunning = useRef(false);
  const autoPlayed = useRef(false);
  const runAutoDemoRef = useRef<(() => void) | null>(null);
  const realInteraction = useRef(false);
  const [revealed, setRevealed] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [ghost, setGhost] = useState({ active: false, x: 18, y: 28 });
  const [hint, setHint] = useState(false);
  const [pointer, setPointer] = useState({ x: 50, y: 50 });

  const url = `https://postproof.app/t/${state.slug || "yourname"}`;
  const clearAutoTimers = useCallback(() => { autoTimers.current.forEach((timer) => window.clearTimeout(timer)); autoTimers.current = []; }, []);
  const cancelAutoDemo = useCallback(() => { clearAutoTimers(); if (replayTimer.current) window.clearTimeout(replayTimer.current); replayTimer.current = null; autoRunning.current = false; setGhost((current) => ({ ...current, active: false })); if (!realInteraction.current) { realInteraction.current = true; setHint(false); } }, [clearAutoTimers]);
  const markRealInteraction = useCallback(() => cancelAutoDemo(), [cancelAutoDemo]);
  const showToast = useCallback((message: string, tone: ToastTone = "coral") => dispatch({ type: "toast", message, tone }), []);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(media.matches);
    sync(); media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const element = sectionRef.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => { if (entry?.isIntersecting) { setRevealed(true); observer.disconnect(); } }, { threshold: .2 });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!state.slug) return;
    const timer = window.setTimeout(() => dispatch({ type: "availability", value: RESERVED_SLUGS.has(state.slug) ? "taken" : "available" }), LINK_TIMING.availability);
    dispatch({ type: "availability", value: "checking" });
    return () => window.clearTimeout(timer);
  }, [state.slug]);

  useEffect(() => {
    if (!state.toast) return;
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    const id = state.toast.id;
    toastTimer.current = window.setTimeout(() => dispatch({ type: "clearToast", id }), LINK_TIMING.toast);
    return () => { if (toastTimer.current) window.clearTimeout(toastTimer.current); };
  }, [state.toast]);

  useEffect(() => () => { clearAutoTimers(); if (replayTimer.current) window.clearTimeout(replayTimer.current); if (copiedTimer.current) window.clearTimeout(copiedTimer.current); if (messageCopiedTimer.current) window.clearTimeout(messageCopiedTimer.current); if (toastTimer.current) window.clearTimeout(toastTimer.current); }, [clearAutoTimers]);

  const commitBusiness = (value: string) => dispatch({ type: "business", value: value.slice(0, 40) });

  const copyLink = useCallback(async (scripted = false) => {
    if (!scripted) markRealInteraction();
    if (!state.slug) { document.getElementById("collection-business")?.focus(); return; }
    let copied = false;
    try { if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(url); copied = true; } } catch { copied = false; }
    if (!copied) {
      const area = document.createElement("textarea"); area.value = url; area.setAttribute("readonly", ""); area.style.position = "fixed"; area.style.opacity = "0"; document.body.appendChild(area); area.select();
      try { copied = document.execCommand("copy"); } catch { copied = false; }
      if (copied) document.body.removeChild(area);
    }
    dispatch({ type: "copied", value: true }); dispatch({ type: "copyPulse" }); showToast(copied ? "Link copied. Go share it." : "Press Ctrl/Cmd+C to copy your link.", copied ? "mint" : "coral");
    if (copiedTimer.current) window.clearTimeout(copiedTimer.current);
    copiedTimer.current = window.setTimeout(() => dispatch({ type: "copied", value: false }), LINK_TIMING.copied);
  }, [markRealInteraction, showToast, state.slug, url]);

  const copyMessage = async () => {
    markRealInteraction();
    if (!state.channel) return;
    const message = messageFor(state.channel, state.businessName, `postproof.app/t/${state.slug || "yourname"}`);
    try {
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(`${message.prefix}${state.slug ? `postproof.app/t/${state.slug}` : "postproof.app/t/yourname"}`);
    } catch {
      // The link copy flow owns the fallback selection path; message copy stays local if the API is unavailable.
    }
    dispatch({ type: "messageCopied", value: true }); showToast("Message copied. Go make someone’s day.", "mint");
    if (messageCopiedTimer.current) window.clearTimeout(messageCopiedTimer.current);
    messageCopiedTimer.current = window.setTimeout(() => dispatch({ type: "messageCopied", value: false }), LINK_TIMING.copied);
  };

  const schedule = useCallback((callback: () => void, delay: number) => { const timer = window.setTimeout(() => { autoTimers.current = autoTimers.current.filter((item) => item !== timer); if (autoRunning.current) callback(); }, delay); autoTimers.current.push(timer); }, []);

  const runAutoDemo = useCallback(() => {
    if (reducedMotion || autoRunning.current || realInteraction.current) return;
    clearAutoTimers(); autoRunning.current = true; setHint(false); setGhost({ active: true, x: 15, y: 34 });
    const demoName = "Bright Smiles Studio";
    // Timing: guide the cursor into the business-name field.
    schedule(() => setGhost({ active: true, x: 48, y: 29 }), 650);
    // Timing: type the sample business name at the product-demo cadence.
    [...demoName].forEach((_, index) => schedule(() => commitBusiness(demoName.slice(0, index + 1)), 900 + (index + 1) * LINK_TIMING.demoCharacter));
    const typedAt = 900 + demoName.length * LINK_TIMING.demoCharacter;
    // Timing: let the local availability check and QR reveal settle.
    schedule(() => setGhost({ active: true, x: 74, y: 49 }), typedAt + 900);
    // Timing: scripted copy moment.
    schedule(() => copyLink(true), typedAt + 1250);
    // Timing: move to the first share channel and let its message type.
    schedule(() => { dispatch({ type: "channel", value: "WhatsApp" }); setGhost({ active: true, x: 42, y: 77 }); }, typedAt + 1850);
    // Timing: hover the email channel before the demo softly clears.
    schedule(() => { dispatch({ type: "channel", value: "Email" }); setGhost({ active: true, x: 65, y: 77 }); }, typedAt + 3400);
    schedule(() => {
      dispatch({ type: "channel", value: null });
      autoRunning.current = false; setGhost((current) => ({ ...current, active: false })); setHint(true);
      if (!realInteraction.current) replayTimer.current = window.setTimeout(() => { if (!realInteraction.current) { dispatch({ type: "business", value: "" }); dispatch({ type: "channel", value: null }); setHint(false); runAutoDemoRef.current?.(); } }, LINK_TIMING.autoReplay);
    }, typedAt + 4800);
  }, [clearAutoTimers, copyLink, reducedMotion, schedule]);

  useEffect(() => {
    runAutoDemoRef.current = runAutoDemo;
  }, [runAutoDemo]);

  useEffect(() => {
    const element = sectionRef.current;
    if (!element || reducedMotion) return;
    const observer = new IntersectionObserver(([entry]) => { if (entry?.intersectionRatio >= .5 && !autoPlayed.current && !realInteraction.current) { autoPlayed.current = true; runAutoDemo(); observer.disconnect(); } }, { threshold: [.5] });
    observer.observe(element);
    return () => observer.disconnect();
  }, [reducedMotion, runAutoDemo]);

  useEffect(() => {
    if (!reducedMotion || state.businessName) return;
    const timer = window.setTimeout(() => commitBusiness("Bright Smiles Studio"), 0);
    return () => window.clearTimeout(timer);
  }, [reducedMotion, state.businessName]);

  const onSectionPointerMove = (event: PointerEvent<HTMLElement>) => {
    markRealInteraction();
    if (reducedMotion) return;
    const rect = event.currentTarget.getBoundingClientRect();
    setPointer({ x: ((event.clientX - rect.left) / rect.width) * 100, y: ((event.clientY - rect.top) / rect.height) * 100 });
  };

  const onChannel = (channel: Channel) => { markRealInteraction(); dispatch({ type: "channel", value: channel }); };

  return (
    <section ref={sectionRef} id="link-claim" className={`collection-link-section pp-section ${revealed ? "is-revealed" : ""}`} data-section="link" aria-labelledby="collection-heading" onPointerMove={onSectionPointerMove} onTouchStart={markRealInteraction} onKeyDown={(event) => { if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) { event.preventDefault(); copyLink(); } }}>
      <div className="collection-glow" aria-hidden="true" />
      <div className="collection-decor collection-decor-one" style={{ transform: `translate3d(${(pointer.x - 50) * .1}px, ${(pointer.y - 50) * .1}px, 0)` }} aria-hidden="true">“</div>
      <div className="collection-decor collection-decor-two" style={{ transform: `translate3d(${(pointer.x - 50) * .16}px, ${(pointer.y - 50) * .16}px, 0)` }} aria-hidden="true"><Sparkles size={20} /></div>
      <div className="collection-inner pp-container">
        <SectionHeader revealed={revealed} />
        <motion.div className="collection-demo" initial={{ opacity: 0, y: 24, filter: "blur(8px)" }} animate={revealed ? { opacity: 1, y: 0, filter: "blur(0px)" } : undefined} transition={{ duration: reducedMotion ? .15 : .62, delay: .18, ease: [0.2, 0.8, 0.2, 1] }}>
          <NameInput value={state.businessName} onChange={commitBusiness} onEnter={() => document.querySelector<HTMLButtonElement>(".collection-copy-button:not(:disabled)")?.focus()} reducedMotion={reducedMotion} realInteraction={markRealInteraction} />
          <LinkPill state={state} reducedMotion={reducedMotion} onSlug={(value) => dispatch({ type: "slug", value })} onCopy={() => copyLink()} onRealInteraction={markRealInteraction} />
          <QRTicket url={url} visible={Boolean(state.businessName)} reducedMotion={reducedMotion} />
          <ChannelChips channel={state.channel} onChange={onChannel} onRealInteraction={markRealInteraction} />
          <div className="collection-preview-slot"><AnimatePresence mode="wait" initial={false}>{state.channel && <MessagePreview key={state.channel} channel={state.channel} businessName={state.businessName} slug={state.slug} reducedMotion={reducedMotion} copied={state.messageCopied} onCopy={copyMessage} onMessage={showToast} />}</AnimatePresence></div>
          <div className={`collection-demo-hint ${hint ? "is-visible" : ""}`} aria-hidden={!hint}>Try your own name <span>→</span></div>
          <GhostCursor {...ghost} />
          <Toast toast={state.toast} />
        </motion.div>
      </div>
    </section>
  );
}
