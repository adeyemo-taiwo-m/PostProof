"use client";

import * as React from "react";
import { Check, Copy, Download, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type ButtonVariant =
  | "primary" | "default" | "secondary" | "outline" | "ghost" | "soft"
  | "destructive" | "destructive-ghost" | "link" | "link-draw" | "inverse"
  | "outline-inverse" | "brand" | "flood" | "chip";
export type ButtonSize = "sm" | "md" | "default" | "lg" | "xl" | "icon-sm" | "icon" | "icon-lg";
export type ButtonShape = "default" | "pill";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  shape?: ButtonShape;
  fullWidth?: boolean;
  mobileFull?: boolean;
  asChild?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  pressed?: boolean;
}

function classNameForButton({ variant = "primary", size = "md", shape = "default", fullWidth, mobileFull, className }: ButtonProps) {
  return cn(
    "ui-button",
    `ui-button-${variant}`,
    `ui-button-size-${size}`,
    `ui-button-shape-${shape}`,
    fullWidth && "ui-button-full",
    mobileFull && "ui-button-mobile-full",
    className,
  );
}

export function buttonVariants(options: Pick<ButtonProps, "variant" | "size" | "shape" | "fullWidth" | "mobileFull" | "className"> = {}) {
  return classNameForButton(options);
}

function setFloodOrigin(event: React.PointerEvent<HTMLElement>, variant: ButtonVariant) {
  if (variant !== "flood") return;
  const rect = event.currentTarget.getBoundingClientRect();
  event.currentTarget.style.setProperty("--button-x", `${event.clientX - rect.left}px`);
  event.currentTarget.style.setProperty("--button-y", `${event.clientY - rect.top}px`);
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    className,
    variant = "primary",
    size = "md",
    shape = "default",
    fullWidth = false,
    mobileFull = false,
    asChild = false,
    loading = false,
    leftIcon,
    rightIcon,
    pressed,
    children,
    disabled,
    onClick,
    onPointerEnter,
    onPointerLeave,
    type,
    ...props
  },
  ref,
) {
  const classes = classNameForButton({ className, variant, size, shape, fullWidth, mobileFull });
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (loading) {
      event.preventDefault();
      return;
    }
    onClick?.(event);
  };

  if (asChild) {
    const child = React.Children.only(children) as React.ReactElement<Record<string, unknown>>;
    const childProps = child.props;
    const childOnClick = childProps.onClick as ((event: React.MouseEvent<HTMLElement>) => void) | undefined;
    return React.cloneElement(child, {
      ...props,
      className: cn(classes, typeof childProps.className === "string" ? childProps.className : undefined),
      "aria-busy": loading || undefined,
      "aria-pressed": pressed,
      "data-loading": loading ? "" : undefined,
      onClick: (event: React.MouseEvent<HTMLElement>) => {
        if (loading) {
          event.preventDefault();
          return;
        }
        childOnClick?.(event);
      },
      onPointerEnter: (event: React.PointerEvent<HTMLElement>) => {
        setFloodOrigin(event, variant);
        (childProps.onPointerEnter as ((event: React.PointerEvent<HTMLElement>) => void) | undefined)?.(event);
      },
      onPointerLeave: (event: React.PointerEvent<HTMLElement>) => {
        setFloodOrigin(event, variant);
        (childProps.onPointerLeave as ((event: React.PointerEvent<HTMLElement>) => void) | undefined)?.(event);
      },
    } as Partial<Record<string, unknown>>);
  }

  return (
    <button
      {...props}
      ref={ref}
      type={type ?? "button"}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      aria-pressed={pressed}
      data-loading={loading ? "" : undefined}
      onClick={handleClick}
      onPointerEnter={(event) => {
        setFloodOrigin(event, variant);
        onPointerEnter?.(event);
      }}
      onPointerLeave={(event) => {
        setFloodOrigin(event, variant);
        onPointerLeave?.(event);
      }}
    >
      {loading ? <Loader2 aria-hidden="true" className="ui-button-spinner" /> : leftIcon}
      <span className="ui-button-label">{children}</span>
      {!loading && rightIcon}
    </button>
  );
});

async function copyText(text: string) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fall back to the legacy path below.
  }
  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    const copied = document.execCommand("copy");
    document.body.removeChild(textarea);
    return copied;
  } catch {
    return false;
  }
}

export interface CopyButtonProps extends Omit<ButtonProps, "onClick" | "children" | "leftIcon" | "rightIcon" | "loading" | "asChild"> {
  value: string;
  label?: string;
  copiedLabel?: string;
  resetAfterMs?: number;
  onCopied?: () => void;
}

export function CopyButton({ value, label = "Copy link", copiedLabel = "Copied", resetAfterMs = 2000, onCopied, ...props }: CopyButtonProps) {
  const [copied, setCopied] = React.useState(false);
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  async function handleClick() {
    if (!await copyText(value)) return;
    setCopied(true);
    onCopied?.();
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), resetAfterMs);
  }

  return (
    <>
      <Button {...props} leftIcon={copied ? <Check /> : <Copy />} onClick={handleClick}>
        <span className="ui-button-stable-label"><span className={copied ? "is-hidden" : ""}>{label}</span><span className={!copied ? "is-hidden" : ""}>{copiedLabel}</span></span>
      </Button>
      <span role="status" aria-live="polite" className="ui-sr-only">{copied ? copiedLabel : ""}</span>
    </>
  );
}

type DownloadStatus = "idle" | "loading" | "done";
export interface DownloadButtonProps extends Omit<ButtonProps, "onClick" | "children" | "leftIcon" | "rightIcon" | "loading" | "asChild"> {
  onDownload: () => Promise<void>;
  onError?: (error: unknown) => void;
  label?: string;
  loadingLabel?: string;
  doneLabel?: string;
  resetAfterMs?: number;
}

export function DownloadButton({ onDownload, onError, label = "Download PNG", loadingLabel = "Creating your graphic...", doneLabel = "Downloaded", resetAfterMs = 2500, variant = "primary", size = "lg", ...props }: DownloadButtonProps) {
  const [status, setStatus] = React.useState<DownloadStatus>("idle");
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  async function handleClick() {
    if (status === "loading") return;
    setStatus("loading");
    try {
      await onDownload();
      setStatus("done");
      timer.current = setTimeout(() => setStatus("idle"), resetAfterMs);
    } catch (error) {
      setStatus("idle");
      onError?.(error);
    }
  }

  return <Button {...props} variant={variant} size={size} loading={status === "loading"} leftIcon={status === "done" ? <Check /> : <Download />} onClick={handleClick}>{status === "loading" ? loadingLabel : status === "done" ? doneLabel : label}</Button>;
}

export function ButtonGroup({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div role="group" className={cn("ui-button-group", className)} {...props}>{children}</div>;
}

export interface MagneticButtonProps extends ButtonProps {
  radius?: number;
  maxShift?: number;
  strength?: number;
}

export function MagneticButton({ radius = 80, maxShift = 10, strength = 0.3, className, ...props }: MagneticButtonProps) {
  const wrapperRef = React.useRef<HTMLSpanElement>(null);

  React.useEffect(() => {
    const element = wrapperRef.current;
    if (!element || !window.matchMedia("(pointer: fine)").matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const clamp = (value: number) => Math.max(-maxShift, Math.min(maxShift, value));
    const reset = () => {
      cancelAnimationFrame(frame);
      element.style.transform = "";
      element.style.willChange = "auto";
    };
    const onMove = (event: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const rect = element.getBoundingClientRect();
        const dx = event.clientX - (rect.left + rect.width / 2);
        const dy = event.clientY - (rect.top + rect.height / 2);
        if (Math.hypot(dx, dy) < radius + Math.max(rect.width, rect.height) / 2) {
          element.style.willChange = "transform";
          element.style.transform = `translate3d(${clamp(dx * strength)}px, ${clamp(dy * strength)}px, 0)`;
        } else reset();
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", reset);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", reset);
      reset();
    };
  }, [maxShift, radius, strength]);

  return <span ref={wrapperRef} className={cn("ui-magnetic-button", props.fullWidth && "ui-button-full")}><Button {...props} className={className} /></span>;
}
