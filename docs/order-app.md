> Served at `/order` inside the website; source in `src/order-app/`.

# Annapurna's Rajubhai Dabeliwale — Online Food Ordering Website

> **"Taste The Real" • Since 1987**
> Customer-facing online ordering portal integrated and ready for POS dashboard backend ingestion.

---

## 🎨 Color Palette & Design Tokens
This application strictly adheres to the provided brand color scheme as defined in CSS variables (`src/styles/theme.css`):
- **`--red: #FF0917`**: Primary CTA buttons, key action links, status highlights
- **`--yellow: #FFDF54`**: Accents, offer chips, star ratings, promo badges
- **`--peach: #FFD8B4`**: Soft hero background cards, category highlights, dividers
- **`--orange: #F67D00`**: Secondary buttons, hover states, interactive icons
- **`--brown: #904137`**: Headings, typography, footer, borders, brand framing

---

## 🚀 Tech Stack
- **Framework**: React 19 + Vite
- **Routing**: React Router DOM (v7)
- **State Management**:
  - `CartContext`: Persistent cart (localStorage), multi-variant sizing, add-ons, promo engine, delivery fee calculation, and order type switching (Delivery / Takeaway / Dine-In).
  - `AuthContext`: Persistent customer session, OTP simulation (`1987`), and saved addresses.
  - `ToastContext`: Dynamic notifications for cart operations, coupons, and errors.
- **Icons**: Lucide React
- **Animations**: CSS Keyframes & Confetti celebration upon order placement

---

## 📱 Pages Built
1. **Home (`/`)**:
   - Live opening hours banner & FSSAI license header
   - Hero banner with tagline *"Taste The Real"* and *"Since 1987"* badge
   - Bestsellers showcase with quick add & customization triggers
   - Interactive coupons strip (`RAJUBHAI1987`, `TASTETHEREAL`, `FREESHIP`)
   - Heritage section detailing the 39+ year legacy of Rajubhai
2. **Menu (`/menu`)**:
   - Category navigation tabs: Famous Dabeli, Sandwiches, Chaat, Sides, Beverages, Desserts
   - Real-time search by dish name, tagline, or ingredients
   - 100% Pure Veg badge and Bestsellers-only filter
   - Item cards featuring ratings, prices, spice levels, and customization badges
3. **Item Customization Modal**:
   - Single-choice size variants (e.g., Single Pav vs Double Pav Special)
   - Multi-choice add-ons (Extra Amul Cheese, Butter toss, Masala Sing, etc.)
   - Special cooking instructions field (less spicy, no onion-garlic, etc.)
   - Dynamic live price counter and quantity stepper
4. **Cart Drawer & Cart Page (`/cart`)**:
   - Slide-in side drawer for quick checkout on any page
   - Dedicated Cart page with quantity modification and removal
   - Order type switcher (Delivery, Takeaway Pickup, Dine-In)
   - Itemized bill breakdown (Subtotal, 5% GST, packaging, delivery fee, discounts)
5. **Checkout (`/checkout`)**:
   - Fulfillment mode selector (Door Delivery, Takeaway Counter, Dine-in Table)
   - Customer details validation (Name, 10-digit mobile number, address/table)
   - Delivery timing options (ASAP 25-30 mins vs Scheduled)
   - Payment modes (UPI with zero surcharge, Cards, Cash/Counter on delivery)
   - Confetti celebration upon order confirmation
6. **Order Confirmation & Live Tracking (`/order-status/:orderId`)**:
   - Visual 6-step progress stepper: *Placed → Accepted → Preparing → Ready → Out for delivery → Delivered*
   - Polling simulation reacting to POS kitchen fulfillment
   - Direct click-to-call restaurant emergency contact
7. **Login / Sign Up (`/login`)**:
   - Mobile + OTP authentication flow (Preconfigured demo OTP: `1987`)
   - Guest checkout bypass
8. **Orders & Profile (`/profile` & `/orders`)**:
   - Order history with full itemized breakdown and timestamps
   - 1-Click "Reorder" button adding items back into current cart
   - Saved delivery addresses management (Home, Office, Other)

---

## 🔌 POS Integration Readiness (`src/services/api.js`)
All mock network operations are centralized in `src/services/api.js` with simulated latency to make backend swap effortless:
- `getMenu(categoryId)`: Retrieve menu items
- `getCategories()`: Retrieve taxonomy
- `applyCoupon(code, subtotal)`: Validate discounts
- `placeOrder(orderPayload)`: Ingests orders formatted for POS KOT generation
- `getOrderById(orderId)`: Fetches live order status
- `sendOtp(phone)` & `verifyOtp(phone, otp)`: Auth endpoints

### POS Order Object Payload Format:
```json
{
  "orderId": "RJB-123456",
  "items": [
    {
      "id": "dab-01",
      "name": "Original Rajubhai Special Dabeli",
      "unitPrice": 65,
      "quantity": 2,
      "itemTotal": 130,
      "selectedSize": { "name": "Single Pav", "price": 0 },
      "selectedAddons": [{ "id": "cheese", "name": "Extra Amul Cheese", "price": 20 }],
      "instructions": "Crispy toasted"
    }
  ],
  "customer": {
    "name": "Ramesh Patel",
    "phone": "9876543210",
    "address": { "street": "42 Sardar Patel Road", "landmark": "Near Town Hall" },
    "tableNumber": null,
    "specialNotes": "Keep extra tissues"
  },
  "orderType": "delivery",
  "deliveryTiming": "Immediate ASAP",
  "payment": {
    "method": "upi",
    "status": "PAID",
    "transactionId": "TXN-UPI-981273"
  },
  "totals": {
    "subtotal": 130,
    "gst": 7,
    "packaging": 15,
    "deliveryFee": 35,
    "discount": 20,
    "grandTotal": 167
  },
  "status": "Placed",
  "timestamps": {
    "placedAt": "2026-10-09T05:50:00.000Z",
    "updatedAt": "2026-10-09T05:50:00.000Z",
    "estimatedDeliveryAt": "2026-10-09T06:20:00.000Z"
  }
}
```

---

## 🏃 Setup & Run Instructions

```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev

# 3. Create production build
npm run build
```
The local server will start at `http://localhost:5173`.

## Routing and deployment

- Fixed routes (`/order`, `/menu`, `/cart`, `/checkout`, `/login`, `/orders`, `/profile`) are built as static pages. `/order/order-status/:id` and unknown paths need the host fallback in `public/_redirects` (`/order/*  /order/index.html  200`, Netlify/Cloudflare Pages syntax). Other hosts need the equivalent rule. In `astro dev` the fallback is handled by a small integration in `astro.config.mjs`.
- App styles are scoped under `.order-app` (`src/order-app/styles/theme.css`). The site header and footer wrap the app; the app's own navbar is a secondary bar and its footer is not rendered.

## Next step

Menu, outlets, quotes, orders and order tracking all use the POS shop API. `src/order-app/services/api.js` still holds mock coupon, OTP and old order functions that are no longer used by checkout or tracking (the login page and its demo OTP still use the OTP ones).

## Shop API and outlets

- `services/shopApi.js` calls the public `/api/v1/shop/*` endpoints and returns the envelope's `data` (or throws `ShopApiError`). `services/menuMapper.js` turns the menu payload into the shape the cards, modal and cart use (variation price is a full price; the mapper stores the cheapest as the item price and the difference per size).
- `PUBLIC_API_BASE_URL` (env) is the API origin. Leave it empty in dev: the Astro dev server proxies `/api` and `/media` to `http://127.0.0.1:8000` (override with `API_PROXY_TARGET`). In production set it to the backend origin, or serve `/api` and `/media` on the same origin.
- Outlet choice (`context/OutletContext.jsx`): `?outlet=` query, then `localStorage` `rajubhai.outlet`, then the only enabled outlet, otherwise the `OutletPicker`. The cart is per outlet (each line has `outletId`, `variationId`, `addonIds`); switching with items in the cart asks before clearing it.

## Order page layout

`/order` is the ordering page (`pages/OrderHome.jsx`): categories on the left, the selected category's dishes in the middle, and the cart on the right (`CartPanel`, from 1280px wide). Below 1280px the cart is the slide-in drawer, opened from the bottom bar or the navbar. The selected category lives in the URL (`?category=chaat`); `/order/menu` redirects here and keeps the query. The old marketing home page and `/menu` page were removed; the brand story lives on the main website.

## Theme

The app uses the website's design tokens, nothing new: `src/order-app/styles/theme.css` maps `--brand-*`, `--bg-*`, `--text-*` and the shadows onto the site's ten colours (`design.md`), with Inter as the only font. Cards are `--paper` on a `--paper-2` page, buttons are the site's uppercase pill (red, maroon on hover), and shadows are warm brown, never black. Add new colours there, not as hex values in components.

## Lazy loading

Dishes on the order page render in batches of 9 (`BATCH_SIZE` in `pages/OrderHome.jsx`); the next batch loads when the list nears the bottom (IntersectionObserver, 600px ahead). A new category or search starts again from the first batch. Item, cart and category images use `loading="lazy"` and `decoding="async"`.

## Checkout, quotes and orders

- **The server prices everything.** `CartContext` keeps lines only (`id`, `variationId`, `addonIds`, `quantity`, `instructions`, `outletId`), never prices. Whenever the lines or the delivery address change it calls `shopApi.quote` (debounced 400 ms; an older answer never overwrites a newer one; an empty cart skips the call) and exposes `quote`, `quoteLoading`, `quoteError`, `lineQuotes` (per-line price and error by cart key) and `checkout` (`canCheckout`, `reason`). Every amount on screen (drawer, panel, cart page, checkout, mobile bar, navbar) is a server decimal string shown through `services/money.js`; there is no local tax, packaging, delivery or discount arithmetic. While the quote is loading, totals show "…".
- **Why Checkout can be disabled:** quote still loading, a line with an error (unavailable item or an add-on rule such as "Choose at least 1 from X"; shown under the line), the minimum order (`reason`), or a closed outlet (`info.accepting_orders` false, shows `info.closed_message`).
- **Checkout (`/checkout`)** is guest only and delivery only (Takeaway and Dine-In stay off; sign-in is not part of it). Fields: name (1-120), mobile (10 digits after removing spaces and `+91`), address (required, max 500), landmark (max 200), notes (max 500). One `idempotency_key` is generated per attempt and kept until the order succeeds, so a retry after a timeout cannot create a second order; it is replaced when the cart lines change or after a 422. The button is disabled while a request is in flight. On 201/200 the order is saved to `orderStore`, the cart is cleared and the confirmation (with the real `reference`) links to `/order-status/{public_id}`.
- **Errors:** 409 shows the outlet's closed message and refreshes the outlet info; 422 marks the listed lines and refreshes the quote; 400 shows the field errors under the matching inputs; 429 asks to wait a minute; a network failure or timeout keeps the cart and allows a retry.
- **`services/orderStore.js`** keeps `{publicId, reference, placedAt}` for the last 20 orders in `localStorage` key `rajubhai.orders` (every access in try/catch). `/orders` lists them for guests too (it fetches the 10 most recent in parallel; an order that fails to load shows as "unavailable" with a remove button).
- **Tracking (`/order-status/:publicId`)** reads `GET /shop/orders/{public_id}/`: every 5 s while `received`, every 15 s while accepted/preparing/ready/out_for_delivery, and stops on delivered/rejected/cancelled. Status mapping: `received` -> Placed step plus an "Auto-accepts in mm:ss" countdown from `auto_accept_at`; `accepted`, `preparing`, `ready`, `out_for_delivery`, `delivered` -> the stepper step of the same name; `rejected` -> a rejected state with `reject_reason`; `cancelled` -> "We could not accept this order". An unknown id shows "Order not found". The mapping lives in `services/orderStatus.js`.

### Not built yet

Phase 3 kitchen stages beyond the status mapping above (the POS must move orders through preparing/ready/out for delivery), customer sign-in and saved addresses on the server, online payment (orders are pay on delivery), and coupons/promo codes (the promo box is hidden).

## Checkout safeguards

- While an order is being sent the cart is locked (`cartLocked` in `CartContext`, set by `Checkout`): quantity, remove and add do nothing and the steppers are disabled, so the idempotency key always stands for exactly the cart that was submitted.
- Pressing Place Order while the total is being recalculated shows "Updating your total…" instead of doing nothing.
- The orders list offers **Remove** only when the server says the order no longer exists (404); any other load failure (network, 429, 5xx) shows "Couldn't load this order right now" with a Retry button, because the stored `public_id` is a guest's only way back to a live order.
- The tracking page's "Call" link uses the order's own outlet (`order.outlet.name/phone` from the server), never the outlet currently selected in the app.
