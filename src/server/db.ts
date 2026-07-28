import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client, server-only.
 *
 * PostgREST is plain HTTP, so there is no connection pool to keep alive across
 * serverless invocations — the usual Postgres-in-serverless footgun does not
 * apply. The atomicity we need lives in the SQL functions this calls.
 *
 * Returns null when credentials are absent so read paths can degrade to zeros
 * instead of breaking the build.
 */
let client: SupabaseClient | null | undefined;

export function getDb(): SupabaseClient | null {
  if (client !== undefined) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.warn(
      "[db] NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing — engagement counters disabled.",
    );
    client = null;
    return client;
  }

  client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}
