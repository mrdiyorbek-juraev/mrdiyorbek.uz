import { NextResponse, type NextRequest } from "next/server";

import { getServerClient } from "@/lib/supabase/server";

/**
 * POST only. A sign-out reachable by GET can be triggered by any image tag or
 * prefetch pointed at it, which logs people out at random.
 */
export async function POST(request: NextRequest) {
  const supabase = await getServerClient();
  if (supabase) await supabase.auth.signOut();

  const referer = request.headers.get("referer");
  const back = referer?.startsWith(new URL(request.url).origin)
    ? referer
    : new URL("/", request.url).toString();

  return NextResponse.redirect(back, { status: 303 });
}
