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
import { visitorHash } from "@/server/visitor";

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
  .derive(({ request }) => ({ visitor: visitorHash(request) }))

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
