import { NextResponse, type NextRequest } from "next/server";

import { getServerClient } from "@/lib/supabase/server";

/** Exchanges the OAuth code GitHub redirects back with for a session cookie. */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  // Where to land afterwards. Relative-only, so an attacker can't craft a
  // callback link that bounces the user off-site with a fresh session.
  const next = searchParams.get("next");
  const redirectTo =
    next && next.startsWith("/") && !next.startsWith("//") ? next : "/";

  if (!code) {
    return NextResponse.redirect(`${origin}${redirectTo}?auth=missing_code`);
  }

  const supabase = await getServerClient();
  if (!supabase) {
    return NextResponse.redirect(`${origin}${redirectTo}?auth=unconfigured`);
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(`${origin}${redirectTo}?auth=failed`);
  }

  return NextResponse.redirect(`${origin}${redirectTo}`);
}
