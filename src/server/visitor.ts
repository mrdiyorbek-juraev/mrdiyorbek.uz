import { createHash } from "node:crypto";

export const VISITOR_COOKIE = "vid";

/** Two years. The like allowance is meant to be effectively permanent. */
export const VISITOR_COOKIE_MAX_AGE = 60 * 60 * 24 * 730;

/**
 * Shape of a value this server produces: 32 base64url characters.
 *
 * The cookie is client-supplied and becomes a database key, so it is accepted
 * only in that exact form. That bounds what can be written, and it makes
 * impersonating another visitor mean guessing 32 characters of a salted
 * SHA-256 rather than simply typing their id.
 */
const ID_PATTERN = /^[A-Za-z0-9_-]{32}$/;

/**
 * Fallback identity, derived from the request alone.
 *
 * The raw IP is never stored or logged — only a salted hash. Rotating
 * VISITOR_SALT resets everyone's dedupe window and like allowance, so treat it
 * as permanent.
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

/**
 * Resolve who is asking, preferring a pinned cookie over the derived hash.
 *
 * IP + User-Agent alone is too brittle to hold a like allowance: a browser
 * update rewrites the User-Agent and switching from wifi to mobile data
 * changes the IP, and either one silently hands the reader a fresh five likes.
 * So the first request derives the hash and pins it in a cookie; every request
 * after that uses the cookie and survives both.
 *
 * The pinned value *is* the hash, which means rows already keyed by a hash stay
 * valid — no backfill.
 *
 * Returns `pin: true` when the caller should write the cookie.
 */
export function resolveVisitor(
  request: Request,
  cookieValue?: string,
): { id: string; pin: boolean } {
  const existing = cookieValue?.trim();
  if (existing && ID_PATTERN.test(existing)) {
    return { id: existing, pin: false };
  }
  return { id: visitorHash(request), pin: true };
}
