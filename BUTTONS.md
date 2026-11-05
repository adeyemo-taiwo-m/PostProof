# Postproof buttons: complete implementation

> **How to use:** paste this whole document into your coding agent. It contains the full button system: every variant, size, state and composed button, with ready-to-use code. Read `STYLE_GUIDE.md` first for the design tokens. This file implements Section 10.1 of that guide and goes further.
>
> **Verification:** the code below was typechecked with TypeScript (strict) and compiled with Tailwind CSS v4 in a scratch project, and the automatic text-color function was tested against sample colors. It has **not** been run inside your app, so the agent must still run the showcase page and the checklist in Section 11.

---

## 1. What you are building

| File | Purpose |
|---|---|
| `src/components/ui/button.tsx` | The core `Button` with **14 variants**, 7 sizes, 2 shapes, loading, toggle and `asChild`. **Replaces** the file shadcn/ui generates |
| `src/components/ui/copy-button.tsx` | Copies text, swaps its label to "Copied", announces it to screen readers |
| `src/components/ui/download-button.tsx` | "Download PNG" with idle, loading and done states |
| `src/components/ui/button-group.tsx` | Attaches buttons edge to edge |
| `src/components/ui/magnetic-button.tsx` | Landing-page CTA that pulls toward the cursor |
| `src/lib/utils/colors.ts` | Automatic readable text color (WCAG) and the business brand button styles |
| `src/app/dev/buttons/page.tsx` | A showcase of every button, used to check the work. Remove or protect it before production |

---

## 2. Setup

### 2.1 Dependencies

```bash
npm install class-variance-authority clsx tailwind-merge @radix-ui/react-slot lucide-react
```

If shadcn/ui is already set up, most of these exist. `src/lib/utils.ts` (the `cn` helper) is created by `shadcn init`. Keep it. Our other helpers live in the `src/lib/utils/` folder and are imported by full file path (for example `@/lib/utils/colors`).

### 2.2 Theme tokens (Tailwind CSS v4)

Add this to `globals.css`, right after `@import "tailwindcss";`. It exposes the style guide tokens as Tailwind utilities, so the button code can say `bg-coral-500`, `text-ink`, `shadow-focus` and `rounded-md`.

```css
@theme {
  /* Fonts */
  --font-sans: "DM Sans", ui-sans-serif, system-ui, sans-serif;
  --font-display: "Bricolage Grotesque", "DM Sans", ui-sans-serif, system-ui, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, Menlo, monospace;

  /* Coral scale */
  --color-coral-50: #FFF3EE;
  --color-coral-100: #FFE8DF;
  --color-coral-200: #FFD0BE;
  --color-coral-300: #FF8A68;
  --color-coral-400: #FF6B47;
  --color-coral-500: #F2542D;
  --color-coral-600: #C93A14;
  --color-coral-700: #B02F0B;
  --color-coral-800: #8A2409;
  --color-coral-900: #5C1806;

  /* Warm neutrals */
  --color-ink: #14110F;
  --color-ink-2: #26211D;
  --color-ink-3: #3A342E;
  --color-ink-muted: #6B645C;
  --color-paper: #FAF7F2;
  --color-surface: #FFFFFF;
  --color-surface-2: #F1ECE3;
  --color-line: #E7E1D8;
  --color-line-strong: #8C847A;
  --color-placeholder: #7A736A;
  --color-disabled: #A8A096;
  --color-on-ink-muted: #A8A096;

  /* Semantic */
  --color-success: #157A52;
  --color-success-tint: #E4F5EC;
  --color-warning: #8A5200;
  --color-warning-fill: #F5A623;
  --color-warning-tint: #FFF1D6;
  --color-error: #B42318;
  --color-error-strong: #9A1D14;
  --color-error-tint: #FDE7E4;
  --color-info: #1D4ED8;
  --color-info-tint: #E8F0FE;

  /* Radius */
  --radius-xs: 4px;
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;
  --radius-xl: 20px;
  --radius-2xl: 28px;

  /* Shadows */
  --shadow-xs: 0 1px 2px rgba(20, 17, 15, 0.06);
  --shadow-sm: 0 1px 2px rgba(20, 17, 15, 0.06), 0 1px 3px rgba(20, 17, 15, 0.10);
  --shadow-md: 0 2px 4px -1px rgba(20, 17, 15, 0.06), 0 6px 12px -2px rgba(20, 17, 15, 0.10);
  --shadow-lg: 0 4px 6px -2px rgba(20, 17, 15, 0.05), 0 12px 24px -4px rgba(20, 17, 15, 0.12);
  --shadow-xl: 0 8px 12px -4px rgba(20, 17, 15, 0.06), 0 24px 48px -8px rgba(20, 17, 15, 0.18);
  --shadow-focus: 0 0 0 2px #FAF7F2, 0 0 0 4px #C93A14;
  --shadow-focus-dark: 0 0 0 2px #14110F, 0 0 0 4px #F2542D;

  /* Easing */
  --ease-standard: cubic-bezier(0.2, 0, 0, 1);
}

:root {
  --brand-bg: #F2542D;
  --brand-fg: #14110F;
}
```

Notes:
- `--radius-md: 10px` makes `rounded-md` the Postproof default radius. This also affects other shadcn components, which is intended.
- Token names map to the style guide like this: `line` is `border-subtle`, `line-strong` is `border-strong`, `ink-muted` is `muted`.
- **If the project uses Tailwind v3**, move the same values into `tailwind.config` under `theme.extend` (`colors`, `boxShadow`, `borderRadius`, `transitionTimingFunction`). Two classes also change: replace `bg-(color:--brand-bg)` with `bg-[color:var(--brand-bg)]` and `text-(color:--brand-fg)` with `text-[color:var(--brand-fg)]`.
- Load DM Sans, Bricolage Grotesque and JetBrains Mono with `next/font` as described in the style guide, so `font-sans` resolves.

---

## 3. Variant reference

Every color pair below passes WCAG AA. Ratios were calculated, not estimated.

| Variant | Resting | Hover | Pressed | Label contrast | Use it for |
|---|---|---|---|---|---|
| **`primary`** (alias `default`) | Coral `#F2542D`, Ink text, `shadow-xs` | `#FF6B47` | Resting color, moves down 1px | Ink on coral **5.45:1** | The one main action on a screen |
| **`secondary`** | Ink `#14110F`, Paper text, `shadow-sm` | `#26211D` | Down 1px | 17.60:1 | Strong second action |
| **`outline`** | White fill, 1.5px `#8C847A` border, Ink text | `#F1ECE3` fill, border `#3A342E` | `#E7E1D8` fill | 18.80:1, border 3.69:1 | Cancel, tertiary actions, Open, Share |
| **`ghost`** | Transparent, Ink text | `#F1ECE3` fill | `#E7E1D8` fill | 17.60:1 | Toolbars, icon buttons, nav actions |
| **`soft`** | `#FFE8DF` fill, `#B02F0B` text | `#FFD0BE` fill | same as hover | 5.48:1 (4.61:1 on hover) | Friendly brand-tinted action |
| **`destructive`** | `#B42318`, white text, `shadow-xs` | `#9A1D14` | Down 1px | 6.57:1 (8.20:1 on hover) | The final Delete button inside a confirm dialog |
| **`destructive-ghost`** | Transparent, `#B42318` text | `#FDE7E4` fill | same as hover | 5.55:1 on hover | Delete on a detail page (opens the dialog) |
| **`link`** | `#C93A14` text, underlined | text `#B02F0B` | n/a | 4.79:1 (6.03:1 on hover) | Inline text actions |
| **`link-draw`** | Ink text, faint underline | A full underline draws in from the left | n/a | 17.60:1 | Landing "See how it works" |
| **`inverse`** | Paper fill, Ink text | `#FFE8DF` fill | Down 1px | 17.60:1 | Secondary action on Ink sections |
| **`outline-inverse`** | 1.5px Paper border, Paper text | `#26211D` fill | Down 1px | 17.60:1 | Tertiary action on Ink sections |
| **`brand`** | The business color, with an automatic text color | Lifts 1px, `shadow-md` | Down 1px | **4.5:1 or higher, guaranteed** | Public form submit button |
| **`flood`** | Ink fill, Paper text | Coral floods in from where the pointer entered, text turns Ink | n/a | Ink on coral 5.45:1 | Landing-page CTAs |
| **`chip`** | White, 1.5px border, pill-friendly | `#F1ECE3` fill | n/a | 18.80:1 | Toggle chips (WhatsApp, Instagram, filters). Use with `pressed` |

**Rules that come from the numbers**
- Label text on coral is **always Ink**. White on `#F2542D` is only 3.45:1 and fails.
- On Ink or dark sections, wrap them in an element with the class `on-ink`. This flips the focus ring to a coral ring that contrasts with the dark background.
- One `primary` button per view. Do not make every button coral.

---

## 4. Sizes, shapes and width

| Size | Height | Padding X | Text | Icon | Notes |
|---|---:|---:|---|---:|---|
| `sm` | 32px (40px on touch) | 12px | 14px | 16px | Dense toolbars, chips |
| `md` (default, alias `default`) | 40px (**44px on touch**) | 16px | 14px | 20px | Standard |
| `lg` | 48px | 24px | 16px, semibold | 20px | Public form submit, Download PNG |
| `xl` | 56px | 32px | 18px, semibold | 24px | Landing hero CTAs |
| `icon-sm` | 32px square (40px on touch) | n/a | n/a | 16px | Dense icon buttons |
| `icon` | 40px square (**44px on touch**) | n/a | n/a | 20px | Standard icon button |
| `icon-lg` | 48px square | n/a | n/a | 24px | Large icon button |

| Prop | Values | Effect |
|---|---|---|
| `shape` | `default` (10px radius), `pill` (fully rounded) | Use `pill` on the landing page and for chips |
| `fullWidth` | boolean | `w-full`. Use for the main action of a form on mobile |
| `mobileFull` | boolean | Full width below 640px only |
| `loading` | boolean | Shows a spinner, sets `aria-busy`, ignores clicks, keeps the button's color and width |
| `pressed` | boolean | Sets `aria-pressed` (toggle). Styled by `chip` |
| `leftIcon`, `rightIcon` | node | 8px gap from the label. Hidden on the right while loading |
| `asChild` | boolean | Render as the child element, for example `<Button asChild><Link href="/signup">Get started</Link></Button>`. Icons and loading are ignored in this mode |

**Important:** `Button` defaults to `type="button"` so it never submits a form by accident. Submit buttons must pass `type="submit"`.

---

## 5. States

| State | Behavior |
|---|---|
| **Hover** | Color change in 150ms. Does nothing on touch devices |
| **Pressed** | Moves down 1px and drops its shadow (disabled for reduced motion) |
| **Focus (keyboard)** | `focus-visible` only: a 2px gap plus a 2px ring. **Coral-600 ring on light surfaces (4.79:1 and above), coral-500 ring on `on-ink` surfaces (5.45:1)** |
| **Disabled** | `#F1ECE3` fill, `#A8A096` text, no shadow, no pointer events. Works with `disabled` and `aria-disabled`. Always show the reason as visible text nearby, never only in a tooltip |
| **Loading** | Spinner replaces the left icon, label stays, `aria-busy="true"`, clicks ignored, cursor shows progress, width does not change |
| **Pressed (toggle)** | `chip` fills Ink with Paper text |
| **Reduced motion** | All transitions and the press movement are removed. The spinner keeps spinning because it conveys progress |

---

## 6. Icon rules

- Lucide only, stroke width default. Icons inherit the text color.
- Size is set by the button size (see Section 4). Do not set sizes on icons by hand.
- Icon-only buttons **must** have an `aria-label`. In development the component warns when it is missing.
- The loading spinner is already hidden from screen readers. If you pass your own icon, add `aria-hidden="true"` unless it carries meaning.
- Arrow nudge on hover for call-to-action arrows: give the icon `transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5`. The button already has the `group` class.

---

## 7. Composed buttons

| Component | What it does |
|---|---|
| `CopyButton` | `value`, `label` ("Copy link"), `copiedLabel` ("Copied"), `resetAfterMs` (2000), `onCopied`. Uses the Clipboard API with a fallback. The button never changes width. A hidden live region announces "Copied" |
| `DownloadButton` | `onDownload: () => Promise<void>`, `onError`. Defaults to `primary` and `lg`. Shows "Creating your graphic..." with a spinner, then "Downloaded" with a check |
| `ButtonGroup` | Attaches buttons edge to edge with shared corners and a 1.5px overlap. Children should all be `Button` elements |
| `MagneticButton` | Same props as `Button`, plus `radius` (80), `maxShift` (10), `strength` (0.3). Only on desktop with a fine pointer, and only when reduced motion is off |
| Brand button | `<Button variant="brand" size="lg" fullWidth style={brandButtonStyle(business.primary_color)}>Submit Testimonial</Button>` |

**Automatic text color (`readableOn`)**
The brand button never hardcodes text color. It picks Ink or white, whichever has more contrast with the business color, and requires 4.5:1. If a mid-tone color fails both, it darkens the background by mixing in 15% Ink until white text passes. The same function is used for the color-picker preview chip and for text on a business color in generated graphics.

---

## 8. Which button for which Postproof action

| Action | Variant | Size | Icon | Where |
|---|---|---|---|---|
| Get started (landing) | `flood` or `primary` | `xl`, `pill` | `ArrowUpRight` right | Hero, final CTA (use `MagneticButton`) |
| See how it works | `link-draw` | n/a | `ArrowDown` or `ArrowUpRight` right | Hero |
| Log in (nav) | `ghost`, or `inverse` on Ink | `md` | none | Nav |
| Create account, Log in (auth form) | `primary` | `lg`, `fullWidth` | none | Auth pages, pass `type="submit"` |
| Forgot password, Create an account | `link` | n/a | none | Auth pages |
| Continue (onboarding) | `primary` | `lg` | none | Stepper |
| Back (onboarding) | `ghost` | `lg` | `ArrowLeft` left | Stepper |
| Copy link | `primary` (use `CopyButton`) | `md` | `Copy` | Dashboard link card, empty states |
| Open | `outline` | `md` | `ExternalLink` | Link card |
| Share | `outline` | `md` | `Share2` | Link card (mobile) |
| Approve | `primary` | `md` | `Check` | Testimonial detail |
| Reject | `outline` | `md` | `X` | Testimonial detail |
| Delete (opens dialog) | `destructive-ghost` | `md` | `Trash2` | Testimonial detail |
| Cancel (dialog) | `outline` | `md` | none | Dialogs |
| Delete (confirm in dialog) | `destructive` | `md` | none | Dialogs |
| Create Graphic | `primary` | `md` or `lg` | `Sparkles` | Detail page |
| Download PNG | `primary` (use `DownloadButton`) | `lg` | `Download` | Design page, sticky on mobile |
| Save changes | `primary` | `md` | none | Settings (pass `type="submit"`, use `loading`) |
| Replace, Remove (logo) | `outline` | `sm` | none | Logo uploader |
| Submit Testimonial | `brand` | `lg`, `fullWidth` | none | Public form (pass `type="submit"`) |
| Retry | `outline` | `md` | `RotateCw` | Error states |
| Filter chips, format chips | `chip` with `pressed` | `sm`, `pill` | none | Filters, share chips |
| Menu, close | `ghost` | `icon` | `Menu`, `X` | Mobile nav, dialogs |
| Pagination Previous, Next | `outline` | `sm` | `ChevronLeft`, `ChevronRight` | Testimonials list |

---

## 9. Code

Create these files exactly. Paths assume `src/` and the `@/*` import alias.

### `src/lib/utils.ts` (created by shadcn init, keep as is)

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### `src/lib/utils/colors.ts`

```ts
import type { CSSProperties } from "react";

const INK = "#14110F";
const WHITE = "#FFFFFF";
const DEFAULT_BRAND = "#F2542D";

type RGB = [number, number, number];

function parseHex(hex: string): RGB {
  let h = hex.trim().replace(/^#/, "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  if (!/^[0-9a-fA-F]{6}$/.test(h)) throw new Error(`Invalid hex color: ${hex}`);
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

function toHex([r, g, b]: RGB): string {
  const part = (n: number) =>
    Math.round(Math.min(255, Math.max(0, n))).toString(16).padStart(2, "0");
  return `#${part(r)}${part(g)}${part(b)}`.toUpperCase();
}

export function isValidHex(hex: string): boolean {
  return /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(hex.trim());
}

/** WCAG 2.x relative luminance. */
export function relativeLuminance(hex: string): number {
  const [r, g, b] = parseHex(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast ratio between two hex colors (1 to 21). */
export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const [hi, lo] = la >= lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

/** Mix `a` toward `b` by `weight` (0 to 1). */
export function mixHex(a: string, b: string, weight: number): string {
  const ra = parseHex(a);
  const rb = parseHex(b);
  return toHex([
    ra[0] + (rb[0] - ra[0]) * weight,
    ra[1] + (rb[1] - ra[1]) * weight,
    ra[2] + (rb[2] - ra[2]) * weight,
  ]);
}

/**
 * Picks Ink or white text for a background so contrast is at least `minRatio`.
 * If neither reaches it (a narrow band of mid-tones), the background is
 * darkened by mixing in 15% Ink until it passes.
 */
export function readableOn(
  background: string,
  minRatio = 4.5,
): { background: string; foreground: string; ratio: number } {
  let bg = background;
  for (let i = 0; i < 8; i++) {
    const withInk = contrastRatio(bg, INK);
    const withWhite = contrastRatio(bg, WHITE);
    const foreground = withInk >= withWhite ? INK : WHITE;
    const ratio = Math.max(withInk, withWhite);
    if (ratio >= minRatio) return { background: bg, foreground, ratio };
    bg = mixHex(bg, INK, 0.15);
  }
  return { background: bg, foreground: WHITE, ratio: contrastRatio(bg, WHITE) };
}

/** Inline CSS variables for `<Button variant="brand">` from a business color. */
export function brandButtonStyle(color: string | null | undefined): CSSProperties {
  const safe = color && isValidHex(color) ? `#${color.replace(/^#/, "")}` : DEFAULT_BRAND;
  const { background, foreground } = readableOn(safe);
  return {
    ["--brand-bg" as string]: background,
    ["--brand-fg" as string]: foreground,
  };
}
```

### `src/components/ui/button.tsx`

```tsx
"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

const PRIMARY = "bg-coral-500 text-ink shadow-xs hover:bg-coral-400";
const SIZE_MD = "h-10 px-4 text-sm [&_svg]:size-5 [@media(pointer:coarse)]:h-11";

export const buttonVariants = cva(
  [
    "group relative inline-flex shrink-0 select-none items-center justify-center gap-2 whitespace-nowrap font-sans font-medium",
    "transition-[background-color,color,border-color,box-shadow,transform,opacity] duration-150 ease-standard",
    "active:translate-y-px active:shadow-none",
    "focus-visible:outline-none focus-visible:shadow-focus [.on-ink_&]:focus-visible:shadow-focus-dark",
    "disabled:pointer-events-none disabled:cursor-not-allowed disabled:border-transparent disabled:bg-surface-2 disabled:text-disabled disabled:shadow-none",
    "aria-disabled:pointer-events-none aria-disabled:cursor-not-allowed aria-disabled:border-transparent aria-disabled:bg-surface-2 aria-disabled:text-disabled aria-disabled:shadow-none",
    "data-[loading]:cursor-progress [&_svg]:pointer-events-none [&_svg]:shrink-0",
    "motion-reduce:transition-none motion-reduce:active:translate-y-0",
  ],
  {
    variants: {
      variant: {
        // Core
        primary: PRIMARY,
        // Alias of primary so components generated by shadcn/ui keep working
        default: PRIMARY,
        secondary: "bg-ink text-paper shadow-sm hover:bg-ink-2",
        outline:
          "border-[1.5px] border-line-strong bg-surface text-ink hover:border-ink-3 hover:bg-surface-2 active:bg-line",
        ghost: "text-ink hover:bg-surface-2 active:bg-line",
        soft: "bg-coral-100 text-coral-700 hover:bg-coral-200 active:bg-coral-200",
        // Destructive
        destructive: "bg-error text-white shadow-xs hover:bg-error-strong",
        "destructive-ghost": "text-error hover:bg-error-tint active:bg-error-tint",
        // Text styles
        link: "text-coral-600 underline underline-offset-[3px] hover:text-coral-700 active:translate-y-0",
        "link-draw":
          "text-ink active:translate-y-0 before:absolute before:inset-x-0 before:bottom-0 before:h-0.5 before:bg-current before:opacity-35 before:content-[''] after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-[240ms] after:ease-standard after:content-[''] hover:after:scale-x-100 focus-visible:after:scale-x-100",
        // For Ink surfaces (wrap the section in an element with class "on-ink")
        inverse: "bg-paper text-ink hover:bg-coral-100",
        "outline-inverse": "border-[1.5px] border-paper text-paper hover:bg-ink-2",
        // Business brand color (public form). Set --brand-bg and --brand-fg inline.
        brand:
          "bg-(color:--brand-bg) text-(color:--brand-fg) shadow-sm hover:-translate-y-px hover:shadow-md",
        // Marketing: coral floods in from the pointer position
        flood:
          "overflow-hidden bg-ink text-paper shadow-sm hover:text-ink hover:delay-200 before:absolute before:inset-0 before:bg-coral-500 before:content-[''] before:[clip-path:circle(0%_at_var(--x,50%)_var(--y,50%))] before:transition-[clip-path] before:duration-[420ms] before:ease-standard hover:before:[clip-path:circle(150%_at_var(--x,50%)_var(--y,50%))] [&>*]:relative [&>*]:z-10",
        // Toggle chip (use with the `pressed` prop)
        chip: "border-[1.5px] border-line-strong bg-surface text-ink hover:bg-surface-2 aria-pressed:border-ink aria-pressed:bg-ink aria-pressed:text-paper aria-pressed:hover:bg-ink-2",
      },
      size: {
        sm: "h-8 px-3 text-sm [&_svg]:size-4 [@media(pointer:coarse)]:h-10",
        md: SIZE_MD,
        // Alias of md so components generated by shadcn/ui keep working
        default: SIZE_MD,
        lg: "h-12 px-6 text-base font-semibold [&_svg]:size-5",
        xl: "h-14 px-8 text-lg font-semibold [&_svg]:size-6",
        "icon-sm": "size-8 [&_svg]:size-4 [@media(pointer:coarse)]:size-10",
        icon: "size-10 [&_svg]:size-5 [@media(pointer:coarse)]:size-11",
        "icon-lg": "size-12 [&_svg]:size-6",
      },
      shape: {
        default: "rounded-md",
        pill: "rounded-full",
      },
      fullWidth: {
        true: "w-full",
        false: "",
      },
      mobileFull: {
        true: "max-sm:w-full",
        false: "",
      },
    },
    compoundVariants: [
      {
        variant: ["link", "link-draw"],
        className: "h-auto min-h-0 rounded-none p-0 [@media(pointer:coarse)]:h-auto",
      },
      { variant: "link-draw", className: "pb-1" },
      {
        variant: ["ghost", "link", "link-draw", "destructive-ghost"],
        className: "disabled:bg-transparent aria-disabled:bg-transparent",
      },
    ],
    defaultVariants: {
      variant: "primary",
      size: "md",
      shape: "default",
      fullWidth: false,
      mobileFull: false,
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Render as the child element (for example a Next.js Link). Icons and loading are ignored. */
  asChild?: boolean;
  /** Shows a spinner, sets aria-busy and ignores clicks. Width stays stable. */
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  /** Toggle state. Sets aria-pressed. Styled by the `chip` variant. */
  pressed?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      className,
      variant,
      size,
      shape,
      fullWidth,
      mobileFull,
      asChild = false,
      loading = false,
      leftIcon,
      rightIcon,
      pressed,
      children,
      onClick,
      onPointerEnter,
      onPointerLeave,
      type,
      ...props
    },
    ref,
  ) {
    const Comp = asChild ? Slot : "button";

    if (
      process.env.NODE_ENV !== "production" &&
      typeof size === "string" &&
      size.startsWith("icon") &&
      !props["aria-label"] &&
      !props["aria-labelledby"]
    ) {
      console.warn("Button: icon-only buttons need an aria-label.");
    }

    // Records where the pointer entered or left so the `flood` variant can grow from that point.
    const setFloodOrigin = (e: React.PointerEvent<HTMLElement>) => {
      if (variant !== "flood") return;
      const rect = e.currentTarget.getBoundingClientRect();
      e.currentTarget.style.setProperty("--x", `${e.clientX - rect.left}px`);
      e.currentTarget.style.setProperty("--y", `${e.clientY - rect.top}px`);
    };

    return (
      <Comp
        ref={ref}
        type={asChild ? undefined : (type ?? "button")}
        className={cn(
          buttonVariants({ variant, size, shape, fullWidth, mobileFull }),
          className,
        )}
        aria-busy={loading || undefined}
        aria-pressed={pressed}
        data-loading={loading ? "" : undefined}
        onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
          if (loading) {
            e.preventDefault();
            return;
          }
          onClick?.(e);
        }}
        onPointerEnter={(e: React.PointerEvent<HTMLButtonElement>) => {
          setFloodOrigin(e);
          onPointerEnter?.(e);
        }}
        onPointerLeave={(e: React.PointerEvent<HTMLButtonElement>) => {
          setFloodOrigin(e);
          onPointerLeave?.(e);
        }}
        {...props}
      >
        {asChild ? (
          children
        ) : (
          <>
            {loading ? (
              <Loader2 aria-hidden="true" className="animate-spin" />
            ) : (
              leftIcon
            )}
            {children}
            {!loading && rightIcon}
          </>
        )}
      </Comp>
    );
  },
);
```

### `src/components/ui/copy-button.tsx`

```tsx
"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";

import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface CopyButtonProps
  extends Omit<ButtonProps, "onClick" | "children" | "leftIcon" | "rightIcon" | "loading" | "asChild"> {
  /** The text to copy. */
  value: string;
  label?: string;
  copiedLabel?: string;
  /** How long the "Copied" state shows, in milliseconds. */
  resetAfterMs?: number;
  onCopied?: () => void;
}

async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through to the legacy path
  }
  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}

export function CopyButton({
  value,
  label = "Copy link",
  copiedLabel = "Copied",
  resetAfterMs = 2000,
  onCopied,
  ...props
}: CopyButtonProps) {
  const [copied, setCopied] = React.useState(false);
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  async function handleClick() {
    const ok = await copyText(value);
    if (!ok) return;
    setCopied(true);
    onCopied?.();
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), resetAfterMs);
  }

  return (
    <>
      <Button
        {...props}
        leftIcon={copied ? <Check /> : <Copy />}
        onClick={handleClick}
      >
        {/* Both labels share one grid cell so the button never changes width. */}
        <span className="inline-grid">
          <span className={cn("col-start-1 row-start-1", copied && "invisible")}>
            {label}
          </span>
          <span
            aria-hidden="true"
            className={cn("col-start-1 row-start-1", !copied && "invisible")}
          >
            {copiedLabel}
          </span>
        </span>
      </Button>
      <span role="status" aria-live="polite" className="sr-only">
        {copied ? copiedLabel : ""}
      </span>
    </>
  );
}
```

### `src/components/ui/download-button.tsx`

```tsx
"use client";

import * as React from "react";
import { Check, Download } from "lucide-react";

import { Button, type ButtonProps } from "@/components/ui/button";

type Status = "idle" | "loading" | "done";

export interface DownloadButtonProps
  extends Omit<ButtonProps, "onClick" | "children" | "leftIcon" | "rightIcon" | "loading" | "asChild"> {
  /** Should start the download and resolve when the file has been handed to the browser. */
  onDownload: () => Promise<void>;
  onError?: (error: unknown) => void;
  label?: string;
  loadingLabel?: string;
  doneLabel?: string;
  /** How long the done state shows, in milliseconds. */
  resetAfterMs?: number;
}

export function DownloadButton({
  onDownload,
  onError,
  label = "Download PNG",
  loadingLabel = "Creating your graphic...",
  doneLabel = "Downloaded",
  resetAfterMs = 2500,
  variant = "primary",
  size = "lg",
  ...props
}: DownloadButtonProps) {
  const [status, setStatus] = React.useState<Status>("idle");
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
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

  return (
    <Button
      {...props}
      variant={variant}
      size={size}
      loading={status === "loading"}
      leftIcon={status === "done" ? <Check /> : <Download />}
      onClick={handleClick}
    >
      {status === "loading" ? loadingLabel : status === "done" ? doneLabel : label}
    </Button>
  );
}
```

### `src/components/ui/button-group.tsx`

```tsx
import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Attaches buttons edge to edge (for example Copy link, Open, Share).
 * Children should all be <Button> elements (visually hidden status spans are fine).
 */
export function ButtonGroup({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="group"
      className={cn(
        "inline-flex items-stretch",
        "[&>button]:rounded-none",
        "[&>button:first-of-type]:rounded-l-md [&>button:last-of-type]:rounded-r-md",
        "[&>button:not(:first-of-type)]:-ml-[1.5px]",
        "[&>button:hover]:z-10 [&>button:focus-visible]:z-10",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
```

### `src/components/ui/magnetic-button.tsx`

```tsx
"use client";

import * as React from "react";

import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface MagneticButtonProps extends ButtonProps {
  /** How far, in pixels, around the button the pull starts. */
  radius?: number;
  /** Maximum shift in pixels. */
  maxShift?: number;
  /** How strongly the button follows the pointer (0 to 1). */
  strength?: number;
}

/**
 * Pulls toward the pointer on desktop. Does nothing on touch devices
 * or when the user prefers reduced motion.
 */
export function MagneticButton({
  radius = 80,
  maxShift = 10,
  strength = 0.3,
  className,
  ...props
}: MagneticButtonProps) {
  const wrapRef = React.useRef<HTMLSpanElement>(null);

  React.useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!finePointer || reduceMotion) return;

    let frame = 0;
    const clamp = (n: number) => Math.max(-maxShift, Math.min(maxShift, n));

    const reset = () => {
      cancelAnimationFrame(frame);
      el.style.transform = "";
      el.style.willChange = "auto";
    };

    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const dx = e.clientX - (rect.left + rect.width / 2);
        const dy = e.clientY - (rect.top + rect.height / 2);
        const reach = radius + Math.max(rect.width, rect.height) / 2;
        if (Math.hypot(dx, dy) < reach) {
          el.style.willChange = "transform";
          el.style.transform = `translate3d(${clamp(dx * strength)}px, ${clamp(dy * strength)}px, 0)`;
        } else {
          reset();
        }
      });
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", reset);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", reset);
      reset();
    };
  }, [radius, maxShift, strength]);

  return (
    <span
      ref={wrapRef}
      className={cn(
        "inline-flex transition-transform duration-300 ease-standard",
        props.fullWidth && "w-full",
      )}
    >
      <Button className={className} {...props} />
    </span>
  );
}
```

---

## 10. Showcase page

This page renders every variant, size and state. Use it to check the work, and remove it (or block it in production) before launch.

### `src/app/dev/buttons/page.tsx`

```tsx
"use client";

import { ArrowUpRight, Check, Plus, Share2, Sparkles, Trash2, X } from "lucide-react";

import { Button, type ButtonProps } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { CopyButton } from "@/components/ui/copy-button";
import { DownloadButton } from "@/components/ui/download-button";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { brandButtonStyle } from "@/lib/utils/colors";

type Variant = NonNullable<ButtonProps["variant"]>;

const LIGHT_VARIANTS: Variant[] = [
  "primary",
  "secondary",
  "outline",
  "ghost",
  "soft",
  "destructive",
  "destructive-ghost",
  "link",
  "link-draw",
  "chip",
  "flood",
];
const SIZES = ["sm", "md", "lg", "xl"] as const;
const BRAND_COLORS = ["#F2542D", "#14110F", "#FFE066", "#7C3AED", "#2E9E6B", "#E9E4DA", "#3B82F6"];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="font-display text-2xl font-bold">{title}</h2>
      {children}
    </section>
  );
}

export default function ButtonsShowcase() {
  return (
    <main className="mx-auto max-w-5xl space-y-12 bg-paper p-8 text-ink">
      <h1 className="font-display text-4xl font-bold">Buttons</h1>

      <Section title="Variants (md)">
        <div className="flex flex-wrap items-center gap-4">
          {LIGHT_VARIANTS.map((v) => (
            <Button key={v} variant={v} pressed={v === "chip" ? true : undefined}>
              {v}
            </Button>
          ))}
        </div>
      </Section>

      <Section title="Sizes">
        {(["primary", "secondary", "outline"] as const).map((v) => (
          <div key={v} className="flex flex-wrap items-center gap-4">
            {SIZES.map((s) => (
              <Button key={s} variant={v} size={s}>
                {v} {s}
              </Button>
            ))}
          </div>
        ))}
      </Section>

      <Section title="States">
        <div className="flex flex-wrap items-center gap-4">
          <Button>Default</Button>
          <Button loading>Saving</Button>
          <Button disabled>Disabled</Button>
          <Button variant="secondary" loading>Saving</Button>
          <Button variant="outline" disabled>Disabled</Button>
          <Button variant="destructive" loading>Deleting</Button>
        </div>
      </Section>

      <Section title="With icons">
        <div className="flex flex-wrap items-center gap-4">
          <Button leftIcon={<Check />}>Approve</Button>
          <Button variant="outline" leftIcon={<X />}>Reject</Button>
          <Button variant="destructive-ghost" leftIcon={<Trash2 />}>Delete</Button>
          <Button leftIcon={<Sparkles />}>Create Graphic</Button>
          <Button variant="soft" rightIcon={<ArrowUpRight />}>Open</Button>
          <Button variant="outline" leftIcon={<Share2 />}>Share</Button>
        </div>
      </Section>

      <Section title="Icon-only">
        <div className="flex flex-wrap items-center gap-4">
          <Button size="icon-sm" variant="ghost" aria-label="Add"><Plus /></Button>
          <Button size="icon" variant="outline" aria-label="Add"><Plus /></Button>
          <Button size="icon-lg" aria-label="Add"><Plus /></Button>
          <Button size="icon" shape="pill" variant="secondary" aria-label="Add"><Plus /></Button>
        </div>
      </Section>

      <Section title="Pill shape">
        <div className="flex flex-wrap items-center gap-4">
          <Button shape="pill" size="lg">Get started</Button>
          <Button shape="pill" size="lg" variant="outline">See how it works</Button>
          <Button shape="pill" size="sm" variant="chip">WhatsApp</Button>
          <Button shape="pill" size="sm" variant="chip" pressed>Instagram</Button>
        </div>
      </Section>

      <Section title="Marketing">
        <div className="flex flex-wrap items-center gap-6">
          <MagneticButton size="xl" shape="pill" rightIcon={<ArrowUpRight className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />}>
            Create your link
          </MagneticButton>
          <Button variant="flood" size="lg" shape="pill">Make it yours</Button>
          <Button variant="link-draw" rightIcon={<ArrowUpRight />}>See how it works</Button>
        </div>
      </Section>

      <Section title="On Ink (dark) surfaces">
        <div className="on-ink flex flex-wrap items-center gap-4 rounded-xl bg-ink p-6">
          <Button>Get started free</Button>
          <Button variant="inverse">Log in</Button>
          <Button variant="outline-inverse">See how it works</Button>
          <Button variant="ghost" className="text-paper hover:bg-ink-2">Ghost</Button>
        </div>
      </Section>

      <Section title="Business brand buttons (auto text color)">
        <div className="flex flex-wrap items-center gap-4">
          {BRAND_COLORS.map((c) => (
            <Button key={c} variant="brand" size="lg" style={brandButtonStyle(c)}>
              Submit Testimonial
            </Button>
          ))}
        </div>
      </Section>

      <Section title="Composed">
        <div className="flex flex-wrap items-center gap-6">
          <ButtonGroup>
            <CopyButton value="https://postproof.app/t/moonwell" />
            <Button variant="outline">Open</Button>
            <Button variant="outline">Share</Button>
          </ButtonGroup>
          <DownloadButton onDownload={() => new Promise((r) => setTimeout(r, 1200))} />
        </div>
      </Section>

      <Section title="Full width and mobile-full">
        <div className="max-w-sm space-y-3">
          <Button fullWidth size="lg">Submit Testimonial</Button>
          <Button mobileFull variant="outline">Full width on mobile only</Button>
        </div>
      </Section>
    </main>
  );
}
```

---

## 11. Acceptance checklist

Open `/dev/buttons` and confirm each item.

**Visual**
- [ ] All 14 variants render and match the table in Section 3
- [ ] Primary buttons have **Ink** text on coral, never white
- [ ] Sizes `sm`, `md`, `lg`, `xl` and the three icon sizes are the heights in Section 4
- [ ] `pill` shape works, `fullWidth` and `mobileFull` work
- [ ] The "On Ink" row looks correct and its focus ring is coral
- [ ] Brand buttons in all seven sample colors have readable text (yellow, light beige and coral get Ink, dark purple and black get white)

**Behavior**
- [ ] Hover, pressed and focus-visible states work on every variant
- [ ] `loading` shows a spinner, ignores clicks and keeps the button the same width
- [ ] `disabled` blocks clicks and looks disabled
- [ ] `CopyButton` copies, shows "Copied" for about 2 seconds, and the width does not jump
- [ ] `DownloadButton` goes idle, loading, done, then back to idle
- [ ] `ButtonGroup` shows one continuous control with correct corner radii and no double borders
- [ ] `MagneticButton` follows the pointer on desktop and does nothing on touch or with reduced motion
- [ ] `flood` grows from where the pointer enters
- [ ] `link-draw` underline draws from the left on hover and on keyboard focus
- [ ] `chip` toggles with the `pressed` prop

**Accessibility**
- [ ] Tab through every button: each shows a clear focus ring (2px, 3:1 or better)
- [ ] Icon-only buttons have `aria-label` (no console warning in development)
- [ ] Touch targets are at least 44px on a touch device or in device emulation
- [ ] With `prefers-reduced-motion: reduce`, there is no press movement, no magnetic pull and no transitions
- [ ] A screen reader announces "Copied" after copying

**Code**
- [ ] `tsc --noEmit` and the linter pass
- [ ] No hardcoded hex values in components (they use theme tokens)
- [ ] Existing shadcn components that use `Button` or `buttonVariants` still compile (`default` aliases exist for variant and size)
- [ ] Every `Button` that submits a form passes `type="submit"`

---

## 12. Do and don't

| Do | Don't |
|---|---|
| Use one `primary` button per view | Make every button coral |
| Use Ink text on coral | Use white text on `#F2542D` |
| Use `destructive` only for the final confirm button | Use red for "Reject" or for ordinary actions |
| Use `outline` for Cancel and `ghost` for quiet actions | Style a button by overriding colors with `className` |
| Wrap Ink sections in `on-ink` | Use light variants on dark backgrounds |
| Keep the reason for a disabled button visible as text | Hide it in a tooltip |
| Use `asChild` with `Link` for navigation | Put a `<a>` inside a `<button>` |
| Use `loading` during async actions | Disable the button and show nothing |
| Pass `type="submit"` on form submit buttons | Rely on the default type |
