---
target: site homepage (src/pages/index.astro)
total_score: 21
max_score: 32
na_heuristics: 7,10
p0_count: 2
p1_count: 2
p2_count: 1
timestamp: 2026-09-02T14-54-21Z
slug: src-pages-index-astro
---
Method: dual-agent (A: design-review sub-agent · B: detector/browser-evidence sub-agent, run in isolation from each other)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|---|---|---|
| 1 | Visibility of System Status | 2 | Hero is opacity:0 until JS reveals it (blank if JS fails); count-up animation briefly displays false values; hamburger has no aria-expanded; "Order Now" gives no signal it won't order |
| 2 | Match System / Real World | 3 | Warm, specific copy — undercut by a priceless menu and a gallery subhead admitting the photos aren't real |
| 3 | User Control and Freedom | 3 | Modal has Esc/close/overlay-click/focus-trap, but no body scroll-lock while open |
| 4 | Consistency and Standards | 3 | Very consistent — the modal-icon gradient circle badge breaks the system's own "no gradients, no floating badges, radius:0" rule |
| 5 | Error Prevention | 2 | Four prominent "Order Now" buttons manufacture the only user error the site has |
| 6 | Recognition Rather Than Recall | 3 | Everything's labelled; the missing recognizable item is price |
| 7 | Flexibility and Efficiency | n/a | Persuade surface, linear scroll |
| 8 | Aesthetic and Minimalist Design | 2 | Clean, but restraint removes information (price, descriptions) rather than noise; ten identical five-star rows carry zero bits |
| 9 | Error Recovery | 3 | No error states needed, but the Coming Soon modal recovers the dead-end CTA well |
| 10 | Help and Documentation | n/a | Persuade surface, nothing to document |
| Total | | 21/32 (66%) | Acceptable — significant improvements needed |

## Design Specificity Verdict

LLM assessment: The copy is specific; the design is not. Strip the words and one photo and this reads as a restaurant template — the section spine, six identical tag/title/em-accent/sub section-openers, the stat-counter trio, the four-icon feature grid, and the auto-drifting testimonial marquee are all interchangeable devices. What's genuinely specific — the receipt-card menu metaphor, the real storefront photo, the About copy — is a minority of the page and is fighting the rest: five of six gallery photos are stock/studio shots in a different visual world from the one real storefront image, and Gallery.astro literally admits "Real photos coming soon."

Deterministic scan: detect.mjs CLI found 1 issue (a transition:width layout-thrash warning); the live in-browser detector found 12 anti-pattern types across the rendered page: undersized UI text (7 instances, down to 10px), a clipped-overflow container, a thin-border-wide-shadow combo, a real contrast failure (2.9:1), kicker-above-heading used 6 times, em-dash overuse (16), 2 skipped heading levels, the cream palette, the layout-transition, and the repeating-stripe CTA background. Most corroborate the design review: the 6x kicker-above-heading finding is the mechanical fingerprint of the "sentence-machine" section-openers; the repeating-stripe/gradient hits match the generic dark-CTA-band and modal-icon badge.

Two are false positives: the clipped-overflow hit on .about is the intentional oversized "1987" watermark (deliberately positioned off-edge and clipped); the thin-border-wide-shadow hit on .story-photo is the one place Assessment A praised as correctly-earned restraint (the only shadow-at-rest on the page).

Visual overlays: injection into the live page succeeded and the detector ran for real, but the browser pane never displayed to a human viewer during this run and the visualization server has since been stopped per protocol — no overlay is currently visible to check.

## Overall Impression

The client's "minimal but not appealing" is exactly right, and it's diagnosable: this is restraint applied uniformly rather than spent deliberately. Every image gets the identical bordered-caption frame at <=400px; every section gets the identical formula at the identical 120px rhythm; six identical five-star menu rows and six identical five-star reviews carry no information. Nothing is allowed to be bigger, louder, or more important than anything else — a different thing from minimal-done-well, where restraint is spent on one or two deliberate moments (here, only About's real photo + drop-shadow does that, once). Layered on top: the site's most-repeated, highest-contrast CTA doesn't work, and the menu — styled as a receipt — has no prices. The opportunity is narrow and high-leverage: fix what "Order Now" promises, put a price next to every dish, and let the one real photo breathe instead of framing it identically to five stock ones.

## What's Working

1. The About section — the one place the page lets one element outrank its neighbors: the real storefront photo gets the only drop-shadow on the site, paired with a drifting "1987" watermark and a genuinely specific founding story.
2. The Coming Soon modal — better engineered than the page around it: real role="dialog"/aria-modal, Esc + overlay-click + focus-trap + focus-return, and it converts a dead end into two working actions (call, directions).
3. Motion discipline — parallax capped at 0.05-0.18 with off-screen work skipped, the marquee driven by transform not scrollLeft, and prefers-reduced-motion that changes behavior rather than just shortening durations.

## Priority Issues

[P0] The primary CTA doesn't work, and it's the last thing visitors experience
Why it matters: Four "Order Now" buttons — the darkest, most-repeated elements on the page — all open "Online ordering is on its way." By the peak-end rule, a broken promise at the page's highest-commitment moment is what gets remembered, while the phone number sits as 14px grey text in the footer, 9,000px down.
Fix: Relabel all four to "Call to Order" (tel: link) as primary, "Get Directions" secondary. Rewrite the Order CTA copy around calling/visiting. Add a sticky mobile call/directions bar.
Suggested command: /impeccable clarify, then /impeccable layout

[P0] The menu has no prices, no descriptions, and ten identical five-star ratings
Why it matters: Price is the first thing anyone checks before a street-food stall, and it's absent from a section styled explicitly as a receipt. A first-timer can't tell what items are or which of ten to order.
Fix: Replace the ratings column with prices. Add one-line descriptions. Group into categories, mark 2-3 signature items.
Suggested command: /impeccable clarify, /impeccable layout

[P1] Nothing on the page is bigger than anything else — the mechanism behind "bland"
Why it matters: Six section-openers use an identical formula at an identical rhythm; every image gets the identical framing treatment at <=400px; six type sizes sit inside one octave. Confident minimalism spends restraint on one or two deliberate moments — this page spends it nowhere. Mechanically confirmed by the detector's 6x kicker-above-heading hit.
Fix: Break the system once, deliberately — full-bleed the About photo, make the gallery asymmetric, let the hero photo fill its column, vary at least two headline formulas.
Suggested command: /impeccable bolder or /impeccable layout

[P1] The food photography is stock, and the page admits it
Why it matters: Five of six gallery photos are studio/stock in a different visual world from the one real storefront photo, with a subhead reading "Real photos coming soon" — contradicting design.md's claim that all photography is real, and undermining the site's authenticity proposition.
Fix: Delete the "coming soon" line now. Replace stock gallery images with real phone photos from the stall. Show fewer images until real ones exist.
Suggested command: /impeccable document, then a content/asset pass

[P2] Mobile: the first screen says nothing, food renders at 130px, and the page is 4MB
Why it matters: At 390px width the header wraps to 3 lines and both H1 and hero CTAs sit below the fold. Gallery tiles shrink to 130x130px. ~4.1MB of unoptimized images ship with no srcset/WebP. Plus: mobile nav opens under the header, header CTA is under the 44px touch target, hours text collides.
Fix: One-column mobile gallery, tighten the header to one line, move H1+CTA above the fold, convert to WebP with srcset, fix nav/row layout bugs.
Suggested command: /impeccable adapt, /impeccable optimize

## Persona Red Flags

Jordan (Confused First-Timer): Clicks the darkest, most-repeated button and gets told it doesn't work yet. Can't find a price anywhere. Doesn't know what menu items are. Every item shows the same five stars. "Contact Us" in Dine-In scrolls to the copyright line, not a contact section. "Real photos coming soon" retroactively undermines trust in every photo above it.

Casey (Distracted Mobile User): First screen is a wrapped header plus a photo — no headline or CTA in view. Food photos are thumbnail-sized. ~4MB of images with no lazy-loading strategy. No thumb-zone action anywhere on a 9,000px page. The review marquee only pauses while a finger is held down.

Riley (Deliberate Stress Tester): Disabling JS produces a blank page — every reveal element stays invisible with no noscript fallback. The stat counter briefly displays false facts about the brand's founding mid-animation. The modal doesn't lock body scroll. Two "Opening Hours" rows show identical times in two places. JSON-LD points at a /our-menu page that doesn't exist; no og:image means link shares produce a text-only card.

## Minor Observations

- Two independently-confirmed real WCAG AA contrast failures (footer logo-name small at 2.9:1; Dine-In section-sub at 4.37:1) contradict design.md's claim that every pairing passes AA.
- Hamburger has no aria-expanded/aria-controls; two heading levels are skipped (h2->h4) in Dine-In and Order CTA.
- Page title is just "Rajubhai Dabeliwale" — no local-search keywords for a single-city business.
- Section indices run 02-05 with no 01, and three sections have none — the numbering announces a system it doesn't keep.
- modal-icon's gradient badge contradicts design.md's explicit "no gradients, no floating badges, radius:0" rules.
- favicon.png is wired up; design.md still documents favicon.ico.
- Contact is a personal Gmail address shown twice, with no WhatsApp or delivery-platform link.

## Questions to Consider

- If every photo except the storefront shot were deleted, would the site be more or less convincing?
- What is the single largest thing on this page, and should it be a 72px wordmark, or the food?
- The word "price" doesn't appear anywhere on a street-food website, and the CTA that takes orders doesn't exist yet — until that has one clear answer, will any cosmetic fix move the needle?
