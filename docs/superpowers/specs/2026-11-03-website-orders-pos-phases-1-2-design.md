# Website orders → POS, Phases 1 and 2 — design

Date: 2026-11-03
Status: draft, awaiting review
Covers: Phase 1 (real menu from the POS) and Phase 2 (orders into the POS, auto-accept, cash on delivery).
Does not cover: live order stages (Phase 3), sign-in and saved addresses (4), online payment and coupons (5), delivery zones (6).

This document is also the "plan first" notice that `pos-eble-be/docs/STANDARDS.md` §12 requires before any backend API is built: every endpoint, file and reuse decision is listed below.

## 1. Goal

A customer on the website picks an outlet, sees that outlet's real menu and prices, places a cash-on-delivery order, and the outlet's POS gets a real bill and kitchen ticket without staff touching it (auto-accept after a delay), while staff can still accept or reject by hand first.

## 2. Decisions this design rests on

Agreed with the user (saved in memory `website-ordering-pos-integration`):

- Website ordering is a **first-party channel**. It never uses Wera or the `integrations` app: no Wera webhooks, tokens, merchant ids, `OnlineOrder` table or Wera client.
- **Multiple outlets.** Everything below is outlet-scoped.
- **Delivery only.** Takeaway and dine-in stay commented out in the website.
- **Auto-accept after a delay**; staff may accept or reject earlier.
- **Delivery rules later, engine now.** Phase 2 ships the engine with a simple default.
- **Later:** payment (cash on delivery only for now), sign-in (guest: name and phone typed at checkout), coupons (the promo box is hidden until Phase 5).

Confirmed by the user on 2026-11-03: website orders appear on the **existing Accept Orders screen** with a "Website" filter, reading two separate sources (section 9).

## 3. What already exists (reported per STANDARDS §12)

| Found | Used how |
|---|---|
| `integrations` app (Wera, `OnlineOrder`, accept/reject, `convert_to_pos_order`) | **Not reused.** `convert_to_pos_order` is the pattern to follow for building a bill and KOT. |
| `orders.services.create_order(outlet, by=, **data)` with `items` and `kots` | Reused to make the POS bill and KOT. |
| `menus` models: `OutletChannel` (channel slug `home-website`), `ItemAreaPrice` (`price`, `is_active`, `online_display_name`, `container_charge`), `ItemImage` (per outlet channel), `Variation`/`ItemVariation`/`VariationAreaPrice`, `AddonGroup` (`addon_min`, `addon_max`, `selection_mode`, `show_in_online`), `Addon`/`AddonAreaPrice`, `Item.taxes`, `Item.ignore_tax`, `Item.order_types`, `Item.days` | Read-only source for the public menu and for pricing. |
| `menus/services.py` price engine (§14) | Its channel-price resolution rule must be reused for the menu feed; read it before implementing. |
| `outlets.OutletOnlineOrderSettings` (strings: `default_delivery_charge`, `minimum_order_amount`, `minimum_preparation_time_mins`, `auto_cancel_duration_mins`, `ignore_online_delivery_charge`) | Source of default delivery rules and timers. |
| Outlet timings: `open_24x7`, `closing_hour/minute`, `delivery_slot1_*`, `OutletTimeSlot` (scope `day`), `outlets/timeutils.py` | Source of open/closed. |
| Outlet `calculations` settings group (`container_charge_mode`, tax-on-charge switches the POS reads) | Source of tax/charge switches. |
| `billing.services.push(outlet=, event=, data=)` and `notifications.notify()` | Live event and bell for staff. |
| `orders.views._fetch_outlet(request, outlet_id, write=)` | Staff endpoint outlet and permission check. |
| Celery with `django_celery_beat` (§13), tasks in `<app>/tasks.py` calling `services.py` | Auto-accept sweeper. |
| `core.responses.success_response / error_response`, `core.ids.register_pk_converter` | Envelope and encrypted ids. |
| `Rajubhai-pos/src/utils/taxEngine.ts` (`computeTax`) — the **only** tax engine; backend "never computes tax" (§14) | **Conflict**, see section 6. |
| `Rajubhai-pos/src/pages/AcceptOnlineOrders.tsx`, `services/onlineOrderApi.ts`, `state/OnlineOrdersContext`, `services/liveRailClient.ts` | Extended in section 9. |
| Any anonymous menu or order endpoint | **None exists.** Closest pattern: `integrations.views.WeraWebhookView` (`permission_classes=[AllowAny]`, `authentication_classes=[]`). |

### Facts to confirm before coding (read from the code, not assumed)

1. The stored value formats of `Item.order_types` and `Item.days`, so "includes delivery" and "includes today" are matched correctly.
2. The exact field names of the outlet `calculations` switches for tax on delivery and container charges (the POS reads them as `taxOnDeliveryCharge` and `taxOnContainerCharge`), and how `container_charge_mode` values other than "Item Wise" behave.
3. How `menus/services.py` resolves variation and add-on prices per channel (`VariationAreaPrice`, `AddonAreaPrice`, `ItemVariation.price`).
4. The payload shape `orders.services._customer_update` expects for `customer`.
5. The semantics of the outlet timings (`open_24x7`, closing time, `day` slots, `outlets/timeutils.py`) for `is_open`.
6. Which cache backend production uses, because DRF throttling counts per cache.

If any of these differs from what is written below, the spec is updated before code is written.

## 4. Architecture

A new Django app **`webshop`**, registered in `INSTALLED_APPS` and `core/api_urls.py`.

```
Website ──public API──▶ webshop (own tables) ──accept──▶ orders.create_order ─▶ POS bill + KOT
                              ▲                                   │
              Celery beat sweeper (auto-accept)        billing.push + notify() ─▶ POS screens
```

Files: `models.py`, `services.py` (order flow), `pricing.py` (server pricing, tax), `delivery.py` (delivery engine), `shop_hours.py` (open/closed), `menu_feed.py` (public menu), `serializers.py`, `views.py`, `urls.py`, `tasks.py`, `admin.py`, `tests/`. Views stay thin; logic lives in services (§1).

## 5. Data model

Both models extend `SoftDeleteModel` (§17) and are registered in admin (§11).

**`WebshopSettings`** (one per outlet, singleton like the other settings models):
- `enabled` (bool, default False) — an outlet appears on the website only when True.
- `auto_accept_delay_seconds` (int, default 180) — the delay before auto-accept.
- `closed_message` (char, optional) — shown when the shop is closed.

**`WebsiteOrder`**:
- `outlet` FK; `public_id` (unique random 16-char string, the customer's lookup secret); `reference` (display, `WEB-000123`).
- `status`: `received`, `accepted`, `preparing`, `ready`, `out_for_delivery`, `delivered`, `rejected`, `cancelled`. Phase 2 uses `received`, `accepted`, `rejected`, `cancelled`; the rest exist now so Phase 3 needs no enum migration.
- `customer_name`, `customer_phone` (normalised 10 digits), `address` (text), `landmark`, `instructions`.
- `payment_method` (`cash` only).
- `items` (JSON snapshot of the priced lines: `item_id`, `name`, `variation`, `addons`, `qty`, `unit_price`, `line_total`, `note`).
- Money (Decimal): `subtotal`, `container_charge`, `delivery_charge`, `discount` (always 0 in Phase 2), `tax_total`, `tax_breakdown` (JSON), `grand_total`.
- `idempotency_key` (unique together with `outlet`), `received_at`, `auto_accept_at`, `accepted_at`, `accepted_by` (user name or `Auto-accept`), `auto_accepted` (bool), `preparation_minutes`, `reject_reason`, `cancelled_reason`, `pos_order` (OneToOne to `orders.Order`, null until accepted).

Raw primary keys never appear in routes or responses; ids are encrypted (§10), converter `register_pk_converter("webshop", "websiteorder")`.

## 6. Pricing and tax (the one deviation from §14)

§14 says the POS front end prices the bill and the backend only recombines. That cannot hold for the website: a customer's browser must not decide prices or tax. So `webshop/pricing.py` is a **server-side port of `computeTax`** and the server is authoritative for website orders only. This deviation is recorded in STANDARDS (section 15 below).

Rules to port exactly: forward vs backward tax (backward is already inside the price and never added to the total); `Fixed` taxes per unit; order-wise slabs applied once on the cart; `Item.ignore_tax`; labels from `tax_category`, falling back to `online_display_name` then `title`; tax on delivery/container charge only when the outlet switches say so; inactive taxes ignored. Arithmetic is `Decimal` with `ROUND_HALF_UP` to 2 places at the same points as `round2` in the TypeScript. Discounts are not supported until Phase 5: `price_cart` rejects `discount != 0`.

Container charge: Phase 2 implements `container_charge_mode == "Item Wise"` (sum of `ItemAreaPrice.container_charge` or `ItemVariation.container_charge` times quantity). Other modes are treated as Item Wise and a warning is logged; supporting them is out of scope.

Totals: `grand_total = subtotal + container_charge + delivery_charge + forward_tax`. No rounding at order time: `Order.round_off` is settlement rounding only (§14).

**Parity proof:** a one-off dev script runs the real `computeTax` on at least 12 fixed carts (forward only, backward only, mixed, Fixed, order-wise, ignore-tax, taxed charges) and writes `webshop/tests/fixtures/tax_vectors.json`. The Python tests assert equality to the cent. The POS front end has no test framework, so this script is a dev tool and is not shipped.

## 7. Delivery engine

`webshop/delivery.py`:

```python
def quote_delivery(outlet, *, address: dict | None, subtotal: Decimal) -> DeliveryQuote
# DeliveryQuote(eligible: bool, charge: Decimal, minimum_order: Decimal, reason: str)
```

Phase 2 default: `charge` = `OutletOnlineOrderSettings.default_delivery_charge` (0 when `ignore_online_delivery_charge`); `minimum_order` = `minimum_order_amount`; `eligible` is False with reason `Minimum order ₹X` when `subtotal < minimum_order`. `address` is accepted and ignored: zones, radius and free-delivery thresholds plug in here later (Phase 6) without touching the order flow. Settings are strings in the database; parsing failures fall back to 0 and are logged.

## 8. Public API (Phase 1 and 2)

All under `/api/v1/shop/`, no login (`permission_classes=[AllowAny]`, `authentication_classes=[]`), standard envelope `{success, message, data, errors}`, DRF throttle scopes (`shop_read` 120/min, `shop_order` 6/min per IP; the cache backend must be shared across workers in production, verified at implementation). CORS: the website origin goes in the existing `CORS_ALLOWED_ORIGINS`.

| Method + path | Phase | Purpose |
|---|---|---|
| `GET /shop/outlets/` | 1 | Enabled outlets: encrypted `id`, name, address, phone, logo URL, `is_open`. |
| `GET /shop/{outlet_pk}/info/` | 1 | Shop status: name, address, phone, FSSAI, hours text, `is_open`, `accepting_orders`, `closed_message`, `minimum_order`, default `delivery_charge`, `preparation_minutes`, currency. |
| `GET /shop/{outlet_pk}/menu/` | 1 | Categories with items. Item: encrypted id, `online_display_name` or name, description, tags, veg flag (`Item.choice`), channel price, image URL, variations `{id, name, price}`, add-on groups `{id, name, min, max, selection_mode, required, addons:[{id, name, price, veg}]}`. `Cache-Control: public, max-age=30`. |
| `POST /shop/{outlet_pk}/quote/` | 2 | Prices a cart on the server (same code as order placement): lines, `subtotal`, charges, tax rows, `grand_total`, plus per-line errors and the minimum-order result. Writes nothing. |
| `POST /shop/{outlet_pk}/orders/` | 2 | Places an order. Returns 201 `{public_id, reference, status, totals, auto_accept_at}`; a repeated `idempotency_key` returns the existing order with 200. |
| `GET /shop/orders/{public_id}/` | 2 | Status of one order for its owner: `status`, `reference`, `reject_reason`, totals, `auto_accept_at`. Phase 3 adds stages. |

**Menu inclusion rule:** an item is listed when the category and item are active, its `ItemAreaPrice` for the outlet's `home-website` `OutletChannel` is active, `Item.order_types` is empty or includes delivery, and `Item.days` is empty or includes today (outlet timezone). Prices come from the same `*AreaPrice` rows the POS price engine reads. Add-on groups with `show_in_online = False` are omitted.

**`POST orders` body:**

```json
{"idempotency_key": "uuid", "customer": {"name": "", "phone": ""},
 "address": {"line": "", "landmark": ""}, "instructions": "",
 "items": [{"item_id": "enc", "variation_id": "enc|null", "addons": [{"id": "enc", "qty": 1}], "qty": 1, "note": ""}]}
```

**Validation (all server-side, errors in the envelope):** shop enabled and open (409 with `closed_message`); every item belongs to this outlet and is listed (422 with the offending lines); quantity 1–50, at most 40 lines; add-on min/max/required rules from `AddonGroup`; name 1–120 chars; phone normalised (`+91`, spaces stripped) to exactly 10 digits; address line required, at most 500 chars; instructions at most 500 chars; minimum order via the delivery engine (422). Client-sent prices are ignored entirely.

**On success:** create `WebsiteOrder` (`received`, `auto_accept_at = now + delay`), push event `website_order.received` through `billing.services.push`, call `notify()`, return. Push or notify failures are logged and never fail the order (same stance as `integrations.services._publish`).

## 9. Staff API and the POS app

Staff endpoints use JWT and `_fetch_outlet(request, outlet_id, write=...)` exactly like the online-orders views, so outlet membership and permissions work as today. A dedicated permission can follow later.

| Method + path | Purpose |
|---|---|
| `GET /api/v1/shop/{outlet_pk}/website-orders/?status=&search=` | List with tab counts (received / in progress / closed), same shape idea as the online-orders list. |
| `POST /api/v1/shop/{outlet_pk}/website-orders/{order_pk}/accept/` | Body `{preparation_time: 1..300}`. Creates the POS bill and KOT, sets `accepted`. |
| `POST /api/v1/shop/{outlet_pk}/website-orders/{order_pk}/reject/` | Body `{reason_id}` from a fixed list (items unavailable, outlet closed, too busy, outside delivery area, other). |

**POS app (`Rajubhai-pos`):** add `services/websiteOrderApi.ts`; `AcceptOnlineOrders.tsx` merges the Wera list and the website list, adds a "Website" platform chip and badge, shows address and instructions, shows an "Auto-accepts in mm:ss" countdown from `auto_accept_at`, routes accept and reject to the right API by source, listens for `website_order.received` and `website_order.updated` in the existing rail subscription, and includes website `received` orders in the sidebar and dashboard count. Same quiet behaviour as today (no pop-ups or sounds). Verify with `npm run lint`, `npm run build`, `npm run audit:tooltips`. Encrypted ids stay opaque strings.

## 10. Order lifecycle (Phase 2)

- `received → accepted` (staff or auto) → `create_order(...)` makes the POS bill and KOT.
- `received → rejected` (staff).
- `received → cancelled` only when an auto-accept keeps failing for `auto_cancel_duration_mins` (existing setting, default 15): the customer then sees "We could not accept this order."

**Auto-accept sweeper:** `webshop.auto_accept_due` runs every 15 seconds via a `PeriodicTask` created in the same data migration as the task (§13). It selects `received` orders with `auto_accept_at <= now`, locks each row (`select_for_update`), skips anything no longer `received`, and calls the same `accept_order` service as staff with `by="Auto-accept"`, `auto_accepted=True`, `preparation_minutes = minimum_preparation_time_mins`. It is idempotent. If Celery is down, orders simply wait for staff to accept; the delay is accurate to within the sweep interval.

**POS bill:** `create_order(outlet, by=..., source="billing", order_type="delivery", order_type_label="Home Website Delivery", sub_order_type="Home Website", customer_name, customer_phone, special_note="Website {reference} | {instructions}", payment_type="Cash", my_amount=subtotal, tax=tax_total, tax_breakdown=rows, discount=0, grand_total, items=lines, kots=[...])`. Container and delivery charges are added as breakdown rows with `mode: "forward"` so `Order.grand_total` equals the server total; an acceptance test asserts this equality. Customer matching by phone follows `orders.services._customer_update`; confirm its payload shape at implementation.

**Open or closed:** `shop_hours.is_open(outlet, now)` in the outlet timezone using `open_24x7`, the `day` time slots and `outlets/timeutils.py`; confirm the exact semantics against the POS before relying on it. A closed outlet shows `closed_message` and refuses orders.

## 11. Website changes (`rajubhai-website/src/order-app`)

- **Config:** `PUBLIC_API_BASE_URL` (Astro env); a dev proxy for `/api` in `astro.config.mjs`.
- **Outlets:** an `OutletContext` loads `/shop/outlets/`, picks the outlet from `?outlet=`, then saved choice, then the only outlet; with several and none chosen it shows a picker. The cart is per outlet; switching outlets asks before clearing it.
- **Services:** `services/api.js` is replaced by `services/shopApi.js` (fetch wrapper that understands the envelope) plus a mapper from the server menu to the current UI shape. Cart lines store `variationId` and add-on ids, not labels.
- **Pricing:** the cart and checkout show the server `quote` (debounced) instead of local arithmetic. Hard-coded fees (5% GST, ₹15 packaging, ₹35 delivery) are removed. The promo box is hidden until Phase 5.
- **Checkout:** guest only, with name, phone, address. It sends the order with a fresh `idempotency_key` kept until success. The confirmation page shows the real `reference`; the tracking page shows received, accepted or rejected only (stages arrive in Phase 3). `public_id`s are kept in `localStorage` so a customer can reopen an order until Phase 4 adds accounts.
- **Content:** address, hours and phone come from `/info/`, not `restaurant.json`.
- **States:** loading, empty, and clear errors for closed (409), unavailable items (422, highlighting the lines), minimum order, and network failure.
- **Verification:** no test framework; use `npm run build` plus manual runs against a real backend.

## 12. Tests (backend, Django `TestCase`)

Menu feed: filters by channel, active flags, `order_types`, `days`, hidden add-on groups, outlet isolation. Pricing: the tax vector fixture to the cent, charges, container charge. Delivery engine: charge, minimum order, ignore flag, bad settings strings. Place order: success, idempotent repeat, closed outlet, item from another outlet, quantity and add-on rule violations, bad phone, client-sent prices ignored, throttle. Accept: POS `Order.grand_total` equals the server total, a KOT exists, `sub_order_type == "Home Website"`, double accept is a no-op. Sweeper: accepts only due orders, idempotent, cancels after the failure window. Staff endpoints: a user of outlet B cannot see or accept outlet A's orders.

## 13. Security

Server-side pricing and validation only. Encrypted ids everywhere except `public_id`, which is random and unguessable. Read endpoints cached briefly and throttled. No customer data in logs. Orders can be switched off per outlet with `enabled`. Wera is never called.

## 14. Config and operations

- Run `makemigrations webshop` then `migrate` locally (standing user preference), and remind the user to migrate production.
- Celery worker and beat must run (dev compose and `docker-compose.prod.yml`); the sweeper depends on them.
- Add the website origin to `CORS_ALLOWED_ORIGINS`; add the API domain to `ALLOWED_HOSTS`; keep `.env.example` current.
- Enable per outlet in Django admin (`WebshopSettings.enabled`), and make sure the outlet has an active `home-website` `OutletChannel` with priced items.
- **Backup first (done 2026-11-03):** `pos-eble-be` is a git repository (history since 2026-09-15, branch `feat/billing`; `AGENTS.md` wrongly says only the frontend is a repo). Protection already in place: tag `pre-webshop-2026-11-03` at `HEAD`, and branch `backup/stash-2026-11-02-1037` pointing at the stash made on 2026-11-02 at 10:37, which holds about 3,200 lines of uncommitted work in outlets, orders, dashboard, inventory and integrations that was never restored. Build `webshop` on its own branch cut from `feat/billing`. Do not apply that stash blindly: it overlaps later commits and migrations 0022 and 0023.

## 15. STANDARDS.md updates (same change as the code)

New section "26. Website ordering (`webshop` app)": the channel decision (no Wera), the endpoint table, the server-side pricing exception to §14 and its parity-test rule, the delivery engine contract, the auto-accept sweeper, and a changelog line.

## 16. Acceptance

**Phase 1:** with two outlets enabled, the website lists both; choosing one shows that outlet's menu; changing an item price or deactivating an item in the POS shows on the website within about 30 seconds; a disabled outlet does not appear.

**Phase 2:** an order placed on the website appears on Accept Orders with a countdown; accepting by hand makes a POS bill and KOT at the right outlet with the right total; doing nothing auto-accepts after the delay with the same result; rejecting shows the reason on the customer's tracking page; a tampered price in the request changes nothing; a closed outlet refuses orders with its message; staff of another outlet cannot see the order.

## 17. Out of scope and known limits

Order stages beyond accepted, customer cancellation, SMS or WhatsApp messages, sign-in, saved addresses, coupons and discounts, online payment, delivery zones, takeaway and dine-in, container-charge modes other than Item Wise, the dashboard "Online Orders" panel (orders still carry no online marker, per §14 notes), and kitchen stock deduction (removed from the backend on 2026-11-02 and being handled separately).
