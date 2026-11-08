"use client";

import { Children, useEffect, useLayoutEffect, useMemo, useRef, type ReactNode, type RefObject } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const SCRUB_SPAN = 0.5;
const RISE_MASK = "inset(-1em -1em -0.15em -1em)";

type SplitBy = "words" | "chars" | "lines";
type Effect = "fade" | "rise" | "flip" | "scale";
type Mode = "scrub" | "enter";

export type ScrollRevealProps = {
  children: ReactNode;
  scrollContainerRef?: RefObject<HTMLElement | null>;
  highlightColor?: string;
  mode?: Mode;
  splitBy?: SplitBy;
  effect?: Effect;
  stagger?: number;
  duration?: number;
  smoothing?: number;
  baseOpacity?: number;
  baseRotation?: number;
  baseOffset?: number;
  enableBlur?: boolean;
  blurStrength?: number;
  rotationEnd?: string;
  wordAnimationEnd?: string;
  containerClassName?: string;
  textClassName?: string;
};

const clamp01 = (value: number) => Math.min(Math.max(value, 0), 1);
const smooth = (value: number) => value * value * (3 - 2 * value);
const easeOut = (value: number) => 1 - Math.pow(1 - value, 3);
const easeBack = (value: number, overshoot: number) => {
  const shifted = value - 1;
  return 1 + (overshoot + 1) * shifted * shifted * shifted + overshoot * shifted * shifted;
};
const glowAt = (value: number) => (value <= 0 || value >= 1 ? 0 : value < 0.35 ? smooth(value / 0.35) : 1 - smooth((value - 0.35) / 0.65));
const clampToScroll = (position: string) => (position.startsWith("clamp(") ? position : `clamp(${position})`);

function paintPiece(piece: HTMLElement, progress: number, look: { effect: Effect; masked: boolean; baseOpacity: number; blur: number; offset: number; highlightColor: string }) {
  let reveal = progress;
  let fadeIn = progress;
  let motion = "";
  if (look.effect === "rise") {
    reveal = easeOut(progress);
    fadeIn = clamp01(reveal * 1.25);
    if (reveal < 1) motion = look.masked ? `translateY(${((1 - reveal) * 100).toFixed(2)}%) translateY(${((1 - reveal) * 0.2).toFixed(3)}em)` : `translateY(${((1 - reveal) * 0.8).toFixed(3)}em)`;
  } else if (look.effect === "flip") {
    reveal = easeBack(progress, 1.2);
    fadeIn = clamp01(progress * 2);
    if (progress < 1) motion = `perspective(6em) rotateX(${((1 - reveal) * 90).toFixed(2)}deg)`;
  } else if (look.effect === "scale") {
    reveal = easeBack(progress, 1.6);
    fadeIn = clamp01(progress * 1.6);
    if (progress < 1) motion = `scale(${(0.35 + 0.65 * reveal).toFixed(4)})`;
  }
  if (look.highlightColor) fadeIn = Math.max(fadeIn, clamp01(progress / 0.35));
  const settled = clamp01(reveal);
  const lift = look.offset * (1 - settled);
  piece.style.opacity = progress >= 1 ? "" : (look.baseOpacity + (1 - look.baseOpacity) * fadeIn).toFixed(3);
  piece.style.transform = [lift ? `translateY(${lift.toFixed(2)}px)` : "", motion].filter(Boolean).join(" ");
  piece.style.filter = look.blur && settled < 1 ? `blur(${(look.blur * (1 - settled)).toFixed(2)}px)` : "";
  if (look.highlightColor) {
    const glow = glowAt(progress);
    piece.style.color = glow > 0.002 ? `color-mix(in srgb, ${look.highlightColor} ${(glow * 100).toFixed(1)}%, currentColor)` : "";
  }
}

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export default function ScrollReveal({
  children,
  scrollContainerRef,
  enableBlur = true,
  baseOpacity = 0.1,
  baseRotation = 3,
  blurStrength = 4,
  baseOffset = 0,
  stagger = 0.05,
  smoothing = 0,
  splitBy = "words",
  effect = "fade",
  mode = "scrub",
  duration = 0.8,
  highlightColor = "",
  containerClassName = "",
  textClassName = "",
  rotationEnd = "bottom bottom",
  wordAnimationEnd = "bottom bottom",
}: ScrollRevealProps) {
  const containerRef = useRef<HTMLHeadingElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const text = useMemo(() => {
    const parts = Children.toArray(children);
    return parts.every((part) => typeof part === "string" || typeof part === "number") ? parts.join("") : null;
  }, [children]);
  const splitText = useMemo(() => {
    if (text === null) return null;
    return text.split(/(\s+)/).map((word, index) => word.trim() === "" ? word : <span className="scroll-reveal-word" key={index}>{splitBy === "chars" ? Array.from(word).map((character, charIndex) => <span className="scroll-reveal-piece" key={charIndex}>{character}</span>) : <span className="scroll-reveal-piece">{word}</span>}</span>);
  }, [text, splitBy]);

  useIsomorphicLayoutEffect(() => {
    const element = containerRef.current;
    const textElement = textRef.current;
    if (!element || !textElement || (scrollContainerRef && !scrollContainerRef.current)) return;
    const scroller = scrollContainerRef?.current || window;
    const wrappers = Array.from(element.querySelectorAll<HTMLElement>(".scroll-reveal-word"));
    const pieces = wrappers.length ? Array.from(element.querySelectorAll<HTMLElement>(".scroll-reveal-piece")) : [textElement];
    const viewportHeight = () => scroller instanceof HTMLElement ? scroller.clientHeight : window.innerHeight;
    const scrub: boolean | number = smoothing > 0 ? smoothing : true;
    const span = mode === "enter" ? Math.max(0.05, duration) : SCRUB_SPAN;
    const gap = Math.max(0, stagger);
    const look = { effect, masked: effect === "rise" && wrappers.length > 0, baseOpacity, blur: enableBlur ? blurStrength : 0, offset: baseOffset, highlightColor };
    const media = gsap.matchMedia();

    media.add("(prefers-reduced-motion: no-preference)", () => {
      const order = pieces.map((_, index) => index);
      const last = pieces.map(() => -1);
      const state = { progress: 0 };
      let count = pieces.length;
      const measure = () => {
        if (splitBy !== "lines" || !wrappers.length) return;
        let line = -1;
        let top = -Infinity;
        wrappers.forEach((wrapper, index) => {
          const nextTop = wrapper.offsetTop;
          if (Math.abs(nextTop - top) > 2) { line += 1; top = nextTop; }
          order[index] = line;
        });
        count = line + 1;
      };
      const total = () => span + Math.max(0, count - 1) * gap;
      const render = () => {
        const at = state.progress * total();
        pieces.forEach((piece, index) => {
          const progress = clamp01((at - order[index] * gap) / span);
          if (progress === last[index]) return;
          last[index] = progress;
          paintPiece(piece, progress, look);
        });
      };
      measure();
      pieces.forEach((piece) => {
        piece.style.willChange = pieces.length > 80 ? "" : effect === "fade" && !baseOffset ? "opacity" : "opacity, transform";
        piece.style.transformOrigin = effect === "flip" ? "50% 100%" : "";
      });
      if (look.masked) wrappers.forEach((wrapper) => { wrapper.style.clipPath = RISE_MASK; });
      render();

      if (mode === "enter") {
        let played = false;
        const play = () => {
          if (played) return;
          played = true;
          gsap.to(state, { progress: 1, duration: total(), ease: "none", onUpdate: render });
          if (baseRotation) gsap.to(element, { rotate: 0, duration: Math.min(total(), 1.4), ease: "power3.out" });
        };
        const startAt = () => {
          const view = viewportHeight();
          const top = element.getBoundingClientRect().top - (scroller instanceof HTMLElement ? scroller.getBoundingClientRect().top + scroller.clientTop - scroller.scrollTop : -window.scrollY);
          const raw = top - view + 0.2 * Math.min(element.offsetHeight, view);
          return Math.min(raw, ScrollTrigger.maxScroll(scroller) - 1);
        };
        if (baseRotation) gsap.set(element, { transformOrigin: "0% 50%", rotate: baseRotation });
        ScrollTrigger.create({ trigger: element, scroller, start: startAt, onEnter: play, onLeave: play, onRefresh: (trigger) => { if (trigger.progress > 0) play(); } });
      } else {
        if (baseRotation) gsap.fromTo(element, { transformOrigin: "0% 50%", rotate: baseRotation }, { ease: "none", rotate: 0, scrollTrigger: { trigger: element, scroller, start: "top bottom", end: clampToScroll(rotationEnd), scrub } });
        gsap.to(state, { progress: 1, ease: "none", onUpdate: render, scrollTrigger: { trigger: element, scroller, start: () => `top bottom-=${0.2 * Math.min(element.offsetHeight, viewportHeight())}`, end: clampToScroll(wordAnimationEnd), scrub } });
      }

      const resizeObserver = splitBy === "lines" && typeof ResizeObserver !== "undefined" ? new ResizeObserver(() => { measure(); last.fill(-1); render(); }) : null;
      resizeObserver?.observe(textElement);
      return () => {
        resizeObserver?.disconnect();
        pieces.forEach((piece) => { piece.style.opacity = ""; piece.style.transform = ""; piece.style.transformOrigin = ""; piece.style.filter = ""; piece.style.color = ""; piece.style.willChange = ""; });
        wrappers.forEach((wrapper) => { wrapper.style.clipPath = ""; });
      };
    });
    return () => media.revert();
  }, [baseOffset, baseOpacity, baseRotation, blurStrength, duration, effect, enableBlur, highlightColor, mode, rotationEnd, scrollContainerRef, smoothing, splitBy, stagger, text, wordAnimationEnd]);

  return <h2 ref={containerRef} className={`scroll-reveal ${containerClassName}`.trim()} aria-label={text ?? undefined}><span ref={textRef} className={`scroll-reveal-text ${textClassName}`.trim()} aria-hidden={text === null ? undefined : true}>{splitText ?? children}</span></h2>;
}
