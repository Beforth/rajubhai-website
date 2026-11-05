# Website Orders → POS (Phases 1 and 2) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Customers pick an outlet on the website, see its real menu, and place cash-on-delivery orders that auto-accept into the outlet's POS as a bill and kitchen ticket.

**Architecture:** A new Django app `webshop` in `pos-eble-be` holds its own tables, a public API, staff accept/reject, a server-side pricing port of the POS tax engine, and a Celery auto-accept sweeper. It creates POS bills through `orders.services.create_order`. The POS app (`Rajubhai-pos`) merges website orders into Accept Orders; the website (`rajubhai-website/src/order-app`) swaps its mock `services/api.js` for the real API. Wera is never used.

**Tech Stack:** Django 5 + DRF + Celery/beat (backend), React 19 + TypeScript + Vite (POS), Astro + React 19 JSX (website).

**Spec:** `rajubhai-website/docs/superpowers/specs/2026-11-03-website-orders-pos-phases-1-2-design.md`

## Global Constraints

- First-party channel: no Wera, no `integrations` models/imports for website orders. Reuse only `orders.services.create_order`, `billing.services.push`, `notifications.notify`, `orders.views._fetch_outlet`, `outlets` settings and `menus` models.
- Backend branch `feat/webshop` cut from `feat/billing` (not `main`) in `E:\pos-eble\pos-eble-be`; POS branch `feat/website-orders` from the current `Rajubhai-pos` branch; website branch `feat/shop-api` from `feat/order-app-merge`. Never apply `stash@{0}`; backup branch `backup/stash-2026-11-02-1037` and tag `pre-webshop-2026-11-03` already exist.
- Backend conventions: envelope `{success, message, data, errors}` via `core.responses`; routes under `/api/v1/`; encrypted ids via `register_pk_converter` (never `<int:...>`); logic in `services.py`, thin views; every model extends `SoftDeleteModel`; register models in admin; after `makemigrations webshop` run `migrate` locally and remind the user to migrate production. Commit prefix style `New:` / `Fix:`.
- Money: `Decimal`, quantised to 2 places with `ROUND_HALF_UP`, sent as decimal strings (`"320.00"`). `grand_total = subtotal + container_charge + delivery_charge + forward_tax`. No rounding at order time; discount is always 0 (a non-zero discount is rejected).
- Limits: quantity 1–50, at most 40 lines, name 1–120 chars, phone normalised to exactly 10 digits (strip spaces and `+91`), address line required and at most 500 chars, instructions at most 500 chars, preparation time 1–300 minutes.
- Throttle scopes: `shop_read` 120/min, `shop_order` 6/min per IP. Auto-accept default delay `auto_accept_delay_seconds=180`; sweeper runs every 15 seconds.
- Delivery only. Takeaway and dine-in stay commented out. Promo box hidden until Phase 5. Website UI follows `docs/order-app.md` theme rules (site tokens only, Inter, no unscoped global CSS).
- Run backend commands from `pos-eble-be` with the venv active (`.\venv\Scripts\Activate.ps1`). Run POS checks with `npm run lint`, `npm run build`, `npm run audit:tooltips` in `Rajubhai-pos`; website check is `npm run build`.
- STANDARDS §14 says the backend never computes tax; website orders are the one recorded exception (Task 9 writes it down).

## Facts confirmed while planning (do not re-derive)

1. `Item.order_types` and `Item.days` are JSON lists and are `[]` on all 181 dev items: empty means "all". Non-empty values are matched case-insensitively (`order_types` contains a value including `"deliver"`; `days` contains the full lowercase weekday name, as `menus/services.py` does).
2. Outlet `calculation_settings` fields: `tax_on_delivery_charge`, `tax_on_container_charge` (default True), `container_charge_mode` (default `"Item Wise"`), `tax_before_discount`, `backward_tax_after_discount`. The POS never passes `chargeTaxes` to `computeTax`, so charges are effectively untaxed there; the Python port keeps a `charge_taxes` parameter but the website passes none (parity).
3. Prices: item = active `ItemAreaPrice.price` for the outlet's `home-website` `OutletChannel`; variation = `ItemVariation.price` when not null, else active `VariationAreaPrice` for that channel; add-on = active `AddonAreaPrice` for that channel, else `Addon.base_price`. Task 3 step 1 pins this against the POS.
4. `create_order(customer=...)` takes an encrypted **customer id** or `""`, not a name/phone. Website orders pass `customer_name` and `customer_phone` only (as `integrations.services.convert_to_pos_order` does).
5. Outlets have no opening-time field. Rule: `open_24x7` → open; else if `OutletTimeSlot` rows with scope `day` exist for today's weekday → open inside any slot (overnight slots allowed); else open. `enabled` on `WebshopSettings` is the real off switch.
6. No `CACHES` setting exists (per-process local memory). Task 6 adds an optional shared cache via env `CACHE_REDIS_URL`.
7. Staff views are gated by `accounts.permissions.SCREEN_PERMISSIONS[url_name]`; Wera's use `"kot_advanced_order_management"`. Website staff url names get the same code.
8. Only 2 items across the dev outlets are priced for `home-website` (outlets 1, 11, 14 have the channel). Task 3 seeds demo data on outlet 14 ("Eble Demo Restaurant").

## Wire contract (exact keys; all amounts are decimal strings)

- `GET /shop/outlets/` → `[{id, name, address, phone, logo, is_open}]`
- `GET /shop/{outlet}/info/` → `{id, name, address, phone, fssai, hours, is_open, accepting_orders, closed_message, minimum_order, delivery_charge, preparation_minutes, currency}`
- `GET /shop/{outlet}/menu/` → `{categories: [{id, name, items: [{id, name, description, veg, price, image, tags, variations: [{id, name, price}], addon_groups: [{id, name, min, max, required, selection_mode, addons: [{id, name, price, veg}]}]}]}]}`
- `POST /shop/{outlet}/quote/` request `{items: [{item_id, variation_id, addons: [{id, qty}], qty, note}], address: {line, landmark}}` → `{lines: [{item_id, variation_id, name, qty, unit_price, line_total, error}], subtotal, container_charge, delivery_charge, tax_total, tax_breakdown: [{label, amount, mode, rate}], grand_total, minimum_order, eligible, reason}`
- `POST /shop/{outlet}/orders/` request `{idempotency_key, customer: {name, phone}, address: {line, landmark}, instructions, items: [...as quote]}` → 201 (200 on repeat key) `{public_id, reference, status, grand_total, auto_accept_at}`
- `GET /shop/orders/{public_id}/` → `{public_id, reference, status, reject_reason, grand_total, auto_accept_at, items, created_at}`
- Staff `GET /shop/{outlet}/website-orders/?status=&search=` → `{results: [order], counts: {received, in_progress, closed}}`; `order` = `{id, reference, platform: "website", status, customer_name, customer_phone, address, landmark, instructions, items, subtotal, container_charge, delivery_charge, tax_total, grand_total, received_at, auto_accept_at, accepted_at, auto_accepted, preparation_minutes, reject_reason}`. Tab mapping: `received` → received; `accepted`, `preparing`, `ready`, `out_for_delivery` → in_progress; `delivered`, `rejected`, `cancelled` → closed.
- Staff `POST .../website-orders/{id}/accept/` body `{preparation_time}`; `POST .../reject/` body `{reason_id}` with 1 Items unavailable, 2 Outlet closed, 3 Too busy, 4 Outside delivery area, 5 Other. Both return the `order` shape.
- Error mapping: closed shop 409, unlisted item or rule violation 422, bad input 400, throttled 429.
- Live events (`billing.services.push`): `website_order.received`, `website_order.updated`, payload = the staff `order` shape.

## Review Focus

1. An item deactivated, unpriced, or removed between the customer loading the menu and placing the order → 422 naming the line, never a 500. (Task 6)
2. The same `idempotency_key` sent twice (double tap, retry after a timeout) → exactly one order, second call 200. (Task 6)
3. Staff accept and the auto-accept sweeper firing together, or a double accept → exactly one POS bill and KOT. (Tasks 7, 8)
4. Outlet closes (or is switched off) after the cart was built → 409 with the closed message. (Task 6)
5. Staff of outlet B listing, accepting or rejecting outlet A's order, or a cart item belonging to another outlet → 404 / 422. (Tasks 6, 7)

---

## Phase 1 — real menu on the website

### Task 1: `webshop` app, models, admin, test factories

**Files:**
- Create: `pos-eble-be/webshop/{__init__.py,apps.py,models.py,admin.py,urls.py}`, `webshop/migrations/0001_initial.py`, `webshop/tests/{__init__.py,factories.py,test_models.py}`
- Modify: `core/settings.py` (`INSTALLED_APPS`), `core/api_urls.py` (`path("shop/", include("webshop.urls"))`)

**Interfaces:**
- Produces (`webshop/models.py`):
  - `WebshopSettings(outlet FK, enabled=False, auto_accept_delay_seconds=180, closed_message="")`, one live row per outlet.
  - `WebsiteOrder` with `Status` (`received|accepted|preparing|ready|out_for_delivery|delivered|rejected|cancelled`), `outlet`, `public_id` (unique, 16 random chars, auto-set on first save), `reference` (`WEB-{pk:06d}`, set after create), `customer_name`, `customer_phone`, `address`, `landmark`, `instructions`, `payment_method="cash"`, `items` JSON, `subtotal`, `container_charge`, `delivery_charge`, `discount`, `tax_total`, `tax_breakdown` JSON, `grand_total`, `idempotency_key`, `received_at`, `auto_accept_at`, `accepted_at`, `accepted_by`, `auto_accepted`, `preparation_minutes`, `reject_reason`, `cancelled_reason`, `pos_order` OneToOne `orders.Order` (null). Unique `(outlet, idempotency_key)` among live rows.
- Produces (`webshop/tests/factories.py`): `make_outlet(name="Shop Outlet", **kw) -> Outlet`; `make_website_channel(outlet) -> OutletChannel` (creates `Channel` slug `home-website` if missing, active); `make_tax(outlet, *, title="CGST", amount="2.5", backward=False, category="CGST", fixed=False, order_wise=False) -> Tax`; `make_item(outlet, *, name="Dabeli", price="45.00", category=None, active=True, taxes=(), ignore_tax=False, container_charge="0.00", order_types=None, days=None, area_active=True) -> Item` (creates category, item and the `home-website` `ItemAreaPrice`); `enable_shop(outlet, **settings) -> WebshopSettings`; `staff_client(outlet) -> APIClient` (superuser, `force_authenticate`, as `integrations/test_online_orders.py` does); `url(name, outlet=None, **kw)` using `reverse(f"webshop:{name}", kwargs={"version": "v1", ...})` with `outlet_id=outlet.pk`.

- [ ] **Step 1: Write failing tests in `webshop/tests/test_models.py`:** `test_public_id_generated_and_unique` (two orders get different 16-char ids), `test_reference_uses_pk` (`reference == f"WEB-{order.pk:06d}"` after create), `test_idempotency_unique_per_outlet` (same key, same outlet → `IntegrityError`; same key, other outlet → ok), `test_settings_defaults` (`enabled is False`, `auto_accept_delay_seconds == 180`), `test_soft_delete_models` (`WebsiteOrder.objects` excludes soft-deleted rows, as `SoftDeleteModel` does).
- [ ] **Step 2: Run** `python manage.py test webshop.tests.test_models -v 2` — Expected: ImportError / FAIL (app missing).
- [ ] **Step 3: Create the app** (`webshop/apps.py` name `webshop`), models as above following the `integrations/models.py` and `outlets/models.py` `_outlet_singleton` style, admin registration for both models (list display with status and outlet), empty `urls.py` with `app_name = "webshop"` and `register_pk_converter` for `outlets/outlet` and `webshop/websiteorder`; register the app and URL include.
- [ ] **Step 4: Run** `python manage.py makemigrations webshop` then `python manage.py migrate`, then the Step 2 command — Expected: PASS (5 tests).
- [ ] **Step 5: Commit** — `git add webshop core && git commit -m "New: webshop app with settings and website order models"`.

### Task 2: Shop hours and the delivery engine

**Files:**
- Create: `webshop/shop_hours.py`, `webshop/delivery.py`, `webshop/tests/test_hours_delivery.py`

**Interfaces:**
- Produces: `shop_hours.is_open(outlet, now=None) -> bool` (rule in fact 5, outlet timezone via `outlets.timeutils.outlet_tz`); `delivery.DeliveryQuote` dataclass `(eligible: bool, charge: Decimal, minimum_order: Decimal, reason: str)`; `delivery.quote_delivery(outlet, *, address: dict | None, subtotal: Decimal) -> DeliveryQuote`.

- [ ] **Step 1: Write failing tests:** `test_open_24x7_always_open`; `test_no_day_slots_means_open`; `test_inside_slot_open_outside_closed` (slot 11:00–23:00 on the weekday, now 10:59 → False, 11:00 → True, 23:00 → False, in `Asia/Kolkata`); `test_overnight_slot` (22:00–02:00 open at 01:00); `test_delivery_defaults_from_online_settings` (`default_delivery_charge="35"`, `minimum_order_amount="100"`, subtotal `Decimal("120")` → `eligible True`, `charge Decimal("35.00")`); `test_below_minimum_not_eligible` (subtotal 80 → `eligible False`, `reason == "Minimum order ₹100"`); `test_ignore_online_delivery_charge_zeroes_charge`; `test_bad_settings_strings_fall_back_to_zero` (`"abc"` → charge 0, no exception).
- [ ] **Step 2: Run** `python manage.py test webshop.tests.test_hours_delivery -v 2` — Expected: FAIL (modules missing).
- [ ] **Step 3: Implement both modules.** Read `OutletOnlineOrderSettings` (`default_delivery_charge`, `minimum_order_amount`, `ignore_online_delivery_charge`) with a safe string-to-Decimal helper that logs and returns 0; `address` is accepted and ignored (hook for Phase 6).
- [ ] **Step 4: Run** the Step 2 command — Expected: PASS (8 tests).
- [ ] **Step 5: Commit** — `git commit -m "New: shop hours and delivery engine for website orders"`.

### Task 3: Public menu feed and Phase 1 endpoints

**Files:**
- Create: `webshop/menu_feed.py`, `webshop/serializers.py`, `webshop/views.py`, `webshop/tests/test_menu_feed.py`
- Modify: `webshop/urls.py`, `core/settings.py` (DRF throttle rates `shop_read`, `shop_order`)

**Interfaces:**
- Consumes: Task 1 factories; Task 2 `is_open`, `quote_delivery`.
- Produces: `menu_feed.home_website_channel(outlet) -> OutletChannel | None`; `menu_feed.build_menu(outlet) -> dict` in the menu wire shape; `webshop.services.list_enabled_outlets() -> list[Outlet]` and `webshop.services.shop_info(outlet) -> dict` (info wire shape); URL names `shop-outlets`, `shop-info`, `shop-menu` (no auth: `permission_classes=[AllowAny]`, `authentication_classes=[]`, throttle scope `shop_read`; menu sends `Cache-Control: public, max-age=30`).

- [ ] **Step 1: Pin the price rule (characterization, no code yet).** In `Rajubhai-pos/src` find where billing turns an item's variation and add-on into a line price (start from `services/menuService.ts` and the billing menu mapping used by `BillPanel`). Write the rule actually used into a code comment at the top of `menu_feed.py` and compare with fact 3. If they differ, use the POS rule and note it in the spec. Expected: a written rule and a ledger note.
- [ ] **Step 2: Write failing tests in `test_menu_feed.py`:** `test_lists_only_priced_active_items` (inactive item, item with inactive `ItemAreaPrice`, item with no home-website price, item in inactive category are all absent); `test_empty_order_types_and_days_mean_all`; `test_order_types_without_delivery_hidden` (`["Dine In"]` hidden, `["Home Delivery"]` shown); `test_days_filter_uses_outlet_timezone`; `test_hidden_addon_group_omitted` (`show_in_online=False`); `test_variation_and_addon_prices` (per the Step 1 rule); `test_outlet_isolation` (items of outlet B never appear for A); `test_outlets_endpoint_lists_only_enabled` (disabled outlet, and outlet without active `home-website` channel, absent); `test_menu_endpoint_shape_and_cache_header` (keys match the wire contract; `Cache-Control` contains `max-age=30`); `test_disabled_outlet_menu_404`; `test_info_reports_closed_message_when_closed`; `test_ids_are_encrypted` (no raw integer ids in any response).
- [ ] **Step 3: Run** `python manage.py test webshop.tests.test_menu_feed -v 2` — Expected: FAIL.
- [ ] **Step 4: Implement** `build_menu` (query with `select_related`/`prefetch_related`, image = first `ItemImage` for the channel by `position`, absolute URL via `request.build_absolute_uri`), the three views and routes `outlets/`, `<outlet_pk:outlet_id>/info/`, `<outlet_pk:outlet_id>/menu/`, and DRF throttle rates in `REST_FRAMEWORK`. Item `name` is `ItemAreaPrice.online_display_name`, else `Item.online_display_name`, else `Item.name`.
- [ ] **Step 5: Run** the Step 3 command — Expected: PASS.
- [ ] **Step 6: Seed demo data and smoke test.** In Django admin or the POS menu screen, price at least 6 items across 2 categories for `home-website` on outlet 14 and set `WebshopSettings.enabled=True` for outlets 14 and 1. Run `curl http://127.0.0.1:8000/api/v1/shop/outlets/` and `.../menu/` for outlet 14 — Expected: envelope with `success: true` and the seeded items.
- [ ] **Step 7: Commit** — `git commit -m "New: public shop outlets, info and menu endpoints"`.

### Task 4: Website reads the real menu (Phase 1 on the website)

**Files (in `rajubhai-website/src/order-app` unless noted):**
- Create: `services/shopApi.js`, `context/OutletContext.jsx`, `services/menuMapper.js`, `components/outlet/OutletPicker.jsx`
- Modify: `OrderApp.jsx` (provider), `pages/OrderHome.jsx` (load via `shopApi`), `context/CartContext.jsx` (cart per outlet, lines keep `variationId`, add-on ids), `components/menu/ItemDetailsModal.jsx` (use mapped sizes/add-ons), `components/layout/Navbar.jsx` (info from `/info/`), `../../astro.config.mjs` (dev proxy `/api` → `http://127.0.0.1:8000`), `docs/order-app.md`

**Interfaces:**
- Consumes: Task 3 wire contract (outlets, info, menu).
- Produces: `shopApi.get(path)` / `shopApi.post(path, body)` returning the envelope's `data` or throwing `ShopApiError {status, message, errors}`; base URL from `import.meta.env.PUBLIC_API_BASE_URL` (empty = same origin via the dev proxy); `useOutlet() -> {outlets, outlet, info, setOutletId, loading, error}`; `menuMapper.toUiMenu(menuData) -> {categories, items}` where each item is `{id, categoryId, name, description, price: Number, isVeg, image, sizes: [{id, label, price}], addons: [{id, label, price, groupId}], addonGroups}` so existing cards and modal keep working.

- [ ] **Step 1: Implement** `shopApi.js`, `OutletContext` (selection order: `?outlet=` query, then `localStorage` key `rajubhai.outlet`, then the only enabled outlet, else show `OutletPicker`), `menuMapper.js`, and switch `OrderHome` to load `/shop/{outlet}/menu/`. Cart lines store `outletId`; changing outlet with a non-empty cart asks to clear it.
- [ ] **Step 2: Replace hard-coded restaurant facts** (address, hours, phone, FSSAI) in `Navbar.jsx` with values from `/info/`; show `closed_message` and a closed banner when `accepting_orders` is false.
- [ ] **Step 3: Add the Astro dev proxy** and the `PUBLIC_API_BASE_URL` note in `docs/order-app.md`.
- [ ] **Step 4: Verify:** with the backend and `astro dev --background` running, open `/order`; Expected: outlet picker (two outlets), then the seeded real menu; a price changed in the POS shows after reload within about 30 seconds; a disabled outlet is absent. Run `npm run build` — Expected: exits 0.
- [ ] **Step 5: Commit** — `git commit -m "feat: order app reads the real menu per outlet"`.

---

## Phase 2 — orders into the POS

### Task 5: Pricing engine port with parity vectors

**Files:**
- Create: `webshop/pricing.py`, `webshop/tests/tools/gen_tax_vectors.cjs`, `webshop/tests/fixtures/tax_cases.json`, `webshop/tests/fixtures/tax_vectors.json`, `webshop/tests/test_pricing.py`

**Interfaces:**
- Produces (`webshop/pricing.py`): dataclasses `TaxSlab(title, tax_category, online_display_name, type, amount: Decimal, backward_printing, item_order_wise, is_active)`, `TaxLine(item_id, price: Decimal, qty: Decimal)`, `TaxItem(taxes: list[TaxSlab], ignore_tax: bool)`, `TaxSettings(tax_before_discount=False, backward_tax_after_discount=False, tax_on_delivery_charge=False, tax_on_container_charge=False)`, `TaxResult(total, added_to_total, breakdown: list[dict], line_tax: dict)`; `compute_tax(lines, items, *, discount=Decimal("0"), delivery_charge=Decimal("0"), container_charge=Decimal("0"), charge_taxes=(), settings=TaxSettings()) -> TaxResult` mirroring `Rajubhai-pos/src/utils/taxEngine.ts` `computeTax`; `round2(value) -> Decimal` (`ROUND_HALF_UP`).

- [ ] **Step 1: Write `tax_cases.json`:** at least 12 carts covering forward only, backward only, mixed, `Fixed` per unit, order-wise only, order-wise plus item-wise, `ignore_tax`, inactive slab, several lines of one item, discount with `tax_before_discount` both ways, backward after discount, and taxed charges with `charge_taxes` supplied.
- [ ] **Step 2: Generate expected values from the real engine.** In `Rajubhai-pos` run `npx esbuild src/utils/taxEngine.ts --bundle --platform=node --format=cjs --outfile=<temp-file>` (any path outside both repos), then from `pos-eble-be` run `node webshop/tests/tools/gen_tax_vectors.cjs <temp-file>` (the script loads that bundle, runs every case in `tax_cases.json`, and writes `tax_vectors.json` with inputs and the engine's `total`, `addedToTotal`, `breakdown`, `lineTax`). Expected: `tax_vectors.json` has one entry per case. Commit the fixture; the script is a dev tool, not shipped.
- [ ] **Step 3: Write failing tests:** `test_matches_taxengine_vectors` (for each vector, `compute_tax` returns the same `total`, `added_to_total` and every `breakdown` row's `label`, `amount`, `mode`, `rate` to the cent) and `test_backward_tax_never_added_to_total` (a backward-only cart has `added_to_total == Decimal("0.00")` while `total > 0`).
- [ ] **Step 4: Run** `python manage.py test webshop.tests.test_pricing -v 2` — Expected: FAIL.
- [ ] **Step 5: Implement `compute_tax`** as a direct port (same slot keys `mode:label`, same order of operations, `Decimal` with `ROUND_HALF_UP` where the TS calls `round2`).
- [ ] **Step 6: Run** the Step 4 command — Expected: PASS for all vectors.
- [ ] **Step 7: Commit** — `git commit -m "New: server-side tax engine port with parity vectors"`.

### Task 6: Cart validation, quote and order placement

**Files:**
- Create: `webshop/tests/test_orders.py`
- Modify: `webshop/services.py`, `webshop/pricing.py`, `webshop/views.py`, `webshop/urls.py`, `core/settings.py` (optional shared `CACHES`), `.env.example`

**Interfaces:**
- Consumes: Task 2 (`quote_delivery`, `is_open`), Task 3 (`home_website_channel`), Task 5 (`compute_tax`).
- Produces (`webshop/pricing.py`): dataclass `PricedCart(lines: list[dict], subtotal, container_charge, delivery_charge, tax_total, tax_breakdown: list[dict], grand_total, minimum_order, eligible: bool, reason: str, errors: list[dict])` and `price_cart(outlet, items: list[dict], *, address: dict | None, discount: Decimal = Decimal("0")) -> PricedCart` (raises `OrderError` when `discount != 0`; loads items, variations, add-ons and taxes, applies the menu inclusion rule and the Task 3 price rule, `Item.taxes`/`ignore_tax`, container charge Item Wise, calls `quote_delivery`).
- Produces (`webshop/services.py`): `OrderError(message, status=400, errors=None)`; `quote_cart(outlet, payload) -> dict` (quote wire shape); `place_order(outlet, payload) -> tuple[WebsiteOrder, bool]` (`bool` = created); `serialize_order(order, *, staff=False) -> dict`; `get_public_order(public_id) -> WebsiteOrder`. URL names `shop-quote`, `shop-order-create`, `shop-order-detail`; throttle scope `shop_order` on create.

- [ ] **Step 1: Write failing tests in `test_orders.py`** (use factories; shop enabled and open):
  - `test_quote_totals_match_engine` (one item 45.00 with forward 2.5%+2.5% → `subtotal "45.00"`, `tax_total "2.25"`, `grand_total` = subtotal + delivery + tax).
  - `test_quote_ignores_client_prices` (extra `price` keys in the body change nothing).
  - `test_place_order_creates_received_order_and_event` (201, `status "received"`, `auto_accept_at ≈ now + 180s`, `push` called with event `website_order.received`).
  - `test_idempotent_repeat_returns_same_order` (same key twice → one row, second HTTP 200). *(Review Focus 2)*
  - `test_item_deactivated_between_menu_and_order_422` (response names the line, no order created). *(Review Focus 1)*
  - `test_closed_outlet_409_with_message` and `test_disabled_outlet_404`. *(Review Focus 4)*
  - `test_item_from_other_outlet_rejected_422`. *(Review Focus 5)*
  - `test_addon_min_max_required_rules` (below min, above max, missing required group → 422).
  - `test_quantity_and_line_limits` (qty 0, 51, negative, 41 lines → 422/400).
  - `test_phone_normalisation` (`"+91 98765 43210"` → `"9876543210"`; 9 digits → 400).
  - `test_name_address_instruction_limits` (121-char name, 501-char address, emoji and non-Latin names accepted when within limits).
  - `test_below_minimum_order_422`.
  - `test_nonzero_discount_rejected` (`price_cart` raises).
  - `test_public_order_lookup_by_public_id_only` (wrong id 404; response has no raw pk).
  - `test_push_failure_does_not_fail_order`.
  - `test_throttle_returns_429` (7th order in a minute).
- [ ] **Step 2: Run** `python manage.py test webshop.tests.test_orders -v 2` — Expected: FAIL.
- [ ] **Step 3: Implement `price_cart` and the services/views.** Validate shape first (400), then rules (422/409). `place_order` runs inside `transaction.atomic()`, creates the order, sets `reference`, `auto_accept_at = now + settings.auto_accept_delay_seconds`, then (outside the transaction, errors logged only) calls `billing.services.push(outlet=, event="website_order.received", data=serialize_order(order, staff=True))` and `notifications.notify(...)` (read `notifications/services.py` for its signature). Idempotency: look up `(outlet, idempotency_key)` first and again on `IntegrityError`.
- [ ] **Step 4: Add optional shared cache:** in `core/settings.py`, when env `CACHE_REDIS_URL` is set use `django.core.cache.backends.redis.RedisCache`; otherwise leave the default. Document the key in `.env.example` (throttles are per process without it).
- [ ] **Step 5: Run** the Step 2 command — Expected: PASS.
- [ ] **Step 6: Commit** — `git commit -m "New: website cart quote and order placement"`.

### Task 7: Accept, reject and the POS bill

**Files:**
- Create: `webshop/tests/test_accept.py`
- Modify: `webshop/services.py`, `webshop/views.py`, `webshop/urls.py`, `accounts/permissions.py` (`SCREEN_PERMISSIONS`)

**Interfaces:**
- Consumes: Task 6 `serialize_order`, `OrderError`; `orders.services.create_order`; `billing.services.push`; `orders.views._fetch_outlet`.
- Produces: `services.accept_order(outlet, pk, *, preparation_time: int, by: str, auto: bool = False) -> WebsiteOrder`; `services.reject_order(outlet, pk, *, reason_id: int) -> WebsiteOrder`; `services.list_website_orders(outlet, *, statuses=None, search=None) -> dict` (`{results, counts}`); `REJECT_REASONS = {1: "Items unavailable", 2: "Outlet closed", 3: "Too busy", 4: "Outside delivery area", 5: "Other"}`. URL names `website-order-list`, `website-order-accept`, `website-order-reject`, each added to `SCREEN_PERMISSIONS` with `"kot_advanced_order_management"`; staff views call `_fetch_outlet(request, outlet_id, write=...)`.

- [ ] **Step 1: Write failing tests in `test_accept.py`:**
  - `test_accept_creates_pos_bill_and_kot` (`Order.sub_order_type == "Home Website"`, `order_type == "delivery"`, `payment_type == "Cash"`, `source == "billing"`, one `Kot` with the same lines).
  - `test_pos_grand_total_equals_server_total` (container and delivery rows `mode: "forward"`; `order.grand_total == website_order.grand_total`).
  - `test_accept_is_idempotent_one_bill` (second accept returns the order, one `Order` row). *(Review Focus 3)*
  - `test_accept_validates_preparation_time` (0 and 301 → 400).
  - `test_reject_sets_reason_and_closed_status`; `test_cannot_accept_rejected_order_409`.
  - `test_list_counts_and_filters` (tab counts per the wire contract; `search` by name, phone, reference).
  - `test_other_outlet_staff_cannot_see_or_act_404` (user with membership only at outlet B). *(Review Focus 5)*
  - `test_unauthenticated_staff_endpoints_401`.
  - `test_accept_emits_updated_event`.
- [ ] **Step 2: Run** `python manage.py test webshop.tests.test_accept -v 2` — Expected: FAIL.
- [ ] **Step 3: Implement** accept (lock the row with `select_for_update`, skip unless `received`, build `create_order(outlet, by=by, source="billing", order_type="delivery", order_type_label="Home Website Delivery", sub_order_type="Home Website", customer_name=, customer_phone=, special_note=f"Website {reference} | {instructions}"[:500], payment_type="Cash", my_amount=subtotal, tax=tax_total, tax_breakdown=rows, discount=0, grand_total=, items=lines, kots=[...])` following `integrations.services.convert_to_pos_order`; do not pass `customer`), reject, list, serializers and the three views. Push `website_order.updated` after each change.
- [ ] **Step 4: Run** the Step 2 command — Expected: PASS.
- [ ] **Step 5: Commit** — `git commit -m "New: website order accept, reject and POS bill creation"`.

### Task 8: Auto-accept sweeper

**Files:**
- Create: `webshop/tasks.py`, `webshop/migrations/0002_auto_accept_periodic_task.py`, `webshop/tests/test_sweeper.py`
- Modify: `webshop/services.py`

**Interfaces:**
- Consumes: Task 7 `accept_order`.
- Produces: `services.auto_accept_due(now=None) -> int` (orders handled); Celery task `webshop.auto_accept_due` calling it; a `django_celery_beat.PeriodicTask` every 15 seconds created by the data migration (§13).

- [ ] **Step 1: Write failing tests in `test_sweeper.py`:** `test_accepts_only_due_orders` (one due, one not); `test_auto_accept_marks_flags` (`auto_accepted True`, `accepted_by "Auto-accept"`, `preparation_minutes == int(minimum_preparation_time_mins)`); `test_sweeper_and_manual_accept_race_one_bill` (accept manually, then sweep → still one POS order). *(Review Focus 3)*; `test_failed_accept_is_retried_then_cancelled_after_window` (patch `create_order` to raise; the order stays `received` until `auto_cancel_duration_mins` has passed since `received_at`, then `cancelled` with `cancelled_reason`); `test_sweeper_skips_rejected_and_cancelled`; `test_per_outlet_delay_respected` (outlet A 60s, outlet B 600s).
- [ ] **Step 2: Run** `python manage.py test webshop.tests.test_sweeper -v 2` — Expected: FAIL.
- [ ] **Step 3: Implement** `auto_accept_due` (query `received` with `auto_accept_at <= now`, per-order try/except so one failure never blocks the rest, log failures) and the task in `webshop/tasks.py` (calls the service only), plus the data migration creating the `PeriodicTask`.
- [ ] **Step 4: Run** the Step 2 command, then `python manage.py test webshop -v 2` — Expected: all webshop tests PASS.
- [ ] **Step 5: Manual end-to-end (backend only):** with Redis, worker and beat up (`docker compose up -d` in `pos-eble-be`), `curl` a quote and an order for outlet 14 and wait 3 minutes — Expected: the order becomes `accepted` and a POS bill with a KOT exists. Note the result in the ledger.
- [ ] **Step 6: Commit** — `git commit -m "New: auto-accept sweeper for website orders"`.

### Task 9: Docs and operations

**Files:**
- Modify: `pos-eble-be/docs/STANDARDS.md`, `pos-eble-be/.env.example`, `pos-eble-be/AGENTS.md`, `E:\pos-eble\AGENTS.md`

- [ ] **Step 1: Add STANDARDS section "26. Website ordering (`webshop` app)":** the first-party decision (no Wera), the endpoint table from the wire contract, the server-side pricing exception to §14 and the parity-vector rule (regenerate `tax_vectors.json` whenever `taxEngine.ts` changes), the delivery engine contract, the auto-accept sweeper, the shared-cache note for throttling, and a changelog line.
- [ ] **Step 2: Document production settings:** in `.env.example` note that production needs the website's origin in `CORS_ALLOWED_ORIGINS`, the API domain in `ALLOWED_HOSTS`, and `CACHE_REDIS_URL` for shared throttling (dev uses the Astro proxy, so no CORS change is needed locally). Remind the user to enable each outlet through `WebshopSettings.enabled` and to run `migrate` on production.
- [ ] **Step 3: Fix the wrong repo statement** in both `AGENTS.md` files ("Only the frontend is a git repo" — `pos-eble-be` is a repo on `feat/billing`); ask the user before editing the workspace-root `AGENTS.md`.
- [ ] **Step 4: Verify** by reading the section back; Expected: every endpoint in the wire contract appears once. Commit — `git commit -m "New: document website ordering in STANDARDS"`.

### Task 10: Website orders on the POS Accept Orders screen

**Files (in `Rajubhai-pos/src`):**
- Create: `services/websiteOrderApi.ts`
- Modify: `pages/AcceptOnlineOrders.tsx`, `components/online-orders/AcceptOrderCard.tsx`, `state/OnlineOrdersContext.tsx`, `services/onlineOrderApi.ts` (shared status/platform types only if needed)

**Interfaces:**
- Consumes: Task 7 staff endpoints and `order` shape; rail events `website_order.received|updated`.
- Produces: `listWebsiteOrdersApi(outletId, {status, search}) -> Promise<{results: WebsiteOrder[], counts: Counts}>`, `acceptWebsiteOrderApi(outletId, id, minutes)`, `rejectWebsiteOrderApi(outletId, id, reasonId)`, `WEBSITE_REJECT_REASONS` (the five reasons above), type `WebsiteOrder` mirroring the staff `order` shape.

- [ ] **Step 1: Implement `websiteOrderApi.ts`** using the existing `apiClient` pattern; ids stay opaque strings.
- [ ] **Step 2: Merge into the screen:** `AcceptOnlineOrders.tsx` loads both lists per tab, sorts by `received_at`, adds a "Website" platform chip, sums counts, routes accept and reject by source, subscribes to `website_order.*` in `RAIL_EVENTS`, keeps the 15 s poll. `AcceptOrderCard` shows a "Website" badge, address, landmark, instructions and "Auto-accepts in mm:ss" (from `auto_accept_at`; hidden once accepted). Website orders use the website reject reasons and the same accept prep-time quick picks.
- [ ] **Step 3: Counts:** `OnlineOrdersContext` adds website `received` to the sidebar and dashboard count.
- [ ] **Step 4: Verify:** `npm run lint`, `npm run build`, `npm run audit:tooltips` — Expected: all exit 0. Manual: place a website order, see it appear on Accept Orders with the countdown; accept by hand and confirm a bill appears in the POS; place another and let it auto-accept.
- [ ] **Step 5: Commit** — `git commit -m "New: website orders on Accept Orders"`.

### Task 11: Website quote-driven checkout and confirmation

**Files (in `rajubhai-website/src/order-app`):**
- Create: `services/orderStore.js` (saved `public_id`s in `localStorage` key `rajubhai.orders`)
- Modify: `services/shopApi.js` (add `quote`, `placeOrder`, `getOrder`), `context/CartContext.jsx` (use the server quote; remove 5% GST, ₹15 packaging, ₹35 delivery constants and local coupon math), `components/cart/PriceSummary.jsx` (render quote rows; hide the promo box), `components/cart/CartPanel.jsx`, `pages/Checkout.jsx` (guest form, `idempotency_key`, errors), `pages/OrderTracking.jsx` (real status), `pages/OrdersProfile.jsx` (list from `orderStore`), `docs/order-app.md`

**Interfaces:**
- Consumes: Task 6 quote/order/detail wire contract.
- Produces: `shopApi.quote(outletId, items, address) -> quote`, `shopApi.placeOrder(outletId, payload) -> {public_id, reference, status, grand_total, auto_accept_at}`, `shopApi.getOrder(publicId)`; `useCart()` exposes `quote`, `quoteLoading`, `quoteError`.

- [ ] **Step 1: Quote in the cart:** debounce (400 ms) a `shopApi.quote` call whenever lines or address change; show server rows (subtotal, container, delivery, tax rows, total); show per-line errors and the minimum-order message; disable Checkout while loading or ineligible.
- [ ] **Step 2: Checkout:** keep the existing name, phone and address form; delivery only; generate one `idempotency_key` per attempt (kept until success, reset after a 4xx that changes the cart); on 201 or 200 save `public_id` via `orderStore`, clear the cart, go to `/order-status/{public_id}`.
- [ ] **Step 3: Errors:** 409 shows the outlet's closed message; 422 highlights the offending lines and offers to refresh the menu; network failure keeps the cart and allows retry; 429 asks to wait.
- [ ] **Step 4: Tracking and history:** `OrderTracking` polls `shopApi.getOrder` every 5 s while `received`; shows received (with auto-accept countdown), accepted, rejected (with reason) or cancelled; later stages are Phase 3. `OrdersProfile` lists orders from `orderStore`.
- [ ] **Step 5: Verify:** `npm run build` — Expected: exits 0. Manual with the real backend: place an order (guest), watch it appear on Accept Orders, accept it, and see "accepted" on the tracking page; place one and let it auto-accept; try a closed outlet (disable `WebshopSettings.enabled` → 404 message) and a deactivated item; refresh the confirmation page and confirm it still loads.
- [ ] **Step 6: Commit** — `git commit -m "feat: quote-driven checkout and real order confirmation"`.

---

## Done when (spec section 16)

**Phase 1:** two enabled outlets listed; each shows its own menu; price or availability changes in the POS appear within about 30 seconds; a disabled outlet is absent. **Phase 2:** a website order appears on Accept Orders with a countdown; manual accept and auto-accept both create one POS bill and KOT at the right outlet with the right total; rejecting shows the reason to the customer; tampered prices change nothing; a closed outlet refuses orders with its message; another outlet's staff cannot see the order.
