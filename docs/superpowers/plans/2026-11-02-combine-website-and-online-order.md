# Combine Website and Online-Order App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Serve the React ordering app at `/order` inside the Astro brand site, wrapped in the site's header and footer, with "Order Online" links from the brand pages.

**Architecture:** One Astro project (static output). The app's source lives in `src/order-app/`. A catch-all Astro page `src/pages/order/[...slug].astro` mounts one React root component with `client:only="react"`; React Router handles everything under the `/order` basename. App styles are scoped under an `.order-app` class so they cannot leak into the brand pages.

**Tech Stack:** Astro 7, `@astrojs/react`, React 19, react-router-dom 7, lucide-react, canvas-confetti.

**Spec:** `docs/superpowers/specs/2026-11-02-combine-website-and-online-order-design.md`

> There is no test framework in either project. "Tests" below are build, `curl` status checks against the dev server, and browser checks. Do not add a test framework.

## Global Constraints

- Output stays static (`astro build`); no SSR adapter.
- App files stay `.jsx`; no TypeScript conversion.
- Only `/order/*` loads React; `/` must keep shipping no React runtime.
- Dev server is run with `astro dev --background` (see `AGENTS.md`); stop it with `astro dev stop`.
- App theme variables keep their names (`--brand-*`, `--primary`, `--bg-*`, `--text-*`); the website's `--red/--gold/--peach/--orange/--maroon/--paper/--ink/--line/--muted` are not renamed.
- Existing absolute asset URLs in the app (`/logo.png`, `/dabeli-hero.png`, `/dabeli category.jpg`, `/dahi-puri.jpg`) must keep resolving, so app assets go in `public/` root, not a subfolder.
- Both "Call to Order" links stay.

## Review Focus

1. Deep link or refresh on `/order/menu`, `/order/checkout`, `/order/order-status/abc123` must return 200 and render that page, in `astro dev` and `astro preview`.
2. `/order` and `/order/` both open the app home.
3. An unknown URL such as `/order/nonsense` must show the app home, not a blank page (the prototype has no catch-all route).
4. A cart built in the app survives a trip to `/` and back (cart is in `localStorage`; nothing may touch it during server render).
5. Opening the cart drawer or an item modal sets `document.body.style.overflow`; closing it must leave the page scrollable, and the site header must not overlap the app on a 375px-wide screen.

---

### Task 1: Fold the app into the website project

**Files:**
- Move: `rajubhai-online-order-fe/src/` → `src/order-app/`
- Copy: `rajubhai-online-order-fe/public/*` → `public/` (only `logo.png` clashes and it is byte-identical; keep the website's)
- Move: `rajubhai-online-order-fe/README.md` → `docs/order-app.md`
- Delete: `rajubhai-online-order-fe/` (including its `.git`)
- Modify: `package.json`, `astro.config.mjs`

**Interfaces:**
- Produces: app code at `src/order-app/` with its original internal structure (`App.jsx`, `main.jsx`, `index.css`, `components/`, `context/`, `pages/`, `services/`, `styles/theme.css`, `data/`); React integration enabled in Astro.

- [ ] **Step 1: Check what would be lost.** Run `git -C rajubhai-online-order-fe status --short` and `git -C rajubhai-online-order-fe log --oneline | head -3`. Expected: report the output to the user; the user already chose to discard this history, so only stop if there are uncommitted changes the user has not seen.
- [ ] **Step 2: Move the files.** `mv rajubhai-online-order-fe/src src/order-app`; `cp -n rajubhai-online-order-fe/public/* public/` (the `-n` keeps the website's `logo.png`); `mv rajubhai-online-order-fe/README.md docs/order-app.md`. Then confirm the diff-check: `cmp public/logo.png rajubhai-online-order-fe/public/logo.png` prints nothing.
- [ ] **Step 3: Delete the leftover folder** with `rm -rf rajubhai-online-order-fe`. Expected: `ls` of the website root no longer lists it.
- [ ] **Step 4: Add dependencies** with `npm install react@^19.2.8 react-dom@^19.2.8 react-router-dom@^7.18.4 lucide-react@^1.53.0 canvas-confetti@^1.9.4 @astrojs/react` and `npm install -D @types/react @types/react-dom`.
- [ ] **Step 5: Enable React** in `astro.config.mjs`: `import react from '@astrojs/react'` and `defineConfig({ integrations: [react()] })`.
- [ ] **Step 6: Trim `docs/order-app.md`** to the parts still true (palette, page list, coupon codes, cart/auth behaviour) and add one line at the top: "Served at `/order` inside the website; source in `src/order-app/`."
- [ ] **Step 7: Verify.** Run `npm run build`. Expected: exits 0 and `dist/index.html` exists (the app is not mounted yet, so only `/` is built).
- [ ] **Step 8: Commit.** `git add -A` then `git commit -m "chore: move online-order app into website under src/order-app"`.

---

### Task 2: Mount the app at `/order`

**Files:**
- Create: `src/order-app/OrderApp.jsx`
- Create: `src/pages/order/[...slug].astro`
- Modify: `src/order-app/App.jsx` (add catch-all route)
- Delete: `src/order-app/main.jsx` (its provider tree moves into `OrderApp.jsx`)

**Interfaces:**
- Produces: `export default function OrderApp(): JSX.Element` in `src/order-app/OrderApp.jsx` — no props; renders `<div className="order-app">` containing the router and providers. Task 3 relies on that `order-app` class.
- Consumes: `App` (default export of `src/order-app/App.jsx`), `ToastProvider`, `AuthProvider`, `CartProvider` from `src/order-app/context/`.

- [ ] **Step 1: Write `OrderApp`** in `src/order-app/OrderApp.jsx`: the `BrowserRouter basename="/order"` + `ToastProvider` + `AuthProvider` + `CartProvider` + `App` tree from the old `main.jsx`, inside `<div className="order-app">`. It imports `./index.css` (the app stylesheet). No `ReactDOM.createRoot`, no `StrictMode` needed.
- [ ] **Step 2: Add the catch-all route** to `App.jsx`: `<Route path="*" element={<Navigate to="/" replace />} />` (import `Navigate` from `react-router-dom`).
- [ ] **Step 3: Write the page** `src/pages/order/[...slug].astro`: `export function getStaticPaths() { return [{ params: { slug: undefined } }]; }` so it builds `/order/` once; frontmatter imports `Layout`, `Header`, `Footer`, `OrderApp`; body is `<Layout title="Order Online | Rajubhai Dabeliwale"><Header /><main><OrderApp client:only="react" /></main><Footer /></Layout>`.
- [ ] **Step 4: Delete `src/order-app/main.jsx`**, then `grep -rn "main.jsx\|createRoot" src` — expected: no matches.
- [ ] **Step 5: Audit hard-coded absolute navigation.** `grep -rnE "window\.location|location\.href|href=\"/" src/order-app` — expected: no matches (the existing `<Link to="/menu">` / `navigate('/menu')` calls are relative to the basename and stay as they are).
- [ ] **Step 6: Run the build and the deep-link checks.** `npm run build` — expected exit 0 and `dist/order/index.html` exists. Then `astro dev --background` and run `curl -s -o /dev/null -w "%{http_code}" http://localhost:4321/<path>` for `/order`, `/order/`, `/order/menu`, `/order/checkout`, `/order/order-status/abc123`, `/order/nonsense` — expected: `200` for each in dev.
- [ ] **Step 7: Browser check.** Open `/order/menu` directly in the browser pane; expected: menu renders; refresh keeps it on `/order/menu`; `/order/nonsense` ends up on the app home. Also run `npm run preview` and repeat `/order/menu` — if preview returns 404 for deep links (static preview has no fallback), record the exact paths that fail in `docs/order-app.md` under "Deployment: needs fallback to `/order/index.html` for `/order/*`" and continue; this is the known deploy-time rule from the spec.
- [ ] **Step 8: Commit.** `git add -A` then `git commit -m "feat: mount online-order app at /order"`.

---

### Task 3: Scope the app's styles and share the site chrome

**Files:**
- Modify: `src/order-app/styles/theme.css` (global selectors at lines ~2, 53, 60, 71, 78, 83, 90: `:root`, `*`, `body`, `h1–h6`, `a`, `button`, `input, select, textarea`)
- Modify: `src/order-app/index.css`, `src/order-app/App.css` if they carry global element rules
- Modify: `src/order-app/App.jsx` (outer wrapper height), `src/order-app/components/layout/Navbar.jsx`, `src/order-app/components/layout/Footer.jsx`
- Modify: `src/components/Header.astro`

**Interfaces:**
- Consumes: the `.order-app` root class from Task 2's `OrderApp`.
- Produces: app CSS that only affects descendants of `.order-app`; an app navbar that is a non-sticky secondary bar; site header links that work from any page.

- [ ] **Step 1: Scope the CSS.** In `theme.css` change `:root {` to `.order-app {`, `* {` to `.order-app * {`, `body {` to `.order-app {` (merge into the same block), and prefix `h1…h6`, `a`, `button`, `input, select, textarea` with `.order-app `. Do the same for any element-level or `:root` rule found in `index.css` / `App.css`. The check: `grep -nE "^(html|body|\*|:root|a|button|h[1-6]|input)\b" src/order-app/**/*.css src/order-app/*.css` returns no unscoped matches.
- [ ] **Step 2: Fix the stacking of the two navs.** The site `header` is `position: sticky; top: 0` (Layout.astro line ~157, a global element selector). Make the app `Navbar` root a `<div role="navigation" aria-label="Ordering">` (not `<header>`/`<nav>` element styled by the site) with `position: static`, keeping its menu/orders/profile-or-login/cart controls and dropping its logo + restaurant name (the site header already shows them). Same for `Footer.jsx`: keep only the ordering links and FSSAI/contact lines that are not already in the site footer; the site `Footer` is rendered below the app by the page.
- [ ] **Step 3: Fix the page height.** In `App.jsx` replace `minHeight: '100vh'` on the wrapper with `minHeight: 'auto'` so the site footer sits right under the app content; remove the `min-height: calc(100vh - 440px)` from `.page-shell` in `index.css` only if it leaves a large gap in the browser check.
- [ ] **Step 4: Make the site header links work from `/order`.** In `src/components/Header.astro` change `#home`, `#about`, `#menu`, `#gallery`, `#reviews`, `#contact` to `/#home`, `/#about`, and so on (and the logo link to `/`). Confirm the same anchors in `src/components/Footer.astro` if present.
- [ ] **Step 5: Verify visually.** With the dev server up, screenshot `/` (desktop 1280 and mobile 375) and compare with the committed state via `git stash` / `git stash pop` or the previous commit's build — expected: the brand page is unchanged. Then screenshot `/order`, `/order/menu`, `/order/checkout`: expected: app fonts/colors intact, one sticky header only, no horizontal scroll at 375px.
- [ ] **Step 6: Body-scroll check.** On `/order/menu` open an item modal, close it, then scroll; and open/close the cart drawer, then scroll. Expected: page scrolls after each close. (Drawer/Modal set `document.body.style.overflow` to `unset` on close.)
- [ ] **Step 7: Commit.** `git add -A` then `git commit -m "feat: scope order-app styles and share site header/footer"`.

---

### Task 4: Link the website to the app and finish

**Files:**
- Modify: `src/components/Header.astro` (add button), `src/components/OrderCta.astro` (add button)
- Modify: `docs/order-app.md`

**Interfaces:**
- Consumes: the `/order` route from Task 2.

- [ ] **Step 1: Header button.** Add `<a href="/order" class="btn btn-primary btn-sm">Order Online</a>` next to the existing Call link in `Header.astro`, and turn the Call link into the secondary style already used in the site (`btn-line` or the closest existing variant). Check it fits at 375px without wrapping the header onto two lines.
- [ ] **Step 2: Order section button.** In `OrderCta.astro` add `<a href="/order" class="btn btn-cream">Order Online</a>` as the first action; keep "Call to Order" and "Get Directions".
- [ ] **Step 3: Cart survives navigation.** In the browser: on `/order/menu` add two items, click the site logo to go to `/`, click "Order Online". Expected: cart badge still shows the two items.
- [ ] **Step 4: Full acceptance run.** `npm run build` exits 0; `grep -c "react" dist/index.html` is `0` (no React runtime on the brand page); run the spec's five acceptance checks, including: menu → customise item → add to cart → checkout → confirmation → tracking, and refresh on every step's URL.
- [ ] **Step 5: Docs.** Add to `docs/order-app.md` a "Next step" line: replacing `src/order-app/services/api.js` mock data with real POS endpoints is a separate spec.
- [ ] **Step 6: Commit.** `git add -A` then `git commit -m "feat: add Order Online links to the brand site"`.
