import { createHash } from "node:crypto";

/**
 * Pseudonymous per-visitor identifier.
 *
 * The raw IP is never stored or logged — only a salted hash of it, which is why
 * this needs no cookie and no consent banner. Rotating VISITOR_SALT resets
 * everyone's dedupe window and like allowance, so treat it as permanent.
 */
export function visitorHash(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip =
    forwarded?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  const ua = request.headers.get("user-agent") ?? "unknown";
  const salt = process.env.VISITOR_SALT ?? "dev-salt";

  return createHash("sha256")
    .update(`${ip}\n${ua}\n${salt}`)
    .digest("base64url")
    .slice(0, 32);
}
