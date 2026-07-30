import { Elysia, t, status } from "elysia";

import { contentExists } from "@/server/content";
import {
  MAX_LIKES_PER_VISITOR,
  addLikes,
  getStats,
  getStatsMap,
  recordView,
  type ContentKind,
} from "@/server/stats";
import {
  VISITOR_COOKIE,
  VISITOR_COOKIE_MAX_AGE,
  resolveVisitor,
} from "@/server/visitor";

const kindParam = t.UnionEnum(["blog", "short"]);
const slugParam = t.String({ pattern: "^[a-z0-9][a-z0-9-]{0,119}$" });

const contentParams = t.Object({ kind: kindParam, slug: slugParam });

/**
 * No rate limiter here on purpose: the schema is the limiter. Views collide on
 * a (content, visitor, day) primary key and likes are capped by a check
 * constraint, so a flood costs one no-op query and moves no counter.
 */
export const api = new Elysia({ prefix: "/api" })
  .onError(({ code, error }) => {
    if (code === "VALIDATION" || code === "NOT_FOUND" || code === "PARSE") {
      // Elysia already produced a well-formed response for these.
      return;
    }
    console.error("[api]", code, error);
    return status(503, { error: "Engagement store unavailable" });
  })
  // Identity is pinned in a cookie on first contact so it survives browser
  // updates and network changes; without that the 5-like cap silently resets
  // every time a User-Agent or IP changes.
  .derive(({ request, cookie }) => {
    // Untyped without a cookie schema; resolveVisitor validates the shape, so
    // an arbitrary string can't reach the database as a key.
    const sent = cookie[VISITOR_COOKIE]?.value as string | undefined;
    const { id, pin } = resolveVisitor(request, sent);

    if (pin) {
      cookie[VISITOR_COOKIE].set({
        value: id,
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: VISITOR_COOKIE_MAX_AGE,
      });
    }

    return { visitor: id };
  })

  .get("/health", () => ({ ok: true }))

  /** Bulk counters for one content kind, keyed by slug. */
  .get(
    "/content/:kind",
    async ({ params: { kind } }) => {
      const stats = await getStatsMap(kind as ContentKind);
      return Object.fromEntries(stats);
    },
    { params: t.Object({ kind: kindParam }) },
  )

  .get(
    "/content/:kind/:slug",
    async ({ params: { kind, slug }, visitor }) => {
      if (!contentExists(kind as ContentKind, slug)) {
        return status(404, { error: "Unknown content" });
      }
      return getStats(kind as ContentKind, slug, visitor);
    },
    { params: contentParams },
  )

  .post(
    "/content/:kind/:slug/view",
    async ({ params: { kind, slug }, visitor }) => {
      if (!contentExists(kind as ContentKind, slug)) {
        return status(404, { error: "Unknown content" });
      }
      return recordView(kind as ContentKind, slug, visitor);
    },
    { params: contentParams },
  )

  .post(
    "/content/:kind/:slug/like",
    async ({ params: { kind, slug }, body, visitor }) => {
      if (!contentExists(kind as ContentKind, slug)) {
        return status(404, { error: "Unknown content" });
      }
      return addLikes(kind as ContentKind, slug, visitor, body.delta);
    },
    {
      params: contentParams,
      body: t.Object({
        delta: t.Integer({ minimum: 1, maximum: MAX_LIKES_PER_VISITOR }),
      }),
    },
  );

export type Api = typeof api;
