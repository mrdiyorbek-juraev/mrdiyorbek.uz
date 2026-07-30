"use client";

import * as React from "react";

const subscribe = () => () => {};

/**
 * False during SSR and the hydration pass, true afterwards.
 *
 * For values that legitimately differ between server and client — a relative
 * timestamp computed from Date.now(), say. Rendering those directly causes a
 * hydration mismatch; computing them in an effect means a synchronous setState
 * in the effect body, which React now warns about. useSyncExternalStore covers
 * both: the server snapshot is false, the client snapshot is true, and React
 * re-renders after hydration without any state of our own.
 */
export function useIsHydrated(): boolean {
  return React.useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
