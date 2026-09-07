/**
 * Every degree programme a resource can be filed under.
 *
 * This replaces the short hand-written list (Computer Science, Law,
 * Business, ...) that each upload form used to carry its own copy of. That
 * list predated the bulk import of the university's own question-paper
 * repository, and could not express most of what came back: the repository
 * covers roughly fifty undergraduate programmes across nine schools, and
 * over half of them — every BA subject, nursing, optometry, physiotherapy,
 * the allied-health diplomas — had no bucket to go in at all.
 *
 * Kept in sync with the importer's classifier, which derives a programme
 * from each paper's course-code prefix:
 * `notesandpyqssharda-backend/scripts/pyq-import/classify.ts`.
 * If you add a programme there, add it here too.
 */
export const PROGRAMS = [
  // Engineering
  "B.Tech CSE",
  "B.Tech Civil",
  "B.Tech ECE",
  "B.Tech EEE",
  "B.Tech Mechanical",
  "B.Tech + MBA (Integrated)",
  "B.Tech (Other)",

  // Computing
  "BCA",
  "B.Sc Computer Science",
  "B.Sc Data Analytics",

  // Basic sciences
  "B.Sc Biochemistry",
  "B.Sc Biotechnology",
  "B.Sc Chemistry",
  "B.Sc Mathematics",
  "B.Sc Microbiology",
  "B.Sc Physics",
  "B.Sc Zoology",
  "B.Sc (Hons)",

  // Agriculture & food
  "B.Sc Agriculture",
  "B.Sc Food Technology",
  "B.Sc Nutrition & Dietetics",

  // Medical, dental & nursing
  "MBBS",
  "BDS",
  "B.Sc Nursing",
  "Post Basic B.Sc Nursing",

  // Allied health
  "BPT (Physiotherapy)",
  "B.Optometry",
  "B.Sc Cardiac Technology",
  "B.Sc Clinical Psychology",
  "B.Sc Dialysis Technology",
  "B.Sc Forensic Science",
  "B.Sc Medical Lab Technology",
  "B.Sc Radiology & Imaging",
  "B.Sc Yoga",
  "Diploma Cardiology",
  "Allied Health (Other)",

  // Pharmacy
  "B.Pharm",
  "B.Sc Pharmaceutical Sciences",

  // Law
  "BA LLB",
  "BBA LLB",

  // Humanities & social sciences
  "BA English",
  "BA Economics",
  "BA Geography",
  "BA History",
  "BA Political Science",
  "BA Psychology",
  "BA Sociology",
  "BA (Hons)",

  // Education
  "B.Ed",

  // Courses taught centrally and sat by several programmes
  "Common / Open Elective",
] as const;

export type Program = (typeof PROGRAMS)[number];

/** Mutable copy, for props typed as `string[]`. */
export const PROGRAM_OPTIONS: string[] = [...PROGRAMS];
