import type { CSSProperties } from "react";

const INK = "#14110F";
const WHITE = "#FFFFFF";
const DEFAULT_BRAND = "#F2542D";

type RGB = [number, number, number];

function parseHex(hex: string): RGB {
  let value = hex.trim().replace(/^#/, "");
  if (value.length === 3) value = value.split("").map((character) => character + character).join("");
  if (!/^[0-9a-fA-F]{6}$/.test(value)) throw new Error(`Invalid hex color: ${hex}`);
  return [
    parseInt(value.slice(0, 2), 16),
    parseInt(value.slice(2, 4), 16),
    parseInt(value.slice(4, 6), 16),
  ];
}

function toHex([red, green, blue]: RGB) {
  const part = (value: number) => Math.round(Math.min(255, Math.max(0, value))).toString(16).padStart(2, "0");
  return `#${part(red)}${part(green)}${part(blue)}`.toUpperCase();
}

export function isValidHex(hex: string) {
  return /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(hex.trim());
}

export function relativeLuminance(hex: string) {
  const [red, green, blue] = parseHex(hex).map((value) => {
    const channel = value / 255;
    return channel <= 0.03928 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

export function contrastRatio(first: string, second: string) {
  const firstLuminance = relativeLuminance(first);
  const secondLuminance = relativeLuminance(second);
  const [higher, lower] = firstLuminance >= secondLuminance
    ? [firstLuminance, secondLuminance]
    : [secondLuminance, firstLuminance];
  return (higher + 0.05) / (lower + 0.05);
}

function mixHex(first: string, second: string, weight: number) {
  const firstRgb = parseHex(first);
  const secondRgb = parseHex(second);
  return toHex([
    firstRgb[0] + (secondRgb[0] - firstRgb[0]) * weight,
    firstRgb[1] + (secondRgb[1] - firstRgb[1]) * weight,
    firstRgb[2] + (secondRgb[2] - firstRgb[2]) * weight,
  ]);
}

export function readableOn(background: string, minRatio = 4.5) {
  let safeBackground = background;
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const inkRatio = contrastRatio(safeBackground, INK);
    const whiteRatio = contrastRatio(safeBackground, WHITE);
    const foreground = inkRatio >= whiteRatio ? INK : WHITE;
    const ratio = Math.max(inkRatio, whiteRatio);
    if (ratio >= minRatio) return { background: safeBackground, foreground, ratio };
    safeBackground = mixHex(safeBackground, INK, 0.15);
  }
  return { background: safeBackground, foreground: WHITE, ratio: contrastRatio(safeBackground, WHITE) };
}

export function brandButtonStyle(color: string | null | undefined): CSSProperties {
  const safeColor = color && isValidHex(color) ? `#${color.replace(/^#/, "")}` : DEFAULT_BRAND;
  const { background, foreground } = readableOn(safeColor);
  return {
    "--brand-bg": background,
    "--brand-fg": foreground,
  } as CSSProperties;
}
