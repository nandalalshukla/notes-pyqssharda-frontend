import assert from "node:assert/strict";
import test from "node:test";
import { readLibraryFilters, withLibraryFilters } from "../components/library/libraryFilterUrl.ts";

test("shared library URLs round-trip all filters and preserve unrelated parameters and fragments", () => {
  const filters = {
    query: "C++ & cloud/计算",
    program: "B.Tech CS",
    courseCode: "CSE 021",
    year: "2024-25",
    semester: "5",
  };
  const path = withLibraryFilters("/library/pyqs?ref=group#results", filters);
  const { searchParams, hash } = new URL(path, "https://example.org");
  assert.deepEqual(readLibraryFilters(searchParams), filters);
  assert.deepEqual(readLibraryFilters(Object.fromEntries(searchParams)), filters);
  assert.equal(searchParams.get("ref"), "group");
  assert.equal(hash, "#results");
  assert.equal(withLibraryFilters(path, readLibraryFilters({})), "/library/pyqs?ref=group#results");
});

test("clearing a single filter preserves the remaining filters and static file identity", () => {
  const path = "/library/resource?type=notes&src=%2FNotes%2FA%26B.pdf&q=cloud&semester=5";
  const url = new URL(path, "https://example.org");
  const filters = readLibraryFilters(url.searchParams);
  const cleared = new URL(withLibraryFilters(path, { ...filters, semester: null }), url);
  assert.deepEqual(Object.fromEntries(cleared.searchParams), {
    type: "notes", src: "/Notes/A&B.pdf", q: "cloud",
  });
});

test("the browser and viewer interpret repeated, oversized and malformed parameters consistently", () => {
  const query = "a".repeat(150);
  const repeated = new URLSearchParams([["q", query], ["q", "other"], ["semester", "NaN"]]);
  const parsed = readLibraryFilters(repeated);
  assert.deepEqual(parsed, readLibraryFilters({ q: [query, "other"], semester: "NaN" }));
  assert.equal(parsed.query.length, 100);
  assert.equal(parsed.semester, null);
});
