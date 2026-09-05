# AURELIA Coffee House

A single-page marketing and ordering site for AURELIA, a fictional neighborhood coffee house. Built with Next.js 16, React 19, and Tailwind CSS v4.

Premium specialty coffee, seasonal plates, and quiet moments in the heart of the city.

**Live demo:** [aurelia-coffee-house-mu.vercel.app](https://aurelia-coffee-house-mu.vercel.app)

## Features

- **Hero + story sections** — full-bleed imagery, serif display type, and an editorial layout.
- **Filterable menu** — category tabs (Coffee, Tea, Breakfast, Bakery, Desserts) plus live text search.
- **Cart drawer** — add items from any product card, view a running subtotal, and open a slide-in bag.
- **Favorites** — heart any product to mark it as a favorite.
- **Reservation form** — name, email, date, time, party size, and an optional special request.
- **Newsletter signup** and a gallery grid with a customer quote.
- **Responsive** across mobile and desktop, with a collapsible mobile nav.

All state is client-side and in-memory; there is no backend, database, or payment integration. The cart, reservation, and newsletter forms confirm optimistically and do not persist.

## Tech stack

| Concern | Choice |
| --- | --- |
| Framework | [Next.js](https://nextjs.org) 16 (App Router, React Server Components) |
| UI | React 19 |
| Styling | Tailwind CSS v4 (CSS-first config in `app/globals.css`) |
| Components | [shadcn/ui](https://ui.shadcn.com) (`base-nova` style) on Base UI |
| Icons | [lucide-react](https://lucide.dev) |
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

## Project structure

```
app/
  layout.tsx      Root layout: metadata, favicons, viewport, Analytics
  page.tsx        The entire single-page site (client component)
  globals.css     Tailwind v4 theme, design tokens, custom utilities
components/
  ui/button.tsx   shadcn/ui button
lib/
  utils.ts        `cn()` class-merging helper
public/
  images/         Hero, coffee, pastry, brunch, and gallery photography
  icon*.png/svg   Light, dark, and Apple touch icons
components.json   shadcn/ui configuration
```

## Customizing

### Menu items

Products and categories live at the top of `app/page.tsx`:

```ts
const products = [
  { name: 'Signature Espresso', category: 'Coffee', price: 4.5, description: '…', image: images.espresso, tag: 'House classic' },
  // …
]
const categories = ['All', 'Coffee', 'Tea', 'Breakfast', 'Bakery', 'Desserts']
```

Add an entry to `products` and it appears in both the "daily edit" grid and the full menu. Categories with no matching products render an empty-state message.

### Theme

Colors, radii, and fonts are defined as CSS custom properties in `app/globals.css` under `@theme inline` and `:root`. The site uses `Crimson Text` for display type and `Inter` for body copy, both loaded from Google Fonts. Reusable utilities — `.eyebrow`, `.section-title`, `.field-label`, `.field-input` — are declared in the same file.

### Images

Swap the files in `public/images/` or point the `images` map in `app/page.tsx` at different paths. Next.js image optimization is disabled (`images.unoptimized` in `next.config.mjs`), so plain `<img>` tags are used throughout.

## Notes

- `next.config.mjs` sets `typescript.ignoreBuildErrors: true`, so type errors will not fail a build. Run `pnpm exec tsc --noEmit` to check types explicitly.
- Contact details, hours, and the address in the footer are placeholder content.

## Deploying

Live at **https://aurelia-coffee-house-mu.vercel.app**, deployed on [Vercel](https://vercel.com) with no additional configuration. Any host that supports a Node.js Next.js server also works with `pnpm build && pnpm start`.
