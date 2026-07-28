This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Engagement backend (views & likes)

Views and likes live in Supabase Postgres behind an [ElysiaJS](https://elysiajs.com)
API mounted inside Next at `src/app/api/[[...slugs]]/route.ts`. Read time is not
part of this — it is derived from the MDX at build time by `reading-time`.

### Setup

1. Copy `.env.example` to `.env.local` and fill in the three values (the
   service-role key comes from Supabase → Settings → API Keys).
2. Run `supabase/migrations/0001_engagement.sql` in the Supabase SQL editor.

### How it works

| Layer | File | Notes |
| --- | --- | --- |
| Schema | `supabase/migrations/0001_engagement.sql` | Two ledgers + a counter cache. RLS on, zero policies — reachable only via the service role. |
| Service | `src/server/stats.ts` | Reads fail soft to zeros; mutations throw. |
| API | `src/server/api.ts` | Elysia, TypeBox-validated, slugs checked against real content. |
| Client | `src/lib/api.ts`, `src/hooks/use-content-stats.ts` | Eden Treaty, optimistic + debounced likes. |

Views are deduped per visitor per 24h and likes are capped at 5 per visitor per
post — both enforced by database constraints rather than application code, so
there is no separate rate limiter to keep in sync. Visitors are identified by a
salted hash of IP + user-agent; **no raw IP is ever stored**.

List pages (`/`, `/blog`, `/shorts`) call `getStatsMap()` directly in the server
component under `revalidate = 300` — a statically generated page has no server
of its own to fetch from at build time. Only the browser talks to Elysia.

If the counters ever drift, `select reconcile_stats();` rebuilds them from the
ledgers, which are the source of truth.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
