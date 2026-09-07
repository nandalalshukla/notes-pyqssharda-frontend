"use client";

import { useEffect, useState } from "react";

/**
 * Returns `value` only once it has stopped changing for `delay` ms.
 *
 * Use it to separate what the user is *typing* from what the app should
 * *act on*. The input itself stays bound to the raw state so it never feels
 * laggy; only the expensive follow-on work — a network request, or
 * re-filtering a large list — waits for the typing to settle.
 *
 * Not worth it for small in-memory lists: filtering a few dozen rows is
 * already instant, and delaying it would only add lag.
 *
 * ```ts
 * const [search, setSearch] = useState("");
 * const debouncedSearch = useDebouncedValue(search, 300);
 * // <input value={search} onChange={...} />  — updates every keystroke
 * // useEffect(() => fetch(debouncedSearch), [debouncedSearch]);
 * ```
 */
export function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    // Clearing on every change is what makes this a debounce rather than a
    // throttle: the timer restarts while the user is still typing, so the
    // work runs once at the end instead of once per pause.
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
}

export default useDebouncedValue;
