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

Replacing the mock data in `src/order-app/services/api.js` with real POS endpoints is a separate spec.

## Order page layout

`/order` is the ordering page (`pages/OrderHome.jsx`): categories on the left, the selected category's dishes in the middle, and the cart on the right (`CartPanel`, from 1280px wide). Below 1280px the cart is the slide-in drawer, opened from the bottom bar or the navbar. The selected category lives in the URL (`?category=chaat`); `/order/menu` redirects here and keeps the query. The old marketing home page and `/menu` page were removed; the brand story lives on the main website.
