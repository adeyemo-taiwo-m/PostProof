<div align="center">

# Postproof Style Guide

### The design system for every pixel: color, type, shadow, motion and every UI element.

![Version](https://img.shields.io/badge/version-1.0-F2542D)
![Accessibility](https://img.shields.io/badge/WCAG-2.2_AA-14110F)

</div>

> **How to use this document.** This is the single source of truth for the Postproof UI. The coding agent must use the tokens and component specs here instead of inventing values. If something is missing, extend this guide first, then build. Pair it with [README.md](./README.md), which defines *what* to build. This file defines *how it looks and behaves*.

---

## Table of Contents

1. [Design Principles](#1-design-principles)
2. [Brand and Voice](#2-brand-and-voice)
3. [Color](#3-color)
4. [Typography](#4-typography)
5. [Spacing, Layout and Grid](#5-spacing-layout-and-grid)
6. [Shape: Radius and Borders](#6-shape-radius-and-borders)
7. [Elevation and Shadows](#7-elevation-and-shadows)
8. [Motion](#8-motion)
9. [Iconography](#9-iconography)
10. [Component Specifications](#10-component-specifications)
11. [Page and Layout Patterns](#11-page-and-layout-patterns)
12. [Graphic Template Design](#12-graphic-template-design)
13. [Accessibility](#13-accessibility)
14. [Content and Microcopy](#14-content-and-microcopy)
15. [Implementation: Tokens and Setup](#15-implementation-tokens-and-setup)
16. [Do and Don't](#16-do-and-dont)
17. [Component Checklist for the Coding Agent](#17-component-checklist-for-the-coding-agent)

---

## 1. Design Principles

| Principle | What it means in practice |
|---|---|
| **The graphic is the hero** | The app UI is calm and neutral so the user's testimonial graphics and brand colors are the most colorful thing on screen. |
| **Typography-led** | Hierarchy comes from type size, weight and spacing first, not from boxes, borders and color. |
| **One accent, used with intent** | Coral marks the single most important action or selected state in any view. If everything is coral, nothing is. |
| **Effortless for customers** | The public form is one column, large tap targets, no clutter, no account. |
| **Warm, not corporate** | Warm neutrals, soft shadows, friendly copy. Avoid cold blue-gray admin-template styling. |
| **Accessible by default** | WCAG 2.2 AA is the minimum, not a polish step. Every color pair in this guide has been contrast-checked. |
| **Never hide state** | Loading, empty, error, success and disabled states are designed, not afterthoughts. |

**Target feel:** modern creative SaaS. Clean, premium, minimal, friendly.

---

## 2. Brand and Voice

**Name:** Postproof (one word, capital P, lowercase "proof").
**Tagline:** *Proof worth posting.*
**Descriptor:** Collect customer reviews with one link. Post them as branded graphics.

**Voice:** friendly, plain, confident. Short sentences. Talk like a helpful friend who knows social media, not like enterprise software.

**Logo and wordmark (until a custom logo exists):**
- Set "Postproof" in Bricolage Grotesque Bold, tracking `-0.02em`.
- Mark: a rounded-square (radius 8px) in Coral 500 containing a quotation mark glyph in Ink.
- Minimum clear space around the logo: the height of the quote glyph.
- Use the wordmark in Ink on light backgrounds and in Paper on Ink backgrounds. On Coral 500 backgrounds use Ink.

---

## 3. Color

### 3.1 Brand palette

| Token | Hex | Role |
|---|---|---|
| **Coral 500** (Primary) | `#F2542D` | Brand color. Primary buttons, key highlights, logo mark. Always paired with Ink text. |
| **Ink** (Secondary) | `#14110F` | Headings, body text, sidebar, secondary buttons, dark surfaces. |
| **Paper** | `#FAF7F2` | Default page background. |

### 3.2 Coral scale

| Token | Hex | Use |
|---|---|---|
| `coral-50` | `#FFF3EE` | Very light tint backgrounds, drag-over states |
| `coral-100` | `#FFE8DF` | Accent tint: badges, highlighted rows, icon circles |
| `coral-200` | `#FFD0BE` | Decorative fills, illustration |
| `coral-300` | `#FF8A68` | Decorative only |
| `coral-400` | `#FF6B47` | Primary button **hover** (lighter, keeps Ink text readable) |
| `coral-500` | `#F2542D` | **Brand / primary button fill** |
| `coral-600` | `#C93A14` | Coral **text and links** on light backgrounds, focus rings, selected controls (checkbox, radio) |
| `coral-700` | `#B02F0B` | Coral text on Coral 100 tint, link hover |
| `coral-800` | `#8A2409` | Decorative, deep accents |
| `coral-900` | `#5C1806` | Decorative |

### 3.3 Warm neutrals

| Token | Hex | Use |
|---|---|---|
| `ink` | `#14110F` | Primary text, sidebar background |
| `ink-2` | `#26211D` | Hover and active on Ink surfaces, secondary button hover |
| `ink-3` | `#3A342E` | Strong secondary text, rejected badge text |
| `muted` | `#6B645C` | Secondary text, helper text, timestamps |
| `placeholder` | `#7A736A` | Input placeholder text |
| `border-strong` | `#8C847A` | **Input and control borders** (meets 3:1) |
| `border-subtle` | `#E7E1D8` | Decorative dividers and card borders only |
| `surface-2` | `#F1ECE3` | Subtle fills, hover backgrounds, skeletons, disabled fill |
| `surface` | `#FFFFFF` | Cards, inputs, popovers |
| `paper` | `#FAF7F2` | Page background |
| `on-ink-muted` | `#A8A096` | Secondary text on Ink backgrounds |

### 3.4 Semantic colors

| Meaning | Text / fill | Tint (background) | Used for |
|---|---|---|---|
| **Success** | `#157A52` | `#E4F5EC` | Approved, success messages, consent granted |
| **Warning** | text `#8A5200`, fill `#F5A623` | `#FFF1D6` | Pending, consent not granted, character-limit warnings |
| **Error** | `#B42318` | `#FDE7E4` | Validation errors, destructive actions, failures |
| **Info** | `#1D4ED8` | `#E8F0FE` | Neutral notices and tips |

**Status color mapping (testimonials):**

| State | Style | Icon (Lucide) |
|---|---|---|
| Pending | Warning tint, Warning-700 text | `Clock` |
| Approved | Success tint, Success text | `CheckCircle2` |
| Rejected | Neutral: `surface-2` bg, `ink-3` text | `XCircle` |
| Marketing consent granted | Success outline | `ShieldCheck` |
| Marketing consent not granted | Warning outline | `ShieldAlert` |

> **Rejected is neutral on purpose.** Red is reserved for errors and destructive actions so owners never confuse "brand" or "status" with "danger." Status is **never** conveyed by color alone. Every badge has an icon and a text label.

### 3.5 Verified contrast ratios

All ratios were calculated with the WCAG 2.x relative-luminance formula. Targets: **4.5:1** for normal text, **3:1** for large text (24px regular or 19px bold and up) and for UI components, icons and focus indicators.

| Foreground on background | Ratio | Result |
|---|---:|---|
| Ink on Paper | 17.60 | Pass (AAA) |
| Ink on White | 18.80 | Pass (AAA) |
| Muted `#6B645C` on Paper | 5.45 | Pass |
| Muted on White | 5.83 | Pass |
| Muted on `surface-2` | 4.95 | Pass |
| Muted on Coral 100 | 4.96 | Pass |
| Placeholder `#7A736A` on White | 4.68 | Pass |
| **Ink on Coral 500** | **5.45** | **Pass: primary button label** |
| **White on Coral 500** | **3.45** | **Fail for small text. Never use.** |
| Ink on Coral 400 (hover) | 6.67 | Pass |
| White on Coral 600 | 5.12 | Pass |
| Coral 600 text on Paper | 4.79 | Pass (links) |
| Coral 700 on Coral 100 | 5.48 | Pass |
| Coral 500 on Paper | 3.23 | Non-text and large text only |
| Coral 500 on Ink | 5.45 | Pass (focus ring and buttons on dark) |
| Coral 600 on White | 5.12 | Pass (focus ring) |
| Paper on Ink | 17.60 | Pass |
| On-ink-muted `#A8A096` on Ink | 7.28 | Pass |
| Success `#157A52` on Paper | 4.99 | Pass |
| Success on Success tint | 4.72 | Pass |
| White on Success | 5.33 | Pass |
| Warning-700 `#8A5200` on Warning tint | 5.72 | Pass |
| Ink on Warning fill `#F5A623` | 9.28 | Pass |
| Error `#B42318` on Error tint | 5.55 | Pass |
| White on Error | 5.7 or higher | Pass |
| Info `#1D4ED8` on Info tint | 5.85 | Pass |
| `border-strong` on White (input border) | 3.69 | Pass (3:1 for controls) |
| `border-strong` on Paper | 3.45 | Pass |
| `border-subtle` on Paper | 1.22 | Decorative only, never for inputs |

**Rules that follow from these numbers**
1. Button labels on Coral 500 are **Ink**, never white.
2. If you want white text on coral, the fill must be **Coral 600 or darker**.
3. Coral 500 text on a light background is **not allowed** for body-size text. Use Coral 600.
4. Input and control borders use `border-strong`. `border-subtle` is for dividers only.
5. Disabled controls are exempt from contrast rules but must still be recognizable.

### 3.6 App colors vs. business brand colors

Two separate color systems exist. **Do not mix them.**

| System | Where it applies | Source |
|---|---|---|
| **Postproof colors** (this guide) | The entire dashboard, auth, landing page, settings UI | Tokens above |
| **Business brand colors** (user's primary, secondary, accent) | The public submission page accents and the generated graphics | Database |

**Public submission page rules**
- Base UI (background, text, inputs) stays Postproof neutral.
- The business's primary color is used for: the submit button fill, a thin top bar and the logo tile.
- Text on the business's primary color is chosen automatically (see [12.2](#122-automatic-text-color)).
- The focus ring uses the business primary **only if** it has at least 3:1 contrast against the page background. Otherwise use Ink.
- Optional footer: "Powered by Postproof" as a small text link in `muted`.

### 3.7 Default brand colors for new businesses

| Field | Default |
|---|---|
| Primary | `#F2542D` |
| Secondary | `#14110F` |
| Accent | `#FFD0BE` |

A business that skips the color step still gets an attractive graphic.

### 3.8 Dark mode

Not part of the MVP. Tokens are defined as CSS variables so a dark theme can be added later. The dashboard sidebar is the only Ink surface in the MVP.

---

## 4. Typography

### 4.1 Typefaces

| Role | Font | Source and license | Use |
|---|---|---|---|
| **Display** | Bricolage Grotesque | Google Fonts (OFL) | Landing headlines, page titles, stat numbers, wordmark |
| **UI / Body** | DM Sans | Google Fonts (OFL) | All interface text, forms, buttons |
| **Mono** | JetBrains Mono | Google Fonts (OFL) | Testimonial link, slugs, hex codes |
| **Graphic: Editorial** | Playfair Display | Google Fonts (OFL) | Editorial template quote text |

Load the three UI fonts through `next/font/google` so they self-host with no layout shift. Fallback stacks:

```css
--font-display: "Bricolage Grotesque", "DM Sans", ui-sans-serif, system-ui, sans-serif;
--font-sans:    "DM Sans", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
--font-mono:    "JetBrains Mono", ui-monospace, "SFMono-Regular", Menlo, monospace;
```

> **Graphic fonts are different.** Fonts used inside generated PNGs must be **bundled font files** (TTF/OTF) in the repo, loaded by the server renderer. Use **static** font cuts (Regular, Medium, SemiBold, Bold), not variable fonts, because the SVG renderer behind Sharp can handle variable fonts unpredictably. See [Section 12](#12-graphic-template-design).

### 4.2 Type scale

| Token | Desktop size / line-height | Mobile size / line-height | Weight | Tracking | Font |
|---|---|---|---|---|---|
| `display-xl` | 64 / 68 | 40 / 44 | 700 | -0.03em | Display |
| `display-lg` | 48 / 52 | 34 / 38 | 700 | -0.025em | Display |
| `h1` | 36 / 40 | 28 / 34 | 700 | -0.02em | Display |
| `h2` | 28 / 34 | 22 / 28 | 700 | -0.015em | Display |
| `h3` | 22 / 28 | 20 / 26 | 600 | -0.01em | Display |
| `h4` | 18 / 24 | 18 / 24 | 600 | 0 | Sans |
| `body-lg` | 18 / 28 | 17 / 26 | 400 | 0 | Sans |
| `body` | 16 / 24 | 16 / 24 | 400 | 0 | Sans |
| `body-sm` | 14 / 20 | 14 / 20 | 400 | 0 | Sans |
| `label` | 14 / 20 | 14 / 20 | 500 | 0 | Sans |
| `caption` | 12 / 16 | 12 / 16 | 500 | 0.01em | Sans |
| `overline` | 12 / 16 | 12 / 16 | 600 | 0.08em, uppercase | Sans |
| `stat` | 40 / 44 | 32 / 36 | 700 | -0.02em, tabular numerals | Display |
| `mono` | 14 / 20 | 14 / 20 | 500 | 0 | Mono |

### 4.3 Typography rules

- **Form inputs are always 16px or larger** on mobile so iOS Safari does not zoom on focus.
- Maximum line length for reading text: **60 to 70 characters** (`max-w-prose`).
- Sentence case everywhere: buttons, headings, labels. No Title Case, no ALL CAPS except `overline`.
- Use tabular numerals (`font-variant-numeric: tabular-nums`) for stats, counters and dates.
- Never go below 12px. Caption text is used sparingly, never for essential information.
- Body text color is Ink. Secondary text is `muted`. Do not use lighter grays for readable text.
- Headings use balanced wrapping: `text-wrap: balance`. Paragraphs use `text-wrap: pretty`.
- Links in body text are underlined (offset 3px). Do not rely on color alone.

---

## 5. Spacing, Layout and Grid

### 5.1 Spacing scale

Base unit **4px**. Use only these steps.

| Token | px | Typical use |
|---|---:|---|
| `1` | 4 | Icon gaps |
| `2` | 8 | Tight gaps, badge padding |
| `3` | 12 | Label to input, small card gaps |
| `4` | 16 | Default gap, mobile page padding |
| `5` | 20 | Card padding |
| `6` | 24 | Section gaps inside pages, tablet page padding |
| `8` | 32 | Desktop page padding, large gaps |
| `10` | 40 | Between major blocks |
| `12` | 48 | Section spacing |
| `16` | 64 | Landing section spacing (mobile) |
| `24` | 96 | Landing section spacing (desktop) |

### 5.2 Breakpoints (Tailwind defaults)

| Name | Min width | Device |
|---|---:|---|
| base | 0 | Small mobile (design for 360px first) |
| `sm` | 640px | Large mobile |
| `md` | 768px | Tablet |
| `lg` | 1024px | Laptop (sidebar appears) |
| `xl` | 1280px | Desktop |
| `2xl` | 1536px | Large desktop |

Design **mobile first**. The public form and the graphic preview must be excellent at 360px.

### 5.3 Containers and page padding

| Context | Max width | Page padding (base / md / lg) |
|---|---:|---|
| Landing page | 1200px | 16 / 24 / 32 |
| Dashboard content | 1120px | 16 / 24 / 32 |
| Public testimonial form card | 560px | 16 / 24 / 24 |
| Auth form | 440px | 16 / 24 / 24 |
| Reading text | 65ch | n/a |

### 5.4 Dashboard shell dimensions

| Element | Size |
|---|---|
| Sidebar (lg and up) | 264px wide, Ink background, full height, fixed |
| Top header | 64px tall, Paper background, 1px `border-subtle` bottom |
| Bottom navigation (below lg) | 64px tall plus safe-area inset, white background, 1px top border |
| Content area | Fills remaining space, vertical padding 32px (24px mobile) |

### 5.5 Grids

| Layout | Columns |
|---|---|
| Stat cards | 1 column mobile, 2 on `sm`, 4 on `lg` |
| Testimonial list | 1 column (full-width cards), always |
| Benefits (landing) | 1 column mobile, 2 on `md`, 3 on `lg` |
| Design page | 1 column mobile (preview first), `lg`: preview 1fr plus 360px controls panel |
| Template selector | 3 columns always, scrolls horizontally if narrower than 320px |

---

## 6. Shape: Radius and Borders

| Token | px | Use |
|---|---:|---|
| `radius-xs` | 4 | Tiny chips, inline code |
| `radius-sm` | 6 | Checkboxes, small badges |
| `radius-md` | **10** | **Buttons, inputs, selects, dropdowns** (the default) |
| `radius-lg` | 14 | Cards, alerts, popovers |
| `radius-xl` | 20 | Dialogs, large panels, graphic preview frame |
| `radius-2xl` | 28 | Landing hero panels, marketing cards |
| `radius-full` | 9999 | Pills, avatars (customer), status dots, switches |

**Borders**

| Token | Value | Use |
|---|---|---|
| Hairline | 1px `border-subtle` | Cards, dividers, table rows |
| Control | 1.5px `border-strong` | Inputs, selects, textareas, outline buttons, checkboxes |
| Emphasis | 2px `ink` or `coral-600` | Selected template or format option |

---

## 7. Elevation and Shadows

Shadows are **warm-tinted** (Ink at low opacity) so they feel natural on the Paper background. Never use pure-black or blue-gray shadows.

| Token | Value | Use |
|---|---|---|
| `shadow-xs` | `0 1px 2px rgba(20,17,15,0.06)` | Inputs on focus-less state (optional), badges |
| `shadow-sm` | `0 1px 2px rgba(20,17,15,0.06), 0 1px 3px rgba(20,17,15,0.10)` | Cards at rest, buttons (secondary) |
| `shadow-md` | `0 2px 4px -1px rgba(20,17,15,0.06), 0 6px 12px -2px rgba(20,17,15,0.10)` | Card hover, dropdown menus, tooltips |
| `shadow-lg` | `0 4px 6px -2px rgba(20,17,15,0.05), 0 12px 24px -4px rgba(20,17,15,0.12)` | Popovers, toasts, sticky action bars |
| `shadow-xl` | `0 8px 12px -4px rgba(20,17,15,0.06), 0 24px 48px -8px rgba(20,17,15,0.18)` | Dialogs, graphic preview, hero mockups |
| `shadow-inset` | `inset 0 1px 2px rgba(20,17,15,0.08)` | Pressed buttons, read-only link field |
| `shadow-focus` | `0 0 0 2px #FAF7F2, 0 0 0 4px #C93A14` | Keyboard focus ring (see 13.2) |
| `shadow-focus-dark` | `0 0 0 2px #14110F, 0 0 0 4px #F2542D` | Focus ring on Ink surfaces |
| `shadow-brand` | `0 6px 16px -4px rgba(242,84,45,0.45)` | **Marketing only:** landing hero CTA hover |
| `shadow-stamp` | `4px 4px 0 #14110F` | **Marketing only, optional:** offset "stamp" on landing feature cards |

**Elevation levels**

| Level | Surface | Shadow | Border |
|---|---|---|---|
| 0 | Page (Paper) | none | none |
| 1 | Card at rest | `shadow-sm` | 1px `border-subtle` |
| 2 | Card hover, dropdown, tooltip | `shadow-md` | 1px `border-subtle` |
| 3 | Popover, toast, sticky bar | `shadow-lg` | 1px `border-subtle` |
| 4 | Dialog, graphic preview | `shadow-xl` | none |

Rules: flat elements stay flat. Use **one** shadow level per element. Do not stack a border-heavy style and a large shadow on the same card.

---

## 8. Motion

Motion explains change. It is quick, quiet and never blocks the user.

| Token | Duration | Use |
|---|---:|---|
| `instant` | 80ms | Press feedback |
| `fast` | 120ms | Hover color, focus, checkbox |
| `base` | 180ms | Buttons, menus, tooltips, toasts |
| `slow` | 240ms | Dialogs, drawers, accordion height |
| `slower` | 320ms | Page-level and skeleton-to-content fades |

| Easing | Value | Use |
|---|---|---|
| `standard` | `cubic-bezier(0.2, 0, 0, 1)` | Most transitions |
| `enter` | `cubic-bezier(0, 0, 0.2, 1)` | Things appearing |
| `exit` | `cubic-bezier(0.4, 0, 1, 1)` | Things leaving |

**Patterns**

| Interaction | Motion |
|---|---|
| Button hover | Background color change, `fast` |
| Button press | `translateY(1px)`, remove shadow, `instant` |
| Card hover | Border to `border-strong`, `shadow-sm` to `shadow-md`, `base` |
| Dialog open | Fade plus scale from 0.96 to 1, `slow`, overlay fades |
| Mobile sheet | Slide up from bottom, `slow` |
| Toast | Slide up 8px plus fade in, `base` |
| Name-display options appearing | Height and opacity expand, `slow` |
| Copy button | Label swaps to "Copied" with a check, reverts after 2s |
| Graphic preview regenerate | Crossfade old to new, `slower`, with the loader overlay only if generation takes more than 300ms |
| Submit success | Fade the form out, fade the success state in, `slower` |

**Reduced motion:** wrap every animation so `@media (prefers-reduced-motion: reduce)` removes transforms and sets durations to `0.01ms`. Fades may remain at `fast`. Never rely on motion alone to communicate state.

---

## 9. Iconography

- **Library:** Lucide (`lucide-react`). One icon family only.
- **Stroke:** 1.75px (set `strokeWidth={1.75}`), round caps and joins.
- **Sizes:** 16px (inline with small text, badges), **20px (default)**, 24px (nav, empty states), 32px+ (illustration).
- **Color:** icons inherit text color. Active nav icon uses coral.
- **Touch targets:** an icon-only button is at least 40px square (44px on touch devices) even if the icon is 20px.
- **Accessibility:** decorative icons get `aria-hidden="true"`. Icon-only buttons need an `aria-label`.

**Standard icon map**

| Concept | Icon |
|---|---|
| Overview | `LayoutDashboard` |
| Testimonials | `MessageSquareQuote` |
| Settings | `Settings` |
| Copy link | `Copy` (swaps to `Check`) |
| Open link | `ExternalLink` |
| Share | `Share2` |
| Approve | `Check` |
| Reject | `X` |
| Delete | `Trash2` |
| Create graphic | `Sparkles` or `ImagePlus` |
| Download | `Download` |
| Upload | `Upload` |
| Quote mark | `Quote` |
| Back | `ArrowLeft` |
| Menu | `Menu` |
| Logout | `LogOut` |
| Pending / Approved / Rejected | `Clock` / `CheckCircle2` / `XCircle` |
| Consent granted / missing | `ShieldCheck` / `ShieldAlert` |
| Info / Warning / Error | `Info` / `AlertTriangle` / `AlertCircle` |
| Show / hide password | `Eye` / `EyeOff` |

---

## 10. Component Specifications

**Conventions used below**
- "Default" means the resting state.
- All interactive components support: default, hover, active (pressed), focus-visible, disabled, and where relevant loading and error.
- Every value references a token from Sections 3 to 8.
- Build on shadcn/ui primitives and restyle them with these tokens. Do not ship the shadcn defaults unmodified.

### 10.1 Buttons

**Variants**

| Variant | Fill | Label | Border | Hover | Pressed | Use |
|---|---|---|---|---|---|---|
| **Primary** | `coral-500` | `ink` | none | fill `coral-400` | `coral-500`, `translateY(1px)` | **One per view.** The main action. |
| **Secondary** | `ink` | `paper` | none | fill `ink-2` | `ink`, `translateY(1px)` | Strong alternative action |
| **Outline** | `surface` | `ink` | 1.5px `border-strong` | fill `surface-2` | fill `border-subtle` | Cancel, tertiary actions |
| **Ghost** | transparent | `ink` | none | fill `surface-2` | fill `border-subtle` | Toolbar actions, icon buttons |
| **Destructive** | `error` | white | none | `#9A1D14` | darker, `translateY(1px)` | Delete (inside confirm dialogs) |
| **Link** | transparent | `coral-600` | none | `coral-700`, underline | n/a | Inline text actions |

**Sizes**

| Size | Height | Padding X | Text | Icon | Radius |
|---|---:|---:|---|---:|---|
| `sm` | 32px | 12px | `label` | 16px | `radius-md` |
| `md` (default) | 40px (**44px on touch devices**) | 16px | `label` | 20px | `radius-md` |
| `lg` | 48px | 24px | `body` weight 600 | 20px | `radius-md` |

**Rules**
- Primary uses `shadow-xs`. Secondary uses `shadow-sm`. Others have no shadow.
- Icon plus label: 8px gap. Icon sits left except for "next" arrows.
- **Loading:** replace the icon with a 16px spinner, keep the label, set `aria-busy`, disable pointer events, keep the button width fixed so the layout does not jump.
- **Disabled:** fill `surface-2`, label `#A8A096`, no shadow, `cursor: not-allowed`, `aria-disabled`.
- **Full-width** buttons on mobile for the main action of a form (for example, "Submit Testimonial").
- Icon-only buttons: square, same height as the size, `aria-label` required.

### 10.2 Form Field (wrapper)

Anatomy, top to bottom: **Label**, optional **hint**, **control**, **helper or error text**.

| Part | Spec |
|---|---|
| Label | `label` style, Ink, 8px above control. Required fields are not marked with an asterisk alone. Add "(optional)" in `muted` to optional fields instead, because most fields here are optional. |
| Hint | `body-sm`, `muted`, directly under the label |
| Helper text | `body-sm`, `muted`, 6px below control |
| Error text | `body-sm`, `error`, with a 16px `AlertCircle` icon, 6px below control, replaces helper text |
| Spacing between fields | 20px (24px on public form) |

Accessibility: label is a real `<label for>`. Error text is linked with `aria-describedby`. Invalid controls set `aria-invalid="true"`.

### 10.3 Text Input

| Property | Value |
|---|---|
| Height | 44px (48px on the public form) |
| Padding | 12px 14px |
| Font | `body` (16px) |
| Background | `surface` |
| Border | 1.5px `border-strong` |
| Radius | `radius-md` |
| Placeholder | `placeholder` color |
| Hover | Border `ink-3` |
| Focus | Border `ink`, plus `shadow-focus` |
| Error | Border `error` 1.5px, helper replaced by error text |
| Disabled | Fill `surface-2`, text `#A8A096` |
| Read-only | Fill `surface-2`, `shadow-inset`, no hover |
| Success (optional) | Border `success`, trailing `Check` icon |

Variants: leading icon (20px, 14px from left, text padding grows), trailing action (for example, show/hide password).

**Password input:** trailing ghost icon button toggling `Eye` / `EyeOff`, `aria-pressed`, `aria-label="Show password"`.

### 10.4 Textarea (testimonial field)

| Property | Value |
|---|---|
| Min height | 160px mobile, 180px desktop |
| Resize | Vertical only, or auto-grow to a 320px maximum |
| Font | `body` (16px), line-height 24px |
| Counter | Bottom-right inside the field, `caption`, `muted`: "132 / 1000" |
| Counter states | Normal `muted`; from 900 characters: `warning` text (`#8A5200`); at the limit: `error` text |
| Minimum-length hint | Helper text "Please write at least 20 characters." shown after the field is blurred or on submit. Not while the user is first typing. |

Update the counter with `aria-live="polite"` throttled so it is not announced on every keystroke.

### 10.5 Select / Dropdown field

Same visual spec as Text Input with a trailing `ChevronDown` (20px). The popup list is a Popover (Section 10.18): `radius-lg`, `shadow-md`, 4px padding, options 40px tall, selected option has a trailing `Check` and `coral-100` background. Used for business category.

### 10.6 Checkbox

| Property | Value |
|---|---|
| Box | 20px (24px for the consent checkbox), radius 6px |
| Border | 1.5px `border-strong` |
| Checked | Fill `coral-600`, white check mark (2px stroke) |
| Hover | Border `ink` |
| Focus | `shadow-focus` |
| Disabled | `surface-2` fill, `#A8A096` border |
| Hit area | The whole label row, min 44px tall |

### 10.7 Consent Checkbox (special component)

This is a legal-intent control. It must be unmistakable.

- Rendered as a **tile**: 1.5px `border-strong` border, `radius-lg`, padding 16px, background `surface`.
- Layout: 24px checkbox left, text right (`body-sm` 15px/22px).
- The business name inside the sentence is semibold.
- **Unchecked by default. Always.**
- Checked: tile border becomes `coral-600`, background `coral-50`.
- Whole tile is clickable (the label wraps the control).
- Text (exact): *"I give **[Business Name]** permission to use this testimonial in its marketing materials, including social media posts and promotional graphics."*

### 10.8 Radio Group (name display preference)

Rendered as **option tiles**, stacked vertically, 8px apart.

| Property | Value |
|---|---|
| Tile | Full width, min 52px tall, `radius-md`, 1.5px `border-strong`, padding 12px 16px |
| Radio | 20px circle, border 1.5px `border-strong` |
| Selected | Tile border 2px `coral-600`, background `coral-50`; radio shows a 10px `coral-600` dot |
| Options | "Display my full name", "Display my first name only" (default), "Display anonymously" |
| Reveal | The group appears (height and fade) once the name field has text |

Use a `role="radiogroup"` with an accessible name. Arrow keys move between options.

### 10.9 Segmented Control and Filter Tabs

Used for: testimonial filters (All, Pending, Approved, Rejected), and the Format selector.

| Property | Value |
|---|---|
| Container | `surface-2` background, `radius-full`, padding 4px |
| Item | Height 36px (40px on touch), padding X 14px, `label` text, `radius-full` |
| Inactive | Transparent, `muted` text, hover text `ink` |
| Active | `surface` background, `ink` text, `shadow-sm` |
| Counts | Shown after the label: "Pending 3", count in `caption`, `muted` |
| Mobile overflow | Container scrolls horizontally, no wrapping, hidden scrollbar, edge fade |

Implemented as `role="tablist"` (filters) or a radiogroup (format). Arrow-key navigation.

### 10.10 Color Picker (`BrandColorPicker`)

One control per color: Primary (required), Secondary, Accent.

| Part | Spec |
|---|---|
| Swatch button | 44px square, `radius-md`, color fill, 1px inner border `rgba(20,17,15,0.2)` so white and pale colors stay visible |
| Hex field | Mono text input, 96px wide, uppercase, validates `#RRGGBB` (also accept 3-digit and expand) |
| Native picker | A visually hidden `<input type="color">` opened by the swatch |
| Presets | A row of 8 suggested colors (36px circles) including the Postproof defaults |
| Contrast hint | Live chip beside the control: a small tile in the chosen color with the sample word "Aa" in the auto-selected text color, and text such as "Text on this color: Dark" |
| Error | "Enter a valid color, like #F2542D" |

### 10.11 Logo Uploader (`LogoUploader`)

| State | Look |
|---|---|
| Empty | Dashed 1.5px `border-strong` box, `radius-lg`, min height 128px, `Upload` icon 24px, text "Drop your logo here or **browse**", caption "PNG, JPG or WebP. Max 2 MB." |
| Drag over | Border solid `coral-500`, background `coral-50` |
| Uploading | Determinate progress bar (4px, `coral-500` on `surface-2`) with filename |
| Uploaded | 80px logo tile (white background, 1px border, `radius-md`, image contained with 8px padding) plus filename, size, and **Replace** and **Remove** buttons (Outline, `sm`) |
| Error | Border `error`, error text: "That file is too large. Please choose an image under 2 MB." or "Please choose a PNG, JPG or WebP image." |

Preview is shown **before** saving. The whole empty box is a button reachable by keyboard.

### 10.12 Cards

**Base card**

| Property | Value |
|---|---|
| Background | `surface` |
| Border | 1px `border-subtle` |
| Radius | `radius-lg` (14px) |
| Padding | 20px (24px on `lg`) |
| Shadow | `shadow-sm` |
| Interactive hover | Border `border-strong`, `shadow-md`, `base` motion |
| Interactive focus | `shadow-focus` |

**Stat card**
- Overline label (`overline`, `muted`), then the value in `stat` style, then optional icon in a 40px `coral-100` circle (icon `coral-700`).
- One of the four cards (Total) may be highlighted with an Ink background and Paper text for emphasis. Otherwise all are `surface`.

**Testimonial card (`TestimonialCard`)**

```text
┌──────────────────────────────────────────────┐
│ Jane D.                         Nov 4, 2026  │  name: h4 · date: body-sm muted
│                                               │
│ “I had a great experience working with…”     │  excerpt: body, 3-line clamp
│                                               │
│ [● Pending]  [🛡 Permission granted]       ›  │  badges + chevron
└──────────────────────────────────────────────┘
```

- Whole card is one link to the detail page.
- Excerpt: `line-clamp-3`, Ink.
- Pending cards show a 6px `coral-500` dot before the name ("new") until opened.
- Missing name shows "Anonymous" in `muted` italic-free text.

**Testimonial link card (`TestimonialLinkCard`)**
- Container: `coral-50` background, 1px `coral-200` border, `radius-lg`, padding 20px.
- Title (`h4`): "Your testimonial link".
- Read-only mono field with `shadow-inset`, the URL truncated in the middle on small screens.
- Action row: **Copy link** (Primary), **Open** (Outline), **Share** (Outline, shown only where `navigator.share` exists).
- Copy: label changes to "Copied" with `Check` for 2 seconds. Announce through an `aria-live="polite"` region.

### 10.13 Badges and Status Pills

| Property | Value |
|---|---|
| Height | 24px |
| Padding | 0 10px |
| Radius | `radius-full` |
| Text | `caption` 12px weight 600 |
| Icon | 14px, 4px gap |
| Colors | See 3.4 status mapping |

Variants: filled tint (status) and outline (consent). Both always contain an icon and a text label.

### 10.14 Alerts and Inline Messages

| Property | Value |
|---|---|
| Layout | Icon (20px) left, title (optional, semibold) and text right |
| Padding | 14px 16px |
| Radius | `radius-lg` |
| Border | 1px in the semantic color at 30% opacity (use the tint border) |
| Background | Semantic tint |
| Text | Semantic text color for the title, Ink for the body |

Variants: Info, Success, Warning, Error. Error alerts use `role="alert"`; others `role="status"`.

**Required alert: missing marketing permission**
Warning variant, shown on the testimonial detail and design pages: *"Marketing permission is required before this testimonial can be turned into a public graphic."* The **Create Graphic** button is disabled beside it (`aria-disabled`, with `aria-describedby` pointing to this alert). The explanation is visible text, never a tooltip alone.

### 10.15 Toasts

| Property | Value |
|---|---|
| Position | Bottom-center on mobile (16px above bottom nav), bottom-right on desktop (24px from edges) |
| Width | Up to 380px, full width minus 32px on mobile |
| Style | `ink` background, `paper` text, `radius-lg`, `shadow-lg`, padding 14px 16px |
| Icon | 20px, `paper` colored, always with a text message. Success uses `CheckCircle2`, Error uses `AlertCircle`. Never rely on color alone. |
| Duration | 4s (6s with an action), pause on hover or focus |
| Behavior | Max 3 stacked, `role="status"` (errors `role="alert"`), dismissible with a close button |

Use for: link copied, changes saved, testimonial approved or deleted, graphic ready.

### 10.16 Dialog (modal)

| Property | Value |
|---|---|
| Overlay | `rgba(20,17,15,0.5)` |
| Panel | `surface`, `radius-xl` (20px), `shadow-xl`, padding 24px, max-width 440px |
| Header | `h3` title, `body` `muted` description |
| Footer | Buttons right-aligned, 12px gap. On mobile: stacked full-width, primary action on top |
| Close | Top-right ghost icon button, `Esc` also closes |
| Mobile | Renders as a **bottom sheet**: full width, top corners 20px, slides up |
| Accessibility | Focus is trapped, initial focus on the least destructive control, focus returns to the trigger on close |

**Delete confirmation:** title "Delete this testimonial?", description "This permanently removes it and any graphics made from it. This can't be undone.", actions **Cancel** (Outline) and **Delete** (Destructive).

### 10.17 Dropdown Menu

Panel: `surface`, `radius-lg`, 1px `border-subtle`, `shadow-md`, padding 4px, min width 200px. Items: 40px tall, 12px horizontal padding, `radius-md`, icon 16px plus `body-sm` label. Hover/focus: `surface-2`. Destructive items use `error` text. Dividers 1px `border-subtle`, 4px vertical margin. Used for the account menu and mobile card overflow actions.

### 10.18 Tooltip and Popover

- **Tooltip:** `ink` background, `paper` text, `caption`, padding 6px 10px, `radius-md`, `shadow-md`, 400ms open delay, appears on hover **and** keyboard focus. Never put essential information only in a tooltip.
- **Popover:** `surface`, `radius-lg`, 1px `border-subtle`, `shadow-lg`, padding 16px.

### 10.19 Navigation

**Sidebar (`Sidebar`, lg and up)**

| Part | Spec |
|---|---|
| Container | 264px, `ink` background, padding 16px, flex column |
| Business identity | Top block: 40px logo tile (rounded 10px, white bg) plus business name (`h4`, `paper`, truncated) and a small "View public page" link (`caption`, `on-ink-muted`, underline on hover) |
| Nav items | Overview, Testimonials, Settings. Height 44px, padding 0 12px, `radius-md`, 20px icon, `label` text, 12px gap |
| Item inactive | `on-ink-muted` text, hover bg `ink-2` and text `paper` |
| Item active | bg `ink-2`, text `paper`, icon `coral-500`, a 3px `coral-500` bar on the left edge |
| Counts | A pending count pill on Testimonials: `coral-500` bg, `ink` text, `caption` |
| Footer | Logout item pinned to the bottom, same item style |
| Focus | `shadow-focus-dark` |

**Bottom navigation (`MobileNavigation`, below lg)**
- Fixed, 64px plus `env(safe-area-inset-bottom)`, `surface` background, 1px top border.
- Three equal items, each 44px or taller touch target: 24px icon above a `caption` label.
- Active: icon and label `coral-600`, plus a 3px `coral-500` bar on top of the item. Inactive: `muted`.
- Pending count shown as a 16px dot badge on the Testimonials icon.

**Top header (`DashboardHeader`)**
- 64px, `paper`. Left: page title (`h2`, on mobile `h3`) and optional breadcrumb or back link. Right: contextual actions and the account menu (avatar button, 40px).
- Below lg the header also shows the Postproof logo mark on the left.

**Back link:** `ArrowLeft` 16px plus "Testimonials", `label`, `muted`, hover `ink`. Placed above the page title on detail pages.

**Pagination:** Previous and Next as Outline `sm` buttons, "Page 2 of 5" in `body-sm` `muted` between them. Disabled at the ends. Provide `nav aria-label="Pagination"`.

### 10.20 Avatars and Logo Tiles

| Type | Spec |
|---|---|
| Business logo tile | Rounded square, `radius-md`, white background, 1px `border-subtle`, image `object-contain` with 15% padding. Sizes 32, 40, 56, 80. |
| Business monogram fallback | Same tile, `coral-100` background, first letter in `coral-700`, Display font 700 |
| Customer initials | Circle, `surface-2` background, `ink-3` text, `label` weight 600 |
| Account avatar | 40px circle, `ink` background, `paper` initials |

### 10.21 Loading, Skeleton and Progress

- **Skeleton:** `surface-2` blocks with `radius-md`, a subtle left-to-right shimmer (`surface-2` to `#F7F3EC`, 1.4s). Shapes mirror the final layout (stat cards, testimonial cards, form fields). With reduced motion: static blocks.
- **Spinner:** 16 or 20px, 2px stroke, current color with 25% opacity track. Used inside buttons.
- **Graphic generation loader:** overlays the preview frame with a `paper` 70% scrim, a 32px spinner and the text "Creating your graphic..." (`aria-live="polite"`).
- **Page transitions:** use skeletons, not blank pages and not full-screen spinners.

### 10.22 Empty States

| Part | Spec |
|---|---|
| Icon | 56px circle, `coral-100` background, 28px icon `coral-700` |
| Title | `h3`, centered |
| Body | `body`, `muted`, max 40ch, centered |
| Action | One Primary button |
| Container | Centered, min height 320px, optional dashed 1.5px `border-subtle` outline, `radius-xl` |

Required copy: **Testimonials list:** "No testimonials yet." / "Share your unique link with customers to start collecting feedback." plus a **Copy link** button.
**Filter with no results:** "Nothing here." / "No testimonials match this filter."

### 10.23 Template and Format Selectors (graphic generator)

**Template selector (`TemplateSelector`)**
- Three option cards in a row, each showing a **live thumbnail** of that template using the business's real branding and the real testimonial.
- Card: `radius-lg`, 1.5px `border-subtle`, padding 8px, label below (`label`): "Minimal", "Bold", "Editorial".
- Selected: 2px `coral-600` border, a 20px `coral-600` circle with white check at the top-right, label semibold.
- Role: `radiogroup`; arrow keys move selection.

**Format selector (`FormatSelector`)**
- Segmented control (10.9) with three options. Each shows a small aspect-ratio glyph (outline rectangle: 4:5, 1:1, 9:16) plus the name and size on larger screens: "Portrait 1080 × 1350", "Square 1080 × 1080", "Story 1080 × 1920". On mobile show only the glyph and name.
- Default: Portrait.

### 10.24 Graphic Preview (`GraphicPreview`)

| Part | Spec |
|---|---|
| Stage | A `surface-2` panel, `radius-xl`, padding 24px (16px mobile), centers the preview |
| Preview frame | The image scaled to fit (`max-height: 70vh`, `max-width: 100%`), `radius-md` clip, `shadow-xl` |
| Scaling | Visual scaling only. The exported file is always at true 1080 px dimensions. |
| Caption | Below the frame: "1080 × 1350 px · PNG" in `caption`, `muted` |
| Loading | Overlay loader (10.21) |
| Error | Error alert replaces the stage content, with a Retry button. Includes the "text too long" validation message and a suggestion to try another format |
| Download | `GraphicDownloadButton`: Primary `lg`, `Download` icon, "Download PNG". Sticky at the bottom on mobile (`shadow-lg`, safe-area padding) |
| Success | Toast: "Your testimonial graphic is ready." |

### 10.25 Detail View (`TestimonialDetail`)

- Desktop: two columns. Left (flexible): the testimonial in a card, text in `h3`-size Display font with a 48px `coral-500` quote glyph above. Right (320px): a metadata panel (card) listing Customer name, Display preference, Submitted date, Marketing permission (badge), Status (badge).
- Actions (`TestimonialApprovalActions`): **Approve** (Primary), **Reject** (Outline), **Delete** (Ghost with `error` text, opens dialog). After approval with consent, a Success alert: "Your testimonial is ready to become a social graphic." and a **Create Graphic** Primary button.
- Mobile: single column; the action bar sticks to the bottom (`surface`, top border, `shadow-lg`, safe-area padding).

### 10.26 Public Submission Page Components

| Component | Spec |
|---|---|
| Page background | `paper`; a 6px top bar in the business primary color |
| Header | Centered: 72px logo tile (or monogram), business name (`h2`), heading "We'd love to hear about your experience." (`display-lg` scaled to 28px mobile), supporting line (`body-lg`, `muted`, `max-w-prose`) |
| Form card | `surface`, `radius-xl`, `shadow-md`, padding 24px (20px mobile), max-width 560px |
| Fields | Stacked: testimonial textarea, name input, name display tiles (revealed), consent tile |
| Submit | Full-width Button `lg`, fill = business primary with auto text color (12.2), label "Submit Testimonial" |
| States | Idle, Submitting (button loading, fields read-only), Success, Validation error (inline, focus moves to the first invalid field), Network error (Error alert above the button with Retry), Rate limited (Warning alert: "You've submitted a few times in a row. Please try again in a bit.") |
| Honeypot | A visually hidden, `tabindex="-1"`, `aria-hidden` field, positioned off-screen (never `display:none`) |
| Success | Replaces the form with a centered block: 64px circle (`success` tint) with a check, "Thank you for sharing your experience!" (`h1`), "Your feedback has been sent to the business." (`body-lg`, `muted`). No reload. |
| Footer | Optional "Powered by Postproof" text link, `caption`, `muted` |

Mobile-first: single column, side padding 16px, inputs 48px tall, the submit button reachable without scrolling past the keyboard (use `scroll-margin` and avoid fixed bottom bars that collide with the keyboard).

### 10.27 Onboarding Stepper

- A 3-step flow: **1 Business** (name, description, category, social handle), **2 Brand** (logo, colors), **3 Your link** (link card and "Go to dashboard").
- Progress indicator: three segments (4px high, `radius-full`) across the top, completed `coral-500`, current `coral-500` with step label, upcoming `border-subtle`. Text "Step 2 of 3" in `caption`.
- Layout: form column (max 520px) on the left, and on `lg` a sticky **live preview panel** on the right showing a sample graphic that updates with the chosen logo and colors. On mobile the preview collapses into an expandable "Preview" card under the form.
- Buttons: **Back** (Ghost) and **Continue** (Primary). The final action is "Go to dashboard".
- Steps are not locked once complete. Optional fields never block progress.

### 10.28 Landing Page Components

| Section | Spec |
|---|---|
| Nav | 72px, `paper`, logo left, links center ("How it works", "Benefits"), "Log in" (Ghost) and "Get Started" (Primary `md`) right. Mobile: logo plus a menu button opening a sheet. |
| Hero | Two columns on `lg`: left text, right composed visual. Headline `display-xl` "Turn customer love into beautiful social proof." Subtext `body-lg` `muted`, max 52ch. CTAs: "Get Started" (Primary `lg`), "See How It Works" (Outline `lg`). Visual: a form card on the left transitions via a curved arrow to a generated graphic (tilted 3 degrees, `shadow-xl`) |
| How it works | Three cards in a row. Each has a large numeral (Display 64px, `coral-500`), `h3` title, `body` text. Titles: Create your link, Collect testimonials, Create and share. |
| Benefits | 5 items in a 2 or 3 column grid, each with a 40px `coral-100` icon circle, `h4` and one line of `muted` text |
| Final CTA | Full-width `ink` band, `radius-2xl` inset on desktop, headline in `paper` Display, "Start collecting testimonials today." and a Primary button |
| Footer | Minimal: logo, links, copyright. `muted` on `paper` with a top border |

Section vertical spacing: 96px desktop, 64px mobile. Keep the page simple. It is secondary to the app.

### 10.29 Auth Pages

- `AuthLayout`: on `lg` a split view. Left: form (max-width 440px, vertically centered). Right: a `coral-50` panel with a sample graphic and a short line ("Proof worth posting."). On mobile, only the form with the logo above.
- Form card has no heavy border on desktop (sits on `paper`). Inputs 48px.
- Primary button full width. Secondary links ("Forgot password?", "Create an account") are Link style, aligned and 44px tall.
- Errors: a top-of-form Error alert for server errors (for example, "Incorrect email or password."), inline errors for field validation.

### 10.30 Error and Not-Found Pages

- **Public not-found (invalid slug):** centered, a 56px `coral-100` icon circle, `h1` "We couldn't find that page.", `body` `muted` "The link may be wrong or no longer active.", an Outline button "Go to Postproof".
- **Dashboard error boundary:** Error alert plus a Retry button. Never show raw error text.
- **Forbidden or not found for owner resources:** same pattern with a "Back to testimonials" button.

### 10.31 Tables (not used)

The MVP does not use data tables. Lists are cards. If a table is added later: header `overline`, 48px rows, 1px `border-subtle` row dividers, hover `surface-2`.

---

## 11. Page and Layout Patterns

| Page | Layout |
|---|---|
| `/` Landing | Full-width sections inside a 1200px container |
| `/signup`, `/login`, `/forgot-password` | `AuthLayout` (split on `lg`) |
| `/onboarding` | Stepper layout (10.27), no sidebar |
| `/dashboard` | Dashboard shell. Greeting (`h1`, "Welcome back."), subtext "Here's what's happening with your testimonials.", link card, then 4 stat cards, then a "Recent testimonials" list (latest 3) with a "View all" link |
| `/dashboard/testimonials` | Shell. Header, filter tabs, list of cards, pagination, empty state |
| `/dashboard/testimonials/[id]` | Shell. Back link, detail view (10.25) |
| `/dashboard/testimonials/[id]/design` | Shell. Heading "Turn this feedback into something worth sharing." On `lg`: preview stage (flexible) plus a 360px controls panel containing the Template selector, Format selector and Download button. On mobile: preview first, then controls, with a sticky download bar |
| `/dashboard/settings` | Shell. Sections as cards: Business details, Branding (logo and three color pickers with a live preview), Testimonial link. A single sticky "Save changes" bar appears only when the form is dirty |
| `/t/[slug]` | Public form (10.26) |

**Page header pattern:** `h1` title, optional one-line description in `muted`, actions on the right (wrap below on mobile). Spacing: 24px below the header.

---

## 12. Graphic Template Design

The generated PNG is the product's most important surface. It follows its own rules.

### 12.1 Canvas, safe area and scale

| Format | Canvas | Safe margin (left and right) | Extra top and bottom |
|---|---|---:|---|
| Portrait | 1080 × 1350 | 96px | 96px |
| Square | 1080 × 1080 | 88px | 88px |
| Story | 1080 × 1920 | 96px | **About 250px each** to stay clear of platform interface overlays (a commonly used guideline, not an official figure) |

All sizes below are in canvas pixels, not screen pixels. A 1080px canvas viewed on a phone is scaled to roughly a third, so **text must be large**.

### 12.2 Automatic text color

Business brand colors are unpredictable. Never hardcode text color on a brand color. Compute it.

1. Compute the WCAG relative luminance `L` of the background color.
2. Contrast with Ink `#14110F`: `(L + 0.05) / 0.0560`. Contrast with white: `1.05 / (L + 0.05)`.
3. Pick whichever has the higher contrast. Require **at least 4.5:1**.
4. Roughly: backgrounds with `L` above about 0.20 get Ink text, and `L` below about 0.18 get white text.
5. If neither reaches 4.5:1 (mid-tone colors in the narrow band between), **darken the background** by mixing 15% Ink into it and recheck, repeating until white text passes.
6. The same function drives: Bold template text, the public submit button label, color-picker preview chips, monogram fallbacks and any text placed on a brand color.

Accent color is **never** used for body text. It is for rules, quote marks and small decorations, and only if it has 3:1 against its background. Otherwise fall back to the primary or Ink.

### 12.3 Text fitting (shared by all templates)

SVG does not wrap text automatically. The renderer must:

- Measure text with the **real font metrics**, not character-count guesses.
- Wrap by words inside the content box. Never break a word unless it is longer than the line (then hard-break with a hyphen-free split).
- Start at the template's maximum quote size and step down until it fits, with a hard minimum.
- Use a line-height of 1.3 to 1.4 depending on the template.
- If it does not fit at the minimum size, return a validation error: "This testimonial is too long for this format. Try the Story format or a different template." **Never truncate, shrink below the minimum or clip.**

| Template | Quote font | Max size | Min size | Step | Line height |
|---|---|---:|---:|---:|---:|
| Minimal | DM Sans Medium | 68px | 34px | 2px | 1.35 |
| Bold | Bricolage Grotesque Bold | 72px | 36px | 2px | 1.25 |
| Editorial | Playfair Display Regular | 64px | 32px | 2px | 1.4 |

**Capacity (estimates only).** Rough characters that fit at the minimum size, with typical text: Portrait about 750 to 900, Square about 500 to 600, Story about 900 to 1,000. Validate against real font metrics. Because the product allows testimonials up to 1,000 characters, **some very long testimonials will not fit Square**. This is expected. Show the validation message instead of cramming.

### 12.4 Shared elements

| Element | Spec |
|---|---|
| Logo | Fitted into a box of 180 × 72px (Story: 200 × 80px), centered vertically with the business name. No logo: a monogram tile 64px, `radius 14`, primary color fill with auto text color |
| Business name | 28px, weight 600 (Editorial: DM Sans 600, 22px, uppercase, tracking 0.12em) |
| Social handle | 24px, weight 500, 70% opacity of the text color. Include "@" if missing |
| Customer name | 32px, weight 600, preceded by an em dash. Omit entirely when anonymous or empty. Never print "Anonymous" |
| Quote mark | A vector path (not a font glyph) so it renders identically everywhere |
| Footer zone | Bottom of the safe area, a flex row: logo plus name left, handle right. Maximum 120px tall |
| Escaping | Every user string is XML-escaped before entering the SVG |

### 12.5 Template 1: Minimal

**Mood:** clean, airy, confident.

| Property | Spec |
|---|---|
| Background | `#FFFFFF` |
| Text | Ink `#14110F` |
| Quote mark | 96px vector quote in the **primary color** (3:1 minimum against white. If it fails, use Ink at 20% opacity), placed top-left of the text block |
| Accent | A 8px × 72px bar in primary at the top-left of the safe area |
| Layout | Text block left-aligned, vertically centered in the area above the footer. Generous whitespace: at least 120px between the quote text and the footer |
| Footer | Hairline 2px rule at 12% Ink, then logo and name left, handle right |
| Feel | Big type, one accent, nothing else |

### 12.6 Template 2: Bold

**Mood:** loud, scroll-stopping, brand-forward.

| Property | Spec |
|---|---|
| Background | **Primary color**, full bleed |
| Text on background | Auto color (12.2) |
| Content panel | A rounded rectangle (radius 40px), fill `#FFFFFF`, inset 64px from the edges, containing the quote in Ink. If the primary is near-white, use Ink as the panel fill with white text |
| Quote mark | A very large (about 240px) vector quote mark in the **accent** (or secondary, if no accent) overlapping the top-left corner of the panel, partly outside it |
| Footer | On the primary background below the panel, auto-colored logo, name and handle |
| Shadow | A hard offset shadow behind the panel: `12px 12px 0` in Ink at 90% (or in secondary), echoing the marketing "stamp" |
| Feel | Poster-like. Heavy weight, tight leading, one big panel |

### 12.7 Template 3: Editorial

**Mood:** refined, magazine-like, trustworthy.

| Property | Spec |
|---|---|
| Background | Warm neutral `#F4EFE6` (fixed, never the brand color) |
| Text | Ink `#14110F` |
| Quote mark | A large opening typographic quote (160px) in the **primary color**, top-left, serif |
| Accent | A 2px × 96px rule in primary above the customer name |
| Layout | Left-aligned serif text, with the customer name set below it in small caps style (DM Sans 600, uppercase, tracking 0.12em) |
| Footer | A thin 1px Ink 20% divider, then the business name uppercase with tracking, handle right, logo small (48px tall) |
| Feel | Quiet, elegant, all focus on the words |

### 12.8 Visual QA matrix

Test every combination before shipping: 3 templates × 3 formats × {short text, near-limit text} × {logo, no logo} × {named, first name, anonymous} × {light, dark, mid-tone primary}. Open the actual PNG files and confirm: no overflow, no clipping, text color passes 4.5:1, the quote mark and accent are visible, dimensions are exact, and fonts render (check on the **deployed** environment, not just locally).

---

## 13. Accessibility

Target: **WCAG 2.2 Level AA**.

### 13.1 Requirements summary

| Area | Requirement |
|---|---|
| Text contrast | 4.5:1 normal text, 3:1 large text (24px regular or 19px bold and up) |
| Non-text contrast | 3:1 for UI component boundaries, icons that convey meaning, and focus indicators |
| Target size | Interactive targets at least **24 × 24 CSS px** (WCAG 2.2 AA). This system uses **44px** as the working minimum on touch devices. |
| Focus | Visible on every interactive element, at least 2px thick, 3:1 against its surroundings, never hidden behind sticky headers |
| Keyboard | Everything operable by keyboard with a logical order |
| Color | Never the only way to convey meaning |
| Zoom | Usable at 200% text zoom and at a 320px viewport with no horizontal scrolling |
| Motion | Respect `prefers-reduced-motion` |

### 13.2 Focus ring

- Use `:focus-visible` so mouse clicks do not show rings but keyboard users always do.
- Light surfaces: `shadow-focus` = 2px Paper gap plus **2px `coral-600` ring** (4.79 to 5.12:1).
- Ink surfaces (sidebar): `shadow-focus-dark` = 2px Ink gap plus 2px `coral-500` ring (5.45:1).
- On the public page, the ring uses the business primary only when it meets 3:1, otherwise Ink.
- Do not remove outlines without providing this replacement.

### 13.3 Forms

- Every control has a visible label. Placeholder text is never the label.
- Errors: show inline next to the field, link with `aria-describedby`, set `aria-invalid`. On submit, move focus to the first invalid field and announce the count of errors in a top summary for long forms.
- Required and optional state is stated in text.
- Autocomplete attributes where applicable (`email`, `current-password`, `new-password`, `name`).
- Buttons that submit show a loading state and prevent double submission.

### 13.4 Semantics and patterns

| Pattern | Requirement |
|---|---|
| Landmarks | `header`, `nav`, `main`, `footer`. One `h1` per page. Heading levels do not skip. |
| Skip link | "Skip to main content" as the first focusable element in the dashboard |
| Dialog | `role="dialog"`, `aria-modal`, labelled and described, focus trap, `Esc` closes, focus returns |
| Tabs and radiogroups | Arrow keys move, only the active item is in the tab order |
| Toasts and status | Polite live regions for success, assertive for errors |
| Images | Logos have `alt="[Business name] logo"`. Decorative images use `alt=""`. The generated graphic preview has `alt` text containing the testimonial text |
| Links vs buttons | Links navigate, buttons act. Do not use a `div` for either |

### 13.5 Testing checklist

- [ ] Tab through every page: order is logical, nothing is skipped, nothing is trapped
- [ ] Every interactive element shows a visible focus ring
- [ ] All text and control borders pass the ratios in 3.5
- [ ] Works at 320px width and 200% zoom
- [ ] Status and validation never rely on color alone
- [ ] Screen reader test on the public form and the approve-and-download flow
- [ ] Run an automated scan (axe or Lighthouse) on every route
- [ ] `prefers-reduced-motion` removes movement

---

## 14. Content and Microcopy

**Principles:** plain words, short sentences, active voice, sentence case. Say what happened and what to do next. No blame, no jargon, no exclamation marks except on genuine success moments.

### 14.1 Standard copy

| Moment | Copy |
|---|---|
| Dashboard greeting | "Welcome back." / "Here's what's happening with your testimonials." |
| Empty testimonials | "No testimonials yet." / "Share your unique link with customers to start collecting feedback." |
| New testimonial | "New testimonial received." |
| Approved with consent | "Your testimonial is ready to become a social graphic." |
| Missing consent | "Marketing permission is required before this testimonial can be turned into a public graphic." |
| Graphic page heading | "Turn this feedback into something worth sharing." |
| Download button | "Download PNG" |
| Download success | "Your testimonial graphic is ready." |
| Public form heading | "We'd love to hear about your experience." |
| Public form success | "Thank you for sharing your experience!" / "Your feedback has been sent to the business." |
| Link copied | "Link copied." |
| Saved | "Changes saved." |
| Deleted | "Testimonial deleted." |

### 14.2 Errors

| Situation | Copy |
|---|---|
| Testimonial too short | "Please write at least 20 characters." |
| Testimonial too long | "Please keep it under 1,000 characters." |
| Name too long | "Names can be up to 80 characters." |
| Invalid color | "Enter a valid color, like #F2542D." |
| Logo too large | "That file is too large. Please choose an image under 2 MB." |
| Logo wrong type | "Please choose a PNG, JPG or WebP image." |
| Network error | "We couldn't send that. Check your connection and try again." |
| Rate limited | "You've submitted a few times in a row. Please try again in a bit." |
| Text too long for graphic | "This testimonial is too long for this format. Try the Story format or a different template." |
| Invalid link | "We couldn't find that page. The link may be wrong or no longer active." |
| Generic server error | "Something went wrong on our side. Please try again." |
| Wrong credentials | "Incorrect email or password." |

### 14.3 Buttons and labels

Use verbs and be specific: "Create graphic", "Copy link", "Approve", "Reject", "Delete testimonial", "Save changes", "Submit Testimonial", "Continue", "Go to dashboard". Avoid "Submit", "OK" and "Click here" on their own.

### 14.4 Numbers and dates

Dates: "Nov 4, 2026" (short month). Relative time only for under 7 days ("2 days ago"). Counts use tabular numerals. Filenames: `{slug}-testimonial-YYYY-MM-DD.png`.

---

## 15. Implementation: Tokens and Setup

### 15.1 Fonts (`app/layout.tsx`)

```tsx
import { Bricolage_Grotesque, DM_Sans, JetBrains_Mono } from "next/font/google";

const display = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-display", display: "swap" });
const sans    = DM_Sans({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const mono    = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

// <html className={`${display.variable} ${sans.variable} ${mono.variable}`}>
```

### 15.2 Design tokens (`globals.css`)

Variable names follow shadcn/ui conventions so its components pick up the theme automatically. Verify the Tailwind and shadcn setup instructions for the versions you install, because the exact syntax for registering theme tokens changes between releases.

```css
:root {
  /* shadcn/ui semantic tokens */
  --background: #FAF7F2;
  --foreground: #14110F;
  --card: #FFFFFF;
  --card-foreground: #14110F;
  --popover: #FFFFFF;
  --popover-foreground: #14110F;
  --primary: #F2542D;
  --primary-foreground: #14110F;       /* Ink on coral: 5.45:1. Never white. */
  --secondary: #14110F;
  --secondary-foreground: #FAF7F2;
  --muted: #F1ECE3;
  --muted-foreground: #6B645C;
  --accent: #FFE8DF;
  --accent-foreground: #B02F0B;
  --destructive: #B42318;
  --destructive-foreground: #FFFFFF;
  --border: #E7E1D8;
  --input: #8C847A;
  --ring: #C93A14;
  --radius: 0.625rem;                   /* 10px: radius-md */

  /* Postproof extended tokens */
  --coral-50: #FFF3EE;  --coral-100: #FFE8DF; --coral-200: #FFD0BE;
  --coral-300: #FF8A68; --coral-400: #FF6B47; --coral-500: #F2542D;
  --coral-600: #C93A14; --coral-700: #B02F0B; --coral-800: #8A2409; --coral-900: #5C1806;

  --ink: #14110F; --ink-2: #26211D; --ink-3: #3A342E;
  --paper: #FAF7F2; --surface: #FFFFFF; --surface-2: #F1ECE3;
  --border-subtle: #E7E1D8; --border-strong: #8C847A;
  --text-muted: #6B645C; --placeholder: #7A736A; --on-ink-muted: #A8A096;

  --success: #157A52;  --success-tint: #E4F5EC;
  --warning: #8A5200;  --warning-fill: #F5A623; --warning-tint: #FFF1D6;
  --error: #B42318;    --error-tint: #FDE7E4;
  --info: #1D4ED8;     --info-tint: #E8F0FE;

  /* Radius */
  --radius-xs: 4px; --radius-sm: 6px; --radius-md: 10px; --radius-lg: 14px;
  --radius-xl: 20px; --radius-2xl: 28px;

  /* Shadows (warm, Ink-tinted) */
  --shadow-xs: 0 1px 2px rgba(20,17,15,0.06);
  --shadow-sm: 0 1px 2px rgba(20,17,15,0.06), 0 1px 3px rgba(20,17,15,0.10);
  --shadow-md: 0 2px 4px -1px rgba(20,17,15,0.06), 0 6px 12px -2px rgba(20,17,15,0.10);
  --shadow-lg: 0 4px 6px -2px rgba(20,17,15,0.05), 0 12px 24px -4px rgba(20,17,15,0.12);
  --shadow-xl: 0 8px 12px -4px rgba(20,17,15,0.06), 0 24px 48px -8px rgba(20,17,15,0.18);
  --shadow-inset: inset 0 1px 2px rgba(20,17,15,0.08);
  --shadow-focus: 0 0 0 2px #FAF7F2, 0 0 0 4px #C93A14;
  --shadow-focus-dark: 0 0 0 2px #14110F, 0 0 0 4px #F2542D;
  --shadow-brand: 0 6px 16px -4px rgba(242,84,45,0.45);
  --shadow-stamp: 4px 4px 0 #14110F;

  /* Motion */
  --ease-standard: cubic-bezier(0.2, 0, 0, 1);
  --ease-enter: cubic-bezier(0, 0, 0.2, 1);
  --ease-exit: cubic-bezier(0.4, 0, 1, 1);
  --dur-instant: 80ms; --dur-fast: 120ms; --dur-base: 180ms;
  --dur-slow: 240ms;  --dur-slower: 320ms;
}

html { background: var(--background); color: var(--foreground); font-family: var(--font-sans); }
h1, h2, h3, .font-display { font-family: var(--font-display); text-wrap: balance; }
p { text-wrap: pretty; }

:focus-visible { outline: none; box-shadow: var(--shadow-focus); }
.on-ink :focus-visible { box-shadow: var(--shadow-focus-dark); }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; scroll-behavior: auto !important; }
}
```

Map these variables into the Tailwind theme (colors `coral`, `ink`, `paper`, `surface`, radius, shadows, fonts) using the method that matches the installed Tailwind version, so utilities like `bg-coral-500`, `shadow-md` and `font-display` work.

### 15.3 Graphic renderer tokens

Keep template constants in code, not CSS. Put them in `lib/graphics/tokens.ts`: canvas sizes, safe margins, font files and size ranges (12.3), the text-color function (12.2), default brand colors (3.7), and the Editorial background `#F4EFE6`.

---

## 16. Do and Don't

| Do | Don't |
|---|---|
| Use Coral 500 with **Ink** text on buttons | Put white text on Coral 500 |
| Use one Primary button per view | Make every button coral |
| Use `border-strong` on inputs | Use `border-subtle` on inputs (fails 3:1) |
| Pair every status color with an icon and a label | Communicate status by color alone |
| Keep red for errors and destructive actions | Use red or coral-red for "Rejected" or brand accents next to delete |
| Use warm, Ink-tinted shadows, one level per element | Use black or blue-gray shadows, or stack heavy shadows and heavy borders |
| Make inputs 16px+ and tap targets 44px on mobile | Use 14px inputs (iOS zoom) or tiny icon buttons |
| Compute text color on brand colors | Hardcode white or black text on a user's color |
| Show loading skeletons that match the final layout | Show blank pages or full-screen spinners |
| Show disabled-state reasons as visible text | Hide the reason in a tooltip only |
| Write copy in sentence case, plain words | Use Title Case, jargon, or blame ("You entered an invalid...") |
| Reveal the business brand only in the public accents and graphics | Recolor the whole dashboard with the user's brand |
| Use static font files for graphic rendering | Depend on system fonts or variable fonts on the server |
| Test PNGs on the deployed environment | Assume local rendering matches production |

---

## 17. Component Checklist for the Coding Agent

Build the shared primitives first, then composite components, then pages. Every component must implement all its states and meet Section 13.

**Primitives**
- [ ] Button (6 variants, 3 sizes, loading, disabled, icon-only)
- [ ] Text input, password input, textarea with counter, select
- [ ] Checkbox, consent checkbox tile, radio option tiles
- [ ] Segmented control and filter tabs
- [ ] Form field wrapper (label, hint, helper, error)
- [ ] Badge and status pill
- [ ] Alert (4 variants)
- [ ] Toast system
- [ ] Dialog and mobile bottom sheet
- [ ] Dropdown menu, tooltip, popover
- [ ] Avatar and logo tile with monogram fallback
- [ ] Skeleton, spinner, progress bar
- [ ] Card (base, interactive)
- [ ] Empty state

**Composite**
- [ ] `AuthLayout`, `AuthForm`, `PasswordInput`
- [ ] `DashboardLayout`, `Sidebar`, `MobileNavigation`, `DashboardHeader`
- [ ] `StatCard`, `TestimonialLinkCard`
- [ ] `BusinessProfileForm`, `LogoUploader`, `BrandColorPicker`
- [ ] `TestimonialCard`, `TestimonialList`, `TestimonialStatusBadge`, `TestimonialDetail`, `TestimonialApprovalActions`, `TestimonialEmptyState`
- [ ] `TemplateSelector`, `FormatSelector`, `GraphicPreview`, `GraphicDownloadButton`, `GraphicGenerationLoader`
- [ ] `PublicTestimonialPage`, `TestimonialSubmissionForm`, `ConsentCheckbox`, `SubmissionSuccess`
- [ ] Onboarding stepper with live preview
- [ ] Landing page sections
- [ ] Not-found and error pages

**Quality gates**
- [ ] All tokens come from this guide, with no stray hex values or one-off shadows
- [ ] Every page checked at 360px, 768px, 1024px and 1440px
- [ ] Contrast spot-checked against Section 3.5
- [ ] Keyboard and screen reader pass on the public form and the approval-to-download flow
- [ ] Graphic QA matrix (12.8) completed on the deployed build

---

<div align="center">

**Calm app. Loud graphics.**
Keep the interface quiet so the proof can speak.

</div>
