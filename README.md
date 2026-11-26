# Rail clothing store

A Next.js 15 clothing store with bank-deposit-only payments: catalog, bag, checkout, order tracking with bank-slip upload, an admin panel, and transactional emails.

## Run it

```bash
export PATH="$HOME/.local/node/bin:$PATH"   # Linux Node 22 (needed for node:sqlite)
npm install
npm run dev
```

- Store: http://localhost:3000
- Admin: http://localhost:3000/admin (password is `ADMIN_PASSWORD` in `.env.local`)

The SQLite database is created and seeded with 10 products on first run, in `data/store.db`. Uploaded slips go to `data/slips/`. Without SMTP settings, emails are saved to `data/outbox/`. The whole `data/` folder is git-ignored; back it up in production.

## Before going live

1. **Bank accounts, contact details, delivery fee**: edit `lib/config.ts`.
2. **`.env.local`**: copy `.env.example`, then set `SITE_URL` (your real domain, used in email links), a strong `ADMIN_PASSWORD`, `SESSION_SECRET` (`openssl rand -hex 32`), `ADMIN_EMAIL`, and SMTP details.
3. **Products**: prices, stock and visibility are editable in Admin → Products. To add new products, extend `lib/seed.ts` (it only runs on an empty database) or insert rows into `products` / `product_stock`.

## How an order flows

| Step | Who | Status | Email |
|---|---|---|---|
| Checkout | Customer | Awaiting payment (stock reserved) | Bank details to customer, "new order" to admin |
| Upload slip | Customer | Verifying payment | "Slip received" to customer, "slip to verify" to admin |
| Confirm / reject | Admin | Payment confirmed / back to awaiting | Confirmed, or "couldn't verify" with your reason |
| Pack | Admin | Packing | none |
| Ship | Admin | Shipped (courier + tracking) | Tracking details |
| Deliver | Admin | Delivered | Delivered |
| Cancel | Admin, or automatically after 48 h unpaid | Cancelled (stock returned) | Cancellation with reason |

Admins can also send a payment reminder, resend the order email, and add internal notes. Templates live in `lib/mail/templates.ts` and can be previewed in Admin → Email templates.

## Code map

- `app/(store)/`: storefront pages and server actions (`actions.ts`)
- `app/admin/`: admin pages, actions, slip and email-preview routes
- `lib/orders.ts`: order lifecycle (every status change runs in a transaction)
- `lib/products.ts`, `lib/db.ts`, `lib/seed.ts`: catalog and database
- `lib/mail/`: email templates, sender, sample data
- `lib/notifications.ts`: which email goes out at each step, plus auto-expiry

## Test

```bash
npm run test:flow
```

This runs the whole order lifecycle against a throwaway database in `/tmp`.
# clothstore-ecommerce
# clothstore-ecommerce
"# clothstore-ecommerce" 
