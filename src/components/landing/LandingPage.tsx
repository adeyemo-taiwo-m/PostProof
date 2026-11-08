"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowDownRight,
  ArrowLeftRight,
  ArrowUpRight,
  BadgeCheck,
  Check,
  CheckCircle2,
  Clock3,
  Copy,
  Download,
  Menu,
  MessageSquareHeart,
  MoveUpRight,
  Quote,
  Sparkles,
  Link2,
  X,
} from "lucide-react";
import { Button, MagneticButton } from "@/components/ui";
import ProofText from "@/components/ProofText";
import CurvedInput from "@/components/CurvedInput";
import WarpText from "@/components/WarpText";
import HeroBackground from "@/components/landing/HeroBackground";
import StudioSection from "@/components/landing/StudioSection";
import CollectionLinkSection from "@/components/landing/CollectionLinkSection";
import ScrollReveal from "@/components/ScrollReveal";
import FinalCtaSection from "@/components/landing/FinalCtaSection";

type Format = "4:5" | "1:1" | "9:16";
type Template = "Minimal" | "Bold" | "Editorial";

const samples = [
  {
    brand: "Common Ground",
    quote: "The first time our story looked like our work.",
    person: "Lena K.",
    template: "Bold",
    tone: "ink",
  },
  {
    brand: "Moonwell",
    quote: "The kind of care you feel the difference in.",
    person: "Maya R.",
    template: "Bold",
    tone: "coral",
  },
  {
    brand: "Northstar",
    quote: "They made the complicated feel completely clear.",
    person: "Jon B.",
    template: "Editorial",
    tone: "editorial",
  },
  {
    brand: "Bright Studio",
    quote: "A thoughtful process from the first call to the last.",
    person: "Ari P.",
    template: "Minimal",
    tone: "paper",
  },
] as const;

const loopSteps = [
  {
    title: "Make one link",
    copy: "A simple URL your customers can open anywhere.",
  },
  {
    title: "Collect the good stuff",
    copy: "A focused form that makes honest feedback easy.",
  },
  {
    title: "Share it proudly",
    copy: "Approve the words you love, then make them yours.",
  },
] as const;

const LOOP_DURATION = 6000;
const LOOP_SLUG = "moonwell";
const LOOP_QUOTE = "The kind of care you feel the difference in.";

function Wordmark({ footer = false }: { footer?: boolean }) {
  return (
    <Link
      className={`pp-wordmark ${footer ? "pp-wordmark-footer" : ""}`}
      href="/"
      aria-label="Postproof home"
    >
      <span className="pp-wordmark-mark">“</span>
      <span>
        Post<span className="pp-wordmark-proof">proof</span>
      </span>
    </Link>
  );
}

type CardPosition = "front" | "middle" | "back";
type CardEvents = {
  onClick?: () => void;
  onPointerEnter?: () => void;
  onPointerMove?: (event: React.PointerEvent<HTMLElement>) => void;
  onPointerLeave?: () => void;
  onPointerDown?: () => void;
  onPointerUp?: () => void;
  onPointerCancel?: () => void;
  cardRef?: React.RefObject<HTMLElement | null>;
};

function QuoteCard({
  sample,
  position,
  format,
  text,
  events,
}: {
  sample: (typeof samples)[number];
  position: CardPosition;
  format: Format;
  text?: string;
  events?: CardEvents;
}) {
  const cardText = position === "front" && text ? text : sample.quote;
  return (
    <motion.article
      ref={events?.cardRef}
      className={`pp-quote-card pp-card-${position} pp-card-${sample.tone} pp-format-${format.replace(":", "-")}`}
      data-cursor={position === "front" ? "Try me" : "Bring forward"}
      aria-label={`${sample.template} sample graphic from ${sample.brand}`}
      onClick={(event) => {
        event.stopPropagation();
        events?.onClick?.();
      }}
      onPointerEnter={events?.onPointerEnter}
      onPointerMove={events?.onPointerMove}
      onPointerLeave={events?.onPointerLeave}
      onPointerDown={events?.onPointerDown}
      onPointerUp={events?.onPointerUp}
      onPointerCancel={events?.onPointerCancel}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.18 }}
    >
      <div className="pp-card-head" data-card-layer="chrome">
        <span className="pp-card-mark">“</span>
        <span>{sample.brand.toUpperCase()}</span>
        <span className="pp-card-sample" data-card-layer="sample">
          SAMPLE
        </span>
      </div>
      <div className="pp-card-template" data-card-layer="chrome">
        {sample.template.toUpperCase()}
      </div>
      <div className="pp-card-quote" data-card-layer="quote">
        “{cardText}”
      </div>
      <div className="pp-card-foot" data-card-layer="signature">
        <span>— {position === "front" && text ? "You" : sample.person}</span>
        <span className="pp-card-rule" />
      </div>
    </motion.article>
  );
}

function HeroStack({ paused }: { paused: boolean }) {
  const [deck, setDeck] = useState([0, 1, 3]);
  const format: Format = "4:5";
  const [text, setText] = useState("");
  const [isPrinting, setIsPrinting] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
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
  const swapTimer = useRef<number | null>(null);
  const current = samples[deck[0]];
  function announce(message: string) {
    if (announcementTimer.current)
      window.clearTimeout(announcementTimer.current);
    setAnnouncement(message);
    announcementTimer.current = window.setTimeout(
      () => setAnnouncement(""),
      900,
    );
  }
  function beginSwap() {
    if (swapTimer.current) window.clearTimeout(swapTimer.current);
    setIsSwapping(true);
    swapTimer.current = window.setTimeout(() => setIsSwapping(false), 720);
  }
  function rotateDeck(offset = 1, message = "Card updated") {
    beginSwap();
    setDeck((value) => {
      const amount = offset % value.length;
      return [...value.slice(amount), ...value.slice(0, amount)];
    });
    setStampKey((value) => value + 1);
    announce(message);
  }
  function shuffle() {
    rotateDeck();
  }
  function promote(offset: number) {
    rotateDeck(offset);
  }
  function printCard() {
    if (isPrinting) return;
    beginSwap();
    setIsPrinting(true);
    window.setTimeout(() => {
      setDeck((value) => [...value.slice(1), value[0]]);
      setStampKey((value) => value + 1);
      setIsPrinting(false);
      announce("Fresh card printed");
    }, 420);
  }
  function setTilt(event: React.PointerEvent<HTMLElement>) {
    if (paused || !frontRef.current) return;
    const rect = frontRef.current.getBoundingClientRect();
    const x = Math.max(
      -1,
      Math.min(
        1,
        (event.clientX - (rect.left + rect.width / 2)) / (rect.width / 2),
      ),
    );
    const y = Math.max(
      -1,
      Math.min(
        1,
        (event.clientY - (rect.top + rect.height / 2)) / (rect.height / 2),
      ),
    );
    if (frame.current) cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      frontRef.current?.style.setProperty("--tilt-x", `${x}`);
      frontRef.current?.style.setProperty("--tilt-y", `${y}`);
      frontRef.current?.style.setProperty("--glare-x", `${50 + x * 42}%`);
      frontRef.current?.style.setProperty("--glare-y", `${50 + y * 42}%`);
    });
  }
  function clearTilt() {
    if (frame.current) cancelAnimationFrame(frame.current);
    frontRef.current?.style.setProperty("--tilt-x", "0");
    frontRef.current?.style.setProperty("--tilt-y", "0");
    frontRef.current?.style.setProperty("--glare-x", "50%");
    frontRef.current?.style.setProperty("--glare-y", "50%");
  }
  function onType(value: string) {
    setText(value);
    setTypingPulse(true);
    announce("Card updated");
    if (typingTimer.current) window.clearTimeout(typingTimer.current);
    typingTimer.current = window.setTimeout(() => setTypingPulse(false), 120);
  }
  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      shuffle();
    }
  }
  useEffect(
    () => () => {
      if (frame.current) cancelAnimationFrame(frame.current);
      if (announcementTimer.current)
        window.clearTimeout(announcementTimer.current);
      if (typingTimer.current) window.clearTimeout(typingTimer.current);
      if (swapTimer.current) window.clearTimeout(swapTimer.current);
    },
    [],
  );
  useEffect(() => {
    if (paused || inputFocused || isPrinting || isHovered) return;
    const timer = window.setInterval(() => rotateDeck(), 6500);
    return () => window.clearInterval(timer);
  }, [paused, inputFocused, isPrinting, isHovered]);
  const [frontIndex, middleIndex, backIndex] = deck;
  return (
    <div
      className={`pp-hero-demo ${paused ? "pp-demo-paused" : ""}`}
      data-cursor="Try me"
    >
      <div className="pp-orbit pp-orbit-one" aria-hidden="true" />
      <div className="pp-orbit pp-orbit-two" aria-hidden="true" />
      <span className="pp-orbit-dot" aria-hidden="true" />
      <div className={`pp-stack-area pp-area-${format.replace(":", "-")}`}>
        <div
          className={`pp-stack ${isHovered ? "is-hovered" : ""} ${isPressed ? "is-pressed" : ""} ${isSwapping ? "is-swapping" : ""} ${isPrinting ? "is-printing" : ""} ${typingPulse ? "is-typing" : ""}`}
          tabIndex={0}
          role="button"
          aria-label="Sample testimonial cards"
          onKeyDown={onKeyDown}
          onTouchStart={(event) => {
            touchStart.current = event.touches[0]?.clientX ?? null;
          }}
          onTouchEnd={(event) => {
            const end = event.changedTouches[0]?.clientX ?? 0;
            const swiped =
              touchStart.current !== null &&
              Math.abs(end - touchStart.current) > 60;
            const touchedCard = (event.target as HTMLElement).closest(
              ".pp-quote-card",
            );
            if (swiped || !touchedCard) {
              shuffle();
              touchActive.current = swiped;
              if (swiped)
                window.setTimeout(() => {
                  touchActive.current = false;
                }, 400);
            }
            touchStart.current = null;
          }}
        >
          <QuoteCard
            key={backIndex}
            sample={samples[backIndex]}
            position="back"
            format={format}
            events={{
              onClick: () => {
                if (!touchActive.current) promote(2);
              },
            }}
          />
          <QuoteCard
            key={middleIndex}
            sample={samples[middleIndex]}
            position="middle"
            format={format}
            events={{
              onClick: () => {
                if (!touchActive.current) promote(1);
              },
            }}
          />
          <QuoteCard
            key={frontIndex}
            sample={current}
            position="front"
            format={format}
            text={text}
            events={{
              cardRef: frontRef,
              onClick: () => {
                if (!touchActive.current) shuffle();
              },
              onPointerEnter: () => setIsHovered(true),
              onPointerMove: setTilt,
              onPointerLeave: () => {
                setIsHovered(false);
                setIsPressed(false);
                clearTilt();
              },
              onPointerDown: () => setIsPressed(true),
              onPointerUp: () => setIsPressed(false),
              onPointerCancel: () => setIsPressed(false),
            }}
          />
          <motion.div
            key={`${stampKey}-${current.brand}`}
            className={`pp-approval-stamp pp-stamp-${current.tone}`}
            initial={{ opacity: 0, scale: 2.2, rotate: -22 }}
            animate={{ opacity: 1, scale: 1, rotate: -12 }}
            transition={{ type: "spring", stiffness: 420, damping: 18 }}
          >
            <Check size={13} /> APPROVED WITH CONSENT
          </motion.div>
        </div>
        <button
          className="pp-shuffle"
          type="button"
          onClick={shuffle}
          aria-label="Shuffle cards"
          title="Shuffle cards"
        >
          <Quote size={17} />
        </button>
      </div>
      <div className="pp-hero-controls">
        <CurvedInput
          className={`pp-live-type ${text.length > 80 ? "is-warning" : ""}`}
          value={text}
          maxLength={90}
          onChange={onType}
          onSubmit={printCard}
          onFocus={() => setInputFocused(true)}
          onBlur={() => setInputFocused(false)}
          placeholder="Type something kind about your work..."
          ariaLabel="Type something kind about your work"
          buttonText="Print card"
          buttonIcon={
            <path
              d="M -5.5 5.5 L 5.5 -5.5 M 0 -5.5 H 5.5 V 0"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          }
          type="text"
          theme="light"
          width="min(90%, 560px)"
          bend={8}
          height={64}
          cornerRadius={28}
          fontSize={14}
          backgroundColor="#FAF7F2"
          textColor="#14110F"
          placeholderColor="#8C847A"
          borderColor="transparent"
          buttonColor="#F2542D"
          buttonTextColor="#FFFFFF"
          iconColor="#F2542D"
          shadowSize="sm"
          showIcon={false}
        />
        <span className="sr-only" aria-live="polite">
          {announcement}
        </span>
      </div>
    </div>
  );
}

function LegacyLoopDemo({ step, paused }: { step: number; paused: boolean }) {
  const [copied, setCopied] = useState(false);
  const [consent, setConsent] = useState(false);
  const [sent, setSent] = useState(false);
  const [approved, setApproved] = useState(false);
  const [template, setTemplate] = useState<Template>("Bold");
  useEffect(() => {
    if (step === 0 && !paused) {
      const timer = window.setTimeout(() => setCopied(true), 1300);
      return () => window.clearTimeout(timer);
    }
  }, [step, paused]);
  return (
    <div className={`pp-loop-demo pp-loop-demo-${step + 1}`}>
      {step === 0 && (
        <>
          <div className="pp-browser-pill">
            <span>postproof.app/t/</span>
            <b>moonwell</b>
            <i />
          </div>
          <button
            className={`pp-copy-action ${copied ? "copied" : ""}`}
            type="button"
            onClick={() => setCopied(true)}
          >
            {copied ? (
              <>
                <Check size={15} /> Copied
              </>
            ) : (
              <>
                <Copy size={15} /> Copy link
              </>
            )}
          </button>
          <span className="pp-burst" aria-hidden="true">
            “ “ “
          </span>
        </>
      )}
      {step === 1 && (
        <div className="pp-phone">
          <div className="pp-phone-notch" />
          <span className="pp-demo-kicker">A NOTE FROM YOU</span>
          <h3>We&apos;d love to hear about your experience.</h3>
          <p>Your feedback helps us improve.</p>
          <div className="pp-phone-field">
            The kind of care you feel the difference in.
          </div>
          <div className="pp-phone-name">
            <span>How should your name appear?</span>
            <button type="button">First name only</button>
          </div>
          <label className="pp-phone-consent">
            <input
              type="checkbox"
              checked={consent}
              onChange={(event) => setConsent(event.target.checked)}
            />{" "}
            I give permission to share this.
          </label>
          <button
            className={`pp-phone-submit ${sent ? "sent" : ""}`}
            type="button"
            onClick={() => setSent(true)}
          >
            {sent
              ? "Thank you for sharing your experience!"
              : "Submit testimonial"}
          </button>
        </div>
      )}
      {step === 2 && (
        <div className="pp-share-demo">
          <div className="pp-share-top">
            <span className="pp-demo-kicker">YOUR STUDIO · SAMPLE DATA</span>
            <span
              className={`pp-status-pill ${approved ? "approved" : "pending"}`}
            >
              {approved ? <CheckCircle2 size={13} /> : <Clock3 size={13} />}
              {approved ? "Approved" : "Pending"}
            </span>
          </div>
          <blockquote>
            “The kind of care you feel the difference in.”
          </blockquote>
          <span className="pp-share-person">— Maya R.</span>
          <div className="pp-template-row">
            {(["Minimal", "Bold", "Editorial"] as Template[]).map((item) => (
              <button
                className={template === item ? "active" : ""}
                key={item}
                type="button"
                onClick={() => setTemplate(item)}
              >
                {item}
              </button>
            ))}
          </div>
          <div className="pp-share-actions">
            {!approved && (
              <button
                className="pp-approve-small"
                type="button"
                onClick={() => setApproved(true)}
              >
                <Check size={14} /> Approve
              </button>
            )}
            {approved && (
              <button className="pp-download-chip" type="button">
                <Download size={14} /> moonwell-testimonial-2026-11-05.png
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function InteractiveLoopCursor({ className = "" }: { className?: string }) {
  return (
    <motion.span
      className={`pp-loop-cursor ${className}`.trim()}
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 28" width="18" height="21">
        <path
          d="M3 2.5 20.5 16l-7.2 1.2 4.5 7-3.1 1.8-4.4-7L5.3 24Z"
          fill="#fff"
          stroke="#1a1613"
          strokeWidth="1.25"
          strokeLinejoin="round"
        />
      </svg>
      <i />
    </motion.span>
  );
}

function InteractiveUrlDemo({
  paused,
  reducedMotion,
  restartKey,
}: {
  paused: boolean;
  reducedMotion: boolean;
  restartKey: number;
}) {
  const [slug, setSlug] = useState("");
  const [copied, setCopied] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [clicking, setClicking] = useState(false);
  const clickTimer = useRef<number | null>(null);

  useEffect(() => {
    if (clickTimer.current) window.clearTimeout(clickTimer.current);
    if (reducedMotion || paused) return;
    const timers = new Set<number>();
    const schedule = (callback: () => void, delay: number) => {
      const timer = window.setTimeout(() => {
        timers.delete(timer);
        callback();
      }, delay);
      timers.add(timer);
    };
    const run = () => {
      setSlug("");
      setCopied(false);
      setClicking(false);
      LOOP_SLUG.split("").forEach((_, index) =>
        schedule(
          () => setSlug(LOOP_SLUG.slice(0, index + 1)),
          (index + 1) * 70,
        ),
      );
      schedule(() => setClicking(true), LOOP_SLUG.length * 70 + 430);
      schedule(() => setClicking(false), LOOP_SLUG.length * 70 + 700);
      schedule(() => setCopied(true), LOOP_SLUG.length * 70 + 760);
      schedule(run, 5200);
    };
    run();
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [paused, reducedMotion, restartKey]);

  async function copyUrl() {
    const value = `https://proofcard-eta.vercel.app/t/${LOOP_SLUG}`;
    try {
      if (navigator.clipboard) await navigator.clipboard.writeText(value);
      else throw new Error("Clipboard unavailable");
    } catch {
      const area = document.createElement("textarea");
      area.value = value;
      document.body.appendChild(area);
      area.select();
      document.execCommand("copy");
      area.remove();
    }
    setCopied(true);
    setClicking(true);
    clickTimer.current = window.setTimeout(() => setClicking(false), 280);
  }

  const displaySlug = reducedMotion || paused ? LOOP_SLUG : slug;
  const displayCopied = reducedMotion || paused || copied;
  return (
    <div className="pp-url-demo" data-cursor="Copy link">
      <div className="pp-loop-orbit pp-loop-orbit-a" aria-hidden="true">
        <i />
        <i />
        <i />
      </div>
      <div className="pp-loop-orbit pp-loop-orbit-b" aria-hidden="true">
        <i />
        <i />
      </div>
      <InteractiveLoopCursor className="pp-url-cursor" />
      <div className="pp-url-demo-content">
        <button
          className={`pp-browser-pill ${hovered ? "is-hovered" : ""} ${clicking ? "is-clicking" : ""}`}
          type="button"
          onClick={copyUrl}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          aria-label="Copy your Postproof collection link"
        >
          <span>postproof.app/t/</span>
          <b>{displaySlug}</b>
          <i className="pp-browser-caret" />
        </button>
        <span
          className={`pp-url-tooltip ${hovered ? "is-visible" : ""}`}
          role="status"
        >
          Click to copy
        </span>
        <motion.div
          className="pp-copy-toast"
          initial={false}
          animate={{
            y: displayCopied ? 0 : 12,
            opacity: displayCopied ? 1 : 0,
            scale: displayCopied ? 1 : 0.94,
          }}
          transition={{ type: "spring", stiffness: 420, damping: 26 }}
          aria-live="polite"
        >
          <Check size={14} /> Copied
        </motion.div>
      </div>
    </div>
  );
}

function InteractivePhoneDemo({
  paused,
  reducedMotion,
  restartKey,
}: {
  paused: boolean;
  reducedMotion: boolean;
  restartKey: number;
}) {
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);
  const [sent, setSent] = useState(false);
  const [namePulse, setNamePulse] = useState(false);
  const manualRef = useRef(false);

  useEffect(() => {
    manualRef.current = false;
    if (reducedMotion || paused) return;
    const timers = new Set<number>();
    const schedule = (callback: () => void, delay: number) => {
      const timer = window.setTimeout(() => {
        timers.delete(timer);
        callback();
      }, delay);
      timers.add(timer);
    };
    const run = () => {
      if (manualRef.current) return;
      setMessage("");
      setConsent(false);
      setSent(false);
      setNamePulse(false);
      LOOP_QUOTE.split("").forEach((_, index) =>
        schedule(
          () => {
            if (!manualRef.current) setMessage(LOOP_QUOTE.slice(0, index + 1));
          },
          (index + 1) * 34,
        ),
      );
      const typedAt = LOOP_QUOTE.length * 34;
      schedule(() => {
        if (!manualRef.current) setNamePulse(true);
      }, typedAt + 450);
      schedule(() => {
        if (!manualRef.current) setConsent(true);
      }, typedAt + 920);
      schedule(() => {
        if (!manualRef.current) setSent(true);
      }, typedAt + 1370);
      schedule(run, typedAt + 3900);
    };
    run();
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [paused, reducedMotion, restartKey]);

  function stopScript() {
    manualRef.current = true;
  }
  const displayMessage = reducedMotion || paused ? LOOP_QUOTE : message;
  const displayConsent = reducedMotion || paused || consent;
  const displaySent = reducedMotion || paused || sent;
  return (
    <div className="pp-phone-wrap">
      <motion.div
        className="pp-phone"
        animate={reducedMotion || paused ? undefined : { y: [0, -6, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="pp-phone-notch" />
        <span className="pp-demo-kicker">A NOTE FROM YOU</span>
        <h3>We&apos;d love to hear about your experience.</h3>
        <p>Your feedback helps us improve.</p>
        <label className="pp-phone-field-label" htmlFor="loop-feedback">
          Your experience
        </label>
        <textarea
          id="loop-feedback"
          className="pp-phone-field"
          value={displayMessage}
          onFocus={stopScript}
          onChange={(event) => {
            stopScript();
            setMessage(event.target.value);
          }}
          aria-label="Your experience"
          placeholder="Tell us what stood out..."
        />
        <div
          className={`pp-phone-name ${namePulse && !paused && !reducedMotion ? "is-pulsing" : ""}`}
        >
          <span>How should your name appear?</span>
          <button type="button" onClick={stopScript}>
            First name only
          </button>
        </div>
        <label
          className={`pp-phone-consent ${displayConsent ? "is-checked" : ""}`}
        >
          <input
            type="checkbox"
            checked={displayConsent}
            onChange={(event) => {
              stopScript();
              setConsent(event.target.checked);
            }}
          />
          <span className="pp-checkbox-mark">
            <Check size={11} />
          </span>
          <span>I give permission to share this.</span>
        </label>
        <button
          className={`pp-phone-submit ${displaySent ? "sent" : ""}`}
          type="button"
          disabled={!displayConsent}
          onClick={() => {
            stopScript();
            setSent(true);
          }}
        >
          {displaySent ? (
            <>
              <Check size={14} /> Thank you for sharing
            </>
          ) : (
            "Submit testimonial"
          )}
        </button>
        {displaySent && (
          <span className="pp-phone-confetti" aria-hidden="true">
            + · • + • + · • + · • +
          </span>
        )}
      </motion.div>
      <InteractiveLoopCursor className="pp-phone-cursor" />
    </div>
  );
}

function InteractiveReviewDemo({
  paused,
  reducedMotion,
  restartKey,
}: {
  paused: boolean;
  reducedMotion: boolean;
  restartKey: number;
}) {
  const [approved, setApproved] = useState(false);
  const [template, setTemplate] = useState<Template>("Minimal");
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const manualRef = useRef(false);
  const reviewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    manualRef.current = false;
    if (reducedMotion || paused) return;
    const timers = new Set<number>();
    const schedule = (callback: () => void, delay: number) => {
      const timer = window.setTimeout(() => {
        timers.delete(timer);
        callback();
      }, delay);
      timers.add(timer);
    };
    const run = () => {
      if (manualRef.current) return;
      setApproved(false);
      setTemplate("Minimal");
      schedule(() => {
        if (!manualRef.current) setTemplate("Editorial");
      }, 700);
      schedule(() => {
        if (!manualRef.current) setTemplate("Bold");
      }, 1400);
      schedule(() => {
        if (!manualRef.current) setApproved(true);
      }, 2250);
      schedule(run, 6000);
    };
    run();
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [paused, reducedMotion, restartKey]);

  function chooseTemplate(value: Template) {
    manualRef.current = true;
    setTemplate(value);
  }
  function moveCard(event: React.PointerEvent<HTMLDivElement>) {
    const rect = reviewRef.current?.getBoundingClientRect();
    if (!rect) return;
    setTilt({
      x: ((event.clientY - rect.top) / rect.height - 0.5) * -8,
      y: ((event.clientX - rect.left) / rect.width - 0.5) * 8,
    });
  }
  const displayApproved = reducedMotion || paused || approved;
  const displayTemplate = reducedMotion || paused ? "Bold" : template;
  return (
    <div className="pp-review-stage">
      <motion.div
        ref={reviewRef}
        className={`pp-share-demo pp-review-demo pp-review-${displayTemplate.toLowerCase()} ${displayApproved ? "is-approved" : ""}`}
        style={{
          transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        }}
        onPointerMove={moveCard}
        onPointerLeave={() => setTilt({ x: 0, y: 0 })}
      >
        <div className="pp-share-top">
          <span className="pp-demo-kicker">
            YOUR STUDIO <span aria-hidden="true">·</span> SAMPLE DATA
          </span>
          <motion.span
            className={`pp-status-pill ${displayApproved ? "approved" : "pending"}`}
            animate={{ scale: displayApproved ? [1, 1.06, 1] : 1 }}
            transition={{ duration: 0.45 }}
            aria-live="polite"
          >
            {displayApproved ? (
              <CheckCircle2 size={13} />
            ) : (
              <Clock3 size={13} />
            )}
            {displayApproved ? "Approved" : "Pending"}
          </motion.span>
        </div>
        <motion.blockquote
          layout
          className={`pp-review-quote pp-review-quote-${displayTemplate.toLowerCase()}`}
        >
          <span className="pp-review-quote-mark" aria-hidden="true">
            &ldquo;
          </span>
          {LOOP_QUOTE}
          <span className="pp-review-quote-end" aria-hidden="true">
            &rdquo;
          </span>
        </motion.blockquote>
        <span className="pp-share-person">&mdash; Maya R.</span>
        <div
          className="pp-template-row"
          role="list"
          aria-label="Graphic styles"
        >
          {(["Minimal", "Bold", "Editorial"] as Template[]).map((item) => (
            <button
              className={displayTemplate === item ? "active" : ""}
              key={item}
              type="button"
              onClick={() => chooseTemplate(item)}
            >
              {displayTemplate === item && (
                <motion.span
                  className="pp-template-highlight"
                  layoutId="loop-template-highlight"
                />
              )}
              {item}
            </button>
          ))}
        </div>
        <div className="pp-share-actions">
          <button
            className={`pp-approve-small ${displayApproved ? "is-approved" : ""}`}
            type="button"
            onClick={() => {
              manualRef.current = true;
              setApproved(true);
            }}
          >
            <Check size={14} /> {displayApproved ? "Approved" : "Approve"}
          </button>
          {displayApproved && (
            <motion.div
              className="pp-share-actions-extra"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <button type="button">
                <Copy size={13} /> Copy embed
              </button>
              <button type="button">
                <Download size={13} /> Download image
              </button>
            </motion.div>
          )}
        </div>
        <span className="pp-review-glow" aria-hidden="true" />
      </motion.div>
      <InteractiveLoopCursor className="pp-review-cursor" />
    </div>
  );
}

function InteractiveLoopDemo({
  step,
  paused,
  reducedMotion,
  restartKey,
}: {
  step: number;
  paused: boolean;
  reducedMotion: boolean;
  restartKey: number;
}) {
  const transition = reducedMotion
    ? { duration: 0 }
    : { duration: 0.45, ease: [0.2, 0.8, 0.2, 1] as const };
  return (
    <div
      className={`pp-loop-demo pp-loop-demo-${step + 1}`}
      id="loop-panel"
      role="tabpanel"
      aria-labelledby={`loop-tab-${step}`}
      aria-live="polite"
    >
      <span className="pp-stage-glow" aria-hidden="true" />
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={step}
          className="pp-loop-stage-content"
          initial={{
            opacity: 0,
            y: 14,
            filter: reducedMotion ? "blur(0px)" : "blur(6px)",
          }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{
            opacity: 0,
            y: -10,
            filter: reducedMotion ? "blur(0px)" : "blur(6px)",
          }}
          transition={transition}
        >
          {step === 0 && (
            <InteractiveUrlDemo
              paused={paused}
              reducedMotion={reducedMotion}
              restartKey={restartKey}
            />
          )}
          {step === 1 && (
            <InteractivePhoneDemo
              paused={paused}
              reducedMotion={reducedMotion}
              restartKey={restartKey}
            />
          )}
          {step === 2 && (
            <InteractiveReviewDemo
              paused={paused}
              reducedMotion={reducedMotion}
              restartKey={restartKey}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function LoopDemo({ step, paused }: { step: number; paused: boolean }) {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [sectionPaused, setSectionPaused] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);
  useEffect(() => {
    const section = document.getElementById("the-loop");
    if (!section) return;
    const pause = () => setSectionPaused(true);
    const resume = () => setSectionPaused(false);
    section.addEventListener("mouseenter", pause);
    section.addEventListener("mouseleave", resume);
    section.addEventListener("focusin", pause);
    section.addEventListener("focusout", resume);
    return () => {
      section.removeEventListener("mouseenter", pause);
      section.removeEventListener("mouseleave", resume);
      section.removeEventListener("focusin", pause);
      section.removeEventListener("focusout", resume);
    };
  }, []);
  void LegacyLoopDemo;
  return (
    <InteractiveLoopDemo
      step={step}
      paused={paused || sectionPaused}
      reducedMotion={reducedMotion}
      restartKey={step}
    />
  );
}

const WINDING_ICONS = [Link2, MessageSquareHeart, BadgeCheck] as const;

function IconBadge({
  icon: Icon,
  active,
}: {
  icon: (typeof WINDING_ICONS)[number];
  active: boolean;
}) {
  return (
    <span
      className={`pp-winding-icon-badge ${active ? "is-active" : ""}`}
      aria-hidden="true"
    >
      <Icon size={25} strokeWidth={1.5} />
    </span>
  );
}

function StepNode({ index, active }: { index: number; active: boolean }) {
  return (
    <span
      className={`pp-winding-node-block ${active ? "is-active" : ""}`}
      aria-hidden="true"
    >
      <span className="pp-winding-step-label">STEP</span>
      <strong>0{index + 1}</strong>
    </span>
  );
}

function StepPill({
  item,
  index,
  active,
  onSelect,
}: {
  item: (typeof loopSteps)[number];
  index: number;
  active: boolean;
  onSelect: (index: number) => void;
}) {
  const Icon = WINDING_ICONS[index];
  return (
    <button
      id={`loop-tab-${index}`}
      className={`pp-winding-step ${active ? "active" : ""}`}
      type="button"
      role="tab"
      tabIndex={active ? 0 : -1}
      aria-selected={active}
      aria-controls="loop-panel"
      onClick={() => onSelect(index)}
    >
      <span className="pp-winding-notch" aria-hidden="true" />
      <IconBadge icon={Icon} active={active} />
      <span className="pp-step-copy">
        <b>{item.title}</b>
        <small>{item.copy}</small>
      </span>
      <StepNode index={index} active={active} />
    </button>
  );
}

function WindingStepList({
  activeStep,
  onSelect,
}: {
  activeStep: number;
  onSelect: (index: number) => void;
}) {
  const listRef = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (!listRef.current || !("IntersectionObserver" in window)) {
      setRevealed(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setRevealed(true);
        observer.disconnect();
      },
      { threshold: 0.2 },
    );
    observer.observe(listRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={listRef}
      className={`pp-step-list pp-winding-list ${revealed ? "is-revealed" : ""}`}
      role="tablist"
      aria-label="How Postproof works"
    >
      <span className="pp-winding-anchor" aria-hidden="true" />
      {loopSteps.map((item, index) => (
        <StepPill
          key={item.title}
          item={item}
          index={index}
          active={activeStep === index}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}

function LegacyBeforeAfter() {
  const [value, setValue] = useState(50);
  return (
    <div className="pp-before-after-wrap">
      <div
        className="pp-before-after"
        style={{ "--reveal": `${value}%` } as React.CSSProperties}
      >
        <div className="pp-after-card">
          <span className="pp-demo-kicker">BOLD · SAMPLE</span>
          <div className="pp-after-quote">
            “The kind of <i>care</i> you feel the difference in.”
          </div>
          <span className="pp-after-person">— Maya R.</span>
        </div>
        <div className="pp-before-shot">
          <span className="pp-shot-status">9:41</span>
          <span className="pp-notification" />
          <div className="pp-chat-bubble">
            The kind of care you feel the difference in.
          </div>
          <span className="pp-shot-file">Screenshot (14).png</span>
        </div>
        <label className="pp-slider-label" data-cursor="Drag">
          <span className="sr-only">
            Compare screenshot and polished graphic
          </span>
          <input
            type="range"
            min="0"
            max="100"
            value={value}
            onChange={(event) => setValue(Number(event.target.value))}
            aria-valuetext={`${value}% polished graphic`}
          />
          <span className="pp-slider-handle">
            <ArrowDownRight size={15} />
          </span>
        </label>
      </div>
      <div className="pp-before-after-legend">
        <span>Before</span>
        <span>
          <span className="pp-sample-tag">SAMPLE</span> After
        </span>
      </div>
    </div>
  );
}

function DesignLayer({ mode }: { mode: DesignMode }) {
  return (
    <div className={`pp-design-layer pp-design-${mode}`}>
      <span className="pp-design-inner-line pp-design-inner-line-top" />
      <span className="pp-design-inner-line pp-design-inner-line-bottom" />
      <span className="pp-design-kicker">
        POSTPROOF <span aria-hidden="true">·</span> SAMPLE{" "}
        {designModes.indexOf(mode) + 1}/3
      </span>
      <span className="pp-design-quote-mark" aria-hidden="true">
        &ldquo;
      </span>
      <p className="pp-design-quote">
        The kind of <strong>care</strong> you feel the difference in.
      </p>
      <span className="pp-design-signature">&mdash; Maya R.</span>
      <span className="pp-design-rule" />
      <span className="pp-design-stars" aria-label="Five stars">
        ★★★★★
      </span>
      <span className="pp-design-mark">
        P<span>p</span>
      </span>
    </div>
  );
}

type DesignMode = "editorial" | "bold" | "minimal";
const designModes: DesignMode[] = ["editorial", "bold", "minimal"];

function BeforeAfter() {
  void LegacyBeforeAfter;
  const [value, setValue] = useState(50);
  const [mode, setMode] = useState<DesignMode>("editorial");
  const [introPlaying, setIntroPlaying] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [hintVisible, setHintVisible] = useState(true);
  const [cursor, setCursor] = useState({ x: 50, y: 50, visible: false });
  const stageRef = useRef<HTMLDivElement>(null);
  const introFrame = useRef<number | null>(null);
  const idleTimer = useRef<number | null>(null);
  const introPlayed = useRef(false);
  const userInteracted = useRef(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || reducedMotion || !("IntersectionObserver" in window)) return;
    const easeInOut = (progress: number) =>
      progress < 0.5
        ? 2 * progress * progress
        : 1 - (-2 * progress + 2) ** 2 / 2;
    const easeOut = (progress: number) => 1 - (1 - progress) ** 3;
    const runSweep = () => {
      setIntroPlaying(true);
      setValue(100);
      const started = performance.now();
      const animate = (now: number) => {
        const elapsed = now - started;
        const total = 3600;
        let nextValue = 50;
        if (elapsed < 1600) {
          nextValue = 100 - easeInOut(elapsed / 1600) * 100;
        } else if (elapsed < 2800) {
          nextValue = 0;
        } else if (elapsed < total) {
          nextValue = easeOut((elapsed - 2800) / 800) * 50;
        }
        setValue(Math.round(nextValue));
        if (elapsed < total && !userInteracted.current) {
          introFrame.current = window.requestAnimationFrame(animate);
          return;
        }
        introFrame.current = null;
        setValue(50);
        setIntroPlaying(false);
        if (!userInteracted.current) {
          idleTimer.current = window.setTimeout(runSweep, 8000);
        }
      };
      introFrame.current = window.requestAnimationFrame(animate);
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (
          !entry?.isIntersecting ||
          introPlayed.current ||
          userInteracted.current
        )
          return;
        introPlayed.current = true;
        runSweep();
        observer.disconnect();
      },
      { threshold: 0.4 },
    );
    observer.observe(stage);
    return () => {
      observer.disconnect();
      if (introFrame.current !== null)
        window.cancelAnimationFrame(introFrame.current);
      if (idleTimer.current !== null) window.clearTimeout(idleTimer.current);
    };
  }, [reducedMotion]);

  function cancelMotion() {
    userInteracted.current = true;
    setHintVisible(false);
    setIntroPlaying(false);
    if (introFrame.current !== null)
      window.cancelAnimationFrame(introFrame.current);
    if (idleTimer.current !== null) window.clearTimeout(idleTimer.current);
  }

  function interact(nextValue: number) {
    cancelMotion();
    setValue(Math.max(0, Math.min(100, nextValue)));
  }

  function moveCursor(event: React.PointerEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    setCursor({
      x: ((event.clientX - rect.left) / rect.width) * 100,
      y: ((event.clientY - rect.top) / rect.height) * 100,
      visible: true,
    });
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    const amount = event.shiftKey ? 20 : 5;
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      interact(value - amount);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      interact(value + amount);
    }
    if (event.key === "Home") {
      event.preventDefault();
      interact(0);
    }
    if (event.key === "End") {
      event.preventDefault();
      interact(100);
    }
  }

  return (
    <div
      className={`pp-before-after-wrap pp-compare-${mode} ${introPlaying ? "is-intro-playing" : ""} ${dragging ? "is-dragging" : ""}`}
    >
      <div
        ref={stageRef}
        className="pp-before-after"
        style={
          {
            "--reveal": `${value}%`,
            "--cursor-x": `${cursor.x}%`,
            "--cursor-y": `${cursor.y}%`,
          } as React.CSSProperties
        }
        onPointerMove={moveCursor}
        onPointerEnter={() =>
          setCursor((current) => ({ ...current, visible: true }))
        }
        onPointerLeave={() =>
          setCursor((current) => ({ ...current, visible: false }))
        }
        onDoubleClick={() => interact(value < 50 ? 100 : 0)}
      >
        <div className="pp-after-layer">
          <DesignLayer mode={mode} />
        </div>
        <div className="pp-before-layer">
          <span className="pp-shot-status">9:41</span>
          <span className="pp-shot-signal">▮▮▮</span>
          <span className="pp-shot-crop">⌜</span>
          <span className="pp-notification">1</span>
          <div className="pp-chat-bubble">
            The kind of care you feel the difference in.
          </div>
          <span className="pp-shot-toast">Screenshot saved</span>
          <span className="pp-shot-file">Screenshot (14).png</span>
        </div>
        <span className="pp-compare-seam" aria-hidden="true">
          <span className="pp-compare-ticks" />
          <span className="pp-slider-handle">
            <ArrowLeftRight size={18} />
          </span>
        </span>
        <span
          className={`pp-compare-hint ${hintVisible ? "is-visible" : ""}`}
          aria-hidden="true"
        >
          <ArrowLeftRight size={14} /> <span>Drag to compare</span>
        </span>
        <label className="pp-slider-label" data-cursor="Drag">
          <span className="sr-only">
            Compare screenshot and polished graphic
          </span>
          <input
            type="range"
            min="0"
            max="100"
            value={value}
            onChange={(event) => interact(Number(event.target.value))}
            onKeyDown={onKeyDown}
            onPointerDown={() => {
              cancelMotion();
              setDragging(true);
            }}
            onPointerUp={() => setDragging(false)}
            onPointerCancel={() => setDragging(false)}
            aria-label="Compare before and after"
            aria-valuetext={`${value}% polished graphic`}
          />
          <span className="sr-only">
            Use left and right arrows to compare. Hold Shift for larger steps.
          </span>
        </label>
        <span
          className={`pp-compare-cursor ${cursor.visible ? "is-visible" : ""}`}
          aria-hidden="true"
        >
          {dragging ? "" : "Drag"}
        </span>
        <span className="pp-compare-sparkle pp-compare-sparkle-a">
          <Sparkles size={16} />
        </span>
        <span className="pp-compare-sparkle pp-compare-sparkle-b">
          <Sparkles size={12} />
        </span>
      </div>
      <div className="pp-before-after-legend">
        <span className={value > 55 ? "is-current" : ""}>Before</span>
        <button
          type="button"
          className="pp-sample-switch"
          onClick={() =>
            setMode(
              (current) =>
                designModes[
                  (designModes.indexOf(current) + 1) % designModes.length
                ],
            )
          }
          aria-label={`Change sample design, currently ${designModes.indexOf(mode) + 1} of 3`}
        >
          <span>SAMPLE {designModes.indexOf(mode) + 1}/3</span>
        </button>
        <span className={value <= 55 ? "is-current" : ""}>After</span>
      </div>
    </div>
  );
}

/* function StudioMock() {
  const [approved, setApproved] = useState(false);
  const [filter, setFilter] = useState("All");
  const [template, setTemplate] = useState<Template>("Bold");
  const shown = studioReviews.filter((review) => filter === "All" || review.status === filter || (filter === "Pending" && review.name === "Jane O." && !approved) || (filter === "Approved" && (review.status === "Approved" || (review.name === "Jane O." && approved))));
  return <div className="pp-studio-stage"><div className="pp-studio-sticker">TRY ME</div><div className="pp-studio-browser"><div className="pp-browser-chrome"><span /><span /><span /><b>postproof.app/dashboard</b></div><div className="pp-studio-content"><div className="pp-studio-head"><div><span className="pp-demo-kicker">YOUR STUDIO · SAMPLE DATA</span><h3>Good work deserves good proof.</h3></div><span className="pp-studio-avatar">M</span></div><div className="pp-stats-row"><div><span>Total</span><b>24</b></div><div><span>Waiting for review</span><b>{approved ? 5 : 6}</b></div><div><span>Approved to share</span><b>{approved ? 19 : 18}</b></div></div><div className="pp-studio-body"><div className="pp-review-list"><div className="pp-filter-row">{["All", "Pending", "Approved"].map((item) => <button key={item} className={filter === item ? "active" : ""} type="button" onClick={() => setFilter(item)}>{item}</button>)}</div>{shown.map((review) => <div className="pp-review-item" key={review.name}><span className={`pp-review-avatar ${review.tone}`}>{review.name[0]}</span><span><b>{review.name}</b><small>{review.text}</small></span><span className={`pp-status-text ${review.name === "Jane O." && approved ? "is-approved" : review.status === "Approved" ? "is-approved" : ""}`}>{review.name === "Jane O." && approved ? "Approved" : review.status}</span>{review.name === "Jane O." && !approved && <button className="pp-review-approve" type="button" onClick={() => setApproved(true)} aria-label="Approve Jane O testimonial"><Check size={14} /></button>}</div>)}</div><div className="pp-studio-graphic">{approved ? <><span className="pp-demo-kicker">CREATE GRAPHIC</span><div className={`pp-mini-graphic pp-mini-${template.toLowerCase()}`}><span>“</span><b>The kind of care<br />you feel the<br />difference in.</b><small>— Maya R.</small></div><div className="pp-mini-tabs">{(["Minimal", "Bold", "Editorial"] as Template[]).map((item) => <button key={item} className={template === item ? "active" : ""} type="button" onClick={() => setTemplate(item)}>{item}</button>)}</div></> : <><ImagePlus size={22} /><b>Approve a sample<br />to create a graphic</b></>}</div></div></div></div><button className="pp-reset-demo" type="button" onClick={() => { setApproved(false); setFilter("All"); }}>Reset demo</button></div>;
}

} */
/* function LegacyBigQuote() {
  const words = "It finally feels like the work I do, not another template someone handed me.".split(" ");
  const [visible, setVisible] = useState(0);
  const ref = useRef<HTMLElement>(null);
  useEffect(() => { const onScroll = () => { if (!ref.current) return; const rect = ref.current.getBoundingClientRect(); const progress = Math.max(0, Math.min(1, (window.innerHeight - rect.top) / (window.innerHeight + rect.height * .6))); setVisible(Math.floor(progress * (words.length + 3))); }; onScroll(); window.addEventListener("scroll", onScroll, { passive: true }); return () => window.removeEventListener("scroll", onScroll); }, [words.length]);
  return <section className="pp-big-quote" ref={ref} data-section="quote"><div className="pp-quote-corner pp-quote-corner-left">“</div><div className="pp-quote-corner pp-quote-corner-right">“</div><div className="pp-quote-marquee">“　“　“　“　“　“　“　“　“　“　“</div><div className="pp-big-quote-inner"><span className="pp-demo-kicker">A SAMPLE OF WHAT YOU COULD SHARE</span><blockquote>{words.map((word, index) => <span key={`${word}-${index}`} style={{ opacity: visible > index ? 1 : .2 }}>{word} </span>)}</blockquote><div className="pp-attribution"><span className="pp-quote-avatar">A</span><span><b>Ayo, founder</b><small>Independent creative studio</small></span><span className="pp-sample-tag">SAMPLE</span></div></div></section>;
} */

function BigQuote() {
  return (
    <section className="pp-big-quote" data-section="quote">
      <div className="pp-quote-corner pp-quote-corner-left">&ldquo;</div>
      <div className="pp-quote-corner pp-quote-corner-right">&ldquo;</div>
      <div className="pp-quote-marquee">
        &ldquo; &ldquo; &ldquo; &ldquo; &ldquo; &ldquo; &ldquo; &ldquo; &ldquo;
        &ldquo;
      </div>
      <div className="pp-big-quote-inner">
        <span className="pp-demo-kicker">A SAMPLE OF WHAT YOU COULD SHARE</span>
        <ScrollReveal
          containerClassName="pp-big-quote-reveal"
          textClassName="pp-big-quote-reveal-text"
          highlightColor="#1A1613"
          mode="enter"
          splitBy="words"
          effect="rise"
          stagger={0.065}
          duration={0.8}
          baseOpacity={0.14}
          baseRotation={2.5}
          baseOffset={10}
          enableBlur
          blurStrength={4}
          rotationEnd="bottom 72%"
          wordAnimationEnd="bottom 34%"
        >
          It finally feels like the work I do, not another template someone
          handed me.
        </ScrollReveal>
        <div className="pp-attribution">
          <span className="pp-quote-avatar">A</span>
          <span>
            <b>Ayo, founder</b>
            <small>Independent creative studio</small>
          </span>
          <span className="pp-sample-tag">SAMPLE</span>
        </div>
      </div>
    </section>
  );
}

export default function LandingPage() {
  const paused = false;
  const [menuOpen, setMenuOpen] = useState(false);
  const [loopStep, setLoopStep] = useState(0);
  const [loopCycle, setLoopCycle] = useState(0);
  const [loopActivity, setLoopActivity] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [progress, setProgress] = useState(0);
  const [cursor, setCursor] = useState({ x: -100, y: -100, label: "" });
  const pageRef = useRef<HTMLElement>(null);

  const loopPaused = paused || loopActivity || !pageVisible;

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max ? window.scrollY / max : 0);
    };
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMotionChange = () => setReducedMotion(media.matches);
    const onVisibility = () => setPageVisible(!document.hidden);
    onMotionChange();
    onVisibility();
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    media.addEventListener("change", onMotionChange);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("scroll", onScroll);
      media.removeEventListener("change", onMotionChange);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  useEffect(() => {
    if (reducedMotion || loopPaused) return;
    const timer = window.setInterval(() => {
      setLoopStep((step) => (step + 1) % loopSteps.length);
      setLoopCycle((cycle) => cycle + 1);
    }, LOOP_DURATION);
    return () => window.clearInterval(timer);
  }, [loopPaused, reducedMotion, loopCycle]);

  useEffect(() => {
    const section = document.getElementById("the-loop");
    if (section) section.classList.toggle("pp-loop-paused", loopPaused);
  }, [loopPaused]);

  useEffect(() => {
    const section = document.getElementById("the-loop");
    if (!section) return;
    const pause = () => setLoopActivity(true);
    const resume = () => setLoopActivity(false);
    section.addEventListener("mouseenter", pause);
    section.addEventListener("mouseleave", resume);
    section.addEventListener("focusin", pause);
    section.addEventListener("focusout", resume);
    return () => {
      section.removeEventListener("mouseenter", pause);
      section.removeEventListener("mouseleave", resume);
      section.removeEventListener("focusin", pause);
      section.removeEventListener("focusout", resume);
    };
  }, []);

  useEffect(() => {
    const syncTabs = () =>
      document
        .querySelectorAll<HTMLElement>("#the-loop .pp-step-list button")
        .forEach((tab, index) => {
          tab.id = `loop-tab-${index}`;
          tab.tabIndex = loopStep === index ? 0 : -1;
          tab.setAttribute("aria-controls", "loop-panel");
        });
    const onKey = (event: KeyboardEvent) => {
      const active = document.activeElement as HTMLElement | null;
      const tabs = Array.from(
        document.querySelectorAll<HTMLElement>(
          "#the-loop .pp-step-list button",
        ),
      );
      const index = active ? tabs.indexOf(active) : -1;
      if (index < 0) return;
      let next = index;
      if (event.key === "Home") next = 0;
      else if (event.key === "End") next = tabs.length - 1;
      else if (event.key === "ArrowDown" || event.key === "ArrowRight")
        next = (index + 1) % tabs.length;
      else if (event.key === "ArrowUp" || event.key === "ArrowLeft")
        next = (index + tabs.length - 1) % tabs.length;
      else if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      setLoopStep(next);
      setLoopCycle((cycle) => cycle + 1);
      window.requestAnimationFrame(() => tabs[next]?.focus());
    };
    syncTabs();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [loopStep]);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    if (!fine) return;
    const move = (event: PointerEvent) => {
      const target = event.target as HTMLElement;
      setCursor({
        x: event.clientX,
        y: event.clientY,
        label:
          target.closest<HTMLElement>("[data-cursor]")?.dataset.cursor ?? "",
      });
    };
    window.addEventListener("pointermove", move);
    return () => window.removeEventListener("pointermove", move);
  }, []);

  return (
    <main ref={pageRef} className={`pp-page ${paused ? "pp-paused" : ""}`}>
      <div
        className="pp-scroll-progress"
        style={{ transform: `scaleX(${progress})` }}
        aria-hidden="true"
      />
      <div
        className="pp-cursor"
        style={{ transform: `translate3d(${cursor.x}px, ${cursor.y}px, 0)` }}
        aria-hidden="true"
      >
        <span>{cursor.label || "“"}</span>
      </div>
      <nav
        className={`pp-nav ${progress > 0.04 ? "is-scrolled" : ""}`}
        aria-label="Main navigation"
      >
        <Wordmark />
        <div className="pp-nav-links">
          <a href="#the-loop">How it works</a>
          <a href="#why-postproof">Why Postproof</a>
        </div>
        <div className="pp-nav-actions">
          <Button asChild variant="secondary" size="md">
            <Link href="/login">Log in</Link>
          </Button>
          <MagneticButton asChild variant="primary" size="md" shape="pill">
            <Link href="/signup">
              Start free <ArrowUpRight aria-hidden="true" />
            </Link>
          </MagneticButton>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="pp-menu-button"
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
          leftIcon={<Menu />}
        />
      </nav>
      {menuOpen && (
        <div className="pp-mobile-sheet">
          <Button
            variant="outline-inverse"
            size="icon"
            className="pp-sheet-close"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
            leftIcon={<X />}
          />
          <Wordmark />
          <div>
            <a href="#the-loop" onClick={() => setMenuOpen(false)}>
              How it works
            </a>
            <a href="#why-postproof" onClick={() => setMenuOpen(false)}>
              Why Postproof
            </a>
            <Button asChild variant="secondary" size="md">
              <Link href="/login">Log in</Link>
            </Button>
            <MagneticButton asChild variant="primary" size="md" shape="pill">
              <Link href="/signup">
                Start free <ArrowUpRight aria-hidden="true" />
              </Link>
            </MagneticButton>
          </div>
        </div>
      )}

      <section className="pp-hero pp-section" data-section="hero">
        <HeroBackground paused={paused} reducedMotion={reducedMotion} />
        <div className="pp-coral-wash" />
        <div className="pp-container pp-hero-grid">
          <div className="pp-hero-copy">
            <span className="pp-sticker">
              <i /> PROOF WORTH POSTING
            </span>
            <h1>
              <WarpText
                as="span"
                className="pp-hero-warp"
                text={"Turn customer\nlove into"}
                textAlign="left"
                fitWidth={0.98}
                fitHeight={0.96}
                fontSize="1.03em"
                fontWeight="inherit"
                fontFamily="inherit"
                letterSpacing="inherit"
                lineHeight={0.92}
                warpStrength={0.06}
                pointerStrength={0.3}
                idleDrift={0.1}
              />
              <ProofText text="proof worth posting." />
            </h1>
            <p>
              Collect customer reviews with one link. Approve the ones you love.
              Download them as branded, ready-to-post graphics.
            </p>
            <div className="pp-hero-actions">
              <MagneticButton asChild variant="flood" size="xl" shape="pill">
                <Link href="/signup">
                  Create your link <ArrowUpRight aria-hidden="true" />
                </Link>
              </MagneticButton>
              <Button asChild variant="secondary" size="md">
                <a href="#the-loop">
                  See how it works <ArrowDown aria-hidden="true" />
                </a>
              </Button>
            </div>
          </div>
          <HeroStack paused={paused} />
        </div>
      </section>

      <section
        className={`pp-loop pp-section pp-loop-step-${loopStep + 1}`}
        id="the-loop"
        data-section="loop"
      >
        <div className="pp-container">
          <div className="pp-section-intro">
            <div>
              <span className="pp-overline">THE SIMPLE LOOP</span>
              <h2>
                Less admin.
                <br />
                <ProofText text="More proof." />
              </h2>
            </div>
            <div>
              <p>
                Great work creates great stories. Postproof gives those stories
                a place to land—and gives you a graceful way to put them back
                into the world.
              </p>
              <Button asChild variant="secondary" size="md">
                <a href="#link-claim">
                  Build your collection link <ArrowUpRight size={16} />
                </a>
              </Button>
            </div>
          </div>
          <div className="pp-loop-grid">
            <WindingStepList
              activeStep={loopStep}
              onSelect={(index) => setLoopStep(index)}
            />
            <LoopDemo key={loopStep} step={loopStep} paused={paused} />
          </div>
        </div>
      </section>

      <section
        className="pp-best-words pp-section"
        id="why-postproof"
        data-section="best-words"
      >
        <div className="pp-container">
          <div className="pp-section-intro pp-section-intro-light">
            <div>
              <span className="pp-overline">THE HOME FOR YOUR BEST WORDS</span>
              <h2>
                A nice message shouldn&apos;t live
                <br />
                <ProofText text="in a screenshot" className="pp-strike-word" />.
              </h2>
            </div>
            <div>
              <p>
                Give your customer&apos;s words the care they deserve. A{" "}
                <span>calm inbox</span>, a <span>clear approval flow</span>, and
                graphics that feel <span>designed</span>—not generated.
              </p>
            </div>
          </div>
          <BeforeAfter />
          <div className="pp-benefit-rows">
            <div tabIndex={0}>
              <span>01</span>
              <b>No more screenshot hunting</b>
              <em>One tidy inbox.</em>
              <i aria-hidden="true" />
            </div>
            <div tabIndex={0}>
              <span>02</span>
              <b>No design queue for every kind word</b>
              <em>Graphics in a click.</em>
              <i aria-hidden="true" />
            </div>
            <div tabIndex={0}>
              <span>03</span>
              <b>No AI-written customer stories</b>
              <em>Real words only.</em>
              <i aria-hidden="true" />
            </div>
          </div>
          <Link className="pp-button pp-button-coral" href="/signup">
            Make it yours <MoveUpRight size={17} />
          </Link>
        </div>
      </section>

      <StudioSection />

      <CollectionLinkSection />

      <BigQuote />

      <FinalCtaSection reducedMotion={reducedMotion} />
    </main>
  );
}
