import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Browser Supabase client, used only to subscribe to counter changes.
 *
 * Carries the publishable (anon) key, so it can read content_stats and nothing
 * else — every mutation still goes through the Elysia API, where the dedupe
 * and per-visitor like cap are enforced. Returns null when the key is absent
 * so the page degrades to non-live counters rather than erroring.
 */
let client: SupabaseClient | null | undefined;

export function getBrowserDb(): SupabaseClient | null {
  if (client !== undefined) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    client = null;
    return client;
  }

  client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    // A portfolio does not need a high-frequency stream, and this caps the
    // damage if something ever starts hammering the counters.
    realtime: { params: { eventsPerSecond: 5 } },
  });
  return client;
}
