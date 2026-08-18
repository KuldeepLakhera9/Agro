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

- Full customer flow: browse → product detail (variants, pincode delivery
  check) → cart → checkout (OTP login → address → delivery method → COD) →
  order confirmation → order tracking (`/orders/[id]`) → account/order
  history
- Admin dashboard: order list/filter/status updates, product CRUD
  (multi-locale name/description, per-variant price & stock), delivery zone
  management, sales summary (today/week/month + top products)
- Stock is decremented with an atomic, race-safe guard (`$elemMatch` +
  positional update) so two simultaneous checkouts can never oversell a
  variant — see `lib/queries/orders.ts` for the reasoning
- Orders are idempotent: a client-generated `orderRef` (UUID) is unique-
  indexed, so a retried/duplicate submit never creates two orders
- Checkout is gated by serviceable pincode (`DeliveryZone` collection),
  never a silently broken cart

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

## Known non-issues

- `next dev`/`next build` print a deprecation warning for `middleware.ts`
  (Next 16 prefers `proxy.ts`). Kept as `middleware.ts` because next-intl's
  documented App Router integration targets it; it still works. Safe to
  ignore.
