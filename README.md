# Aisaheb Agro Industries

Trilingual (Marathi / Hindi / English) storefront for a farmer-direct seller of
cold-pressed oils and graded grains in Rashin, Maharashtra. Next.js (App
Router) + Tailwind + MongoDB/Mongoose.

## Getting started

```bash
npm install
cp .env.local.example .env.local   # already present with local defaults — fill in AUTH_SECRET
npm run seed                        # populates the product catalog + delivery zones
npm run dev
```

Open http://localhost:3000 — you'll be redirected to `/mr` (Marathi, the
default locale). Switch language from the header; the storefront is fully
translated (Marathi/Hindi/English), including error and status messages.

Admin dashboard: http://localhost:3000/admin/login — log in with any phone
number listed in `ADMIN_PHONES` (`.env.local`). In dev mode the OTP is echoed
back in the login form and printed to the server console, so no SMS account
is needed to test the flow.

## What's implemented

**Storefront (Phase 1):**
- Full customer flow: browse → product detail (variants, pincode delivery
  check) → cart → checkout (OTP login → address → delivery method → COD) →
  order confirmation → order tracking (`/orders/[id]`) → account/order
  history
- Stock is decremented with an atomic, race-safe guard (`$elemMatch` +
  positional update) so two simultaneous checkouts can never oversell a
  variant — see `lib/queries/orders.ts` for the reasoning
- Orders are idempotent: a client-generated `orderRef` (UUID) is unique-
  indexed, so a retried/duplicate submit never creates two orders
- Checkout is gated by serviceable pincode (`DeliveryZone` collection),
  never a silently broken cart

**Admin & procurement (Phase 2):**
- Role-based access: `customer` / `staff` / `owner` on `User.role`.
  `ADMIN_PHONES` (env) always resolves to `owner` on login; staff are
  granted via `/admin/settings/users`. Enforced server-side on every
  route via `requireAdmin()`/`requireOwner()` (`lib/auth/requireAdmin.ts`),
  not just hidden nav links
- Order management, product/catalog CRUD (multi-locale name/description,
  per-variant price & stock, plus separate raw-material stock — see below),
  sales summary, customer directory, audit log — all under `/admin`
- **Procurement**: admin drafts a Purchase Request against a product and a
  set of farmers → sends it (SMS/WhatsApp templated in Marathi) → farmer
  opens a phone-OTP-verified, zero-install web form
  (`/farmer/offer?requestId=...`) to submit quantity/price/ready-by date →
  admin compares offers side by side and accepts one or several (split
  fulfillment) → Goods Receipt records the delivery and atomically
  increases the product's raw-material stock → farmer ledger tracks what's
  owed vs. paid, with a printable statement and a post-delivery reliability
  rating
- A dashboard "Low Stock" panel scans raw-material stock against each
  product's threshold and links straight into drafting a purchase request
  for it — there's no cron/scheduler in this app, so this is a page-load
  scan rather than a push alert (see Deferred below)

## Deliberately deferred integrations

These need real third-party accounts/API keys that don't exist yet. Each has
a single, clearly-marked swap point — no other code needs to change once
credentials are available:

| Concern | Current behavior | Swap point |
|---|---|---|
| OTP delivery | Logs to console + echoes the code in the API response outside production | `lib/auth/otpProvider.ts` → `deliver()` |
| Payments | Cash on Delivery only; online payment UI shown as disabled "coming soon" | `lib/payments/provider.ts`, then wire a real gateway into the order-creation flow in `lib/queries/orders.ts` |
| SMS/WhatsApp notifications | Logs to console | `lib/notifications/notify.ts` |
| Product images | Local `/public/images/products/*.svg` placeholders | Swap the URL strings in each product's `images[]` (admin → Products) for Cloudinary/S3 URLs — no code change needed |
| Database hosting | Local MongoDB (`mongodb://127.0.0.1:27017/aisaheb_agro`) | Swap `MONGODB_URI` in `.env.local` for an Atlas connection string |
| WhatsApp Business API (farmer sourcing) | The web-form channel (`/farmer/offer`) is what's built — the brief's own recommended first step | Add a WhatsApp send call inside `lib/notifications/notify.ts`'s farmer-directed cases once Meta business verification is done |
| Scheduled reminders ("nudge farmer after X hours") | Manual "Send Reminder" button per farmer on the purchase request detail page | Needs a real scheduler (e.g. Vercel Cron) calling a new endpoint that finds stale `sentTo` entries and calls the same reminder logic |

## Environment variables

See `.env.local.example` for the full list with comments. Required:
`MONGODB_URI`, `AUTH_SECRET` (generate with `openssl rand -base64 32`),
`ADMIN_PHONES`.

## Notes on the stock/order-atomicity design

Local dev here runs MongoDB as a standalone instance (not a replica set),
so multi-document transactions aren't available locally. `createOrder()` in
`lib/queries/orders.ts` gets correctness without one: it first atomically
claims the order via the unique index on `orderRef` (so a duplicate/retried
request never touches stock twice), then decrements each item's stock with
an atomic, per-document guarded update, rolling back and deleting the claimed
order if stock runs out partway through a multi-item order. This was
verified under real concurrent load (10 simultaneous requests against a
variant with 6 units in stock → exactly 6 succeeded, 4 correctly rejected,
no overselling, no cross-variant corruption).

On MongoDB Atlas — always a replica set — the same claim-then-decrement
sequence can optionally be wrapped in a `mongoose.startSession()`
transaction for full multi-document atomicity, if desired.

## Raw stock vs. sellable stock

`Product.variants[].stock` (packaged, sellable units — a 500ml bottle, a
5kg bag) and `Product.rawStock` (unpressed/unpackaged material on hand,
e.g. quintals of raw groundnut) are deliberately separate fields with
different units and magnitudes. Goods Receipts from farmers only ever
increase `rawStock`; turning raw material into packaged variant stock (the
actual pressing/packing step) is a manual admin edit on the product's pack
sizes, same as before — this app doesn't model that conversion.

## Known non-issues

- `next dev`/`next build` print a deprecation warning for `middleware.ts`
  (Next 16 prefers `proxy.ts`). Kept as `middleware.ts` because next-intl's
  documented App Router integration targets it; it still works. Safe to
  ignore.
