"use client";

import { useEffect, useRef } from "react";
import "./TechText.css";

type Reveal = "area" | "letter" | "off";
type Align = "left" | "center" | "right";
type LineStyle = "dashed" | "solid";
type Intro = "none" | "type" | "assemble" | "metrics";

export type TechTextProps = {
  text?: string;
  fontFamily?: string;
  fontWeight?: number;
  fontSize?: number;
  letterSpacing?: number;
  align?: Align;
  color?: string;
  accentColor?: string;
  highlightText?: string;
  highlightColor?: string;
  reveal?: Reveal;
  reach?: number;
  softness?: number;
  dashLength?: number;
  dashGap?: number;
  lineStyle?: LineStyle;
  strokeWidth?: number;
  specks?: number;
  selection?: boolean;
  labels?: boolean;
  draggable?: boolean;
  bounce?: number;
  clickKick?: boolean;
  intro?: Intro;
  introDuration?: number;
  guides?: boolean;
  sweep?: boolean;
  speed?: number;
  className?: string;
  style?: React.CSSProperties;
};

type Glyph = {
  char: string;
  x: number;
  width: number;
  ascent: number;
  descent: number;
  offsetX: number;
  offsetY: number;
  velocityY: number;
};

type Settings = Required<Omit<TechTextProps, "fontFamily" | "className" | "style">> & {
  fontFamily: string;
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const isInherited = (value: string) => !value || /^(currentcolor|inherit)$/i.test(value.trim());

export default function TechText({
  text = "React Bits",
  fontFamily = "",
  fontWeight = 600,
  fontSize = 150,
  letterSpacing = -0.05,
  align = "center",
  color = "currentColor",
  accentColor = "currentColor",
  highlightText = "",
  highlightColor = "",
  reveal = "letter",
  reach = 200,
  softness = 0.7,
  dashLength = 4,
  dashGap = 2,
  lineStyle = "dashed",
  strokeWidth = 1.5,
  specks = 15,
  selection = true,
  labels = true,
  draggable = true,
  bounce = 0.4,
  clickKick = true,
  intro = "none",
  introDuration = 2,
  guides = false,
  sweep = true,
  speed = 1,
  className = "",
  style,
}: TechTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!container || !canvas || !context) return undefined;

    let width = 1;
    let height = 1;
    let dpr = 1;
    let raf = 0;
    let visible = true;
    let destroyed = false;
    let clock = 0;
    let last = performance.now();
    let introClock = intro === "none" ? introDuration : 0;
    let dragging = -1;
    let activeIndex = -1;
    let pointerInside = false;
    let pointerX = 0;
    let pointerY = 0;
    let dragOffsetX = 0;
    let dragOffsetY = 0;
    let layoutKey = "";
    let glyphs: Glyph[] = [];
    let baseline = 0;
    let font = "";
    let currentSize = fontSize;
    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;

    const getSettings = (): Settings => ({
      text,
      fontFamily,
      fontWeight,
      fontSize,
      letterSpacing,
      align,
      color,
      accentColor,
      highlightText,
      highlightColor,
      reveal,
      reach,
      softness,
      dashLength,
      dashGap,
      lineStyle,
      strokeWidth,
      specks,
      selection,
      labels,
      draggable,
      bounce,
      clickKick,
      intro,
      introDuration,
      guides,
      sweep,
      speed,
    });

    const resolveColor = (value: string, computed: CSSStyleDeclaration, fallback: string) => {
      if (isInherited(value)) return computed.color || fallback;
      const variable = value.match(/^var\(\s*(--[\w-]+)\s*\)$/);
      return variable ? computed.getPropertyValue(variable[1]).trim() || fallback : value;
    };

    const getPalette = (settings: Settings) => {
      const computed = getComputedStyle(container);
      const ink = resolveColor(settings.color, computed, "#0f0f0f");
      return {
        ink,
        highlight: resolveColor(settings.highlightColor, computed, ink),
        accent: resolveColor(settings.accentColor, computed, "#f2542d"),
      };
    };

    const setFont = (settings: Settings, size: number) => {
      const family = settings.fontFamily || getComputedStyle(container).fontFamily || "sans-serif";
      font = `${settings.fontWeight} ${size}px ${family}`;
      context.font = font;
      context.textBaseline = "alphabetic";
      context.textAlign = "left";
    };

    const rebuild = (settings: Settings, ink: string) => {
      const key = [settings.text, settings.fontFamily, settings.fontWeight, settings.fontSize, settings.letterSpacing, align, width, height, dpr].join("|");
      if (key === layoutKey && glyphs.length) return;
      layoutKey = key;

      setFont(settings, settings.fontSize);
      const spacing = settings.letterSpacing * settings.fontSize;
      const metrics = Array.from(settings.text).map((char) => context.measureText(char));
      const requestedWidth = metrics.reduce((total, metric) => total + metric.width, 0) + Math.max(0, metrics.length - 1) * spacing;
      const requestedHeight = Math.max(...metrics.map((metric) => (metric.actualBoundingBoxAscent || settings.fontSize * .75) + (metric.actualBoundingBoxDescent || settings.fontSize * .2)), 1);
      const fit = Math.min(1, (width * .94) / Math.max(requestedWidth, 1), (height * .8) / requestedHeight);
      currentSize = settings.fontSize * fit;
      setFont(settings, currentSize);

      const fittedSpacing = settings.letterSpacing * currentSize;
      const fittedMetrics = Array.from(settings.text).map((char) => context.measureText(char));
      const totalWidth = fittedMetrics.reduce((total, metric) => total + metric.width, 0) + Math.max(0, fittedMetrics.length - 1) * fittedSpacing;
      const tallest = Math.max(...fittedMetrics.map((metric) => (metric.actualBoundingBoxAscent || currentSize * .75) + (metric.actualBoundingBoxDescent || currentSize * .2)), 1);
      const startX = align === "left" ? width * .04 : align === "right" ? width - width * .04 - totalWidth : (width - totalWidth) / 2;
      baseline = (height - tallest) / 2 + Math.max(...fittedMetrics.map((metric) => metric.actualBoundingBoxAscent || currentSize * .75));

      let x = startX;
      glyphs = Array.from(settings.text).map((char, index) => {
        const metric = fittedMetrics[index];
        const glyph = {
          char,
          x,
          width: metric.width,
          ascent: metric.actualBoundingBoxAscent || currentSize * .75,
          descent: metric.actualBoundingBoxDescent || currentSize * .2,
          offsetX: glyphs[index]?.offsetX ?? 0,
          offsetY: glyphs[index]?.offsetY ?? 0,
          velocityY: glyphs[index]?.velocityY ?? 0,
        };
        x += metric.width + fittedSpacing;
        return glyph;
      });
      context.fillStyle = ink;
    };

    const glyphAt = (x: number, y: number) => {
      const index = glyphs.findIndex((glyph) => {
        const left = glyph.x + glyph.offsetX;
        const right = left + glyph.width;
        const top = baseline - glyph.ascent + glyph.offsetY;
        const bottom = baseline + glyph.descent + glyph.offsetY;
        return x >= left - 12 && x <= right + 12 && y >= top - 16 && y <= bottom + 16;
      });
      if (index >= 0) return index;
      let closest = -1;
      let distance = Infinity;
      glyphs.forEach((glyph, index) => {
        const center = glyph.x + glyph.width / 2 + glyph.offsetX;
        const nextDistance = Math.abs(center - x);
        if (nextDistance < distance) { distance = nextDistance; closest = index; }
      });
      return distance < 44 ? closest : -1;
    };

    const drawGlyph = (settings: Settings, glyph: Glyph, fill: string, outline: boolean, outlineColor: string) => {
      context.save();
      context.font = font;
      context.fillStyle = fill;
      context.strokeStyle = outlineColor;
      context.lineWidth = settings.strokeWidth * 2;
      context.lineJoin = "round";
      context.lineCap = "butt";
      if (outline) {
        context.setLineDash(settings.lineStyle === "dashed" ? [Math.max(1, settings.dashLength), Math.max(1, settings.dashGap)] : []);
        context.globalCompositeOperation = "destination-out";
        context.fillText(glyph.char, glyph.x + glyph.offsetX, baseline + glyph.offsetY);
        context.globalCompositeOperation = "source-over";
        context.strokeText(glyph.char, glyph.x + glyph.offsetX, baseline + glyph.offsetY);
      } else {
        context.fillText(glyph.char, glyph.x + glyph.offsetX, baseline + glyph.offsetY);
      }
      context.restore();
    };

    const drawFrame = (settings: Settings, glyph: Glyph, accent: string) => {
      if (!settings.selection) return;
      const x = glyph.x + glyph.offsetX - 7;
      const y = baseline - glyph.ascent + glyph.offsetY - 8;
      const w = glyph.width + 14;
      const h = glyph.ascent + glyph.descent + 16;
      context.save();
      context.strokeStyle = accent;
      context.fillStyle = accent;
      context.lineWidth = 1;
      context.globalAlpha = .62;
      context.strokeRect(x, y, w, h);
      context.globalAlpha = .9;
      [[x, y], [x + w, y], [x, y + h], [x + w, y + h]].forEach(([pointX, pointY]) => context.fillRect(pointX - 2, pointY - 2, 4, 4));
      if (settings.labels) {
        context.font = "10px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
        context.textBaseline = "bottom";
        context.fillText(`${glyph.char}  ${Math.round(glyph.width)} × ${Math.round(glyph.ascent + glyph.descent)}`, x, y - 7);
      }
      context.restore();
    };

    const drawSpecks = (settings: Settings, glyph: Glyph, accent: string, time: number) => {
      if (!settings.specks) return;
      const x = glyph.x + glyph.width / 2 + glyph.offsetX;
      const y = baseline - glyph.ascent / 2 + glyph.offsetY;
      context.save();
      context.fillStyle = accent;
      for (let index = 0; index < settings.specks; index += 1) {
        const phase = time * (.7 + index * .04) + index * 1.73;
        const size = index % 4 === 0 ? 4 : 2;
        context.globalAlpha = .18 + ((Math.sin(phase) + 1) / 2) * .5;
        context.fillRect(x + Math.cos(phase * 1.2) * (glyph.width * .8 + 12), y + Math.sin(phase) * (glyph.ascent + 14), size, size);
      }
      context.restore();
    };

    const resize = () => {
      width = Math.max(1, container.clientWidth);
      height = Math.max(1, container.clientHeight);
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      layoutKey = "";
      wake();
    };

    const wake = () => {
      if (!raf && visible && !destroyed) raf = requestAnimationFrame(tick);
    };

    const tick = (now: number) => {
      raf = 0;
      const settings = getSettings();
      const palette = getPalette(settings);
      const dt = Math.min(.05, Math.max(.001, (now - last) / 1000));
      last = now;
      clock += dt * settings.speed;
      if (!reducedMotion && settings.intro !== "none") introClock = Math.min(settings.introDuration, introClock + dt);
      rebuild(settings, palette.ink);

      let targetX = pointerX;
      let targetY = pointerY;
      const canSweep = settings.sweep && !reducedMotion && !pointerInside && dragging < 0;
      if (canSweep && glyphs.length) {
        targetX = glyphs[0].x + (glyphs[glyphs.length - 1].x + glyphs[glyphs.length - 1].width - glyphs[0].x) * ((Math.sin(clock * .55) + 1) / 2);
        targetY = baseline;
      }
      if (settings.reveal === "off") activeIndex = -1;
      else if (targetX || targetY) activeIndex = glyphAt(targetX, targetY);

      glyphs.forEach((glyph, index) => {
        if (index !== dragging) {
          glyph.velocityY += (-360 * glyph.offsetY - 34 * glyph.velocityY) * dt;
          glyph.offsetY += glyph.velocityY * dt;
          if (Math.abs(glyph.offsetY) < .05 && Math.abs(glyph.velocityY) < .5) { glyph.offsetY = 0; glyph.velocityY = 0; }
        }
      });

      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.clearRect(0, 0, width, height);
      const introProgress = settings.intro === "none" || reducedMotion ? 1 : clamp(introClock / Math.max(.3, settings.introDuration), 0, 1);
      const visibleCount = settings.intro === "type" ? Math.ceil(glyphs.length * introProgress) : glyphs.length;
      glyphs.forEach((glyph, index) => {
        if (index >= visibleCount) return;
        const outline = settings.reveal === "letter" && index === activeIndex;
        const highlightStart = settings.highlightText ? settings.text.indexOf(settings.highlightText) : -1;
        const highlightEnd = highlightStart >= 0 ? highlightStart + Array.from(settings.highlightText).length : -1;
        const fill = index >= highlightStart && index < highlightEnd ? palette.highlight : palette.ink;
        context.globalAlpha = settings.intro === "none" ? 1 : clamp(introProgress * 1.7 - index / Math.max(glyphs.length, 1) * .6, 0, 1);
        drawGlyph(settings, glyph, fill, outline, palette.accent);
        context.globalAlpha = 1;
      });
      if (activeIndex >= 0 && glyphs[activeIndex]) {
        drawFrame(settings, glyphs[activeIndex], palette.accent);
        drawSpecks(settings, glyphs[activeIndex], palette.accent, clock);
      }

      const shouldContinue = visible && (settings.sweep || dragging >= 0 || glyphs.some((glyph) => Math.abs(glyph.offsetY) > .05 || Math.abs(glyph.velocityY) > .5));
      if (shouldContinue) raf = requestAnimationFrame(tick);
    };

    const locate = (event: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      pointerX = event.clientX - rect.left;
      pointerY = event.clientY - rect.top;
    };
    const onPointerEnter = (event: PointerEvent) => { pointerInside = true; locate(event); wake(); };
    const onPointerMove = (event: PointerEvent) => {
      locate(event);
      if (dragging >= 0) {
        const glyph = glyphs[dragging];
        if (glyph) { glyph.offsetX = pointerX - dragOffsetX; glyph.offsetY = pointerY - dragOffsetY; }
      }
      wake();
    };
    const onPointerLeave = () => { if (dragging < 0) pointerInside = false; wake(); };
    const onPointerDown = (event: PointerEvent) => {
      locate(event);
      const settings = getSettings();
      const index = glyphAt(pointerX, pointerY);
      if (settings.draggable && index >= 0) {
        dragging = index;
        dragOffsetX = pointerX - glyphs[index].offsetX;
        dragOffsetY = pointerY - glyphs[index].offsetY;
        container.setPointerCapture?.(event.pointerId);
      }
      wake();
    };
    const onPointerUp = (event: PointerEvent) => {
      if (dragging >= 0) {
        const glyph = glyphs[dragging];
        if (glyph && getSettings().clickKick) glyph.velocityY -= currentSize * (1.3 + getSettings().bounce * .7);
        dragging = -1;
        container.releasePointerCapture?.(event.pointerId);
      } else if (getSettings().clickKick && activeIndex >= 0 && glyphs[activeIndex]) {
        glyphs[activeIndex].velocityY -= currentSize * 1.2;
      }
      wake();
    };

    container.addEventListener("pointerenter", onPointerEnter);
    container.addEventListener("pointermove", onPointerMove);
    container.addEventListener("pointerleave", onPointerLeave);
    container.addEventListener("pointerdown", onPointerDown);
    container.addEventListener("pointerup", onPointerUp);
    container.addEventListener("pointercancel", onPointerUp);
    const observer = new ResizeObserver(resize);
    observer.observe(container);
    const visibility = new IntersectionObserver(([entry]) => { visible = Boolean(entry?.isIntersecting); wake(); });
    visibility.observe(container);
    resize();

    return () => {
      destroyed = true;
      cancelAnimationFrame(raf);
      observer.disconnect();
      visibility.disconnect();
      container.removeEventListener("pointerenter", onPointerEnter);
      container.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("pointerleave", onPointerLeave);
      container.removeEventListener("pointerdown", onPointerDown);
      container.removeEventListener("pointerup", onPointerUp);
      container.removeEventListener("pointercancel", onPointerUp);
    };
  }, [text, fontFamily, fontWeight, fontSize, letterSpacing, align, color, accentColor, reveal, reach, softness, dashLength, dashGap, lineStyle, strokeWidth, specks, selection, labels, draggable, bounce, clickKick, intro, introDuration, guides, sweep, speed]);

  return <div ref={containerRef} className={`tech-text ${className}`.trim()} style={style} role="img" aria-label={text}><canvas ref={canvasRef} className="tech-text-canvas" /></div>;
}
