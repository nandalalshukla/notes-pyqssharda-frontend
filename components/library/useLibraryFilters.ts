import { useMemo, useSyncExternalStore } from "react";
import { useSearchParams } from "next/navigation";
import { readLibraryFilters, withLibraryFilters } from "./libraryFilterUrl";
import type { LibraryFilters } from "./libraryFilters";

const filterChange = "library-filter-change";

function subscribe(notify: () => void) {
  window.addEventListener(filterChange, notify);
  window.addEventListener("popstate", notify);
  return () => {
    window.removeEventListener(filterChange, notify);
    window.removeEventListener("popstate", notify);
  };
}

function writeFilters(filters: LibraryFilters) {
  const { pathname, search, hash } = window.location;
  const href = withLibraryFilters(pathname + search + hash, filters);
  if (href !== pathname + search + hash) {
    window.history.replaceState(null, "", href);
    window.dispatchEvent(new Event(filterChange));
  }
}

export function useLibraryFilters() {
  const route = useSearchParams();
  // The router supplies the request URL for SSR and invalidates the snapshot
  // on Link navigation. Native history edits update controlled inputs immediately.
  const search = useSyncExternalStore(subscribe, () => window.location.search.slice(1), () => route.toString());
  const filters = useMemo(() => readLibraryFilters(new URLSearchParams(search)), [search]);
  return { filters, setFilters: writeFilters };
}
