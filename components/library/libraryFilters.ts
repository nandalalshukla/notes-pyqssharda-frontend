export interface LibraryItem {
  subject: string;
  code: string;
  credits: number;
  semester: number;
  year: string;
  src: string | string[];
  /**
   * The degree this paper belongs to. Optional because the hand-curated
   * static lists this page was built on were all one programme, and pass
   * `programLabel` for the whole page instead. Database-backed items carry
   * their own, and it takes precedence wherever it's set.
   */
  program?: string;
  /**
   * An internal page for this item. When set, the card links here instead
   * of straight to the file — so a reader lands on a page on this site
   * rather than being handed off to a raw Cloudinary URL.
   */
  href?: string;
}

/** The filter state the page can be in, and what a server source is asked for. */
export interface LibraryQuery {
  query: string;
  program: string | null;
  courseCode: string;
  year: string | null;
  semester: string | null;
  page: number;
}

export type LibraryFilters = Omit<LibraryQuery, "page">;

export const emptyFilters: LibraryFilters = {
  query: "", program: null, courseCode: "", year: null, semester: null,
};

function normalizeSearchText(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

function isCloseSearchWord(queryWord: string, valueWord: string): boolean {
  if (queryWord.length === 1) return valueWord === queryWord;
  if (valueWord.includes(queryWord)) return true;
  if (!/^[a-z]{5,24}$/.test(queryWord) || Math.abs(queryWord.length - valueWord.length) > 1) return false;

  // One edit (insertion, deletion, or substitution) handles common typing
  // mistakes without turning short words into noisy matches.
  let queryIndex = 0;
  let valueIndex = 0;
  let edits = 0;
  while (queryIndex < queryWord.length && valueIndex < valueWord.length) {
    if (queryWord[queryIndex] === valueWord[valueIndex]) {
      queryIndex += 1;
      valueIndex += 1;
      continue;
    }
    edits += 1;
    if (edits > 1) return false;
    if (queryWord.length > valueWord.length) queryIndex += 1;
    else if (valueWord.length > queryWord.length) valueIndex += 1;
    else {
      queryIndex += 1;
      valueIndex += 1;
    }
  }
  return edits + (queryIndex < queryWord.length || valueIndex < valueWord.length ? 1 : 0) <= 1;
}

export function matchesLibraryFilters(item: LibraryItem, filters: LibraryFilters, programLabel: string): boolean {
  const { program, semester, year, courseCode, query } = filters;
  if (program && (item.program ?? programLabel) !== program) return false;
  if (semester && String(item.semester) !== semester) return false;
  if (year && item.year !== year) return false;

  const code = item.code.replace(/[\s-]/g, "").toLowerCase();
  const codePrefix = courseCode.trim().replace(/[\s-]/g, "").toLowerCase();
  if (codePrefix && !(/^[a-z]+\d*$/.test(codePrefix) ? code.startsWith(codePrefix) : code.includes(codePrefix))) {
    return false;
  }

  const text = query.trim();
  if (!text) return true;
  const words = normalizeSearchText(text).split(" ");
  if (!words[0]) return [item.subject, item.code].some((value) => value.includes(text));
  const candidates = normalizeSearchText(item.subject).split(" ");
  const codeWords = normalizeSearchText(item.code).split(" ");
  return words.every((word) =>
    candidates.some((candidate) => isCloseSearchWord(word, candidate)) ||
    (/^[a-z]+\d+$/.test(word) ? code.startsWith(word) : codeWords.some((part) => part.includes(word))),
  );
}
