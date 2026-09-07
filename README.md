# AURELIA Coffee House

A single-page marketing and ordering site for AURELIA, a fictional neighborhood coffee house. Built with Next.js 16, React 19, and Tailwind CSS v4.

Premium specialty coffee, seasonal plates, and quiet moments in the heart of the city.

**Live demo:** [aurelia-coffee-house-mu.vercel.app](https://aurelia-coffee-house-mu.vercel.app)

## Features

- **Hero + story sections** — full-bleed imagery, serif display type, and an editorial layout.
- **Filterable menu** — category tabs (Coffee, Tea, Breakfast, Bakery, Desserts) plus live text search.
- **Cart drawer** — add items from any product card, adjust quantities inline, remove rows, and see a subtotal, tax line, and total. Adding an item already in the bag increments its quantity rather than duplicating the row.
- **Favorites** — heart any product to mark it as a favorite.
- **Persistence** — the cart and favorites survive a page refresh via `localStorage`.
- **Reservation form** — name, email, date, time, party size, and an optional special request, with inline validation.
- **Newsletter signup** and a gallery grid with a customer quote.
- **Responsive** across mobile and desktop, with a collapsible mobile nav.

There is no backend, database, or payment integration. Checkout is a demo confirmation only — no payment is taken. The reservation and newsletter forms submit to [Web3Forms](https://web3forms.com), a third-party form-to-email service, when an access key is configured; without one they fall back to a local-only success state so the demo still works.

## Tech stack

| Concern | Choice |
| --- | --- |
| Framework | [Next.js](https://nextjs.org) 16 (App Router, React Server Components) |
| UI | React 19 |
| Styling | Tailwind CSS v4 (CSS-first config in `app/globals.css`) |
| Components | [shadcn/ui](https://ui.shadcn.com) (`base-nova` style) on Base UI |
| Icons | [lucide-react](https://lucide.dev) |
| Form delivery | [Web3Forms](https://web3forms.com) (optional) |
| Analytics | `@vercel/analytics` (production builds only) |
| Language | TypeScript 5.7 |
| Package manager | pnpm |

## Getting started

Requires Node.js 20+ and [pnpm](https://pnpm.io).

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Start the development server. |
| `pnpm build` | Create a production build. |
| `pnpm start` | Serve the production build (run `pnpm build` first). |
| `pnpm exec tsc --noEmit` | Type-check. Not run by `build` — see [Notes](#notes). |

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_WEB3FORMS_KEY` | No | Web3Forms access key. Without it, forms confirm locally but send nothing. |

To receive real submissions:

1. Get a free access key at [web3forms.com](https://web3forms.com) — enter the email address that should receive submissions and confirm it. No account is needed.
2. For local development, copy `.env.example` to `.env.local` and fill in the key. `.env.local` is gitignored.
3. For production, add the same variable in your Vercel project under **Settings → Environment Variables**.

Restart the dev server after adding the key; environment variables are not hot-reloaded.

> **Note:** `NEXT_PUBLIC_` variables are inlined into the browser bundle **at build time**. Two consequences: the key is publicly visible in the page source (expected for Web3Forms — the key only permits submissions to your own verified inbox), and changing it requires a **redeploy**, not just a save.

## Project structure

```
app/
  layout.tsx      Root layout: metadata, favicons, viewport, Analytics
  page.tsx        The entire single-page site (client component)
  globals.css     Tailwind v4 theme, design tokens, custom utilities
components/
  reveal.tsx      Scroll-triggered reveal wrapper used by each section
  ui/button.tsx   shadcn/ui button
lib/
  utils.ts        `cn()` class-merging helper
public/
  images/         Hero, coffee, pastry, brunch, and gallery photography
  icon*.png/svg   Light, dark, and Apple touch icons
.env.example      Documented environment variables
components.json   shadcn/ui configuration
```

## Customizing

### Menu items

Products and categories live at the top of `app/page.tsx`:

```ts
const products = [
  { name: 'Signature Espresso', category: 'Coffee', price: 4.5, description: '…', image: images.coffee, tag: 'House classic' },
  // …
]
const categories = ['All', 'Coffee', 'Tea', 'Breakfast', 'Bakery', 'Desserts']
```

Add an entry to `products` and it appears in both the "daily edit" grid and the full menu. Categories with no matching products render an empty-state message.

Products have no `id` field — `name` is the identity key for the cart and favorites, so **names must stay unique**.

### Tax rate and hours

`TAX_RATE` (default `0.0875`, shown as a labelled line in the cart) and the reservation window `OPENING_TIME` / `CLOSING_TIME` (`07:00`–`21:00`) are constants near the top of `app/page.tsx`.

### Theme

Colors, radii, and fonts are defined as CSS custom properties in `app/globals.css` under `@theme inline` and `:root`. The site uses `Crimson Text` for display type and `Inter` for body copy, both loaded from Google Fonts. Reusable utilities — `.eyebrow`, `.section-title`, `.field-label`, `.field-input` — are declared in the same file.

### Images

Swap the files in `public/images/` or point the `images` map in `app/page.tsx` at different paths. Next.js image optimization is disabled (`images.unoptimized` in `next.config.mjs`), so plain `<img>` tags are used throughout.

## Persisted state

| Key | Contents |
| --- | --- |
| `aurelia-cart` | `{ name, quantity }[]` — rebuilt against the current product list on load, so edited prices are never stale and removed products drop out. |
| `aurelia-favorites` | `string[]` of product names. |

Reads happen in a mount effect (never during render) and every access is guarded with a `typeof window` check and wrapped in `try/catch`, so malformed JSON or blocked storage cannot break the page.

## Notes

- `next.config.mjs` sets `typescript.ignoreBuildErrors: true`, so type errors will not fail a build. Run `pnpm exec tsc --noEmit` to check types explicitly.
- There is no linter or test suite configured.
- Contact details, hours, and the address in the footer are placeholder content.

## Deploying

Live at **https://aurelia-coffee-house-mu.vercel.app**, deployed on [Vercel](https://vercel.com) with no additional configuration. Any host that supports a Node.js Next.js server also works with `pnpm build && pnpm start`.

Remember to set `NEXT_PUBLIC_WEB3FORMS_KEY` in your host's environment and redeploy if you want the forms to deliver mail.
