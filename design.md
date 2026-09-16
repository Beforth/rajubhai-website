# Rajubhai Dabeliwale — Design System (v5)

**History, briefly:**
- **v1** — editorial-minimalist: sharp corners, hairline borders, mostly paper backgrounds, everything in a bordered "card" box.
- **v2** — a "pinned & stamped" overhaul: new type (Fraunces/Bebas Neue), bold color-blocking, tilted Polaroids, a spinning stamp badge. Feedback: **"i dont want too funky."**
- **v2.1** — kept the type/color, removed every tilt and the spinning badge. Structurally still v1's boxed-card convention underneath.
- **v3** — a real structural break: dropped almost every card/border sitewide in favor of full-bleed photography and rule-lines (a bare dot-leader menu, borderless gallery images, a flat hours list). Feedback: **"no minimal and no funky — make it attractive."**
- **v4** — v3 went too far the other way: no boxes at all read as sparse/unfinished, not "rich." v4 brought back cards — done warm, not stark: rounded corners (18–20px), soft warm-toned shadows, actual brand color on icon roundels and top edges. Also swapped Bebas Neue/Karla for Big Shoulders Display/Plus Jakarta Sans (Fraunces kept).
- **v5 (this version)** — direct feedback on both the motion and the fonts: **"reduce animtions for img slike parralax , cahnge the fonts dude wtf are tehse fonts."** Two changes, no other direction change: (1) parallax removed entirely — the last remaining scroll-driven motion on photos, deleted rather than just disabled; (2) fonts dropped to Poppins + Inter, the two safest/most-recognized webfonts available, ending three rounds of increasingly editorial/trendy type choices that kept not landing. The instruction that has now held across four rounds and should not be re-litigated without new client input: **no tilt, no rotate-on-hover, no spinning/decorative motion, and — as of this round — no scroll-driven motion on photos either.**

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

**Fourth font change, now down to one family.** Zilla Slab+Karla (v1) → Fraunces+Bebas Neue+Karla (v2) → Fraunces+Big Shoulders Display+Plus Jakarta Sans → Poppins+Inter (previous round) → client asked for "a professional font." Poppins' rounded geometric letterforms read as friendly/startup-y rather than serious, so it's gone too — **everything on the page is Inter now**, headings included: `Inter:wght@400;500;600;700;800`. One family, zero pairing risk, about as neutral and "professional software" as a webfont gets (this is the same face GitHub, Notion, Linear, and most serious SaaS products ship with).

- **Inter** — literally everything: headings, `em` emphasis, stat numbers, menu prices, menu category titles, pull-quote, crest wordmark, footer headings, body copy, nav, buttons. Hierarchy now comes entirely from **size and weight** (400/500/600 for body-ish text, 700/800 for headings and display numbers), not from switching families.
- **Still no italics** — same reasoning as before (Inter's italic wasn't loaded and a synthesized oblique looks worse than none), emphasis is weight + `--maroon` color only.
- **If a future request asks to differentiate headings from body again**, reach for a *weight/size* solution before reaching for a second font family — the last three rounds of feedback all trended toward "simpler, safer, fewer distinct type styles," not more.

| Element | Size | Weight |
|---|---|---|
| Hero H1 | `clamp(52px, 6.2vw, 104px)` | 800 |
| H2 | `clamp(34px, 5.2vw, 64px)` | 700 |
| Menu category title | `clamp(19px, 1.8vw, 22px)` | 700 |
| Pull-quote | `clamp(20px, 2.3vw, 25px)` | 600 |
| Stat numbers | `clamp(40px, 4vw, 56px)` | 800 |
| Menu prices | 16px | 700 |
| Body | 15–17px | 400 |

`em` renders in `--maroon` (or `--gold`/`--peach` on dark sections) at a heavier weight than surrounding text — never italic, never bold-red.

**Specificity trap to watch for:** a generic descendant selector like `.about-text p` can silently beat a single-class selector like `.pull` on the same element (0,1,1 vs 0,1,0) regardless of source order. Scope the class to its container (`.about-text .pull`) when this applies.

## Layout conventions — the v4 shape language

- **⚠️ Every section's content must share the exact same left/right edge, at every viewport width — a real bug, found and fixed.** Client report: "the sections are not in the same space... some are to right and some to left." Two real causes, both fixed:
  1. `.hero-text` used a flat `padding: 80px clamp(32px,6vw,96px)` for its left inset, while every `.container`-based section (Menu, Gallery, Dine-In, Reviews, Footer, Order CTA) and `.about-text` use a viewport-centered formula: `padding-left: max(32px, calc((100vw - 1200px)/2 + 32px))`. Below ~1264px wide these look almost identical, which is why it went unnoticed — but past that, `.container`'s inset keeps growing with the viewport while the `clamp()` caps out at 96px, so on a 1920px screen the Hero heading sat at `x:96px` while every other section's heading sat at `x:392px` — a huge, obvious drift. Fixed by giving `.hero-text` the identical `padding-left` formula `.about-text` already used.
  2. The Reviews marquee's own wrapper had an inline `style="max-width:1400px"` while literally every other `.container` on the page — including the Reviews heading and "Read More" button *inside the same section* — uses the default `1200px`. That made the review cards start at a different `x` than their own section's heading. Removed the override.
  - **The invariant to protect going forward:** any new section's readable content (heading, body text, cards) must sit inside plain `.container` (1200px, `padding:0 32px`, centered), or — if it needs to be full-bleed like Hero/About — its text column's left padding must be exactly `max(32px, calc((100vw - 1200px)/2 + 32px))`. Never a flat `clamp()`, a fixed px value, or a different `max-width` for the wrapper. Verify with `getBoundingClientRect().left` on a heading in the new section at a few widths (900px, 1366px, 1920px+) against an existing section's heading — they must match exactly.
- **Cards are back, but warm.** `border-radius: 18–20px` on every card (Menu category cards, Gallery tiles, Review cards, the Dine-In hours card), a soft warm-toned shadow (`rgba(43,23,18,...)`, never cool grey) — **except Gallery tiles, which lost their shadow per direct feedback** and rely on rounded corners + tonal background contrast alone. Don't assume "shadow" is still a blanket rule; check each section's row in Sections below before copying a pattern.
- **Every card lifts on hover, consistently.** `translateY(-6px)` + a deeper version of its own resting shadow — the same small interaction Gallery tiles already had, now applied to Menu category cards, Review cards, and the Dine-In hours card too, so hovering feels the same everywhere a card exists. Plain lift only, no rotation.
- **A few more small hover details, all scale/lift/color only — never rotate:** every button's icon nudges right on hover now (was `.btn-primary`-only; extended to all variants — `.btn:hover .icon`), the header logo's crest scales up slightly and its inner ring turns red on hover, and an icon roundel (Menu category icons, About's point icons) scales up slightly whenever its parent card/row is hovered. Small, cheap, and consistent with the "no funky" motion policy — the rule for a new one: scale or color-shift only, tied to a real hover/focus target, never a loop.
- **The sticky header now carries its own soft shadow** (`0 4px 20px rgba(43,23,18,.06)`) alongside its `2px solid var(--ink)` bottom edge — it was the one major surface with no depth once every card below it picked one up.
- **⚠️ SUPERSEDED — see the "true full-bleed again" bullet below.** ~~Nothing is full-bleed to the true viewport edge anymore.~~ Both Hero's and About's photos used to bleed flush right with zero margin. Client feedback first called this out on About ("the img is too right... proper whitespace on left and right"); when Hero turned out to have the identical issue, feedback followed ("fix the first and second section") to fix it there too. Both `.hero-photo` and `.about-photo-bleed` briefly carried the same `padding-right: max(32px, calc((100vw - 1200px)/2 + 32px))` gutter — since reverted; kept here only so the history of back-and-forth on this makes sense.
- **⚠️ `1fr` alone is not a reliable 50/50 split — a second real bug, found right after the one above.** After fixing the right edges, the client clarified further: "i mean the img staring and ending point" — the photo's *left* edge (where it starts) still didn't line up between Hero and About, and even within one section wasn't reliably at the true midpoint. Two compounding causes:
  1. `.about-bleed` used `grid-template-columns: minmax(0,1fr) min(48vw,640px)` while `.hero` used `1fr 1fr` — two entirely different formulas, so the two sections' photo columns started at different x-positions from each other by construction. Unified both to the same template.
  2. Even after unifying to `1fr 1fr`, Hero's photo still started in the wrong place — because a bare `1fr` track is really `minmax(auto,1fr)` per spec: it won't shrink below its content's min-content width. `.hero-text`'s two nowrap buttons had a combined min-content width wide enough to push that column past 50%, silently skewing the split (measured 1028px/892px at a 1920px viewport instead of 960px/960px). Fixed by using `minmax(0,1fr) minmax(0,1fr)` on both `.hero` and `.about-bleed` — removing the min-content floor forces a genuinely fixed 50/50 split regardless of what's inside either column. (The button row still degrades gracefully if a column ever gets too narrow for it — `.hero-actions{flex-wrap:wrap}` was already there — it just wraps to two rows instead of quietly widening the grid track.)
  - **The lesson for any future two-column full-bleed layout:** if you want two grid columns to be a *precise, content-independent* ratio (50/50 or otherwise), always write `minmax(0, ...)` for each track, never a bare `1fr`/`Npx`/`Nvw` — and verify with `getBoundingClientRect()` on the actual rendered image in both columns at several widths, not just by reading the CSS and assuming a `1fr 1fr` grid produces equal halves.
- **About is now mirrored — photo left, text right** (client: "move ht pic to left and info to right"), the opposite of Hero's text-left/photo-right, for zig-zag rhythm between the two full-bleed sections. Done with CSS `order` on the two grid children (`.about-text{order:2}`, `.about-photo-bleed{order:1}`), not by reordering the markup — so DOM/reading order for screen readers stays text-then-photo regardless of the visual swap. The bleed gutter moved with it: `.about-photo-bleed` now carries `padding-left` (was `padding-right`) with the same formula, since the photo's outer edge is now the left side of the section.
  - **⚠️ SUPERSEDED — see "About now fully mirrors Hero" below.** ~~Same request also flagged real cropping~~ ("dont cut the img"): the photo column was `align-items:stretch`-ed to match the text column's full height, then `object-fit:cover` cropped hard into the sides of this landscape photo (1600×1067) to fill that tall, narrow box. Was fixed with `.about-photo-bleed{align-self:center}` + `aspect-ratio:1600/1067` on the `<img>` (so the box took its height from the image's real ratio instead of stretching) — since reverted in favor of matching Hero exactly; kept here for history.
- **True full-bleed again, on desktop — the whitespace-gutter bullet above is reverted.** Client shared a screenshot of the live Hero photo pointing at the reserved right-side gutter (the maroon placeholder gradient showing through the padding) and asked to "scale the image horizontally right fully," mirrored to About's left side. Removed `padding-right` from `.hero-photo` and the (just-added) `padding-left` from `.about-photo-bleed` entirely — both photos now span their full grid column, true edge to true edge, on desktop. The ≤980px stacked breakpoint is untouched at this point (`.hero-photo`/`.about-photo-bleed` there still get an explicit `padding:0 32px` override), so mobile keeps its own margin regardless.
- **About now fully mirrors Hero's photo treatment, not just its edge.** Client asked again: "do same for second section img — make it like first img — to left only." The `align-self:center` + aspect-ratio-locked `<img>` from two bullets up kept About's photo short and centered (deliberately avoiding any crop), which no longer matched Hero's full-height, `object-fit:cover` look now that both bleed to a true edge. Dropped `align-self:center` and the `aspect-ratio`/`height:auto` on the img — `.about-photo-bleed` is now styled identically to `.hero-photo` (stretches to the grid row's full height, `width:100%;height:100%;object-fit:cover`), just bled left instead of right. The ≤980px breakpoint got the matching update too: `.about-photo-bleed{height:340px}`, the same fixed mobile height Hero uses (was relying on the now-removed aspect-ratio). **Net effect: About's photo crops via `cover` again, same as Hero — the earlier "don't cut the img" fix is fully superseded, not just its padding.**
- **About's copy cut roughly in half.** Client feedback: "this section info is too ai-ish and too much text there... make it good" — the two body paragraphs (~80 words combined) read like generic AI marketing copy (*"established the brand," "quickly became a crowd favourite," "staying true to the values that started it all"*) and were just too much text next to the pull-quote and four points. Merged into one ~35-word paragraph in [About.astro](src/components/About.astro:6) with plainer, more specific phrasing, and dropped the two secondary name-credits (Harshadbhai Gista, Shri. Deepak Ramkrushna Agravat) for brevity — **if those names matter to the client for credit, they should come back in, just not inline in the flowing paragraph.** Core facts (1987 founding, Panchvati, 1991 hand cart, Kutchi Kadak, today's 30+ varieties + Fafda) are all still there. The pull-quote and the four points were already short and stayed as-is.
- **Buttons stay pills** (`border-radius:999px`), unchanged since v2 — already warm/friendly, not part of what needed fixing.
- **No tilt, no rotate-on-hover, no spinning/decorative motion.** This constraint has now survived three rounds (v2.1 removed it, v3 didn't touch it, v4 doesn't touch it either) — treat it as settled unless the client explicitly asks for motion again.
- **Section backgrounds carry more of the color** than v3's mostly-paper approach: About and Dine-In are `--peach`, Menu/Order CTA/Footer are `--ink`, and Gallery now sits on `--paper-2` (added in v4) instead of plain `--paper` — partly so the gallery's paper-colored cards have something to sit *on* rather than blending into an identical background.
- **No same-size icon+heading+text card grids** (About's points still avoid this — icon-roundel + text, not a bordered grid), **no kicker/eyebrow labels, no decorative section numbering** — still hard bans, independent of whichever version of "boxed vs. bare" the page is in.

## Header / nav

Unchanged — sticky, `backdrop-filter: blur(6px)`, translucent paper background, `2px solid var(--ink)` bottom edge, 1010px breakpoint, hamburger, always-visible "Call to Order" pill. See [Header.astro](src/components/Header.astro).

## Icons

Line icons only, `stroke: currentColor; stroke-width: 1.5; fill: none`, defined in [IconSprite.astro](src/components/IconSprite.astro). Menu category icons (`i-dabeli`, `i-bowl`, `i-sandwich`) are back in v4, each in a colored `.menu-cat-icon` roundel matching that category's `--cat-accent`. About's points use `.icon-roundel` (44px circle, `--ink` fill, `--gold` icon).

## Sections

| Component | Structure |
|---|---|
| [Hero.astro](src/components/Hero.astro) | Still the v3 `min-height:100vh` split, finished off per "hero can be better": the photo carries a frosted caption pill (`.hero-photo-tag`, same `rgba(--ink,.55)` + `backdrop-filter:blur` device as Gallery's featured-tile caption) in its bottom-left corner instead of sitting bare, and the stat-strip has vertical hairline dividers between the three numbers (was gap-only spacing with just a top rule) for a more finished, considered feel. The photo is no longer full-bleed to the true edge — see Layout conventions. |
| [About.astro](src/components/About.astro) | Bold `--peach` block, flat paper pull-quote card, icon-roundel points. Photo left, text right (mirrors Hero) via CSS `order`; the photo now matches Hero's treatment exactly — full row height, `object-fit:cover`, true bleed to the left edge (see Layout conventions). |
| [Menu.astro](src/components/Menu.astro) | Rebuilt again: each category is now a rounded (`20px`), shadowed `.menu-cat` card in `--paper`, floating on the dark `--ink` section in a 3-column grid (1 column ≤980px). Each card has a colored icon roundel (`.menu-cat-icon`) matching its `--cat-accent`. Replaces v3's bare dot-leader spread, which read as too sparse for a "menu board." |
| [Gallery.astro](src/components/Gallery.astro) | Each tile is a rounded (`18px`) `.g-card`, `background:var(--paper)`, sitting on a `--paper-2`-tinted section. **No box-shadow** (removed per client feedback — separation now comes from the rounded corners plus the paper-vs-paper-2 tonal contrast alone); hover is a plain `translateY(-6px)` lift, no shadow change either. This is the one place shadows were explicitly asked to go — other cards (Menu, Reviews, Dine-In) keep theirs, see Layout conventions. Sizing is still `aspect-ratio`-only on the `img` (unchanged hard-won mechanism from v1). Featured tile keeps its scrim-overlay caption. |
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

- **Parallax is gone.** The Hero and About photos both drifted slightly on scroll (`data-parallax="0.04"`/`"0.05"`) — removed per direct client feedback ("reduce animations for imgs like parallax"). The `data-parallax` attributes, the CSS `[data-parallax]{will-change:transform}` hook, and the entire parallax `requestAnimationFrame` block in `Layout.astro`'s script were all deleted rather than left dormant — there's no infrastructure left to accidentally re-trigger. Photos are now fully static.
- **Scroll-reveal**: `IntersectionObserver` (threshold 0.15), plain `opacity:0; translateY(24px)` → visible, staggered via `data-reveal="1..4"`. No rotation. Each `.menu-cat` carries its own `data-reveal` (cycling 1–3) rather than one wrapper around the whole spread, since it's a grid of independent cards, not a single list.
- **Stat count-up**: unchanged mechanics.
- **Reviews marquee — a real seamlessness bug fixed.** The auto-drift always duplicated the 6 review cards into 2 identical sets and wrapped the scroll offset at "one set's width" so the loop never visibly ends — that part was correct. But "one set's width" was computed as `track.scrollWidth / 2`, and `.reviews-track` has its own left/right padding (`padding:8px 4px 30px`) which gets counted in `scrollWidth` without being part of the repeating pattern — so the computed half was 8px short of the true repeat period, and the loop wrapped 8px early every cycle (small but real, a visible little jump). Fixed by measuring the actual DOM distance between the first card of set 1 and the first card of set 2 (`cards[half].offsetLeft - cards[0].offsetLeft`) instead of deriving it from the track's total width — immune to whatever padding the track has. **If you ever add padding to `.reviews-track` again, this is why `scrollWidth / 2` would silently drift out of sync — don't go back to it.**
- **Hero underline, draws in once**: `em::after` under "Dabeliwale" used to be a static bar sitting behind the letters (a highlighter-marker effect, permanently there). Client feedback ("remove underline - make it more attractive like micro interaction") replaced it with a thin line *below* the text that animates `scaleX(0)→1` (`transform-origin:left`, 0.8s, 0.35s delay) the moment the hero text settles in — tied to the same `[data-reveal="1"].in-view` state the heading/paragraph already use, so it's one extra rule, not new JS. A one-time entrance moment, not a loop — reduced-motion shows it fully drawn immediately.
- **`prefers-reduced-motion: reduce`**: scroll-reveal shows content instantly, stat counters skip to final values, the reviews marquee falls back to native scroll, the hero underline appears fully drawn with no transition.
- **Rule of thumb, still in force:** no animation directly on food/product photography (there's no motion on photos at all now), and no *looping/decorative* motion for its own sake (spinning/tilting was tried and walked back, parallax too) — a single, purposeful entrance effect like the underline above is the kind of "micro interaction" that's welcome; a continuous or repeating one is not.

**Historical CSS gotcha, kept for reference even though parallax is gone:** `[data-reveal].in-view` sets `transform` directly, which would have fully replaced (not composed with) a separate static `transform` on the same element — this is why `data-reveal` should never sit on an element that also needs a static transform of its own (a tilt, etc.); wrap it in a plain `<div>` instead. Still applies to any future scroll-driven effect, not just the parallax that used to trigger it.

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
4. **No tilt, no rotate-on-hover, no spinning decorative elements, no parallax/scroll-driven drift on photos.**
5. New icons go into [IconSprite.astro](src/components/IconSprite.astro) as `<symbol>`s, same stroke style as the rest.
6. Any scroll-triggered element gets `data-reveal` — if it also needs a static transform (a tilt, etc.), wrap rather than combine (see the CSS gotcha in Motion).
7. Check the new color/text pairing against the AA contrast rule before shipping — per-background, not per-token.
8. Before defaulting to the "plain text + trailing `<em>` accent" headline formula, check whether enough sections already use it — vary it if so.
