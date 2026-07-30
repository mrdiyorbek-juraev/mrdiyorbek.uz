import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * The single Supabase client for the browser.
 *
 * Deliberately one client, not two: it carries the signed-in session *and*
 * serves the realtime subscriptions. Creating a separate anon client for
 * realtime would open a second websocket and leave that socket unaware of the
 * user's JWT, so RLS-filtered subscriptions would silently see nothing.
 *
 * Returns null when the project isn't configured, so pages degrade to
 * non-live, read-only rather than throwing.
 */
let client: SupabaseClient | null | undefined;

export function getBrowserClient(): SupabaseClient | null {
  if (client !== undefined) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    client = null;
    return client;
  }

  client = createBrowserClient(url, key, {
    // A portfolio needs no high-frequency stream, and this bounds the damage
    // if anything ever starts hammering a channel.
    realtime: { params: { eventsPerSecond: 5 } },
  });
  return client;
}
