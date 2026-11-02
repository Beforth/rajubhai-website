# Combine the brand website and the online-order app — design

Date: 2026-11-02
Scope: front-end merge only. Connecting orders to the POS backend is a separate spec.

## Goal

A customer visits one site (`rajubhaidabeliwale.com`), reads the brand pages, taps **Order Online**, and uses the ordering app (menu, cart, checkout, tracking) without leaving the domain or the site's look and feel.

## Current state

- `rajubhai-website` — Astro 7, static, vanilla TS, one page (`src/pages/index.astro`). Header and order section only offer "Call to Order".
- `rajubhai-website/rajubhai-online-order-fe` — React 19 + Vite + React Router 7 prototype, copied in as a subfolder with its own `.git`. Runs on local JSON (`src/data/*.json`) through `src/services/api.js` with simulated delays, a simulated OTP, and simulated tracking. It calls no backend.
- Website `package.json` has only `astro`.

## Decisions (agreed)

- One Astro project; the ordering app is embedded at `/order` (not two apps, not subdomains, not a rewrite).
- The ordering app's own `.git` history is discarded. The code becomes part of the website repo.

## Design

### 1. Layout of the merged project

- App source moves to `src/order-app/` (components, context, pages, services, data, styles, assets keep their relative structure).
- App static assets from its `public/` are merged into the website's `public/`. Name clashes (`favicon.svg`, `logo.png`, `icons.svg`) are resolved by keeping the website's file and checking the app still renders; any app-only asset goes under `public/order/`.
- The app's `index.html`, `vite.config.js`, `check-bytes.mjs`, `.oxlintrc.json`, `.gitignore`, `package*.json`, `README.md` and nested `.git` are removed. Useful README content (design tokens, page list, coupon codes) moves to a short `docs/order-app.md`.

### 2. Dependencies and Astro config

- Add `react`, `react-dom`, `react-router-dom`, `lucide-react`, `canvas-confetti`, `@astrojs/react`, `@types/react`, `@types/react-dom` to the website `package.json`.
- `astro.config.mjs` adds the React integration. Output stays static.
- JSX files stay `.jsx`; no TypeScript conversion in this step.

### 3. Mounting at `/order`

- New page `src/pages/order/[...slug].astro` renders the shared Layout and the app's root component with `client:only="react"`. `getStaticPaths` yields a single catch-all so every `/order/*` URL serves the same shell and React Router handles the rest.
- The app's `BrowserRouter` gets `basename="/order"`. Internal links keep working unchanged; any hard-coded absolute paths (`/menu`, `/cart`, `/checkout`, `/order-status/:id`) are audited and fixed.
- Direct loads and refreshes of `/order/menu` etc. must work in `astro dev` and `astro preview`. Hosting rewrite rules for deep links are noted in the doc for deployment (a static host needs a fallback to the `/order` shell; handled when the deploy target is known).

### 4. Look and feel

- The ordering app's theme tokens (`--red`, `--yellow`, `--peach`, `--orange`, `--brown`) stay in `theme.css` but are scoped under an `.order-app` root class so they do not collide with the website's variables. The app's global resets and `index.css` are scoped the same way.
- The website's Header and Footer wrap the app so the user keeps site navigation. The app's own `Navbar` and `Footer` are reduced to what the app needs (cart button, order-flow links) and styled to sit under the site header, not duplicate it.

### 5. Linking the website to the app

- `Header.astro`: add an **Order Online** primary button linking to `/order`; "Call to Order" stays as a secondary link.
- `OrderCta.astro`: add an **Order Online** button beside "Call to Order".
- The Header's in-page anchors (`#about`, `#menu`, ...) become `/#about`, `/#menu`, ... so they work from `/order` too.
- Hero keeps its current content; a hero button to `/order` is optional and left to the visual pass.

### 6. Out of scope (next spec)

- Replacing `services/api.js` mock data with real POS endpoints, a public per-outlet-keyed order endpoint, real customer OTP, the order `source`/online marker, and status polling against the POS.
- Payments.
- Converting the app to TypeScript.

## Acceptance checks

1. `npm run build` succeeds with no errors.
2. `npm run dev` / `preview`: `/` renders exactly as before; "Order Online" in the header and order section opens `/order`.
3. In the app: browse menu, customise an item, add to cart, run checkout to confirmation, open tracking — all behave as in the prototype, and refreshing on any `/order/*` URL stays on that page.
4. No style regressions on the brand pages (spot-check desktop and mobile widths) and none inside the app.
5. The nested `rajubhai-online-order-fe` folder and its `.git` are gone.

## Risks

- **CSS collisions** between the two stylesheets — mitigated by scoping under `.order-app`.
- **Deep-link refresh** on a static host — needs a fallback rule at deploy time.
- **Asset name clashes** in `public/` — resolved case by case in step 1.
