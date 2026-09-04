# Rajubhai Dabeliwale — Design System (v2)

**v2 note:** this is a complete overhaul of the visual language, not a tweak pass — done on explicit client direction ("completely overhaul the design, idc, just use my colors"). The ten color tokens below are the one thing that survived unchanged from v1; everything else — type, shape, motion, section rhythm — was rebuilt. If you're looking for the old "editorial minimalist, sharp corners, hairline borders" system, it's gone; this doc describes what replaced it.

**The new identity: a pinned, stamped, hand-ticketed street stall.** Rajubhai's real story is a hand cart in 1987 that grew into a stall — so the site now leans into that physical, tactile, slightly-imperfect object language: photos are pinned like Polaroids at a tilt, the menu is a torn paper ticket, a wax-seal-style stamp badge spins on the hero photo, buttons are hand-stamped pills. It's still confident and uncluttered (no gradient blobs, no emoji icons, no kicker/eyebrow labels above headings, no corner brackets) — the boldness comes from color, tilt, and a few real signature devices, not from visual noise.

Built as an [Astro](https://astro.build) static site. Global styles and behavior live in [src/layouts/Layout.astro](src/layouts/Layout.astro); each section is its own component under [src/components/](src/components/).

## Color

Exactly these ten tokens, defined once in `:root` (`Layout.astro`) — unchanged since v1, deliberately kept as the one constant through the overhaul. Never invent a new hex.

| Token | Hex | Use |
|---|---|---|
| `--red` | `#FF0917` | Primary CTAs, the hero underline bar, the stamp badge fill |
| `--gold` | `#FFDF54` | Stamp/roundel icon color, footer accents |
| `--peach` | `#FFD8B4` | Bold section backgrounds (About, Dine-In) |
| `--orange` | `#F67D00` | Secondary accent, tile/badge borders |
| `--maroon` | `#904137` | Headings, icons, ratings, AA-safe text on `--peach` |
| `--paper` | `#FBF6EF` | Default background, card/polaroid fill |
| `--paper-2` | `#F4EADC` | Rarely used now — most former paper-2 sections moved to `--peach` for bolder color-blocking |
| `--ink` | `#2B1712` | Primary text, dark section backgrounds, roundel fills |
| `--line` | `rgba(43,23,18,.14)` | Hairline internal dividers (menu rows, footer rule) |
| `--muted` | `#7a5f56` | Secondary text — **fails AA on both `--ink` and `--peach`, see below** |

**Contrast rule:** `--red` and `--orange` fail WCAG AA (4.5:1) for small text on `--paper`. Only use them for large display type, buttons, and backgrounds. `--muted` itself only clears AA on `--paper` — on `--ink` (footer) use `#a88a7f` instead, and on `--peach` (About, Dine-In) use `--maroon` instead. Check any new color/text pairing against 4.5:1 before shipping; don't assume `--muted` travels to every background.

**Color-blocking, not paper-with-accents:** v1 was mostly `--paper` with color used sparingly. v2 leans on full section backgrounds doing more work — About and Dine-In are both bold `--peach` blocks (not adjacent, so the repeat doesn't read as monotonous), Menu and Order CTA and Footer stay `--ink`. Hero, Gallery and Reviews stay `--paper` so the color-blocked sections have something to punctuate.

## Typography

Three families now (was two), loaded via Google Fonts (`Fraunces:ital,wght@0,400;0,500;0,600;0,700;0,900;1,500;1,600;1,700` + `Bebas+Neue` + `Karla:wght@400;500;600;700`):

- **Fraunces** — all headings, `em` emphasis, pull-quotes, the crest wordmark, reviewer names, footer headings. A characterful soft-serif with real personality — replaces Zilla Slab, which read as a fairly generic slab.
- **Bebas Neue** — display numerals and small stamped labels only: the hero stat numbers, the menu price column, "Menu No. 01", the stamp badge's circular text. Tall, condensed, all-caps — reads like something stamped or printed, never used for prose.
- **Karla** — body copy, nav, buttons, UI labels (unchanged from v1).

| Element | Size | Family / weight |
|---|---|---|
| H1 | `clamp(48px, 7.5vw, 90px)` | Fraunces 800 |
| H2 | `clamp(34px, 5.2vw, 64px)` | Fraunces 700 |
| Pull-quote | `clamp(20px, 2.3vw, 25px)` italic | Fraunces 500 |
| Stat numbers / prices | `clamp(46px, 6.4vw, 68px)` / 15px | Bebas Neue 400 |
| Body | 15–17px | Karla 400 |
| Buttons / labels | 13px, 700, uppercase, 1.5px letter-spacing | Karla |

Line-height: 1.65 body, ~0.96–1.02 large headings. `em` inside headings/copy renders italic in `--maroon` (or `--gold`/`--peach` on dark sections) — never bold-red.

**Specificity trap to watch for:** a generic descendant selector like `.about-text p` can silently beat a single-class selector like `.pull` on the same element (`.about-text p` has specificity 0,1,1 vs `.pull`'s 0,1,0) regardless of source order. When a classed element sits inside a container that also has a generic tag-selector rule, scope the class selector to the container too (`.about-text .pull`, specificity 0,2,0) rather than relying on source order to save you.

**Headline formula variety:** most section H2s use a "plain phrase + `<em>` accent" formula (e.g. "Off the *menu board*"), but at least two deliberately break it — Gallery inverts it (em leads: "*A closer look* at the stall"), and Dine-In drops the em split entirely for a single plain statement ("You're always welcome here."). Don't default to the trailing-em formula if most sections already use it.

## Layout conventions

- **Shape language is intentionally mixed now, not uniformly sharp.** Buttons are full pills (`border-radius:999px`). Roundel icons and the stamp badge are circles. Photos and a few cards (Hero's photo, Gallery's small tiles, About's pull-quote, the Dine-In hours card) are sharp-cornered but **tilted** a few degrees, like something physically pinned or placed down slightly askew. The receipt, review cards (now `border-radius:6px`), and the review nav buttons (circular) stay in that softened-but-not-round middle ground. There's no longer a single blanket corner rule — match the nearest existing device (pill / circle / tilted-sharp / soft-rounded) rather than inventing a fifth.
- Borders: `1.5px solid var(--ink)` on cards/frames; `2px` on buttons, the header crest, and now the header's own bottom edge (was a 1px hairline in v1 — bumped to match the bolder overall weight).
- Shadows are used more freely than v1's "two exceptions" rule — every tilted/pinned element (photos, pull-quote, hours card, gallery tiles) carries a soft warm-toned shadow (`rgba(43,23,18,...)`) to sell the "physically placed on the surface" read. Keep shadows warm-toned (ink-based rgba), never cool grey — a grey shadow is the fastest way to make a warm palette look off.
- `.btn-primary` is filled `--red` at rest, deepens to `--maroon` on hover, and now also **rotates ~1.5deg** on hover (all button variants do) — a small hand-stamped flourish, consistent across `.btn-primary/-outline/-cream`.
- `.container` — `max-width: 1200px`, `padding: 0 32px`. `.section` — `padding: 144px 0` (`92px` at ≤1010px) — unchanged from v1.
- Faint (`opacity: .045`) SVG fractal-noise paper-grain texture, fixed, `mix-blend-mode: multiply` — unchanged from v1.
- **No same-size icon+heading+text card grids** — still a hard ban. About's four feature points now use a circular `--ink`/`--gold` icon roundel + text (was a plain icon+text pair in v1) — a roundel is not a bordered card, still fine.
- **No kicker/eyebrow labels, no decorative section numbering** — still banned. This rule survived the overhaul because it's about avoiding generic template scaffolding, not about the old aesthetic specifically.
- **Structural color accents**: the receipt-head divider and menu category underlines (`--orange`), the Dine-In hours card's top edge (`--orange`), the footer's top edge (`--gold`), hover states on gallery/review cards (`border-color:var(--red)`) — all carried over from v1, still the rule of reaching for an existing token before inventing a new decorative element.

## ⚠️ The transform-conflict trap (read this before adding `data-reveal`/`data-parallax` to a tilted element)

This is the one real bug the overhaul introduced, found and fixed during this same pass — worth its own heading so it isn't repeated.

`[data-reveal].in-view` sets `transform: translateY(0) rotate(0)` in CSS, and the parallax script sets `el.style.transform = 'translateY(...)'` directly as an **inline style**. Both of these **fully replace** the `transform` property — they don't compose with a separate `transform: rotate(...)` declared elsewhere on the same element, regardless of specificity (an inline style always wins over any CSS rule; `[data-reveal].in-view`'s specificity beats a plain single-class rule regardless of source order). Two elements were built with a static CSS `rotate()` directly on the same node that also carried `data-reveal` or `data-parallax`, and the rotation was silently getting wiped:

- `.book-card` had `data-reveal` directly on it → the reveal system's `rotate(0)` reset overrode `.book-card{transform:rotate(1.2deg)}` the instant it scrolled into view.
- `.frame-card` (Hero photo) had `data-parallax="0.06"` directly on it → the parallax script's inline `translateY(...)` overrode `.frame-card{transform:rotate(-2.5deg)}` immediately on page load (parallax runs an initial synchronous pass, not just on scroll).

**The fix, and the rule going forward:** never put `data-reveal` or `data-parallax` on the same element that also carries a static CSS `rotate()`/`transform`. Wrap it — put the JS-driven attribute on a plain wrapper `<div>` with no styling of its own, and keep the tilted element as an unstyled-by-JS child inside it:

```html
<div data-reveal> <!-- or data-parallax="0.06" -->
  <div class="book-card">…</div> <!-- keeps its own static transform:rotate(...) safely -->
</div>
```

`Hero.astro`'s `.frame-parallax` (parallax wrapper) → `.frame-card` (rotated polaroid) is the reference example. `DineIn.astro`'s outer `data-reveal` div → `.book-card` is the other. Before adding a new tilted element, check whether it needs `data-reveal`/`data-parallax` at all, and if so, wrap rather than combine.

## Header / nav

Unchanged structurally from v1 — sticky, `backdrop-filter: blur(6px)`, translucent paper background, now a `2px solid var(--ink)` bottom edge (was a 1px hairline). Logo, breakpoint (1010px), hamburger behavior, and the always-visible "Call to Order" pill are all as before — see [Header.astro](src/components/Header.astro).

## Icons

Line icons only: `stroke: currentColor; stroke-width: 1.5; fill: none`, defined once as `<symbol>`s in [IconSprite.astro](src/components/IconSprite.astro), referenced via `<use href="#i-name"/>`. Unchanged from v1. About's points now wrap the icon in a `.icon-roundel` (44px circle, `--ink` fill, `--gold` icon) instead of a bare icon — the one new icon-presentation pattern.

## Sections

| Component | What changed in v2 |
|---|---|
| [Hero.astro](src/components/Hero.astro) | H1 now Fraunces 800; the em underline bar is thicker, rounded, and rotated (a highlighter-marker feel, not a straight rule). The photo is a **pinned polaroid**: thick paper border, tilted `-2.5deg`, sitting inside a `.frame-parallax` wrapper (parallax lives on the wrapper, not the card — see the transform-conflict note above). A **spinning stamp badge** (`.stamp`, pure CSS/SVG `<textPath>`, 26s linear rotation, no JS) overlaps the photo's top-left corner reading "EST. 1987 · NASHIK · KUTCHI DABELI" around a red seal with a chili icon at center — the page's one always-moving signature detail. The "1987" watermark from v1 is gone (this badge replaces its job, more dynamically). Stat numbers are Bebas Neue now, not italic Zilla Slab. |
| [About.astro](src/components/About.astro) | Background is now bold `--peach` (was a barely-there `--paper-2`). The pull-quote is a tilted "sticky note" — a small `--paper` card floating on the peach block with a rotate + drop shadow, instead of a plain border-left rule. Points use the new icon-roundel. Body/point text switched from `--muted` to `--maroon` (the AA-safe token on peach). Full-bleed photo device kept as-is — still the one deliberate structural break, still works. |
| [Menu.astro](src/components/Menu.astro) | Structurally the same 3-column receipt as v1, but the receipt now ends in a **torn ticket-stub edge** (`.ticket-edge`, a radial-gradient scallop pattern showing the dark `--ink` menu-section background through a row of bites) instead of a flat bottom border — the "paper feeding out of a printer" reveal now visually pays off with an actual torn edge, not just a straight rectangle. `receipt-head span` and `.menu-price` moved to Bebas Neue. |
| [Gallery.astro](src/components/Gallery.astro) | The four small tiles are now tilted polaroids (`--tilt` custom property set per-figure in the markup, alternating ±1.5–2deg), straightening + lifting on hover. The featured and wide tiles stay flat/untilted on purpose — they read as the "anchor" shots amid the tilted candid ones. Sizing mechanism (`aspect-ratio`-only, no fixed rows/flexbox) is unchanged — that was a hard-won fix, not a style choice, see Images. |
| [DineIn.astro](src/components/DineIn.astro) | `book-card` now tilts `1.2deg` at rest, straightens on hover — same pinned-object language as the photos. `data-reveal` moved to a wrapper div around it, not on the card itself (see transform-conflict note). |
| [Reviews.astro](src/components/Reviews.astro) | Cards softened to `border-radius:6px` (were sharp), nav arrows are now circular. Marquee mechanism unchanged — see Motion. |
| [OrderCta.astro](src/components/OrderCta.astro) | Unchanged structurally; inherits the new pill buttons and Fraunces heading automatically. |
| [Footer.astro](src/components/Footer.astro) | Unchanged structurally; headings moved to Fraunces italic (were Zilla Slab italic — same treatment, new font). |
| [Header.astro](src/components/Header.astro) | See Header/nav above. |

## Images

Real photography, not AI-generated — stored in [public/](public/) as `.webp` (see Performance). Unchanged from v1 except for presentation:

| Slot | File | Notes |
|---|---|---|
| Header/footer crest | `logo.png` | Real brand mark |
| Favicon / iOS icon / OG image | `favicon.png` / `apple-touch-icon.png` / `og-image.jpg` | See SEO/meta — unchanged this pass |
| Hero visual | `book-table-img.webp` | Now a tilted, pinned polaroid with the spinning stamp badge — see Sections |
| **About photo** | `about-img.webp` | Full-bleed, unframed — the one deliberate structural break, kept from v1 |
| Gallery — Signature Dabeli (featured) | `dish-1.webp` | Flat/untilted, `grid-column:span 2` |
| Gallery — Kutchi Kadak, Fafda, Sandwich, Dahi Puri | `book-table-img3/4.webp`, `dish-5.webp`, `book-table-img2.webp` | Tilted polaroid tiles, `--tilt` alternates per tile |
| Gallery — Our Nashik Outlet (wide) | `about-img.webp` | Flat/untilted, `grid-column:span 3` |

**Lesson learned on Gallery's special tiles (still applies):** the featured and wide tiles are sized by `aspect-ratio` alone, not fixed rows or flexbox — both of those broke in production during v1. Don't reintroduce fixed heights or a flex context for a new tile shape; give it an `aspect-ratio`.

Photography is still a mix of real (storefront) and stock/studio (five of six gallery shots, the hero) — known, accepted per the client's earlier choice.

## Performance

Unchanged: images pre-resized/converted to WebP via `cwebp` at build-prep time, not an Astro image pipeline. Resize new photos to their actual max display width before adding to `public/`.

## Motion

- **Spinning stamp badge** (Hero): the new signature moment, replacing v1's receipt-print-in as "the one thing that's always moving" — though the receipt print-in is still there too (see below). Pure CSS `@keyframes` rotation on an SVG, 26s linear infinite, `animation:none` under reduced motion. No JS dependency, so it can never desync or fail to attach.
- **The receipt prints in** (Menu): unchanged from v1 — `clip-path: inset()` animates top-to-bottom on scroll-reveal (0.9s, `cubic-bezier(.16,1,.3,1)`), now finishing with the torn ticket-edge as part of the same reveal (the edge is in-flow inside `.receipt`, so it clips/reveals along with everything else).
- **Scroll-reveal**: unchanged mechanism (`IntersectionObserver`, threshold 0.15, `data-reveal="1..4"` stagger), but the base transform is now `translateY(26px) rotate(-.7deg)` → `translateY(0) rotate(0)` (was a plain translateY) — a barely-perceptible "settling straight" motion on entrance, consistent with the tilted-object language. **See the transform-conflict warning above before putting `data-reveal` on anything that also needs a static tilt.**
- **Stat count-up, parallax, reviews marquee**: unchanged mechanics from v1 — see the v1 history in git log if you need the original rationale. Parallax factors: about photo `0.05`, hero frame wrapper `0.06`.
- **`prefers-reduced-motion: reduce`**: scroll-reveal shows content instantly, parallax never attaches, stat counters skip to final values, the reviews marquee falls back to native scroll, the receipt appears fully visible with no print-in clip, and the stamp badge simply stops spinning (still visible, just static).
- **Rule of thumb, still in force: no animation directly on the food/product photography itself** — the stamp spins on top of the photo's corner, never on the photo; the tilt on photo frames is a static rest-state, not an animated effect.

## Accessibility

Unchanged from v1 — skip-link, `<main>` landmark, `aria-hidden` on decorative icons, visible focus outlines (`outline:2px solid var(--red)`), 44×44px minimum touch targets, real `aria-label`s, no heading-level skips, and the same per-background AA contrast discipline (see Color). The new `.icon-roundel` and `.stamp` are both `aria-hidden="true"` (purely decorative, the text they contain — brand name, "1987 · Nashik" — is already present elsewhere as real content).

## SEO / meta

Unchanged this pass — canonical link, `apple-touch-icon.png`, full OG/Twitter tags with `og-image.jpg`, `Restaurant` schema.org JSON-LD, print stylesheet, themed `::selection`/scrollbar. See git history for the pass that added these. **Follow-up worth doing:** `og-image.jpg` was generated for the v1 aesthetic (a Georgia-serif approximation) — it's still accurate in content/color but no longer matches the live site's Fraunces/Bebas Neue type or tilted-polaroid language. Regenerate it to match next time it's touched.

## Known gaps (tracked, not yet fixed)

- **Menu prices are placeholders** (`₹—`). Real per-item prices from the client are needed before this is production-honest.
- **No `<noscript>` fallback**: with JavaScript disabled, `[data-reveal]` elements stay at `opacity:0` permanently.
- **Stock photography**: five of six gallery images (plus the hero) are stock/studio shots. Kept as-is per the client's choice.
- **`og-image.jpg` is stylistically stale** — see SEO/meta above.

## Adding a new section

1. New component under `src/components/`, imported into [src/pages/index.astro](src/pages/index.astro)
2. Reuse existing utility classes (`.section`, `.container`, `.section-title`, `.btn` variants) before inventing new ones. No kicker/tag label above the heading.
3. Pick a shape treatment that matches an existing device — pill (buttons), circle (roundels/badges/nav arrows), tilted-sharp (photos/pinned cards), or soft-rounded (receipt/review cards) — rather than a fifth new corner style.
4. New icons go into [IconSprite.astro](src/components/IconSprite.astro) as `<symbol>`s, same stroke style as the rest.
5. Any scroll-triggered element gets `data-reveal`; any drifting element gets `data-parallax="0.05–0.2"` — **if that element (or one you're wrapping) also has a static CSS tilt, read the transform-conflict warning above first and wrap instead of combining.**
6. Check the new color/text pairing against the AA contrast rule before shipping — per-background, not per-token (see Color).
7. Before defaulting to the "plain text + trailing `<em>` accent" headline formula, check whether enough sections already use it — vary it if so.
