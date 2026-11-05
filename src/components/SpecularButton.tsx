"use client";

import * as React from "react";
import { useEffect, useRef, type CSSProperties, type MouseEventHandler, type ReactNode } from "react";

const PAD = 24;
const TAU = Math.PI * 2;

const VERTEX = `#version 300 es
in vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`;

const FRAGMENT = `#version 300 es
precision highp float;
uniform vec2 uCenter;
uniform vec2 uHalf;
uniform float uRadius;
uniform float uPx;
uniform float uSpot;
uniform vec2 uEntry;
uniform vec3 uLineColor;
uniform vec3 uBaseColor;
uniform float uIntensity;
uniform vec2 uWindow;
uniform float uThickness;
uniform float uGlow;
out vec4 outColor;

float roundedBox(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

float loopPosition(vec2 p, vec2 b, float r) {
  vec2 inner = b - r;
  float arc = 1.5707963 * r;
  float quarter = inner.x + inner.y + arc;
  vec2 a = abs(p);
  vec2 q = a - inner;
  float s = q.x > 0.0 && q.y > 0.0
    ? inner.y + atan(q.y, q.x) * r
    : (q.x > q.y ? min(a.y, inner.y) : inner.y + arc + inner.x - min(a.x, inner.x));
  if (p.x < 0.0) s = p.y >= 0.0 ? 2.0 * quarter - s : 2.0 * quarter + s;
  else if (p.y < 0.0) s = 4.0 * quarter - s;
  return s / max(4.0 * quarter, 0.0001);
}

float lobe(float position, float center) {
  float gap = abs(fract(position - center + 0.5) - 0.5);
  return 1.0 - smoothstep(uWindow.x, uWindow.x + uWindow.y, gap);
}

void main() {
  vec2 p = gl_FragCoord.xy - uCenter;
  float d = roundedBox(p, uHalf, uRadius);
  float position = loopPosition(p, uHalf, uRadius);
  float key = lobe(position, uSpot);
  float back = lobe(position, uSpot + 0.5);
  float streak = key + back * 0.45;
  float width = max(uThickness * uPx * mix(1.0, max(key, back), 0.6), 0.35);
  float band = smoothstep(-width - 0.6, -width + 0.6, d) * (1.0 - smoothstep(-0.6, 0.6, d));
  float hair = smoothstep(-uPx - 0.6, -uPx + 0.6, d) * (1.0 - smoothstep(-0.6, 0.6, d));
  float inside = 1.0 - smoothstep(-0.6, 0.6, d);
  vec2 pool = (p - uEntry) / (uHalf.y * vec2(1.6, 1.1));
  float glow = streak * 0.2 * exp(-abs(d + width * 0.5) / (5.0 * uPx)) + inside * 0.08 * exp(-dot(pool, pool));
  float light = clamp((band * streak + glow * uGlow) * uIntensity, 0.0, 1.0);
  vec4 base = vec4(uBaseColor, 1.0) * hair * 0.6;
  outColor = vec4(uLineColor, 1.0) * light + base * (1.0 - light);
}`;

const UNIFORMS = [
  "uCenter",
  "uHalf",
  "uRadius",
  "uPx",
  "uSpot",
  "uEntry",
  "uLineColor",
  "uBaseColor",
  "uIntensity",
  "uWindow",
  "uThickness",
  "uGlow",
] as const;

type SpecularSize = "sm" | "md" | "lg";
type SpecularSettings = {
  radius: number;
  lineColor: string;
  baseColor: string;
  intensity: number;
  idleIntensity: number;
  shineSize: number;
  shineFade: number;
  thickness: number;
  glow: number;
  speed: number;
  followMouse: boolean;
  proximity: number;
  autoAnimate: boolean;
  disabled: boolean;
};

export type SpecularButtonProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children" | "style" | "className" | "type" | "onClick"> & {
  children?: ReactNode;
  asChild?: boolean;
  effectOnly?: boolean;
  size?: SpecularSize;
  radius?: number;
  tint?: string;
  tintOpacity?: number;
  blur?: number;
  textColor?: string;
  lineColor?: string;
  baseColor?: string;
  intensity?: number;
  idleIntensity?: number;
  shineSize?: number;
  shineFade?: number;
  thickness?: number;
  glow?: number;
  followMouse?: boolean;
  proximity?: number;
  autoAnimate?: boolean;
  speed?: number;
  disabled?: boolean;
  onClick?: MouseEventHandler<HTMLElement>;
  type?: "button" | "submit" | "reset";
  className?: string;
  style?: CSSProperties;
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const wrap = (value: number) => value - Math.floor(value);

function loopPosition(x: number, y: number, halfX: number, halfY: number, radius: number) {
  const innerX = halfX - radius;
  const innerY = halfY - radius;
  const arc = (Math.PI / 2) * radius;
  const quarter = innerX + innerY + arc;
  const absoluteX = Math.abs(x);
  const absoluteY = Math.abs(y);
  const qx = absoluteX - innerX;
  const qy = absoluteY - innerY;
  let distance: number;
  if (qx > 0 && qy > 0) distance = innerY + Math.atan2(qy, qx) * radius;
  else if (qx > qy) distance = Math.min(absoluteY, innerY);
  else distance = innerY + arc + innerX - Math.min(absoluteX, innerX);
  if (x < 0) distance = y >= 0 ? 2 * quarter - distance : 2 * quarter + distance;
  else if (y < 0) distance = 4 * quarter - distance;
  return wrap(distance / Math.max(4 * quarter, 0.0001));
}

function rimPoint(position: number, halfX: number, halfY: number, radius: number) {
  const innerX = halfX - radius;
  const innerY = halfY - radius;
  const arc = (Math.PI / 2) * radius;
  const quarter = innerX + innerY + arc;
  let distance = wrap(position) * 4 * quarter;
  let signX = 1;
  let signY = 1;
  if (distance > 3 * quarter) {
    distance = 4 * quarter - distance;
    signY = -1;
  } else if (distance > 2 * quarter) {
    distance -= 2 * quarter;
    signX = -1;
    signY = -1;
  } else if (distance > quarter) {
    distance = 2 * quarter - distance;
    signX = -1;
  }
  let x = innerX - (distance - innerY - arc);
  let y = halfY;
  if (distance <= innerY) {
    x = halfX;
    y = distance;
  } else if (distance <= innerY + arc) {
    const angle = (distance - innerY) / Math.max(radius, 0.0001);
    x = innerX + Math.cos(angle) * radius;
    y = innerY + Math.sin(angle) * radius;
  }
  return [x * signX, y * signY] as const;
}

function compileShader(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;
  gl.deleteShader(shader);
  return null;
}

function createProgram(gl: WebGL2RenderingContext) {
  const vertex = compileShader(gl, gl.VERTEX_SHADER, VERTEX);
  const fragment = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT);
  const program = gl.createProgram();
  if (!vertex || !fragment || !program) return null;
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.bindAttribLocation(program, 0, "aPosition");
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);
  if (gl.getProgramParameter(program, gl.LINK_STATUS)) return program;
  gl.deleteProgram(program);
  return null;
}

const SpecularButton = React.forwardRef<HTMLElement, SpecularButtonProps>(function SpecularButton({
  children = "Get Started",
  asChild = false,
  effectOnly = false,
  size = "lg",
  radius = 18,
  tint = "#ffffff",
  tintOpacity = 0.04,
  blur = 0,
  textColor = "#f5f5f5",
  lineColor = "#ffffff",
  baseColor = "#525252",
  intensity = 1,
  idleIntensity = 0.35,
  shineSize = 10,
  shineFade = 34,
  thickness = 1.2,
  glow = 1,
  speed = 0.35,
  followMouse = true,
  proximity = 250,
  autoAnimate = false,
  disabled = false,
  onClick,
  onPointerEnter,
  onPointerLeave,
  className = "",
  type = "button",
  style,
  ...rest
}: SpecularButtonProps, forwardedRef) {
  const buttonRef = useRef<HTMLElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wakeRef = useRef<(() => void) | null>(null);
  const setElementRef = (element: HTMLElement | null) => {
    buttonRef.current = element;
    if (typeof forwardedRef === "function") forwardedRef(element);
    else if (forwardedRef) forwardedRef.current = element;
  };
  const settings: SpecularSettings = {
    radius: Math.max(0, radius),
    lineColor: String(lineColor),
    baseColor: String(baseColor),
    intensity: Math.max(0, intensity),
    idleIntensity: clamp(idleIntensity, 0, 1),
    shineSize: Math.max(0, shineSize),
    shineFade: Math.max(0, shineFade),
    thickness: Math.max(0, thickness),
    glow: Math.max(0, glow),
    speed,
    followMouse,
    proximity: Math.max(1, proximity),
    autoAnimate,
    disabled,
  };
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  useEffect(() => {
    const button = buttonRef.current;
    const canvas = canvasRef.current;
    const gl = canvas?.getContext("webgl2", {
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
      depth: false,
      stencil: false,
    }) as WebGL2RenderingContext | null;
    if (!button || !canvas || !gl) return undefined;
    const program = createProgram(gl);
    if (!program) return undefined;
    const uniforms = Object.fromEntries(UNIFORMS.map((name) => [name, gl.getUniformLocation(program, name)])) as Record<(typeof UNIFORMS)[number], WebGLUniformLocation | null>;
    const buffer = gl.createBuffer();
    const vertexArray = gl.createVertexArray();
    if (!buffer || !vertexArray) {
      gl.deleteProgram(program);
      return undefined;
    }
    gl.bindVertexArray(vertexArray);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);

    const probe = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    const colors = new Map<string, [number, number, number]>();
    const view = { width: 1, height: 1, ratio: 1 };
    const pointer = { x: 0, y: 0, known: false };
    const state = { spot: 0, level: 0, press: 0, ready: false };
    let raf = 0;
    let last = 0;
    let visible = true;

    const toRgb = (value: string) => {
      const cached = colors.get(value);
      if (cached) return cached;
      let rgb: [number, number, number] = [1, 1, 1];
      if (probe) {
        probe.clearRect(0, 0, 1, 1);
        probe.fillStyle = "#000000";
        probe.fillStyle = value;
        probe.fillRect(0, 0, 1, 1);
        const data = probe.getImageData(0, 0, 1, 1).data;
        rgb = [data[0] / 255, data[1] / 255, data[2] / 255];
      }
      colors.set(value, rgb);
      return rgb;
    };

    const cornerRadius = (current: SpecularSettings) => Math.min(current.radius, view.width / 2, view.height / 2);
    const restingSpot = (current: SpecularSettings) => {
      const currentRadius = cornerRadius(current);
      const inset = currentRadius * (1 - Math.SQRT1_2);
      return loopPosition(inset - view.width / 2, view.height / 2 - inset, view.width / 2, view.height / 2, currentRadius);
    };
    const aim = (current: SpecularSettings) => {
      if (!current.followMouse || current.disabled || !pointer.known) return null;
      const rect = button.getBoundingClientRect();
      const scale = rect.width / view.width || 1;
      const halfX = view.width / 2;
      const halfY = view.height / 2;
      const x = (pointer.x - rect.left - rect.width / 2) / scale;
      const y = (rect.top + rect.height / 2 - pointer.y) / scale;
      const distance = Math.hypot(Math.max(Math.abs(x) - halfX, 0), Math.max(Math.abs(y) - halfY, 0));
      const t = clamp(1 - distance / current.proximity, 0, 1);
      const near = t * t * (3 - 2 * t);
      const nearest = loopPosition(x, y, halfX, halfY, cornerRadius(current));
      if (distance > 0) return { spot: nearest, near };
      const depth = clamp(Math.min(halfX - Math.abs(x), halfY - Math.abs(y)) / (halfY * 0.8), 0, 1);
      const sway = restingSpot(current) - (x / halfX) * 0.06 - (y / halfY) * 0.02;
      const offset = sway - nearest - Math.round(sway - nearest);
      return { spot: wrap(nearest + offset * depth * depth * (3 - 2 * depth)), near };
    };
    const draw = (current: SpecularSettings) => {
      const { width, height } = view;
      const scaleX = canvas.width / (width + PAD * 2);
      const scaleY = canvas.height / (height + PAD * 2);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(program);
      gl.uniform2f(uniforms.uCenter, (PAD + width / 2) * scaleX, (PAD + height / 2) * scaleY);
      gl.uniform2f(uniforms.uHalf, (width / 2) * scaleX, (height / 2) * scaleY);
      gl.uniform1f(uniforms.uRadius, Math.min(current.radius, width / 2, height / 2) * scaleX);
      gl.uniform1f(uniforms.uPx, view.ratio);
      const currentRadius = Math.min(current.radius, width / 2, height / 2);
      const [rimX, rimY] = rimPoint(state.spot, width / 2, height / 2, currentRadius);
      const pull = 1 - Math.min(0.35 * (height / 2), Math.hypot(rimX, rimY)) / Math.max(Math.hypot(rimX, rimY), 0.0001);
      gl.uniform1f(uniforms.uSpot, state.spot);
      gl.uniform2f(uniforms.uEntry, rimX * pull * scaleX, rimY * pull * scaleY);
      gl.uniform3fv(uniforms.uLineColor, toRgb(current.lineColor));
      gl.uniform3fv(uniforms.uBaseColor, toRgb(current.baseColor));
      gl.uniform1f(uniforms.uIntensity, current.intensity * (state.level + state.press * 0.8));
      gl.uniform2f(uniforms.uWindow, current.shineSize / 360 + state.press * 0.06, current.shineFade / 360 + 0.0001);
      gl.uniform1f(uniforms.uThickness, current.thickness);
      gl.uniform1f(uniforms.uGlow, current.glow);
      gl.bindVertexArray(vertexArray);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      gl.bindVertexArray(null);
    };
    const frame = (now: number) => {
      raf = 0;
      if (!visible) return;
      const current = settingsRef.current;
      const delta = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;
      last = now;
      const target = aim(current);
      const spinning = current.autoAnimate && !reduce;
      const steering = !!target && target.near > 0;
      if (!state.ready) {
        state.spot = restingSpot(current);
        state.level = current.autoAnimate ? 1 : current.idleIntensity;
        state.ready = true;
      }
      let difference = 0;
      if (spinning && !steering) state.spot = wrap(state.spot + (current.speed / TAU) * delta);
      else {
        difference = (steering ? target.spot : restingSpot(current)) - state.spot;
        difference -= Math.round(difference);
        state.spot = wrap(state.spot + difference * (1 - Math.exp(-delta * 8)));
      }
      const level = current.autoAnimate ? 1 : current.idleIntensity + (1 - current.idleIntensity) * (target?.near ?? 0);
      state.level += (level - state.level) * (1 - Math.exp(-delta * 7));
      state.press *= Math.exp(-delta * 5);
      draw(current);
      const settling = Math.abs(difference) > 0.0002 || Math.abs(level - state.level) > 0.001 || state.press > 0.002;
      if (settling || (spinning && !steering)) raf = requestAnimationFrame(frame);
      else last = 0;
    };
    const wake = () => {
      if (!raf && visible) raf = requestAnimationFrame(frame);
    };
    const measure = (entry?: ResizeObserverEntry) => {
      const borderBox = entry?.borderBoxSize;
      const box = Array.isArray(borderBox) ? borderBox[0] : borderBox;
      view.width = Math.max(1, box?.inlineSize ?? button.offsetWidth);
      view.height = Math.max(1, box?.blockSize ?? button.offsetHeight);
      view.ratio = Math.min(window.devicePixelRatio || 1, 3);
      canvas.width = Math.max(1, Math.round((view.width + PAD * 2) * view.ratio));
      canvas.height = Math.max(1, Math.round((view.height + PAD * 2) * view.ratio));
      if (state.ready) draw(settingsRef.current);
      wake();
    };
    const onPointerMove = (event: PointerEvent) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.known = true;
      wake();
    };
    const onPointerDown = (event: PointerEvent) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.known = true;
      if (!settingsRef.current.disabled) state.press = 1;
      wake();
    };
    const onPointerEnd = (event: PointerEvent) => {
      if (event.pointerType === "mouse") return;
      pointer.known = false;
      wake();
    };
    const onPointerLeave = () => {
      pointer.known = false;
      wake();
    };
    const resizeObserver = new ResizeObserver((entries) => measure(entries[entries.length - 1]));
    resizeObserver.observe(button);
    const intersection = new IntersectionObserver((entries) => {
      visible = entries.some((entry) => entry.isIntersecting);
      if (visible) {
        last = 0;
        wake();
      }
    });
    intersection.observe(button);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerup", onPointerEnd, { passive: true });
    window.addEventListener("pointercancel", onPointerEnd, { passive: true });
    document.documentElement.addEventListener("pointerleave", onPointerLeave);
    button.addEventListener("pointerdown", onPointerDown);
    measure();
    wakeRef.current = wake;
    return () => {
      cancelAnimationFrame(raf);
      wakeRef.current = null;
      resizeObserver.disconnect();
      intersection.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerEnd);
      window.removeEventListener("pointercancel", onPointerEnd);
      document.documentElement.removeEventListener("pointerleave", onPointerLeave);
      button.removeEventListener("pointerdown", onPointerDown);
      gl.deleteBuffer(buffer);
      gl.deleteVertexArray(vertexArray);
      gl.deleteProgram(program);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, []);

  useEffect(() => {
    wakeRef.current?.();
  });

  const sharedButton = className.split(/\s+/).includes("ui-button");
  const componentClassName = `${effectOnly ? "specular-effect" : "specular-button"}${effectOnly || sharedButton ? "" : ` specular-button--${size}`}${className ? ` ${className}` : ""}`;
  const componentStyle = {
    "--sb-radius": `${radius}px`,
    "--sb-tint": tint,
    "--sb-tint-opacity": tintOpacity,
    "--sb-blur": `${blur}px`,
    "--sb-text-color": textColor,
    ...style,
  } as CSSProperties;

  const handlePointerEnter = (event: React.PointerEvent<HTMLElement>) => onPointerEnter?.(event as React.PointerEvent<HTMLButtonElement>);
  const handlePointerLeave = (event: React.PointerEvent<HTMLElement>) => onPointerLeave?.(event as React.PointerEvent<HTMLButtonElement>);

  if (asChild) {
    const child = React.Children.only(children) as React.ReactElement<Record<string, unknown>>;
    const childProps = child.props;
    const childOnClick = childProps.onClick as MouseEventHandler<HTMLElement> | undefined;
    const childOnPointerEnter = childProps.onPointerEnter as ((event: React.PointerEvent<HTMLElement>) => void) | undefined;
    const childOnPointerLeave = childProps.onPointerLeave as ((event: React.PointerEvent<HTMLElement>) => void) | undefined;
    return React.cloneElement(child, {
      ...rest,
      ref: setElementRef,
      className: `${componentClassName}${typeof childProps.className === "string" ? ` ${childProps.className}` : ""}`,
      style: { ...componentStyle, ...(childProps.style as CSSProperties | undefined) },
      "aria-disabled": disabled || undefined,
      "aria-busy": rest["aria-busy" as keyof typeof rest],
      onClick: (event: React.MouseEvent<HTMLElement>) => {
        if (disabled) {
          event.preventDefault();
          return;
        }
        onClick?.(event);
        childOnClick?.(event);
      },
      onPointerEnter: (event: React.PointerEvent<HTMLElement>) => {
        handlePointerEnter(event);
        childOnPointerEnter?.(event);
      },
      onPointerLeave: (event: React.PointerEvent<HTMLElement>) => {
        handlePointerLeave(event);
        childOnPointerLeave?.(event);
      },
      children: <><canvas ref={canvasRef} className="specular-button__light" aria-hidden="true" /><span className="specular-button__label">{childProps.children as ReactNode}</span></>,
    });
  }

  return (
    <button
      {...rest}
      ref={setElementRef as React.Ref<HTMLButtonElement>}
      type={type}
      disabled={disabled}
      onClick={(event) => onClick?.(event)}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      className={componentClassName}
      style={componentStyle}
    >
      <canvas ref={canvasRef} className="specular-button__light" aria-hidden="true" />
      <span className="specular-button__label">{children}</span>
    </button>
  );
});

export default SpecularButton;
