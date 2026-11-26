import { useMemo, useSyncExternalStore } from "react";
import { emptyFilters, type LibraryFilters } from "./libraryFilters";

function createFilterStore(library: string) {
  const key = `library.filters.${library}`;
  let current: LibraryFilters | undefined;
  const listeners = new Set<() => void>();
  return {
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    },
    read() {
      if (current) return current;
      current = { ...emptyFilters };
      try {
        const saved = new URLSearchParams(sessionStorage.getItem(key) ?? "");
        for (const field of Object.keys(emptyFilters) as (keyof LibraryFilters)[]) {
          const value = saved.get(field);
          if (value) current[field] = value;
        }
      } catch { /* Storage can be unavailable in private browsing. */ }
      return current;
    },
    write(filters: LibraryFilters) {
      current = filters;
      const params = new URLSearchParams();
      for (const [field, value] of Object.entries(filters)) {
        if (value) params.set(field, value);
      }
      try {
        if (params.size) sessionStorage.setItem(key, params.toString());
        else sessionStorage.removeItem(key);
      } catch { /* The controls still work in memory. */ }
      listeners.forEach((listener) => listener());
    },
  };
}

const serverSnapshot = () => null;

export function useLibraryFilters(library: string) {
  const store = useMemo(() => createFilterStore(library), [library]);
  const filters = useSyncExternalStore(store.subscribe, store.read, serverSnapshot);
  return { filters, setFilters: store.write };
}
