# Rajubhai Dabeliwale — Design System (v4)

**History, briefly:**
- **v1** — editorial-minimalist: sharp corners, hairline borders, mostly paper backgrounds, everything in a bordered "card" box.
- **v2** — a "pinned & stamped" overhaul: new type (Fraunces/Bebas Neue), bold color-blocking, tilted Polaroids, a spinning stamp badge. Feedback: **"i dont want too funky."**
- **v2.1** — kept the type/color, removed every tilt and the spinning badge. Structurally still v1's boxed-card convention underneath.
- **v3** — a real structural break: dropped almost every card/border sitewide in favor of full-bleed photography and rule-lines (a bare dot-leader menu, borderless gallery images, a flat hours list). Feedback: **"no minimal and no funky — make it attractive."**
- **v4 (this version)** — v3 went too far the other way: no boxes at all read as sparse/unfinished, not "rich." v4 keeps v3's one genuinely good structural idea (the full-bleed Hero split) and v2.1's calm, no-motion posture, but **brings back cards — done warm, not stark.** Rounded corners (18–20px), soft warm-toned shadows, and actual brand color on icon roundels and top edges, instead of either the old sharp `1.5px solid var(--ink)` box or v3's bare rule-line minimalism. The instruction that has now held across three rounds and should not be re-litigated without new client input: **no tilt, no rotate-on-hover, no spinning/decorative motion.**

Built as an [Astro](https://astro.build) static site. Global styles and behavior live in [src/layouts/Layout.astro](src/layouts/Layout.astro); each section is its own component under [src/components/](src/components/).

## Color

Exactly these ten tokens, defined once in `:root` (`Layout.astro`) — unchanged since v1. Never invent a new hex.

| Token | Hex | Use |
|---|---|---|
| `--red` | `#FF0917` | Primary CTAs, hero underline bar, Dabeli category icon |
| `--gold` | `#FFDF54` | Icon roundel color (About), footer accents |
| `--peach` | `#FFD8B4` | Bold section backgrounds (About, Dine-In) |
| `--orange` | `#F67D00` | Fafda & Chaat category icon, Dine-In/Reviews card top edges |
| `--maroon` | `#904137` | Headings, Sandwiches category icon, AA-safe text on `--peach` |
| `--paper` | `#FBF6EF` | Default background, card fill |
| `--paper-2` | `#F4EADC` | Gallery section background (added in v4 for warmth) |
| `--ink` | `#2B1712` | Primary text, dark section backgrounds (Menu, Order CTA, Footer) |
| `--line` | `rgba(43,23,18,.14)` | Hairline internal dividers (menu rows inside a card, footer rule) |
| `--muted` | `#7a5f56` | Secondary text — **fails AA on both `--ink` and `--peach`, see below** |

**Contrast rule:** `--red` and `--orange` fail WCAG AA (4.5:1) for small text on `--paper`. Only use them for large display type, buttons, icon-roundel fills, and backgrounds. `--muted` only clears AA on `--paper` — on `--ink` use `#a88a7f`, on `--peach` use `--maroon`.

**v4's color-per-category device:** the three Menu categories each get a distinct accent color on their icon roundel and "Signature" badge (Dabeli = `--red`, Fafda & Chaat = `--orange`, Sandwiches = `--maroon`) via a `--cat-accent` custom property set inline per card. Reach for this pattern — an inline custom property, not a new class per color — if a future list needs per-item color variety.

## Typography

**Upgraded from Bebas Neue + Karla** (both fine but generic/overused — Bebas Neue especially is a cliché "impact" display font at this point) **to a more premium pairing**, keeping Fraunces (already a good choice, no reason to touch it): `Fraunces:ital,wght@0,400;0,500;0,600;0,700;0,900;1,500;1,600;1,700` + `Big+Shoulders+Display:wght@600;700;800` + `Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;1,600`.

- **Fraunces** — headings, `em` emphasis, pull-quotes, menu category titles, crest wordmark, footer headings. Unchanged.
- **Big Shoulders Display** (replaces Bebas Neue) — stat numbers, menu prices, gallery captions. A condensed display face with real weight range (we load 600/700/800) and more refined letterforms than Bebas Neue's single-weight block-capital look. Never prose. **Always set an explicit `font-weight` matching a loaded weight (600/700/800)** — an unset or mismatched weight (e.g. the old `font-weight:400` left over from the Bebas Neue days) makes the browser fall back to the nearest loaded weight rather than what you asked for.
- **Plus Jakarta Sans** (replaces Karla) — body, nav, buttons, UI labels, menu item names/descriptions. Warmer x-height and slightly more character than Karla while staying just as legible at small sizes.

| Element | Size | Family / weight |
|---|---|---|
| Hero H1 | `clamp(52px, 6.2vw, 104px)` | Fraunces 800 |
| H2 | `clamp(34px, 5.2vw, 64px)` | Fraunces 700 |
| Menu category title | `clamp(19px, 1.8vw, 22px)` italic | Fraunces 600 |
| Pull-quote | `clamp(20px, 2.3vw, 25px)` italic | Fraunces 500 |
| Stat numbers | `clamp(40px, 4vw, 56px)` | Big Shoulders Display 700 |
| Menu prices | 16px | Big Shoulders Display 700 |
| Body | 15–17px | Plus Jakarta Sans 400 |

`em` renders italic in `--maroon` (or `--gold`/`--peach` on dark sections) — never bold-red.

**Specificity trap to watch for:** a generic descendant selector like `.about-text p` can silently beat a single-class selector like `.pull` on the same element (0,1,1 vs 0,1,0) regardless of source order. Scope the class to its container (`.about-text .pull`) when this applies.

## Layout conventions — the v4 shape language

- **Cards are back, but warm.** `border-radius: 18–20px` on every card (Menu category cards, Gallery tiles, Review cards, the Dine-In hours card), a soft warm-toned shadow (`rgba(43,23,18,...)`, never cool grey), and either a filled `--paper` background or a colored top/icon accent. This is the opposite instinct from v1/v2's sharp `1.5px solid var(--ink)` boxes — rounded and shadowed reads as inviting, sharp-and-hairlined reads as "editorial/minimal," which is exactly what the client didn't want this round.
- **Every card lifts on hover, consistently.** `translateY(-6px)` + a deeper version of its own resting shadow — the same small interaction Gallery tiles already had, now applied to Menu category cards, Review cards, and the Dine-In hours card too, so hovering feels the same everywhere a card exists. Plain lift only, no rotation.
- **The sticky header now carries its own soft shadow** (`0 4px 20px rgba(43,23,18,.06)`) alongside its `2px solid var(--ink)` bottom edge — it was the one major surface with no depth once every card below it picked one up.
- **What's still full-bleed, deliberately:** the Hero photo (fills half the 100vh split, no frame) and About's photo (bleeds to the viewport edge). These are the two places a lack of framing is bold rather than sparse — don't add a card around either without a real reason.
- **Buttons stay pills** (`border-radius:999px`), unchanged since v2 — already warm/friendly, not part of what needed fixing.
- **No tilt, no rotate-on-hover, no spinning/decorative motion.** This constraint has now survived three rounds (v2.1 removed it, v3 didn't touch it, v4 doesn't touch it either) — treat it as settled unless the client explicitly asks for motion again.
- **Section backgrounds carry more of the color** than v3's mostly-paper approach: About and Dine-In are `--peach`, Menu/Order CTA/Footer are `--ink`, and Gallery now sits on `--paper-2` (added in v4) instead of plain `--paper` — partly so the gallery's paper-colored cards have something to sit *on* rather than blending into an identical background.
- **No same-size icon+heading+text card grids** (About's points still avoid this — icon-roundel + text, not a bordered grid), **no kicker/eyebrow labels, no decorative section numbering** — still hard bans, independent of whichever version of "boxed vs. bare" the page is in.

## Header / nav

Unchanged — sticky, `backdrop-filter: blur(6px)`, translucent paper background, `2px solid var(--ink)` bottom edge, 1010px breakpoint, hamburger, always-visible "Call to Order" pill. See [Header.astro](src/components/Header.astro).

## Icons

Line icons only, `stroke: currentColor; stroke-width: 1.5; fill: none`, defined in [IconSprite.astro](src/components/IconSprite.astro). Menu category icons (`i-dabeli`, `i-bowl`, `i-sandwich`) are back in v4, each in a colored `.menu-cat-icon` roundel matching that category's `--cat-accent`. About's points use `.icon-roundel` (44px circle, `--ink` fill, `--gold` icon).

## Sections

| Component | v4 structure |
|---|---|
| [Hero.astro](src/components/Hero.astro) | Unchanged from v3 — `min-height:100vh` split, full-bleed photo on the right, no frame. This wasn't part of the "too minimal" complaint (it's bold, not sparse) and works well; left alone. |
| [About.astro](src/components/About.astro) | Unchanged — bold `--peach` block, full-bleed photo, flat paper pull-quote card, icon-roundel points. |
| [Menu.astro](src/components/Menu.astro) | Rebuilt again: each category is now a rounded (`20px`), shadowed `.menu-cat` card in `--paper`, floating on the dark `--ink` section in a 3-column grid (1 column ≤980px). Each card has a colored icon roundel (`.menu-cat-icon`) matching its `--cat-accent`. Replaces v3's bare dot-leader spread, which read as too sparse for a "menu board." |
| [Gallery.astro](src/components/Gallery.astro) | Each tile is a rounded (`18px`) `.g-card` with a soft shadow, `background:var(--paper)`, sitting on a `--paper-2`-tinted section. Sizing is still `aspect-ratio`-only on the `img` (unchanged hard-won mechanism from v1). Featured tile keeps its scrim-overlay caption. |
| [DineIn.astro](src/components/DineIn.astro) | `book-card` is a rounded (`20px`), shadowed `--paper` card with a 5px `--orange` top edge — back to a real card (was a bare rule-line list in v3). |
| [Reviews.astro](src/components/Reviews.astro) | Cards are rounded (`18px`) `--paper` cards with a 4px `--orange` top edge and a soft shadow (was border-right-only hairline separation in v3). Marquee mechanism unchanged. |
| [OrderCta.astro](src/components/OrderCta.astro) | Unchanged. |
| [Footer.astro](src/components/Footer.astro) | Unchanged. |

## Images

Real photography, stored in [public/](public/) as `.webp`.

| Slot | File | Notes |
|---|---|---|
| Header/footer crest | `logo.png` | Real brand mark |
| Favicon / iOS icon / OG image | `favicon.png` / `apple-touch-icon.png` / `og-image.jpg` | See SEO/meta — `og-image.jpg` now predates three redesigns' worth of type/layout, worth regenerating |
| Hero visual | `book-table-img.webp` | Full-bleed, fills the hero's right half edge-to-edge |
| About photo | `about-img.webp` | Full-bleed, unframed |
| Gallery — Signature Dabeli (featured) | `dish-1.webp` | `grid-column:span 2`, rounded card, scrim caption |
| Gallery — Kutchi Kadak, Fafda, Sandwich, Dahi Puri | `book-table-img3/4.webp`, `dish-5.webp`, `book-table-img2.webp` | Rounded cards, `aspect-ratio:1/1` |
| Gallery — Our Nashik Outlet (wide) | `about-img.webp` | `grid-column:span 3`, rounded card, `aspect-ratio:3/1` |

**Lesson learned on Gallery's special tiles (still applies):** sized by `aspect-ratio` alone, never fixed rows or flexbox — both broke in production once.

Photography is still a mix of real (storefront) and stock/studio (five of six gallery shots, the hero) — known, accepted per the client's earlier choice.

## Performance

Unchanged — images pre-resized/converted to WebP via `cwebp` at build-prep time. Resize new photos to their actual max display width before adding to `public/`.

## Motion

- **Scroll-reveal**: `IntersectionObserver` (threshold 0.15), plain `opacity:0; translateY(24px)` → visible, staggered via `data-reveal="1..4"`. No rotation. Each `.menu-cat` now carries its own `data-reveal` (cycling 1–3) rather than one wrapper around the whole spread, since it's a grid of independent cards now, not a single list.
- **Stat count-up, parallax, reviews marquee**: unchanged mechanics. Parallax factors: about photo `0.05`, hero photo `0.04`.
- **`prefers-reduced-motion: reduce`**: scroll-reveal shows content instantly, parallax never attaches, stat counters skip to final values, the reviews marquee falls back to native scroll.
- **Rule of thumb, still in force:** no animation directly on food/product photography, and no decorative motion for its own sake (spinning/tilting was tried and explicitly walked back — don't reintroduce without new client direction).

**CSS gotcha worth remembering:** `[data-reveal].in-view` and the parallax script's inline `el.style.transform = ...` both **fully replace** the `transform` property — they don't compose with a separate static `transform` on the same element. If a future element needs both a scroll/parallax effect *and* its own static transform, put the JS-driven attribute on a plain wrapper `<div>` around it, not on the element with the static transform.

## Accessibility

Unchanged — skip-link, `<main>` landmark, `aria-hidden` on decorative icons, visible focus outlines (`outline:2px solid var(--red)`), 44×44px minimum touch targets, real `aria-label`s, no heading-level skips, per-background AA contrast discipline.

## SEO / meta

Unchanged this pass — canonical link, `apple-touch-icon.png`, full OG/Twitter tags with `og-image.jpg`, `Restaurant` schema.org JSON-LD, print stylesheet (updated to match the new card-based Menu markup), themed `::selection`/scrollbar. **Follow-up worth doing:** `og-image.jpg` predates three redesigns' worth of changes — regenerate it next time it's touched.

## Known gaps (tracked, not yet fixed)

- **Menu prices are placeholders** (`₹—`).
- **No `<noscript>` fallback**: `[data-reveal]` elements stay at `opacity:0` with JS disabled.
- **Stock photography**: five of six gallery images (plus the hero) are stock/studio shots.
- **`og-image.jpg` is stylistically stale** — see SEO/meta above.

## Adding a new section

1. New component under `src/components/`, imported into [src/pages/index.astro](src/pages/index.astro).
2. **Default to a warm rounded card** (`border-radius:18–20px`, soft warm shadow, `--paper` fill or a colored accent) for anything that needs visual containment — that's the current baseline, not v3's bare rule-line minimalism or v1/v2's sharp hairline box.
3. Reuse existing utility classes (`.section`, `.container`, `.section-title`, `.btn` variants). No kicker/tag label above the heading.
4. **No tilt, no rotate-on-hover, no spinning decorative elements.**
5. New icons go into [IconSprite.astro](src/components/IconSprite.astro) as `<symbol>`s, same stroke style as the rest.
6. Any scroll-triggered element gets `data-reveal`; any drifting element gets `data-parallax="0.05–0.2"` — if it also needs a static transform, wrap rather than combine (see the CSS gotcha in Motion).
7. Check the new color/text pairing against the AA contrast rule before shipping — per-background, not per-token.
8. Before defaulting to the "plain text + trailing `<em>` accent" headline formula, check whether enough sections already use it — vary it if so.
