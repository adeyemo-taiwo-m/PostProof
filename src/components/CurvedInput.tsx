"use client";

import {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
  type SyntheticEvent,
} from "react";

const DEG = 180 / Math.PI;

const round2 = (value: number) => Math.round(value * 100) / 100;

function hexToRgba(hex: string, alpha: number) {
  let value = String(hex).replace("#", "");
  if (value.length === 3) value = value.split("").map((character) => character + character).join("");
  const number = Number.parseInt(value.slice(0, 6), 16);
  if (Number.isNaN(number)) return hex;
  return `rgba(${(number >> 16) & 255}, ${(number >> 8) & 255}, ${number & 255}, ${alpha})`;
}

const SHADOWS = {
  sm: [5, 12, 0.3],
  md: [10, 24, 0.4],
  lg: [16, 40, 0.52],
} as const;

const THEMES = {
  dark: {
    backgroundColor: "#1B1722",
    textColor: "#f5f5f5",
    placeholderColor: "#a1a1aa",
    borderColor: "#392e4e",
    buttonColor: "#A855F7",
    buttonTextColor: "#ffffff",
    shadowColor: "#000000",
  },
  light: {
    backgroundColor: "#ffffff",
    textColor: "#1d2050",
    placeholderColor: "#9aa0b6",
    borderColor: "#262a56",
    buttonColor: "#4763eb",
    buttonTextColor: "#ffffff",
    shadowColor: "#0b0e2a",
  },
} as const;

type Geometry = {
  straight: boolean;
  W: number;
  T: number;
  svgH: number;
  uPerLen: number;
  R: number;
  dir: number;
  point: (u: number, v: number) => [number, number];
  angleAt: (u: number) => number;
  uFromPoint: (x: number, y: number) => number;
};

function buildGeometry(width: number, bend: number, thickness: number, pad: number): Geometry {
  const W = width;
  const T = thickness;
  const sagitta = Math.max(-W * 0.35, Math.min(bend, W * 0.35));
  const amount = Math.abs(sagitta);
  const direction = sagitta >= 0 ? 1 : -1;
  const svgH = T + amount + pad * 2;

  if (amount < 0.75) {
    const midY = pad + T / 2;
    return {
      straight: true,
      W,
      T,
      svgH,
      R: 0,
      dir: direction,
      uPerLen: 1,
      point: (u, v) => [u, midY + v],
      angleAt: () => 0,
      uFromPoint: (x) => x,
    };
  }

  const R = (W * W * 0.25 + amount * amount) / (2 * amount);
  const centerX = W / 2;
  const apexY = pad + T / 2 + (direction > 0 ? 0 : amount);
  const centerY = apexY + direction * R;
  const phi = Math.asin(Math.min(1, W / (2 * R)));

  return {
    straight: false,
    W,
    T,
    svgH,
    R,
    dir: direction,
    uPerLen: W / (2 * R * phi),
    point: (u, v) => {
      const theta = ((u - centerX) / centerX) * phi;
      const radius = R - direction * v;
      return [centerX + radius * Math.sin(theta), centerY - direction * radius * Math.cos(theta)];
    },
    angleAt: (u) => direction * ((u - centerX) / centerX) * phi * DEG,
    uFromPoint: (x, y) => {
      const theta = Math.atan2(x - centerX, direction * (centerY - y));
      return centerX + (theta / phi) * centerX;
    },
  };
}

function formatPoint(geometry: Geometry, u: number, v: number) {
  const [x, y] = geometry.point(u, v);
  return `${round2(x)} ${round2(y)}`;
}

function edgeSegment(geometry: Geometry, uTo: number, v: number, leftToRight: boolean) {
  if (geometry.straight) return `L ${formatPoint(geometry, uTo, v)}`;
  const radius = round2(geometry.R - geometry.dir * v);
  const sweep = leftToRight === geometry.dir > 0 ? 1 : 0;
  return `A ${radius} ${radius} 0 0 ${sweep} ${formatPoint(geometry, uTo, v)}`;
}

function bentRectPath(geometry: Geometry, u0: number, u1: number, vTop: number, vBottom: number, radius: number) {
  const corner = Math.max(0, Math.min(radius, (vBottom - vTop) / 2, (u1 - u0) / 2));
  return [
    `M ${formatPoint(geometry, u0 + corner, vTop)}`,
    edgeSegment(geometry, u1 - corner, vTop, true),
    `Q ${formatPoint(geometry, u1, vTop)} ${formatPoint(geometry, u1, vTop + corner)}`,
    `L ${formatPoint(geometry, u1, vBottom - corner)}`,
    `Q ${formatPoint(geometry, u1, vBottom)} ${formatPoint(geometry, u1 - corner, vBottom)}`,
    edgeSegment(geometry, u0 + corner, vBottom, false),
    `Q ${formatPoint(geometry, u0, vBottom)} ${formatPoint(geometry, u0, vBottom - corner)}`,
    `L ${formatPoint(geometry, u0, vTop + corner)}`,
    `Q ${formatPoint(geometry, u0, vTop)} ${formatPoint(geometry, u0 + corner, vTop)}`,
    "Z",
  ].join(" ");
}

function bentLinePath(geometry: Geometry, u0: number, u1: number, v: number) {
  return `M ${formatPoint(geometry, u0, v)} ${edgeSegment(geometry, u1, v, true)}`;
}

const SELECTABLE_TYPES = ["text", "search", "tel", "url", "password"];
type Theme = keyof typeof THEMES;
type ShadowSize = keyof typeof SHADOWS | "none";

export type CurvedInputProps = {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  placeholder?: string;
  buttonText?: string;
  type?: string;
  name?: string;
  ariaLabel?: string;
  theme?: Theme;
  width?: number | string;
  bend?: number;
  height?: number;
  cornerRadius?: number;
  borderWidth?: number;
  fontSize?: number;
  backgroundColor?: string;
  textColor?: string;
  placeholderColor?: string;
  borderColor?: string;
  buttonColor?: string;
  buttonTextColor?: string;
  iconColor?: string;
  shadowSize?: ShadowSize;
  shadowColor?: string;
  showButton?: boolean;
  showIcon?: boolean;
  icon?: ReactNode;
  buttonIcon?: ReactNode;
  className?: string;
  style?: CSSProperties;
  maxLength?: number;
};

const CurvedInput = ({
  value,
  defaultValue = "",
  onChange,
  onSubmit,
  onFocus,
  onBlur,
  placeholder = "Enter your email",
  buttonText = "Get Started",
  type = "email",
  name,
  ariaLabel,
  theme = "dark",
  width = 450,
  bend = 28,
  height = 64,
  cornerRadius = 18,
  borderWidth = 1.5,
  fontSize = 16,
  backgroundColor,
  textColor,
  placeholderColor,
  borderColor,
  buttonColor,
  buttonTextColor,
  iconColor,
  shadowSize = "md",
  shadowColor,
  showButton = true,
  showIcon = true,
  icon,
  buttonIcon,
  className = "",
  style,
  maxLength,
}: CurvedInputProps) => {
  const uid = useId().replace(/:/g, "");
  const layoutPathId = `ci-text-${uid}`;
  const buttonPathId = `ci-btn-${uid}`;
  const clipId = `ci-clip-${uid}`;
  const rootRef = useRef<HTMLFormElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const textRef = useRef<SVGTextElement | null>(null);
  const buttonMeasureRef = useRef<SVGTextElement | null>(null);
  const scrollRef = useRef(0);
  const [widthInPixels, setWidthInPixels] = useState(0);
  const [innerValue, setInnerValue] = useState(defaultValue);
  const [caretIndex, setCaretIndex] = useState(defaultValue.length);
  const [focused, setFocused] = useState(false);
  const [caretU, setCaretU] = useState(0);
  const [scrollLength, setScrollLength] = useState(0);
  const [buttonTextWidth, setButtonTextWidth] = useState(0);
  const [, setFontTick] = useState(0);

  const currentValue = value !== undefined ? value : innerValue;
  const displayValue = type === "password" ? "•".repeat(currentValue.length) : currentValue;
  const palette = THEMES[theme] || THEMES.dark;
  const fillColor = backgroundColor ?? palette.backgroundColor;
  const foregroundColor = textColor ?? palette.textColor;
  const placeholderFill = placeholderColor ?? palette.placeholderColor;
  const outlineColor = borderColor ?? palette.borderColor;
  const accentColor = buttonColor ?? palette.buttonColor;
  const buttonForegroundColor = buttonTextColor ?? palette.buttonTextColor;
  const dropShadowColor = shadowColor ?? palette.shadowColor;

  useEffect(() => {
    const element = rootRef.current;
    if (!element || typeof ResizeObserver === "undefined") return;
    const resizeObserver = new ResizeObserver((entries) => {
      const nextWidth = entries[0]?.contentRect?.width ?? element.clientWidth;
      setWidthInPixels(Math.round(nextWidth));
    });
    resizeObserver.observe(element);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    let alive = true;
    if (document.fonts?.ready) {
      document.fonts.ready.then(() => {
        if (alive) setFontTick((tick) => tick + 1);
      });
    }
    return () => {
      alive = false;
    };
  }, []);

  const padding = Math.ceil(borderWidth / 2) + 6;
  const geometry = useMemo(
    () => (widthInPixels > 2 ? buildGeometry(widthInPixels, bend, height, padding) : null),
    [widthInPixels, bend, height, padding],
  );

  const layout = useMemo(() => {
    if (!geometry) return null;
    const buttonInset = Math.max(5, borderWidth + 4);
    const chipHeight = Math.min(34, Math.max(16, height * 0.34));
    const chipWidth = chipHeight * 1.25;
    const iconU = 22 + chipWidth / 2;
    const textStartU = showIcon ? 22 + chipWidth + 13 : 24;
    const buttonWidth = showButton
      ? buttonIcon
        ? Math.max(fontSize * 2.8, height * 0.9)
        : Math.max(buttonTextWidth + fontSize * 2.7, height * 1.35)
      : 0;
    const buttonU1 = geometry.W - buttonInset;
    const buttonU0 = buttonU1 - buttonWidth;
    const textEndU = Math.max(textStartU + 20, showButton ? buttonU0 - 14 : geometry.W - 24);
    const windowLength = (textEndU - textStartU) / geometry.uPerLen;
    return { buttonInset, chipHeight, chipWidth, iconU, textStartU, textEndU, buttonU0, buttonU1, windowLength };
  }, [geometry, height, borderWidth, buttonTextWidth, fontSize, showIcon, showButton, buttonIcon]);

  useLayoutEffect(() => {
    if (!buttonIcon && buttonMeasureRef.current) {
      const nextButtonWidth = buttonMeasureRef.current.getComputedTextLength();
      setButtonTextWidth((previous) => (Math.abs(previous - nextButtonWidth) > 0.5 ? nextButtonWidth : previous));
    }
    if (!geometry || !layout) return;
    const textElement = textRef.current;
    const caret = Math.min(caretIndex, displayValue.length);
    let caretLength = 0;
    let totalLength = 0;
    if (textElement && displayValue.length) {
      try {
        totalLength = textElement.getSubStringLength(0, displayValue.length);
        caretLength = caret > 0 ? textElement.getSubStringLength(0, caret) : 0;
      } catch {
        totalLength = 0;
        caretLength = 0;
      }
    }
    let nextScroll = scrollRef.current;
    if (caretLength - nextScroll > layout.windowLength - 2) nextScroll = caretLength - layout.windowLength + 2;
    if (caretLength - nextScroll < 0) nextScroll = caretLength;
    if (totalLength - nextScroll < layout.windowLength) nextScroll = Math.max(0, totalLength - layout.windowLength);
    nextScroll = Math.max(0, nextScroll);
    if (Math.abs(nextScroll - scrollRef.current) > 0.5) {
      scrollRef.current = nextScroll;
      setScrollLength(nextScroll);
    }
    setCaretU(layout.textStartU + (caretLength - nextScroll) * geometry.uPerLen);
  }, [geometry, layout, caretIndex, displayValue, buttonText, fontSize, buttonIcon]);

  const commitValue = (nextValue: string) => {
    if (value === undefined) setInnerValue(nextValue);
    onChange?.(nextValue);
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    commitValue(event.target.value);
    setCaretIndex(event.target.selectionStart ?? event.target.value.length);
  };

  const handleSelect = (event: SyntheticEvent<HTMLInputElement>) => {
    setCaretIndex(event.currentTarget.selectionStart ?? event.currentTarget.value.length);
  };

  const handleSubmit = (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    onSubmit?.(currentValue);
  };

  const handleSurfaceClick = (event: React.MouseEvent<SVGSVGElement>) => {
    const input = inputRef.current;
    if (!input) return;
    let index = displayValue.length;
    const svg = svgRef.current;
    const textElement = textRef.current;
    if (svg && geometry && layout && textElement && displayValue.length) {
      try {
        const transform = svg.getScreenCTM();
        if (!transform) throw new Error("Unable to measure curved input");
        const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(transform.inverse());
        const target = scrollRef.current + (geometry.uFromPoint(point.x, point.y) - layout.textStartU) / geometry.uPerLen;
        let closest = 0;
        let closestDistance = Infinity;
        for (let character = 0; character <= displayValue.length; character += 1) {
          const length = character === 0 ? 0 : textElement.getSubStringLength(0, character);
          const distance = Math.abs(length - target);
          if (distance < closestDistance) {
            closestDistance = distance;
            closest = character;
          }
        }
        index = closest;
      } catch {
        index = displayValue.length;
      }
    }
    input.focus();
    try {
      input.setSelectionRange(index, index);
    } catch {
      // Selection APIs are unavailable for some native input types.
    }
    setCaretIndex(index);
  };

  const safeType = SELECTABLE_TYPES.includes(type) ? type : "text";
  const inputMode = type === "email" ? "email" : type === "number" ? "decimal" : undefined;
  const shadow = shadowSize === "none" ? undefined : SHADOWS[shadowSize];
  const svgStyle = shadow
    ? { filter: `drop-shadow(0 ${shadow[0]}px ${shadow[1]}px ${hexToRgba(dropShadowColor, shadow[2])})` }
    : undefined;

  let content: ReactNode = null;
  if (geometry && layout) {
    const vBase = fontSize * 0.34;
    const scrollU = scrollLength * geometry.uPerLen;
    const bandPath = bentRectPath(geometry, 0, geometry.W, -height / 2, height / 2, cornerRadius);
    const layoutPath = bentLinePath(geometry, layout.textStartU - scrollU, geometry.W, vBase);
    const clipPath = bentRectPath(geometry, layout.textStartU - 6, layout.textEndU + 8, -height / 2, height / 2, 0);
    const chipFill = iconColor || accentColor;
    const { chipWidth, chipHeight } = layout;
    const envelopeWidth = chipWidth * 0.5;
    const envelopeHeight = chipHeight * 0.5;
    const strokeWidth = Math.max(1.1, chipHeight * 0.075);
    const [iconX, iconY] = geometry.point(layout.iconU, 0);
    const iconAngle = geometry.angleAt(layout.iconU);
    const [caretX, caretY] = geometry.point(caretU, 0);
    const caretAngle = geometry.angleAt(caretU);
    const caretHeight = Math.min(height * 0.58, fontSize * 1.45);
    const buttonHeight = height - layout.buttonInset * 2;
    const buttonPath = showButton
      ? bentRectPath(
          geometry,
          layout.buttonU0,
          layout.buttonU1,
          -height / 2 + layout.buttonInset,
          height / 2 - layout.buttonInset,
          Math.min(cornerRadius * 0.72, buttonHeight / 2),
        )
      : "";
    const buttonTextPath = showButton && !buttonIcon ? bentLinePath(geometry, layout.buttonU0, layout.buttonU1, vBase) : "";
    const buttonCenterU = (layout.buttonU0 + layout.buttonU1) / 2;
    const [buttonIconX, buttonIconY] = geometry.point(buttonCenterU, 0);
    const buttonIconAngle = geometry.angleAt(buttonCenterU);

    content = (
      <svg
        ref={svgRef}
        className="curved-input__svg"
        width={geometry.W}
        height={round2(geometry.svgH)}
        viewBox={`0 0 ${geometry.W} ${round2(geometry.svgH)}`}
        style={svgStyle}
        onPointerDown={(event) => event.preventDefault()}
        onClick={handleSurfaceClick}
      >
        <defs>
          <clipPath id={clipId}>
            <path d={clipPath} />
          </clipPath>
        </defs>
        <path className="curved-input__ring" d={bandPath} fill="none" stroke={accentColor} strokeWidth={borderWidth + 6} />
        <path d={bandPath} fill={fillColor} stroke={outlineColor} strokeWidth={borderWidth} />
        <path id={layoutPathId} d={layoutPath} fill="none" />
        {showIcon && (
          <g transform={`translate(${round2(iconX)} ${round2(iconY)}) rotate(${round2(iconAngle)})`} aria-hidden="true">
            {icon || (
              <>
                <rect x={-chipWidth / 2} y={-chipHeight / 2} width={chipWidth} height={chipHeight} rx={chipHeight * 0.27} fill={chipFill} />
                <rect
                  x={-envelopeWidth / 2}
                  y={-envelopeHeight / 2}
                  width={envelopeWidth}
                  height={envelopeHeight}
                  rx={1.4}
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth={strokeWidth}
                  strokeLinejoin="round"
                />
                <path
                  d={`M ${round2(-envelopeWidth / 2)} ${round2(-envelopeHeight / 2 + strokeWidth * 0.4)} L 0 ${round2(envelopeHeight * 0.14)} L ${round2(envelopeWidth / 2)} ${round2(-envelopeHeight / 2 + strokeWidth * 0.4)}`}
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth={strokeWidth}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              </>
            )}
          </g>
        )}
        <g clipPath={`url(#${clipId})`}>
          <text ref={textRef} style={{ fontSize: `${fontSize}px`, fontWeight: 500 }} fill={foregroundColor} xmlSpace="preserve" aria-hidden="true">
            <textPath href={`#${layoutPathId}`}>{displayValue}</textPath>
          </text>
          {!displayValue && placeholder && (
            <text style={{ fontSize: `${fontSize}px`, fontWeight: 500 }} fill={placeholderFill} xmlSpace="preserve" aria-hidden="true">
              <textPath href={`#${layoutPathId}`}>{placeholder}</textPath>
            </text>
          )}
          {focused && (
            <g
              key={`${displayValue}-${Math.min(caretIndex, displayValue.length)}`}
              transform={`translate(${round2(caretX)} ${round2(caretY)}) rotate(${round2(caretAngle)})`}
            >
              <line y1={-caretHeight / 2} y2={caretHeight / 2} stroke={foregroundColor} strokeWidth="1.5" strokeLinecap="round">
                <animate attributeName="opacity" values="1;0" dur="1.06s" calcMode="discrete" repeatCount="indefinite" />
              </line>
            </g>
          )}
        </g>
        {showButton && (
          <g
            className="curved-input__button"
            role="button"
            tabIndex={0}
            aria-label={buttonText}
            onClick={(event) => {
              event.stopPropagation();
              handleSubmit();
            }}
            onPointerDown={(event) => event.stopPropagation()}
            onKeyDown={(event: KeyboardEvent<SVGGElement>) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                handleSubmit();
              }
            }}
          >
            <path className="curved-input__button-bg" d={buttonPath} fill={accentColor} />
            {buttonIcon ? (
              <g
                transform={`translate(${round2(buttonIconX)} ${round2(buttonIconY)}) rotate(${round2(buttonIconAngle)})`}
                style={{ color: buttonForegroundColor, pointerEvents: "none" }}
                aria-hidden="true"
              >
                {buttonIcon}
              </g>
            ) : (
              <>
                <path id={buttonPathId} d={buttonTextPath} fill="none" />
                <text fill={buttonForegroundColor} textAnchor="middle" style={{ fontSize: `${fontSize}px`, fontWeight: 600, pointerEvents: "none" }}>
                  <textPath href={`#${buttonPathId}`} startOffset="50%">{buttonText}</textPath>
                </text>
              </>
            )}
          </g>
        )}
        {!buttonIcon && (
          <text ref={buttonMeasureRef} style={{ fontSize: `${fontSize}px`, fontWeight: 600 }} x="-9999" y="-9999" visibility="hidden" aria-hidden="true">
            {buttonText}
          </text>
        )}
      </svg>
    );
  }

  return (
    <form
      ref={rootRef}
      className={`curved-input ${focused ? "curved-input--focused" : ""} ${className}`.trim()}
      style={{ width: typeof width === "number" ? `${width}px` : width, ...style }}
      onSubmit={handleSubmit}
      noValidate
    >
      {content}
      <input
        ref={inputRef}
        className="curved-input__field"
        type={safeType}
        inputMode={inputMode}
        name={name}
        maxLength={maxLength}
        value={currentValue}
        onChange={handleInputChange}
        onSelect={handleSelect}
        onKeyUp={handleSelect}
        onFocus={() => {
          setFocused(true);
          onFocus?.();
        }}
        onBlur={() => {
          setFocused(false);
          onBlur?.();
        }}
        aria-label={ariaLabel || placeholder || "Curved input"}
        autoComplete="off"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
      />
    </form>
  );
};

export default CurvedInput;
