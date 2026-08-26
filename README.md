# Rajubhai Dabeliwale

The website for **Rajubhai Dabeliwale** — Nashik's original Kutchi Dabeli stall, serving authentic Kutchi Dabeli, Kutchi Kadak, and Kathiyawadi Fafda since 1987.

A fast, static, single-page site built with [Astro](https://astro.build) — zero client-side framework runtime, real photography, and a design system built to feel editorial and warm rather than "generic AI startup landing page."

## Tech stack

- **[Astro](https://astro.build)** (static output) — components compile to plain HTML/CSS with only the JS actually needed for interactivity (nav, scroll-reveal, parallax, reviews marquee)
- **Vanilla TypeScript** for all interactivity — no React/Vue/etc., no client-side hydration cost
- **Google Fonts** — Zilla Slab (headings/display) + Karla (body/UI)
- **schema.org `Restaurant` JSON-LD** + Open Graph/Twitter meta for SEO

## Getting started

```bash
npm install
npm run dev
```

The dev server runs at `http://localhost:4321`.

| Command | Action |
|---|---|
| `npm install` | Install dependencies |
| `npm run dev` | Start the local dev server |
| `npm run build` | Build the static site to `./dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run astro ...` | Run any Astro CLI command (`astro add`, `astro check`, etc.) |

`npm run build` outputs fully static HTML/CSS/JS to `dist/` — deployable to any static host (Netlify, Vercel, GitHub Pages, Cloudflare Pages, or a plain file server) with no server runtime required.

## Project structure

```text
/
├── public/                  # Static assets served as-is (photos, logo, favicon)
├── src/
│   ├── components/          # One component per page section
│   │   ├── Header.astro
│   │   ├── Hero.astro
│   │   ├── About.astro
│   │   ├── Menu.astro
│   │   ├── Gallery.astro
│   │   ├── DineIn.astro
│   │   ├── Reviews.astro
│   │   ├── OrderCta.astro
│   │   ├── Footer.astro
│   │   └── IconSprite.astro # Shared line-icon <symbol> sprite
│   ├── layouts/
│   │   └── Layout.astro     # <head>/SEO/JSON-LD, global CSS, global script
│   └── pages/
│       └── index.astro      # Assembles the page from the components above
├── design.md                 # Design system reference (colors, type, motion, a11y)
└── package.json
```

## Design system

See **[design.md](design.md)** for the full spec: color tokens and contrast rules, typography scale, layout conventions, the image asset map (which photo lives where), motion/animation details (scroll-reveal, parallax, the reviews marquee), and accessibility requirements. Read it before adding or changing a section.

## Content & assets

All photography in `public/` is real — the brand logo, the actual Nashik storefront, and dish photos matching the live menu (no stock or AI-generated imagery). `design.md` documents exactly which file is used where.

## Deployment

Any static host works. Typical flow:

```bash
npm run build   # outputs to dist/
```

Then upload `dist/` to your host of choice, or connect the git repo directly if your host builds from source (set the build command to `npm run build` and the output directory to `dist`).
