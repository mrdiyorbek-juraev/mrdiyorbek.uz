import { treaty } from "@elysiajs/eden";

import type { Api } from "@/server/api";

/**
 * Typed client for the Elysia API. `Api` is a type-only import, so nothing from
 * the server bundle crosses into the browser — the route shapes come along, the
 * code does not.
 */
export const api = treaty<Api>(
  typeof window === "undefined" ? "http://localhost:3000" : window.location.origin,
).api;

export type ContentKind = "blog" | "short";

export type StatsWithViewer = {
  views: number;
  likes: number;
  yourLikes: number;
};

export const MAX_LIKES_PER_VISITOR = 5;
