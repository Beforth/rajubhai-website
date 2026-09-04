# Rajubhai Dabeliwale — Design System (v3)

**History, briefly:**
- **v1** — editorial-minimalist: sharp corners, hairline borders, mostly paper backgrounds, everything in a bordered "card" box (framed photos, receipt, gallery tiles, review cards, the hours card).
- **v2** — a from-scratch overhaul on "completely overhaul the design, idc, just use my colors": new type (Fraunces/Bebas Neue), bold color-blocking, and a "pinned & stamped" tilt/motion language (rotated Polaroids, a spinning stamp badge). Client feedback: **"i dont want too funky."**
- **v2.1** — kept v2's type and color, removed every tilt/rotation and the spinning badge. Structurally, though, this was still v1's layout — same boxed-card convention everywhere, same split-hero-with-a-framed-photo composition, same receipt-in-a-box menu. The client's next note was **"completely overhaul the website... i mean completely"** — a signal that the *structure*, not just the decoration on top of it, needed to change.
- **v3 (this version)** — the real structural break. Same ten color tokens (still untouched, still the one constant), same calm/flat shape language from v2.1 (no tilt, no spinning, no rotate-on-hover — that instruction still stands), but the page is now built on a fundamentally different convention: **almost nothing sits in a bordered box anymore.** Full-bleed photography, rule-lines instead of card outlines, a menu set as an actual printed spread instead of a receipt-shaped component. If a section still reads as "a card with a border" after this pass, that's a bug, not a style choice — flag it.

Built as an [Astro](https://astro.build) static site. Global styles and behavior live in [src/layouts/Layout.astro](src/layouts/Layout.astro); each section is its own component under [src/components/](src/components/).

## Color

Exactly these ten tokens, defined once in `:root` (`Layout.astro`) — unchanged since v1. Never invent a new hex.

| Token | Hex | Use |
|---|---|---|
| `--red` | `#FF0917` | Primary CTAs, the hero underline bar |
| `--gold` | `#FFDF54` | Menu prices, icon roundel color, footer accents |
| `--peach` | `#FFD8B4` | Bold section backgrounds (About, Dine-In) |
| `--orange` | `#F67D00` | Secondary accent |
| `--maroon` | `#904137` | Headings, icons, AA-safe text on `--peach` |
| `--paper` | `#FBF6EF` | Default background |
| `--paper-2` | `#F4EADC` | Rarely used — most former paper-2 sections are now `--peach` |
| `--ink` | `#2B1712` | Primary text, dark section backgrounds (Menu, Order CTA, Footer) |
| `--line` | `rgba(43,23,18,.14)` | Hairline dividers — now doing more work than ever, since it's what replaces most card borders |
| `--muted` | `#7a5f56` | Secondary text — **fails AA on both `--ink` and `--peach`, see below** |

**Contrast rule:** `--red` and `--orange` fail WCAG AA (4.5:1) for small text on `--paper`. Only use them for large display type, buttons, and backgrounds. `--muted` only clears AA on `--paper` — on `--ink` use `#a88a7f`, on `--peach` use `--maroon`.

## Typography

Three families, unchanged from v2 (`Fraunces:ital,wght@0,400;0,500;0,600;0,700;0,900;1,500;1,600;1,700` + `Bebas+Neue` + `Karla:wght@400;500;600;700`):

- **Fraunces** — headings, `em` emphasis, pull-quotes, menu category titles, crest wordmark, footer headings.
- **Bebas Neue** — stat numbers, menu prices. Tall, condensed, all-caps — never prose.
- **Karla** — body, nav, buttons, UI labels.

| Element | Size | Family / weight |
|---|---|---|
| Hero H1 | `clamp(52px, 6.2vw, 104px)` | Fraunces 800 — pushed larger in v3 to earn the new full-bleed composition |
| H2 | `clamp(34px, 5.2vw, 64px)` | Fraunces 700 |
| Menu category title | `clamp(24px, 2.6vw, 32px)` italic | Fraunces 600 |
| Pull-quote | `clamp(20px, 2.3vw, 25px)` italic | Fraunces 500 |
| Stat numbers / prices | `clamp(40px, 4vw, 56px)` / 16px | Bebas Neue 400 |
| Body | 15–17px | Karla 400 |

`em` renders italic in `--maroon` (or `--gold`/`--peach` on dark sections) — never bold-red.

**Specificity trap to watch for:** a generic descendant selector like `.about-text p` can silently beat a single-class selector like `.pull` on the same element (0,1,1 vs 0,1,0) regardless of source order. Scope the class to its container (`.about-text .pull`) when this applies.

## Layout conventions — the v3 break

- **No bordered-box cards, as a rule.** The convention that survived v1 through v2.1 — every photo, every list, every quote sitting inside a `1.5px solid var(--ink)` box — is gone except where explicitly noted below. Structure now comes from **whitespace, rule-lines (`--line` or a 1–2px `--ink` edge), and type scale**, not from drawing a box around things.
- **Full-bleed photography.** The Hero photo runs edge-to-edge on its half of a full-height split (no frame, no padding, no border) — see Sections. About's photo was already full-bleed (kept, still the one place it originated). Gallery images sit bare with a small caption underneath, no card.
- **Rule-lines replace borders.** Dine-In's hours block is a plain list under a `2px solid var(--ink)` top rule (was a padded, shadowed card). Review cards are separated by a single `1px solid var(--line)` on the right edge, not a box (marquee mechanism unchanged).
- **The menu is a printed spread, not a component.** No card, no border, no ticket-notch circles. Category names in large italic Fraunces, items in a flat list with a dotted price-leader (`.menu-leader`, `border-bottom:1px dotted`) running from the name to the price — the classic printed-menu typographic device. This replaces the old receipt-card + torn-ticket-edge entirely; that device is gone, not hidden.
- **What's still boxed, deliberately:** the header crest (circular, functional chrome) and buttons (pills) — both are UI controls, not content cards, so the "no box" rule doesn't apply to them.
- **Shape language stays calm, per the last round's feedback:** no tilt, no rotate-on-hover, no spinning/decorative motion. Buttons are pills with a plain `translateY` lift on hover. This constraint did not change in v3 — only the box-everywhere convention did.
- **No same-size icon+heading+text card grids, no kicker/eyebrow labels, no decorative section numbering** — all still hard bans, independent of whatever the current aesthetic is.

## Header / nav

Unchanged — sticky, `backdrop-filter: blur(6px)`, translucent paper background, `2px solid var(--ink)` bottom edge, 1010px breakpoint, hamburger, always-visible "Call to Order" pill. See [Header.astro](src/components/Header.astro).

## Icons

Line icons only, `stroke: currentColor; stroke-width: 1.5; fill: none`, defined in [IconSprite.astro](src/components/IconSprite.astro). The menu no longer uses category icons (dropped for a cleaner typographic list) — `i-dabeli`/`i-bowl`/`i-sandwich` are still defined in the sprite but currently unreferenced; fine to reuse or remove later. About's points still use the `.icon-roundel` (44px circle, `--ink` fill, `--gold` icon).

## Sections

| Component | v3 structure |
|---|---|
| [Hero.astro](src/components/Hero.astro) | `min-height:100vh` two-column grid: text on the left (`.hero-text`, centered vertically), the dish photo full-bleed on the right (`.hero-photo`, no frame/border, `object-fit:cover` filling the column edge-to-edge). This replaces the old boxed/framed photo floating in whitespace — the single biggest structural change in this pass. Stacks to photo-on-top/text-below under 980px. |
| [About.astro](src/components/About.astro) | Unchanged structurally from v2.1 — bold `--peach` block, full-bleed photo (the one place this device originated, still works), flat paper pull-quote card with a red left border, icon-roundel points. |
| [Menu.astro](src/components/Menu.astro) | Rebuilt as a plain typographic spread (`.menu-spread`, max-width 720px, centered) directly on the dark `--ink` section — no card, no border. Italic Fraunces category titles, a dotted leader line between each item name and its price. See Layout conventions above. |
| [Gallery.astro](src/components/Gallery.astro) | Bare images, no card/border/background — `.g-card img` sized by `aspect-ratio` alone (unchanged hard-won mechanism), a small Bebas Neue caption underneath. Featured tile keeps its scrim-overlay caption (already borderless, no change needed there). |
| [DineIn.astro](src/components/DineIn.astro) | `book-card` is now a flat list under a `2px solid var(--ink)` top rule — no box, no shadow, no circle notches. |
| [Reviews.astro](src/components/Reviews.astro) | Cards lost their border/background — separated by a single `1px solid var(--line)` right-edge rule inside the marquee track. Auto-drift mechanism unchanged, see Motion. |
| [OrderCta.astro](src/components/OrderCta.astro) | Unchanged — dark diagonal-stripe band, two real CTAs. |
| [Footer.astro](src/components/Footer.astro) | Unchanged. |

## Images

Real photography, stored in [public/](public/) as `.webp`.

| Slot | File | Notes |
|---|---|---|
| Header/footer crest | `logo.png` | Real brand mark |
| Favicon / iOS icon / OG image | `favicon.png` / `apple-touch-icon.png` / `og-image.jpg` | See SEO/meta — `og-image.jpg` is now stylistically behind two redesigns, worth regenerating |
| Hero visual | `book-table-img.webp` | **Full-bleed**, fills the hero's right half edge-to-edge, no frame |
| About photo | `about-img.webp` | Full-bleed, unframed — unchanged |
| Gallery — Signature Dabeli (featured) | `dish-1.webp` | `grid-column:span 2`, bare |
| Gallery — Kutchi Kadak, Fafda, Sandwich, Dahi Puri | `book-table-img3/4.webp`, `dish-5.webp`, `book-table-img2.webp` | Bare, `aspect-ratio:1/1` |
| Gallery — Our Nashik Outlet (wide) | `about-img.webp` | `grid-column:span 3`, bare, `aspect-ratio:3/1` |

**Lesson learned on Gallery's special tiles (still applies):** sized by `aspect-ratio` alone, never fixed rows or flexbox — both broke in production once. Don't reintroduce either for a new tile shape.

Photography is still a mix of real (storefront) and stock/studio (five of six gallery shots, the hero) — known, accepted per the client's earlier choice.

## Performance

Unchanged — images pre-resized/converted to WebP via `cwebp` at build-prep time. Resize new photos to their actual max display width before adding to `public/`.

## Motion

- **The receipt-prints-in animation is gone** along with the receipt itself. The menu's reveal is now the standard scroll-fade like every other section — there's no equivalent brand-specific device replacing it yet (see Known gaps).
- **Scroll-reveal**: `IntersectionObserver` (threshold 0.15), plain `opacity:0; translateY(24px)` → visible, staggered via `data-reveal="1..4"`. No rotation (removed in v2.1, stays removed).
- **Stat count-up, parallax, reviews marquee**: unchanged mechanics. Parallax factors: about photo `0.05`, hero photo `0.04`.
- **`prefers-reduced-motion: reduce`**: scroll-reveal shows content instantly, parallax never attaches, stat counters skip to final values, the reviews marquee falls back to native scroll.
- **Rule of thumb, still in force:** no animation directly on food/product photography, and no decorative motion for its own sake (spinning/tilting was tried and explicitly walked back).

**CSS gotcha worth remembering:** `[data-reveal].in-view` and the parallax script's inline `el.style.transform = ...` both **fully replace** the `transform` property — they don't compose with a separate static `transform` on the same element. If a future element needs both a scroll/parallax effect *and* its own static transform, put the JS-driven attribute on a plain wrapper `<div>` around it, not on the element with the static transform.

## Accessibility

Unchanged — skip-link, `<main>` landmark, `aria-hidden` on decorative icons/leader-lines, visible focus outlines (`outline:2px solid var(--red)`), 44×44px minimum touch targets, real `aria-label`s, no heading-level skips, per-background AA contrast discipline.

## SEO / meta

Unchanged this pass — canonical link, `apple-touch-icon.png`, full OG/Twitter tags with `og-image.jpg`, `Restaurant` schema.org JSON-LD, print stylesheet (updated to match the new Menu markup — no more receipt/ticket-edge selectors), themed `::selection`/scrollbar. **Follow-up worth doing:** `og-image.jpg` now predates two redesigns' worth of type/layout changes — regenerate it next time it's touched.

## Known gaps (tracked, not yet fixed)

- **Menu prices are placeholders** (`₹—`).
- **No `<noscript>` fallback**: `[data-reveal]` elements stay at `opacity:0` with JS disabled.
- **Stock photography**: five of six gallery images (plus the hero) are stock/studio shots.
- **`og-image.jpg` is stylistically stale** — see SEO/meta above.
- **The menu no longer has its own signature motion device** now that the receipt-print-in is gone — worth a calm (non-tilting, non-spinning) replacement if the page ever feels like it needs one more focal moment.

## Adding a new section

1. New component under `src/components/`, imported into [src/pages/index.astro](src/pages/index.astro).
2. **Default to no box.** Reach for whitespace + a rule-line (`--line` hairline or a `1–2px solid var(--ink)` edge) before reaching for `border:1.5px solid var(--ink)` all around something. If a genuine card is unavoidable, ask whether it should just be full-bleed or list-style instead.
3. Reuse existing utility classes (`.section`, `.container`, `.section-title`, `.btn` variants). No kicker/tag label above the heading.
4. **No tilt, no rotate-on-hover, no spinning decorative elements** — tried and explicitly walked back twice now.
5. New icons go into [IconSprite.astro](src/components/IconSprite.astro) as `<symbol>`s, same stroke style as the rest.
6. Any scroll-triggered element gets `data-reveal`; any drifting element gets `data-parallax="0.05–0.2"` — if it also needs a static transform, wrap rather than combine (see the CSS gotcha in Motion).
7. Check the new color/text pairing against the AA contrast rule before shipping — per-background, not per-token.
8. Before defaulting to the "plain text + trailing `<em>` accent" headline formula, check whether enough sections already use it — vary it if so.
