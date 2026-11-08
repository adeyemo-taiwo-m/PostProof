"use client";

import { useEffect, useRef, useState, type CSSProperties, type MutableRefObject } from "react";
import "./HeroBackground.css";

type PointerState = { x: number; y: number; inside: boolean };
type RippleState = { x: number; y: number; started: number } | null;

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

function QuoteSymbol({ className, size, rotation }: { className: string; size: string; rotation: number }) {
  return <span className={`hero-quote ${className}`} style={{ "--quote-size": size, "--quote-rotation": `${rotation}deg` } as CSSProperties} aria-hidden="true">&ldquo;</span>;
}

function BlueprintGrid({ paused, reducedMotion, pointerRef, rippleRef }: { paused: boolean; reducedMotion: boolean; pointerRef: MutableRefObject<PointerState>; rippleRef: MutableRefObject<RippleState> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    const context = canvas?.getContext("2d");
    if (!canvas || !host || !context) return undefined;

    let width = 1;
    let height = 1;
    let dpr = 1;
    let frame = 0;
    let visible = true;
    let destroyed = false;

    const draw = (now: number) => {
      frame = 0;
      if (destroyed || !visible) return;
      const spacing = width < 768 ? 44 : 54;
      const columns = Math.max(4, Math.floor(width / spacing));
      const rows = Math.max(4, Math.floor(height / spacing));
      const startX = width < 768 ? width * .28 : width * .57;
      const startY = width < 768 ? height * .42 : height * .15;
      const pointer = pointerRef.current;
      const ripple = rippleRef.current;

      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.clearRect(0, 0, width, height);
      context.save();
      context.setLineDash([3, 5]);
      context.lineWidth = 1;
      context.strokeStyle = "rgba(194,65,12,.16)";
      context.fillStyle = "rgba(240,82,45,.62)";

      for (let column = 0; column < columns; column += 1) {
        const x = startX + column * spacing;
        context.beginPath();
        context.moveTo(x, startY);
        context.lineTo(x, startY + (rows - 1) * spacing);
        context.stroke();
      }
      for (let row = 0; row < rows; row += 1) {
        const y = startY + row * spacing;
        context.beginPath();
        context.moveTo(startX, y);
        context.lineTo(startX + (columns - 1) * spacing, y);
        context.stroke();
      }

      context.setLineDash([]);
      for (let row = 0; row < rows; row += 1) {
        for (let column = 0; column < columns; column += 1) {
          const x = startX + column * spacing;
          const y = startY + row * spacing;
          const distance = Math.hypot(pointer.x - x, pointer.y - y);
          const pointerGlow = pointer.inside ? clamp(1 - distance / 170, 0, 1) : 0;
          const rippleAge = ripple ? now - ripple.started : Infinity;
          const rippleRadius = rippleAge * .45;
          const rippleGlow = rippleAge < 760 ? clamp(1 - Math.abs(distance - rippleRadius) / 32, 0, 1) * (1 - rippleAge / 760) : 0;
          const pulse = paused || reducedMotion ? 0 : (Math.sin(now * .0012 + row * 1.7 + column * .9) + 1) * .08;
          context.globalAlpha = .28 + pointerGlow * .55 + rippleGlow * .65 + pulse;
          context.beginPath();
          context.arc(x, y, 1.6 + pointerGlow * 2.2 + rippleGlow * 2, 0, Math.PI * 2);
          context.fill();
        }
      }
      context.restore();

      if (ripple && now - ripple.started > 760) rippleRef.current = null;
      if (!paused && !reducedMotion && !document.hidden && visible) frame = requestAnimationFrame(draw);
    };

    const resize = () => {
      width = Math.max(1, host.clientWidth);
      height = Math.max(1, host.clientHeight);
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      draw(performance.now());
    };

    const resizeObserver = new ResizeObserver(resize);
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = Boolean(entry?.isIntersecting);
      if (visible) draw(performance.now());
      else if (frame) cancelAnimationFrame(frame);
    });
    resizeObserver.observe(host);
    intersectionObserver.observe(host);
    const onVisibility = () => {
      if (document.hidden && frame) cancelAnimationFrame(frame);
      if (!document.hidden) draw(performance.now());
    };
    document.addEventListener("visibilitychange", onVisibility);
    resize();

    return () => {
      destroyed = true;
      if (frame) cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [paused, pointerRef, reducedMotion, rippleRef]);

  return <div className="hero-blueprint-grid" aria-hidden="true"><canvas ref={canvasRef} /></div>;
}

export default function HeroBackground({ paused, reducedMotion }: { paused: boolean; reducedMotion: boolean }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const pointerRef = useRef<PointerState>({ x: 0, y: 0, inside: false });
  const rippleRef = useRef<RippleState>(null);
  const [introReady, setIntroReady] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setIntroReady(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    const hero = root?.parentElement;
    if (!root || !hero) return undefined;
    let pointerFrame = 0;
    let rippleTimer = 0;

    const onPointerMove = (event: PointerEvent) => {
      if (paused || reducedMotion) return;
      if (pointerFrame) return;
      pointerFrame = requestAnimationFrame(() => {
        pointerFrame = 0;
        const rect = hero.getBoundingClientRect();
        pointerRef.current = { x: event.clientX - rect.left, y: event.clientY - rect.top, inside: true };
        root.style.setProperty("--mx", `${event.clientX - rect.left}px`);
        root.style.setProperty("--my", `${event.clientY - rect.top}px`);
      });
    };
    const onPointerLeave = () => {
      pointerRef.current.inside = false;
      root.style.setProperty("--flash-opacity", "0");
    };
    const onClick = (event: MouseEvent) => {
      if (paused || reducedMotion || event.target !== hero) return;
      const rect = hero.getBoundingClientRect();
      rippleRef.current = { x: event.clientX - rect.left, y: event.clientY - rect.top, started: performance.now() };
      root.classList.add("is-rippling");
      window.clearTimeout(rippleTimer);
      rippleTimer = window.setTimeout(() => root.classList.remove("is-rippling"), 760);
    };

    hero.addEventListener("pointermove", onPointerMove, { passive: true });
    hero.addEventListener("pointerleave", onPointerLeave, { passive: true });
    hero.addEventListener("click", onClick, { passive: true });
    return () => {
      if (pointerFrame) cancelAnimationFrame(pointerFrame);
      window.clearTimeout(rippleTimer);
      hero.removeEventListener("pointermove", onPointerMove);
      hero.removeEventListener("pointerleave", onPointerLeave);
      hero.removeEventListener("click", onClick);
    };
  }, [paused, reducedMotion]);

  const style = {
    "--mx": "50%",
    "--my": "28%",
    "--flash-opacity": "0",
  } as CSSProperties;

  return <div ref={rootRef} className={`hero-background ${introReady ? "is-intro-ready" : ""} ${paused || reducedMotion ? "is-static" : ""}`} style={style} aria-hidden="true"><div className="hero-background-content"><div className="hero-grain" /><div className="hero-light" /><div className="hero-window-bars"><i /><i /><i /></div><QuoteSymbol className="hero-quote-a" size="min(42vw, 420px)" rotation={8} /><QuoteSymbol className="hero-quote-b" size="min(16vw, 160px)" rotation={-10} /><BlueprintGrid paused={paused} reducedMotion={reducedMotion} pointerRef={pointerRef} rippleRef={rippleRef} /><div className="hero-flashlight" /></div></div>;
}
