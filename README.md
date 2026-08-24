# Actuate — Gaming Gear Storefront

Next.js 14 (App Router) + TypeScript + Tailwind frontend for the
Microservices E-Commerce System. Talks directly to all four backend
services (Product, Pricing, Inventory, Order) from the client/server
components - no BFF layer, kept simple for a portfolio project.

## Design

- **Palette**: deep graphite base, dual violet + cyan accent (nods to RGB peripheral lighting)
- **Type**: Space Grotesk (display) + Inter (body)
- **Signature element**: "keycap" surfaces — product cards and panels have a subtle
  bevel and light up with a violet→cyan glow on hover, like a mechanical switch actuating
- Components follow shadcn/ui conventions (`cn()` helper, `cva` variants, Radix-style structure)
  so they're easy to extend later with real shadcn CLI components if you add more.

## Setup

```bash
npm install
cp .env.local.example .env.local   # adjust ports if your services run elsewhere
npm run dev
```

Runs on **http://localhost:3000**.

## Requirements

All four backend services must be running:
- Product Service — :8081
- Inventory Service — :8082
- Pricing Service — :8083
- Order Service — :8084

If a service isn't reachable, the storefront degrades gracefully (empty
product list, "price unavailable" labels, etc.) instead of crashing —
but you'll obviously want them all up to actually browse and checkout.

## Structure

```
src/
  app/                  # pages (home, products/[id], cart, checkout)
  components/
    ui/                 # shadcn-style primitives (button, card, badge, input...)
    navbar.tsx, product-card.tsx, category-filter.tsx, add-to-cart.tsx
  context/cart-context.tsx   # cart state, persisted to localStorage
  lib/
    api.ts              # fetch wrappers for all 4 backend services
    config.ts           # service base URLs (env-overridable)
    utils.ts            # cn() helper + PHP currency formatter
  types/index.ts         # shared TypeScript types
```

## Known simplifications (portfolio scope)

- Cart lives in localStorage, not a backend cart service
- No auth/login — checkout just asks for name + email
- Product ↔ Price merge happens client-side (N+1 fetches) — fine at demo scale,
  would move to a BFF/aggregator endpoint in a larger system
- No image upload — `imageUrl` on a product is just a link you provide when creating it
