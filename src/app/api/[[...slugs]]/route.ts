import { api } from "@/server/api";

// Wrapped rather than exported directly so `this` stays bound to the instance.
const handle = (request: Request) => api.handle(request);

export const GET = handle;
export const POST = handle;

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Run beside the database instead of wherever Vercel defaults to.
 *
 * Measured before this: x-vercel-id reported `hkg1::iad1`, so a request from
 * Central Asia was hopping Hong Kong edge → Virginia function → Sydney
 * Postgres → back, about 760ms of round trips to reach a database ~190ms away.
 * Pinning the function next to Postgres removes the trans-Pacific leg.
 *
 * Keep this in sync with the Supabase project's region — if the database moves,
 * this must move with it or it makes things worse, not better.
 */
export const preferredRegion = "syd1";
