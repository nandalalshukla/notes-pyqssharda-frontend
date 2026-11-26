import type { LibraryFilters } from "./libraryFilters";

export type PageSearchParams = Record<string, string | string[] | undefined>;

const keys = {
  query: "q",
  program: "program",
  courseCode: "code",
  year: "year",
  semester: "semester",
} as const satisfies Record<keyof LibraryFilters, string>;

export function readLibraryFilters(params: URLSearchParams | PageSearchParams): LibraryFilters {
  function read(key: keyof LibraryFilters) {
    const name = keys[key];
    const raw = params instanceof URLSearchParams ? params.get(name) : params[name];
    const value = (Array.isArray(raw) ? raw[0] : raw) ?? "";
    return key === "query" || key === "courseCode" ? value.slice(0, 100) : value.trim();
  }

  const semester = read("semester");
  return {
    query: read("query"),
    program: read("program") || null,
    courseCode: read("courseCode"),
    year: read("year") || null,
    semester: /^[1-9]\d*$/.test(semester) && Number.isSafeInteger(Number(semester)) ? semester : null,
  };
}

/** Add or remove just the library filters on an internal list or viewer URL. */
export function withLibraryFilters(href: string, filters: LibraryFilters): string {
  const url = new URL(href, "https://sharda.social");
  for (const field of Object.keys(keys) as (keyof LibraryFilters)[]) {
    const value = filters[field];
    if (value) url.searchParams.set(keys[field], value);
    else url.searchParams.delete(keys[field]);
  }
  return url.pathname + url.search + url.hash;
}
