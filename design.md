# Rajubhai Dabeliwale — Design System (v2.1)

**History:** v1 was editorial-minimalist (sharp corners, hairline borders, mostly paper backgrounds). v2 was a complete overhaul on client direction ("completely overhaul the design, idc, just use my colors") that kept only the ten color tokens and rebuilt everything else around a "pinned, stamped, hand-ticketed" object language — tilted Polaroid photos, a spinning wax-seal stamp badge, rotate-on-hover buttons. The client's next note was **"i dont want too funky"** — so v2.1 (this version) keeps v2's real gains (the new typography, the bold color-blocking, the torn ticket edge, the softened shape variety) and removes every rotation/tilt: no spinning badge, no tilted photos or cards, no rotate-on-hover. If something in this doc still describes a tilt or the stamp, it's stale — the rule going forward is **flat and calm, not gimmick-free-for-all**.

Built as an [Astro](https://astro.build) static site. Global styles and behavior live in [src/layouts/Layout.astro](src/layouts/Layout.astro); each section is its own component under [src/components/](src/components/).

## Color

Exactly these ten tokens, defined once in `:root` (`Layout.astro`). Never invent a new hex.

| Token | Hex | Use |
|---|---|---|
| `--red` | `#FF0917` | Primary CTAs, the hero underline bar |
| `--gold` | `#FFDF54` | Roundel icon color, footer accents |
| `--peach` | `#FFD8B4` | Bold section backgrounds (About, Dine-In) |
| `--orange` | `#F67D00` | Secondary accent, tile/badge borders |
| `--maroon` | `#904137` | Headings, icons, ratings, AA-safe text on `--peach` |
| `--paper` | `#FBF6EF` | Default background, card fill |
| `--paper-2` | `#F4EADC` | Rarely used now — most former paper-2 sections moved to `--peach` for bolder color-blocking |
| `--ink` | `#2B1712` | Primary text, dark section backgrounds, roundel fills |
| `--line` | `rgba(43,23,18,.14)` | Hairline internal dividers (menu rows, footer rule) |
| `--muted` | `#7a5f56` | Secondary text — **fails AA on both `--ink` and `--peach`, see below** |

**Contrast rule:** `--red` and `--orange` fail WCAG AA (4.5:1) for small text on `--paper`. Only use them for large display type, buttons, and backgrounds. `--muted` itself only clears AA on `--paper` — on `--ink` (footer) use `#a88a7f` instead, and on `--peach` (About, Dine-In) use `--maroon` instead. Check any new color/text pairing against 4.5:1 before shipping.

**Color-blocking, not paper-with-accents:** About and Dine-In are both bold `--peach` blocks (not adjacent, so the repeat doesn't read as monotonous); Menu, Order CTA and Footer stay `--ink`. Hero, Gallery and Reviews stay `--paper` so the color-blocked sections have something to punctuate.

## Typography

Three families, loaded via Google Fonts (`Fraunces:ital,wght@0,400;0,500;0,600;0,700;0,900;1,500;1,600;1,700` + `Bebas+Neue` + `Karla:wght@400;500;600;700`):

- **Fraunces** — all headings, `em` emphasis, pull-quotes, the crest wordmark, reviewer names, footer headings. A characterful soft-serif — replaces the old Zilla Slab.
- **Bebas Neue** — display numerals and small stamped labels only: the hero stat numbers, the menu price column, "Menu No. 01". Tall, condensed, all-caps — never used for prose.
- **Karla** — body copy, nav, buttons, UI labels.

| Element | Size | Family / weight |
|---|---|---|
| H1 | `clamp(48px, 7.5vw, 90px)` | Fraunces 800 |
| H2 | `clamp(34px, 5.2vw, 64px)` | Fraunces 700 |
| Pull-quote | `clamp(20px, 2.3vw, 25px)` italic | Fraunces 500 |
| Stat numbers / prices | `clamp(46px, 6.4vw, 68px)` / 15px | Bebas Neue 400 |
| Body | 15–17px | Karla 400 |
| Buttons / labels | 13px, 700, uppercase, 1.5px letter-spacing | Karla |

Line-height: 1.65 body, ~0.96–1.02 large headings. `em` inside headings/copy renders italic in `--maroon` (or `--gold`/`--peach` on dark sections) — never bold-red.

**Specificity trap to watch for:** a generic descendant selector like `.about-text p` can silently beat a single-class selector like `.pull` on the same element (`.about-text p` has specificity 0,1,1 vs `.pull`'s 0,1,0) regardless of source order. When a classed element sits inside a container that also has a generic tag-selector rule, scope the class selector to the container too (`.about-text .pull`, specificity 0,2,0).

**Headline formula variety:** most section H2s use a "plain phrase + `<em>` accent" formula (e.g. "Off the *menu board*"), but Gallery inverts it (em leads: "*A closer look* at the stall") and Dine-In drops the em split entirely ("You're always welcome here."). Don't default to the trailing-em formula if most sections already use it.

## Layout conventions

- **Shape language is calm and mostly flat.** Buttons are full pills (`border-radius:999px`), a fixed identity detail that reads as friendly rather than funky. Roundel icons are circles. Photos and cards sit flat — no tilt, no rotate-on-hover. The receipt, review cards (`border-radius:6px`), and the review nav buttons (circular) stay in a softened-but-not-round middle ground. Match one of these four (pill / circle / flat-sharp / soft-rounded) rather than inventing a fifth.
- Borders: `1.5px solid var(--ink)` on cards/frames; `2px` on buttons, the header crest, and the header's own bottom edge.
- Shadows: soft, warm-toned (`rgba(43,23,18,...)`), used on cards that sit above the page surface (Hero photo, pull-quote, hours card, gallery tiles) — plain depth, not a "pinned object" effect. Keep shadows warm-toned, never cool grey.
- `.btn-primary` is filled `--red` at rest, deepens to `--maroon` on hover, lifts `translateY(-2px)` — **no rotation on hover**, on any button variant. Plain, confident lift only.
- `.container` — `max-width: 1200px`, `padding: 0 32px`. `.section` — `padding: 144px 0` (`92px` at ≤1010px).
- Faint (`opacity: .045`) SVG fractal-noise paper-grain texture, fixed, `mix-blend-mode: multiply`.
- **No same-size icon+heading+text card grids** — still a hard ban. About's four feature points use a circular `--ink`/`--gold` icon roundel + text — a roundel is not a bordered card, still fine.
- **No kicker/eyebrow labels, no decorative section numbering, no spinning/rotating decorative badges** — all banned. A heading stands alone; if a section needs a label, put the context in the heading itself.
- **Structural color accents**: the receipt-head divider and menu category underlines (`--orange`), the Dine-In hours card's top edge (`--orange`), the footer's top edge (`--gold`), hover states on gallery/review cards (`border-color:var(--red)`) — reach for an existing token before inventing a new decorative element.

## Header / nav

Sticky, `backdrop-filter: blur(6px)`, translucent paper background, `2px solid var(--ink)` bottom edge. Logo, breakpoint (1010px), hamburger behavior, and the always-visible "Call to Order" pill — see [Header.astro](src/components/Header.astro).

## Icons

Line icons only: `stroke: currentColor; stroke-width: 1.5; fill: none`, defined once as `<symbol>`s in [IconSprite.astro](src/components/IconSprite.astro), referenced via `<use href="#i-name"/>`. About's points wrap the icon in a `.icon-roundel` (44px circle, `--ink` fill, `--gold` icon).

## Sections

| Component | Notes |
|---|---|
| [Hero.astro](src/components/Hero.astro) | H1 in Fraunces 800; the em underline bar is a thick, straight rounded rule (no rotation). The photo sits flat in a framed `.frame-card` (thick paper border, soft shadow) inside a `.frame-parallax` wrapper (parallax lives on the wrapper so it never needs to fight a static transform on the card — see the note in Motion). Stat numbers are Bebas Neue. No badge, no watermark. |
| [About.astro](src/components/About.astro) | Bold `--peach` background. The pull-quote is a flat `--paper` card with a red left border and soft shadow (no tilt). Points use the icon-roundel. Body/point text uses `--maroon` (the AA-safe token on peach). Full-bleed photo device kept — still the one deliberate structural break. |
| [Menu.astro](src/components/Menu.astro) | Dark `--ink` section, 3-column receipt. Ends in a **torn ticket-stub edge** (`.ticket-edge`, a radial-gradient scallop pattern showing the dark background through a row of bites) instead of a flat bottom border — this stayed, it's a texture device, not a motion/tilt gimmick. `receipt-head span` and `.menu-price` are Bebas Neue. |
| [Gallery.astro](src/components/Gallery.astro) | All tiles sit flat, no tilt. Sizing is `aspect-ratio`-only (no fixed rows/flexbox) — a hard-won fix, not a style choice, see Images. |
| [DineIn.astro](src/components/DineIn.astro) | `--peach` background, flat `book-card` with a soft shadow and an `--orange` top edge. |
| [Reviews.astro](src/components/Reviews.astro) | Cards `border-radius:6px`, nav arrows circular. Marquee mechanism unchanged — see Motion. |
| [OrderCta.astro](src/components/OrderCta.astro) | Dark, diagonal-stripe texture overlay; inherits the pill buttons and Fraunces heading. |
| [Footer.astro](src/components/Footer.astro) | Headings in Fraunces italic. |

## Images

Real photography, stored in [public/](public/) as `.webp` (see Performance).

| Slot | File | Notes |
|---|---|---|
| Header/footer crest | `logo.png` | Real brand mark |
| Favicon / iOS icon / OG image | `favicon.png` / `apple-touch-icon.png` / `og-image.jpg` | See SEO/meta |
| Hero visual | `book-table-img.webp` | Flat framed photo, fills its frame-card |
| **About photo** | `about-img.webp` | Full-bleed, unframed — the one deliberate structural break |
| Gallery — Signature Dabeli (featured) | `dish-1.webp` | `grid-column:span 2` |
| Gallery — Kutchi Kadak, Fafda, Sandwich, Dahi Puri | `book-table-img3/4.webp`, `dish-5.webp`, `book-table-img2.webp` | Standard framed tiles |
| Gallery — Our Nashik Outlet (wide) | `about-img.webp` | `grid-column:span 3` |

**Lesson learned on Gallery's special tiles (still applies):** the featured and wide tiles are sized by `aspect-ratio` alone, not fixed rows or flexbox — both broke in production once. Don't reintroduce fixed heights or a flex context for a new tile shape; give it an `aspect-ratio`.

Photography is still a mix of real (storefront) and stock/studio (five of six gallery shots, the hero) — known, accepted per the client's earlier choice.

## Performance

Images are pre-resized/converted to WebP via `cwebp` at build-prep time, not an Astro image pipeline. Resize new photos to their actual max display width before adding to `public/`.

## Motion

- **The receipt prints in** (Menu): `clip-path: inset()` animates top-to-bottom on scroll-reveal (0.9s, `cubic-bezier(.16,1,.3,1)`), finishing with the torn ticket-edge as part of the same reveal. Still the page's one genuinely brand-specific device.
- **Scroll-reveal**: `IntersectionObserver` (threshold 0.15), plain `opacity:0; translateY(24px)` → visible, staggered via `transition-delay` (`data-reveal="1..4"`). **No rotation in the reveal** — it was removed along with the rest of the tilt language.
- **Stat count-up, parallax, reviews marquee**: unchanged mechanics — see git history for the original rationale. Parallax factors: about photo `0.05`, hero frame wrapper `0.06`.
- **`prefers-reduced-motion: reduce`**: scroll-reveal shows content instantly, parallax never attaches, stat counters skip to final values, the reviews marquee falls back to native scroll, the receipt appears fully visible with no print-in clip.
- **Rule of thumb: no animation directly on the food/product photography itself**, and (new) **no decorative motion for its own sake** — a spinning stamp badge was tried and removed on client feedback ("too funky"). Motion here should read as *reveal* (things appearing) not *performance* (things spinning/wobbling/rotating).

**A CSS gotcha worth remembering even though the examples that triggered it are gone:** `[data-reveal].in-view` and the parallax script's inline `el.style.transform = ...` both **fully replace** the `transform` property — they don't compose with a separate static `transform` declared on the same element. If a future element needs both a scroll-triggered/parallax effect *and* its own static transform (a tilt, a scale, whatever), put the `data-reveal`/`data-parallax` attribute on a plain wrapper `<div>` around it, not on the element with the static transform. `Hero.astro`'s `.frame-parallax` wrapper is the reference pattern.

## Accessibility

Skip-link, `<main>` landmark, `aria-hidden` on decorative icons, visible focus outlines (`outline:2px solid var(--red)`), 44×44px minimum touch targets, real `aria-label`s, no heading-level skips, per-background AA contrast discipline (see Color). `.icon-roundel` is `aria-hidden="true"` (decorative, its meaning is already present as real text nearby).

## SEO / meta

Canonical link, `apple-touch-icon.png`, full OG/Twitter tags with `og-image.jpg`, `Restaurant` schema.org JSON-LD, print stylesheet, themed `::selection`/scrollbar. See git history for the pass that added these. **Follow-up worth doing:** `og-image.jpg` predates the Fraunces/Bebas Neue type change — still accurate in content/color but stylistically a little behind the live site. Regenerate it next time it's touched.

## Known gaps (tracked, not yet fixed)

- **Menu prices are placeholders** (`₹—`). Real per-item prices from the client are needed before this is production-honest.
- **No `<noscript>` fallback**: with JavaScript disabled, `[data-reveal]` elements stay at `opacity:0` permanently.
- **Stock photography**: five of six gallery images (plus the hero) are stock/studio shots. Kept as-is per the client's choice.
- **`og-image.jpg` is stylistically a little stale** — see SEO/meta above.

## Adding a new section

1. New component under `src/components/`, imported into [src/pages/index.astro](src/pages/index.astro)
2. Reuse existing utility classes (`.section`, `.container`, `.section-title`, `.btn` variants) before inventing new ones. No kicker/tag label above the heading.
3. Pick a shape treatment that matches an existing device — pill (buttons), circle (roundels/nav arrows), flat-sharp (photos/cards), or soft-rounded (receipt/review cards) — rather than a fifth new corner style. **No tilt, no rotate-on-hover, no spinning decorative elements** — that direction was tried and explicitly walked back.
4. New icons go into [IconSprite.astro](src/components/IconSprite.astro) as `<symbol>`s, same stroke style as the rest.
5. Any scroll-triggered element gets `data-reveal`; any drifting element gets `data-parallax="0.05–0.2"` — if that element also needs a static transform of its own, wrap rather than combine (see the CSS gotcha in Motion).
6. Check the new color/text pairing against the AA contrast rule before shipping — per-background, not per-token (see Color).
7. Before defaulting to the "plain text + trailing `<em>` accent" headline formula, check whether enough sections already use it — vary it if so.
