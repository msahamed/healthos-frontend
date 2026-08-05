# Ontor — Customer-facing design system

The **ontor.ai website** (and any customer-facing surface: pricing, landing pages, shared Artifacts, decks) is a **warm editorial voice-instrument** look: paper cream ground, teal + amber brand, a Newsreader serif for display type, calm and confident. New customer-facing UI should match this so the brand reads as one product.

> **Ground truth for color is `frontend/app/globals.css`.** This doc mirrors and explains it; if the two ever disagree, `globals.css` wins. (For visual design work, invoke the **`artifact-design`** skill and mock in an Artifact for approval before building.)
>
> This is **separate from `cockpit/DESIGN.md`** — that's the internal tool (forest-green, system fonts, dense). Don't cross them: customer-facing = this file; internal cockpit = that file.

Precedence: the founder's explicit ask → `globals.css` → this doc → new choices.

## Palette (light — the committed theme)

| Token | Hex | Use |
|---|---|---|
| `--paper` | `#F7F4EE` | page background |
| `--paper-2` | `#F1ECE2` | slightly recessed surface |
| `--paper-3` | `#E7DEC9` | warm fill / subtle panel |
| card white | `#FFFFFF` | raised cards on paper |
| `--ink` | `#1B1A17` | headings / primary text |
| `--ink-soft` | `#5A554B` | body / secondary text |
| `--line` | `#E4DDD0` | hairline borders (cards) |
| `--line-strong` | `#D6CDBC` | stronger dividers / ghost-button border |
| **`--teal`** | **`#0F766E`** | **brand / primary action / italic emphasis** |
| `--teal-dark` | `#0B5048` | primary hover / deep panels |
| `--teal-surface` | `#E8F1EF` | teal-tinted fills, ghost-button hover |
| **`--amber`** | **`#F59E0B`** | **accent / energy / the voice bars** |
| `--amber-soft` | `#FBEFD3` | amber chip / tint |
| `--amber-border` | `#FCD34D` | amber outlines |
| `--sunrise` | `#FB923C` | secondary warm accent (sparing) |
| dark-section ink | `#FBF8F1` | cream text on teal/dark panels |
| selection | `#F8DDB6` | `::selection` background |

**On dark/teal panels** (hero, featured cards), flip to cream text `#FBF8F1`; keep amber for accents and the voice bars.

## Type

- **Display — Newsreader** (`var(--font-newsreader)`, serif, via next/font). Used for `h1/h2/h3` and the "beat" line via `.font-serif-display`. Weight **500**, letter-spacing **-0.01 to -0.02em**, line-height **1.05–1.1**.
- **Body — Hanken Grotesk** (`var(--font-hanken)`, via next/font). Base **17px / 1.6**.
- **Emphasis move:** an italic `<em>` in **teal** inside a serif headline (e.g. *"call after call."*). This is the signature type gesture — use it once per headline, not everywhere.
- **Uppercase micro-labels / eyebrows:** ~12px, weight 700, `letter-spacing: 0.16–0.2em`, teal.
- **Numbers that align** (prices, counts): `font-variant-numeric: tabular-nums`.
- Type scale seen in the wild: h1 `clamp(38px, 4.6vw, 56px)`, section h2 `clamp(30px, 3.6vw, 42px)`.

## Patterns

- **Radius:** buttons **12px**, cards **18px**, chips/pills `999px`.
- **Primary button:** teal bg, `#fff` text, radius 12, padding ~`9–14px 16–20px`, soft teal-tinted shadow `0 6px 18px rgba(15,118,110,.22)`. Hover → `--teal-dark`.
- **Ghost button:** transparent, teal text, `1px solid --line-strong`; hover → teal border + `--teal-surface` fill.
- **Cards:** white bg, `1px solid --line`, radius 18, generous padding; hover transitions on border-color / shadow / transform (`.2s`).
- **Focus:** always a visible ring — 2px amber, `outline-offset: 2–3px`.
- **Shadow:** restrained; brand shadows are teal-tinted, not neutral grey.
- **Voice motif:** the mark is a small teal tile with amber equalizer bars; the site has a motion vocabulary in `globals.css` (`eq`, `cine-wave`, `cine-pulse`, `snip-bar`) for animated waveforms — use sparingly, and honor `prefers-reduced-motion`.

## Voice & copy (customer-facing)

- Ontor is **performance intelligence from voice** — **not** a wellness/health app.
- Never say **"app"** → say **"tool"** or just "Ontor". Never say **"surveillance"** as a positive; the brand's contrast line is *"Self-tracking, not surveillance."* Never claim *"data doesn't leave the phone"* (retired — cloud sync is optional).
- **Human, not AI** — plain, active, specific. **No em dashes** in outward copy. A control says exactly what happens ("Start free trial").
- Fuller rules live in the go-to-market copy guide / memory; this is the short version.

## Where it lives

- **Colors:** `frontend/app/globals.css` (`:root` custom properties) — the source of truth.
- **Fonts:** `frontend/app/layout.tsx` (next/font: Newsreader + Hanken → `--font-*` vars).
- **Components:** inline `style={{}}` using JS color constants (`teal`, `ink`, `inkSoft`) plus the `.font-serif-display` class and `.hos-*` helpers in `page.tsx`. There's no CSS framework layer for these — reuse the constants and the serif-display class rather than redefining.
