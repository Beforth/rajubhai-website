# Rajubhai Dabeliwale — Design System

Editorial, warm, slightly vintage. Not a startup landing page: no gradient blobs, no emoji icons, no cartoon hard-shadow buttons, no corner brackets, no floating badge circles. Sharp corners, hairline borders, restrained motion.

Built as an [Astro](https://astro.build) static site. Global styles and behavior live in [src/layouts/Layout.astro](src/layouts/Layout.astro); each section is its own component under [src/components/](src/components/).

## Color

Exactly these ten tokens, defined once in `:root` (`Layout.astro`). Never invent a new hex.

| Token | Hex | Use |
|---|---|---|
| `--red` | `#FF0917` | Primary CTAs, links, small accents |
| `--gold` | `#FFDF54` | Highlights on dark sections, icon fills |
| `--peach` | `#FFD8B4` | Soft section backgrounds (Dine-In) |
| `--orange` | `#F67D00` | Secondary accent, tile backgrounds |
| `--maroon` | `#904137` | Headings, icons, ratings, small labels |
| `--paper` | `#FBF6EF` | Default background |
| `--paper-2` | `#F4EADC` | Alternate section background (About) |
| `--ink` | `#2B1712` | Primary text, dark section backgrounds |
| `--line` | `rgba(43,23,18,.14)` | Hairline borders |
| `--muted` | `#7a5f56` | Secondary text |

**Contrast rule:** `--red` and `--orange` fail WCAG AA (4.5:1) for small text on `--paper`. Only use them for large display type, buttons, and backgrounds. Rating stars, active-nav-state, and small labels use `--maroon` instead.

## Typography

Two families only, loaded via Google Fonts (`Zilla+Slab:ital,wght@0,400;0,500;0,600;0,700;1,500;1,600` + `Karla:wght@400;500;600;700`):

- **Zilla Slab** — all headings, the crest wordmark, stat numbers, pull-quotes, `em` emphasis
- **Karla** — body copy, nav, buttons, UI labels

| Element | Size | Weight |
|---|---|---|
| H1 | `clamp(42px, 6vw, 72px)` | 600 |
| H2 | `clamp(32px, 4.6vw, 54px)` | 600 |
| Body | 15–17px | 400 |
| Buttons / labels | 11–14px | 600–700, uppercase, 1–3px letter-spacing |

Line-height: 1.65 body, ~1.04 large headings. `em` inside headings/copy renders italic in `--maroon` (or `--gold`/`--peach` on dark sections) — never bold-red.

## Layout conventions

- `border-radius: 0` everywhere — cards, buttons, frames all sharp-cornered
- Borders: `1.5px solid var(--ink)`
- No drop-shadows at rest; shadows only appear on hover-lift (`translateY(-2px)` + soft colored shadow)
- `.container` — `max-width: 1200px`, `padding: 0 32px`
- `.section` — `padding: 120px 0` (`80px` at ≤1010px)
- Faint (`opacity: .025`) SVG fractal-noise paper-grain texture, fixed, `mix-blend-mode: multiply`, pointer-events none — gives the flat paper background some tooth

## Header / nav

- Sticky, `backdrop-filter: blur(6px)`, translucent paper background, bottom hairline
- Logo = circular crest (bordered ring, `overflow:hidden`) containing the real brand mark `/logo.png`, plus wordmark "Rajubhai Dabeliwale" / "Est. 1987 · Nashik"
- Desktop: logo + 6 links (Home, About, Menu, Gallery, Reviews, Contact) + "Order Now" pill, one row
- **Breakpoint is 1010px**, not 768/900 — the full row genuinely doesn't fit any later without clipping the Order Now button
- Below 1010px: hamburger (44×44px tap target) → full-width dropdown of stacked links

## Icons

Line icons only: `stroke: currentColor; stroke-width: 1.5; fill: none`. Defined once as `<symbol>` elements in a hidden sprite ([IconSprite.astro](src/components/IconSprite.astro)), referenced via `<use href="#i-name"/>`. All decorative icons carry `aria-hidden="true"`. No emoji, no filled-icon style.

## Sections

| # | Component | Notes |
|---|---|---|
| — | [Header.astro](src/components/Header.astro) | Sticky nav, see above |
| — | [Hero.astro](src/components/Hero.astro) | H1 + stat strip (1987 / 30+ / 4.8) + framed photo card |
| 02 | [About.astro](src/components/About.astro) | `--paper-2` background, giant faint "1987" watermark, single large photo (see Images) |
| 03 | [Menu.astro](src/components/Menu.astro) | Dark `--ink` section, receipt-style card with ticket-notch cutouts, 10 items × ★★★★★ |
| 04 | [Gallery.astro](src/components/Gallery.astro) | 3-col grid (2-col ≤980px), real dish/outlet photography |
| — | [DineIn.astro](src/components/DineIn.astro) | `--peach` background, opening-hours card |
| 05 | [Reviews.astro](src/components/Reviews.astro) | Auto-drifting marquee, see Motion |
| → | [OrderCta.astro](src/components/OrderCta.astro) | Dark, diagonal-stripe texture overlay |
| — | [Footer.astro](src/components/Footer.astro) | Logo, hours, quick links, contact, dynamic copyright year |

Numbered tags (`02`, `03`, `04`, `05`) use an italic Zilla Slab index before the label; unnumbered sections (Hero, Dine-In, Footer, Order CTA) either omit the index or use a symbol (`→`) — never a bare placeholder dash.

## Images

All real photography, not stock/AI-generated — supplied by the business and stored in [public/](public/). Object-fit: cover inside bordered frames.

| Slot | File | Notes |
|---|---|---|
| Header/footer crest | `logo.png` | Real brand mark (red circle, gold script "R", "Since 1987") |
| Browser favicon | `favicon.ico` | |
| Hero visual | `book-table-img.jpg` | Signature Kutchi Dabeli |
| About — Our Nashik Outlet | `about-img.jpg` | Real storefront photo; single enlarged frame (the old second "Hand Cart" placeholder card was removed — no photo exists for it) |
| Gallery — Signature Dabeli | `dish-1.png` | |
| Gallery — Kutchi Kadak | `book-table-img3.jpg` | |
| Gallery — Kathiyawadi Fafda | `book-table-img4.jpg` | |
| Gallery — Club Sandwich | `dish-5.png` | |
| Gallery — Dahi Puri | `book-table-img2.jpg` | |
| Gallery — Our Nashik Outlet | `about-img.jpg` | Reused from About |

Unused leftover template assets in `public/` (garlic.png, mashroom.png, leaf.png, menu-bg.png, banner-shape-1.png, title-shape.svg, blog-pattern-bg.png, newsletter-bg.jpg, testimonials-bg.jpg, loader.jpg, dish-2/3/4/6/7/8.png, book-table-img5.jpg) were deliberately **not** wired in — they read as generic stock-template decoration, which the brand direction explicitly avoids.

## Motion

- **Scroll-reveal**: elements start `opacity:0; translateY(24px)`, animate in via `IntersectionObserver` (threshold 0.15), class added once then unobserved. Staggered via `transition-delay` of `.05s / .15s / .25s / .35s` (`data-reveal="1..4"`).
- **Parallax**: `requestAnimationFrame`-throttled, skips elements far off-screen. Factors: about watermark `0.18` (most drift), about photo `0.05`, hero frame card `0.06`. Kept in the 0.05–0.2 range on purpose — stronger looks gimmicky.
- **Reviews marquee**: continuous auto-drift at `70px/s`, driven by `transform: translateX()` (GPU-composited, not `scrollLeft`, to stay smooth at speed). Cards are duplicated in the DOM for a seamless loop; edges fade via a mask gradient. Pauses on hover/touch/focus; manual prev/next arrows trigger an eased jump (exponential ease, ~0.6s) and re-arm auto-drift after 2.8s idle.
- **`prefers-reduced-motion: reduce`**: scroll-reveal shows content instantly (no transition), the parallax listener never attaches, and the reviews marquee falls back to a plain native scroll container driven only by the arrow buttons — no autoplay.

## Accessibility

- Skip-to-content link, first element in `<body>`, visually hidden until focused
- All main sections wrapped in a `<main>` landmark
- `aria-hidden="true"` on every decorative icon/svg (including the duplicated, off-screen half of the reviews marquee)
- Visible focus outlines: `outline: 2px solid var(--red); outline-offset: 3px`
- Minimum 44×44px touch targets on icon-only buttons (hamburger, review arrows)
- Real `aria-label`s on all icon-only interactive buttons
- Contrast: every text/background pairing passes WCAG AA (4.5:1 normal, 3:1 large) — the reason ratings/labels/active-nav-state use `--maroon` rather than `--red`/`--orange`

## SEO / meta

Canonical link, `favicon.ico`, `theme-color #2B1712`, Open Graph + Twitter Card tags, and a `Restaurant` schema.org JSON-LD block (cuisine, price range, phone, email, full address, opening hours) — all defined in `Layout.astro`'s `<head>`.

## Adding a new section

1. New component under `src/components/`, imported into [src/pages/index.astro](src/pages/index.astro)
2. Reuse existing utility classes (`.section`, `.container`, `.tag`, `.section-title`, `.btn` / `.btn-primary` / `.btn-outline` / `.btn-cream`) before inventing new ones
3. New icons go into [IconSprite.astro](src/components/IconSprite.astro) as `<symbol>`s, same stroke style as the rest
4. Any scroll-triggered element gets `data-reveal` (optionally `="1"`–`"4"` for stagger); any drifting element gets `data-parallax="0.05–0.2"`
5. Check the new color/text pairing against the AA contrast rule before shipping
