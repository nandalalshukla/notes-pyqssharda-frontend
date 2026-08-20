"use client";

import { useEffect, type RefObject } from "react";

type ClickOutsideRef<T extends HTMLElement> = RefObject<T | null>;

/**
 * Calls `handler` when a mousedown happens outside every ref in `refs`.
 * Accepts a single ref or an array (e.g. a dropdown panel + its trigger
 * button) so clicking the trigger doesn't count as "outside".
 */
export function useOnClickOutside<T extends HTMLElement = HTMLElement>(
  refs: ClickOutsideRef<T> | ClickOutsideRef<T>[],
  handler: () => void,
  enabled = true,
): void {
  useEffect(() => {
    if (!enabled) return;

    const refList = Array.isArray(refs) ? refs : [refs];

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const clickedInside = refList.some(
        (ref) => ref.current && ref.current.contains(target),
      );
      if (!clickedInside) {
        handler();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
    // refs are stable ref objects across renders; only enabled/handler matter
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, handler]);
}
