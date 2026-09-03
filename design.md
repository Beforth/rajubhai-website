# Rajubhai Dabeliwale — Design System

Editorial, warm, slightly vintage. Not a startup landing page: no gradient blobs, no emoji icons, no cartoon hard-shadow buttons, no corner brackets, no floating badge circles, **no kicker/eyebrow labels above headings** (a hard ban — the heading carries its own weight). Sharp corners, hairline borders, restrained motion. Confident minimalism spends its restraint on one or two deliberate moments per page (About's full-bleed photo, Gallery's dominant tile) rather than applying the identical frame to everything uniformly — uniform restraint reads as bland, not considered.

Built as an [Astro](https://astro.build) static site. Global styles and behavior live in [src/layouts/Layout.astro](src/layouts/Layout.astro); each section is its own component under [src/components/](src/components/).

## Color

Exactly these ten tokens, defined once in `:root` (`Layout.astro`). Never invent a new hex.

| Token | Hex | Use |
|---|---|---|
| `--red` | `#FF0917` | Primary CTAs, links, small accents |
| `--gold` | `#FFDF54` | Highlights on dark sections, icon fills |
| `--peach` | `#FFD8B4` | Soft section backgrounds (Dine-In) |
| `--orange` | `#F67D00` | Secondary accent, tile backgrounds |
| `--maroon` | `#904137` | Headings, icons, ratings, small labels, AA-safe text on `--peach` |
| `--paper` | `#FBF6EF` | Default background |
| `--paper-2` | `#F4EADC` | Alternate section background (About) |
| `--ink` | `#2B1712` | Primary text, dark section backgrounds |
| `--line` | `rgba(43,23,18,.14)` | Hairline borders |
| `--muted` | `#7a5f56` | Secondary text — **fails AA on both `--ink` and `--peach`, see below** |

**Contrast rule:** `--red` and `--orange` fail WCAG AA (4.5:1) for small text on `--paper`. Only use them for large display type, buttons, and backgrounds. `--muted` itself only clears AA on `--paper`/`--paper-2` — on `--ink` (dark footer) use `#a88a7f` instead, and on `--peach` (Dine-In) use `--maroon` instead. Check any new color/text pairing against 4.5:1 before shipping; don't assume `--muted` travels to every background.

## Typography

Two families only, loaded via Google Fonts (`Zilla+Slab:ital,wght@0,400;0,500;0,600;0,700;1,500;1,600` + `Karla:wght@400;500;600;700`):

- **Zilla Slab** — all headings, the crest wordmark, stat numbers, pull-quotes, `em` emphasis
- **Karla** — body copy, nav, buttons, UI labels

| Element | Size | Weight |
|---|---|---|
| H1 | `clamp(48px, 7.5vw, 88px)` | 600 |
| H2 | `clamp(34px, 5.2vw, 62px)` | 600 |
| Pull-quote | `clamp(22px, 2.6vw, 28px)` italic | 500 |
| Body | 15–17px | 400 |
| Buttons / labels | 13px, 700, uppercase, 1.5px letter-spacing |

Line-height: 1.65 body, ~1.04 large headings. `em` inside headings/copy renders italic in `--maroon` (or `--gold`/`--peach` on dark sections) — never bold-red. Scale runs deliberately large at the top of the page (H1, stat numbers) — a client review called an earlier, more conservative pass "safe" and "cheap"; don't walk the ceiling back down without a reason.

**Specificity trap to watch for:** a generic descendant selector like `.about-text p` can silently beat a single-class selector like `.pull` on the same element (`.about-text p` has specificity 0,1,1 vs `.pull`'s 0,1,0) regardless of source order — this happened for real and the pull-quote rendered at 15.5px muted body-text size instead of its intended 28px maroon for the entire time it existed. When a classed element sits inside a container that also has a generic tag-selector rule, scope the class selector to the container too (`.about-text .pull`, specificity 0,2,0) rather than relying on source order to save you.

**Headline formula variety:** most section H2s use a "plain phrase + `<em>` accent" formula (e.g. "Off the *menu board*"), but at least two on the page deliberately break it — About/Gallery/Reviews/OrderCta lead with plain text and trail with the em accent, Gallery inverts that (em leads: "*A closer look* at the stall"), and Dine-In drops the em split entirely for a single plain statement ("You're always welcome here."). When adding a section, don't default to the trailing-em formula if five others already use it.

## Layout conventions

- `border-radius: 0` everywhere — cards, buttons, frames all sharp-cornered
- Borders: `1.5px solid var(--ink)` on cards/frames; `2px` on buttons and the header crest — buttons and the crest are meant to feel substantial, not thin
- No drop-shadows at rest, with two deliberate exceptions: the primary button (`--red` at rest, permanent soft red glow) and About's full-bleed photo. Everything else only gets a shadow on hover-lift (`translateY(-2px)` + soft colored shadow). Two exceptions, not a pattern — don't add a third without a reason.
- `.btn-primary` is filled `--red` at rest (not `--ink`) — buttons are explicitly whitelisted for red per the contrast rule above, and a red-at-rest CTA is one of the highest-leverage moves for color confidence on an otherwise paper/ink page. Hover deepens to `--maroon`.
- `.container` — `max-width: 1200px`, `padding: 0 32px`
- `.section` — `padding: 144px 0` (`92px` at ≤1010px). About no longer uses `.section`/`.container` for its full width — see below. A client review called an earlier, tighter pass (120px/80px) too dense; err toward more room, not less, and carry that through heading margins, grid gaps, and card padding too — don't just widen the outer section padding and leave everything inside it cramped.
- Faint (`opacity: .045`) SVG fractal-noise paper-grain texture, fixed, `mix-blend-mode: multiply`, pointer-events none — gives the flat paper background some tooth. (Started at `.025`, which is imperceptible at normal viewing distance and wasn't earning the "editorial, slightly vintage" identity this doc claims — bumped once for real texture; don't push past ~0.06 or it starts reading dirty rather than textured.)
- **No same-size icon+heading+text card grids** — a hard ban per the craft floor. About's four feature points (Authentic / Fresh Daily / Legacy / 30+ Varieties) used to be exactly this (bordered cells, hairline grid background) and were flagged early as the one deferred "same-size card" violation on the page; now just icon + text pairs with generous gap, no border, no background box. If a future section wants to list 3-5 short facts, reach for this pattern (or the stat-strip's number+label row), not a bordered card grid.
- **No kicker/eyebrow labels, and no decorative section numbering** (01/02/03…). Both were removed sitewide — they read as generic template scaffolding and the numbering never covered every section anyway. A heading stands alone; if a section needs a label, put the context in the heading itself.
- **Structural color accents beyond buttons**: a handful of borders carry brand color instead of `--line` — the receipt-head divider and each menu category underline (`--orange`, 2px), the Dine-In hours card's top edge (`--orange`, 5px), the footer's top edge (`--gold`, 4px), and hover states on gallery/review cards (`border-color: var(--red)`). These are deliberate, not decoration for its own sake — color was concentrated almost entirely in buttons/stat-numbers before, and the rest of the page read as flat because of it. Reach for one of the existing tokens on a structural border before reaching for a new decorative element.

## Header / nav

- Sticky, `backdrop-filter: blur(6px)`, translucent paper background, bottom hairline
- Logo = circular crest (bordered ring, `overflow:hidden`) containing the real brand mark `/logo.png`, plus wordmark "Rajubhai Dabeliwale" / "Est. 1987 · Nashik" (subtitle hidden ≤480px to keep the mobile header one line — real info, but already redundant with Hero/Footer)
- Desktop: logo + 6 links (Home, About, Menu, Gallery, Reviews, Contact) + "Call to Order" pill (`tel:` link, phone icon), one row
- **Breakpoint is 1010px**, not 768/900 — the full row genuinely doesn't fit any later without clipping the CTA button
- Below 1010px: hamburger (44×44px tap target, `aria-expanded`/`aria-controls` wired) → dropdown of stacked links, `position:absolute; top:100%` off the header itself (not a hardcoded px guess against a header whose height varies with content)
- All CTAs across the site ("Call to Order" in header/hero/menu, "Call to Order" + "Get Directions" in the Order CTA band) are real actions (`tel:`/Maps links) — online ordering isn't live, so nothing pretends otherwise or opens a placeholder dialog

## Icons

Line icons only: `stroke: currentColor; stroke-width: 1.5; fill: none`. Defined once as `<symbol>` elements in a hidden sprite ([IconSprite.astro](src/components/IconSprite.astro)), referenced via `<use href="#i-name"/>`. All decorative icons carry `aria-hidden="true"`. No emoji, no filled-icon style.

## Sections

| Component | Notes |
|---|---|
| [Header.astro](src/components/Header.astro) | Sticky nav, see above |
| [Hero.astro](src/components/Hero.astro) | H1 + count-up stat strip (1987 / 30+ / 4.8) + photo card that fills its grid column (no artificial width cap) |
| [About.astro](src/components/About.astro) | The one deliberately bold section — see Layout conventions and Images. `--paper-2` background (with a 1px `--line` top border — `--paper`→`--paper-2` alone is too subtle a shift to read as a section change), faint "1987" watermark behind the text column |
| [Menu.astro](src/components/Menu.astro) | Dark `--ink` section, receipt-style card with ticket-notch cutouts, items grouped into categories (Dabeli / Fafda & Chaat / Sandwiches, Burgers & More) with descriptions, a `Signature` badge on 3 items, and a price column (currently `₹—` placeholders — real prices pending from the client) |
| [Gallery.astro](src/components/Gallery.astro) | Asymmetric 3-column grid, not a uniform tile wall — see Images. Sizing is `aspect-ratio`-only (no fixed pixel row-heights, no flexbox); that's a hard lesson, not a style preference — see the note below. |
| [DineIn.astro](src/components/DineIn.astro) | `--peach` background, opening-hours card |
| [Reviews.astro](src/components/Reviews.astro) | Auto-drifting marquee, see Motion |
| [OrderCta.astro](src/components/OrderCta.astro) | Dark, diagonal-stripe texture overlay, two real CTAs |
| [Footer.astro](src/components/Footer.astro) | Logo, hours, quick links, contact, dynamic copyright year |

## Images

Real photography, not AI-generated — supplied by the business or sourced to match the actual menu, stored in [public/](public/) (`.webp`, resized/compressed from the original `.jpg`/`.png` uploads to keep page weight down — see Performance). Most sit `object-fit: cover` inside bordered frames, but two are deliberately unframed:

| Slot | File | Notes |
|---|---|---|
| Header/footer crest | `logo.png` | Real brand mark (red circle, gold script "R", "Since 1987") |
| Browser favicon | `favicon.png` | (not `favicon.ico` — that file is leftover Astro-scaffold branding, unused and deleted) |
| Hero visual | `book-table-img.webp` | Signature Kutchi Dabeli, fills its frame-card at full column width |
| **About photo** | `about-img.webp` | **Full-bleed, unframed, no caption** — the section's one deliberate break from the page's own frame-everything convention. Bleeds from the text column's right edge to the viewport's right edge (`.about-bleed` grid + a `calc()` that matches `.container`'s left gutter for the text column) |
| Gallery — Signature Dabeli (**featured tile**) | `dish-1.webp` | **Unframed**, `grid-column:span 2`, `img{aspect-ratio:16/9}` — caption overlaid on a bottom gradient scrim, the gallery's one dominant tile |
| Gallery — Kutchi Kadak | `book-table-img3.webp` | Standard framed tile, `.box{aspect-ratio:1/1}` |
| Gallery — Kathiyawadi Fafda | `book-table-img4.webp` | Standard framed tile, `.box{aspect-ratio:1/1}` |
| Gallery — Club Sandwich | `dish-5.webp` | Standard framed tile, `.box{aspect-ratio:1/1}` |
| Gallery — Dahi Puri | `book-table-img2.webp` | Standard framed tile, `.box{aspect-ratio:1/1}` |
| Gallery — Our Nashik Outlet (**wide tile**) | `about-img.webp` | Framed, `grid-column:span 3`, `.box{aspect-ratio:3/1}` — a closing banner strip |

**Lesson learned on the two special tiles:** the featured and wide tiles were originally sized with fixed-pixel `grid-template-rows` + `grid-row:span 2` (featured) and a column-flexbox with `flex:1` (wide). Both broke in production — the flexbox version let the image balloon past its frame because flex items default to `min-height:auto`, computed from the image's own intrinsic size rather than the ~200px actually available; the fixed-row version required hand-matching row heights to every breakpoint's spans, which drifted out of sync at least once. Both are now sized by `aspect-ratio` alone (`16/9` and `3/1` respectively) — height derives directly from width, no distribution logic, no per-breakpoint height to maintain. If a future tile needs a distinct shape, give it an `aspect-ratio`, not a fixed height or a flex context.

Unused leftover template assets in `public/` (garlic.png, mashroom.png, leaf.png, menu-bg.png, banner-shape-1.png, title-shape.svg, blog-pattern-bg.png, newsletter-bg.jpg, testimonials-bg.jpg, loader.jpg, dish-2/3/4/6/7/8.png, book-table-img5.jpg, and the original unresized about-img.jpg/book-table-img*.jpg/dish-1.png/dish-5.png) were deliberately **not** wired in — the template ones read as generic stock decoration; the unresized originals are kept on disk only as source material behind the `.webp` versions actually served.

Photography itself is still a mix of real (the storefront) and stock/studio (five of six gallery shots, the hero) — known, accepted for now per the client's choice to defer replacing them. If real stall photos become available, swap the gallery/hero sources directly; the frame/bleed treatment doesn't need to change.

## Performance

Images are pre-resized and converted to WebP at build-prep time (via `cwebp`, not an Astro image pipeline) to the largest size they're ever displayed at, roughly halving-to-tenthing original file weight (the full image set went from ~4.1MB to ~630KB). When adding a new photo: resize it to its actual max display width before adding it to `public/`, prefer `.webp`, and reference it directly — there's no automatic optimization step in this project.

## Motion

One authored focal moment, specific to this brand rather than a generic effect — everything else in this list is supporting motion, not the main event. (An earlier pass also added looping steam wisps over the hero photo; removed on client feedback — no animation directly on the food photography.)

- **The receipt prints in** (Menu): instead of the generic fade+rise every other section uses, `.receipt` reveals via an animated `clip-path: inset()` from top to bottom (0.9s, `cubic-bezier(.16,1,.3,1)`) — reads as paper feeding out of an order-ticket printer, extending the site's one genuinely brand-specific device (the receipt-styled menu). Implemented as `.receipt[data-reveal]` overriding the generic `[data-reveal]` rule (needs the extra specificity — see the specificity-trap note in Typography). Reduced motion: `clip-path:none !important`, full content visible instantly.
- **Scroll-reveal**: elements start `opacity:0; translateY(24px)`, animate in via `IntersectionObserver` (threshold 0.15), class added once then unobserved. Staggered via `transition-delay` of `.05s / .15s / .25s / .35s` (`data-reveal="1..4"`).
- **Stat count-up**: the hero's three stats (1987 / 30+ / 4.8) count up from 0 once the strip scrolls into view, reusing the same reveal observer. The real final value stays in the static HTML (JS resets to 0 and animates back up), so no-JS/SEO see correct content. Skipped under reduced motion.
- **Parallax**: `requestAnimationFrame`-throttled, skips elements far off-screen. Factors: about watermark `0.18` (most drift), about photo `0.05`, hero frame card `0.06`. Kept in the 0.05–0.2 range on purpose — stronger looks gimmicky.
- **Reviews marquee**: continuous auto-drift at `70px/s`, driven by `transform: translateX()` (GPU-composited, not `scrollLeft`, to stay smooth at speed). Cards are duplicated in the DOM for a seamless loop; edges fade via a mask gradient. Pauses on hover/touch/focus; manual prev/next arrows trigger an eased jump (exponential ease, ~0.6s) and re-arm auto-drift after 2.8s idle.
- **`prefers-reduced-motion: reduce`**: scroll-reveal shows content instantly (no transition), the parallax listener never attaches, the stat counters skip straight to their final values, the reviews marquee falls back to a plain native scroll container driven only by the arrow buttons, and the receipt appears fully visible with no print-in clip.
- **Rule of thumb going forward: no animation directly on the food/product photography itself** (per client feedback) — motion on surrounding UI (cards, text, layout) is fine; overlays or effects on top of the images are not.

## Accessibility

- Skip-to-content link, first element in `<body>`, visually hidden until focused
- All main sections wrapped in a `<main>` landmark
- `aria-hidden="true"` on every decorative icon/svg (including the duplicated, off-screen half of the reviews marquee)
- Visible focus outlines: `outline: 2px solid var(--red); outline-offset: 3px`
- Minimum 44×44px touch targets on icon-only buttons (hamburger, review arrows)
- Real `aria-label`s on all icon-only interactive buttons; hamburger also carries `aria-expanded`/`aria-controls`, kept in sync with its open state
- Heading levels don't skip (h2 → h3, never straight to h4) — check this when adding a section with its own sub-heading
- Contrast: every text/background pairing must pass WCAG AA (4.5:1 normal, 3:1 large) — see the Color section's note on where `--muted` actually applies; two real failures (footer logo subtitle, Dine-In intro text) were found and fixed by an external design review, so don't assume a pairing is safe just because `--muted`/`--maroon` is "the AA-safe token" — verify per background.

## SEO / meta

Canonical link, `favicon.png`, `theme-color #2B1712`, Open Graph + Twitter Card tags, and a `Restaurant` schema.org JSON-LD block (cuisine, price range, phone, email, full address, opening hours) — all defined in `Layout.astro`'s `<head>`.

## Known gaps (tracked, not yet fixed)

- **Menu prices are placeholders** (`₹—`). Real per-item prices from the client are needed before this is production-honest — the receipt visually promises a price column it doesn't yet deliver.
- **No `<noscript>` fallback**: with JavaScript disabled, `[data-reveal]` elements stay at `opacity:0` permanently (nothing un-hides them without the reveal script). Low-cost, high-value fix if it comes up again.
- **Stock photography**: five of six gallery images (plus the hero) are stock/studio shots, not photos of this actual stall. Kept as-is per the client's choice; swap in real stall photos when available — see Images.

## Adding a new section

1. New component under `src/components/`, imported into [src/pages/index.astro](src/pages/index.astro)
2. Reuse existing utility classes (`.section`, `.container`, `.section-title`, `.btn` / `.btn-primary` / `.btn-outline` / `.btn-cream`) before inventing new ones. Do not add a kicker/tag label above the heading — that pattern is banned sitewide.
3. New icons go into [IconSprite.astro](src/components/IconSprite.astro) as `<symbol>`s, same stroke style as the rest
4. Any scroll-triggered element gets `data-reveal` (optionally `="1"`–`"4"` for stagger); any drifting element gets `data-parallax="0.05–0.2"`
5. Check the new color/text pairing against the AA contrast rule before shipping — per-background, not per-token (see Color)
6. Before defaulting to the "plain text + trailing `<em>` accent" headline formula, check whether enough sections already use it (see Typography) — vary it if so
