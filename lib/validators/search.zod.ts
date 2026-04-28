import { z } from "zod";

/**
 * Search Query Schema
 */
export const searchSchema = z.object({
  query: z
    .string()
    .trim()
    .min(1, "Search query is required")
    .max(100, "Search query must not exceed 100 characters"),
  resourceType: z
    .enum(["notes", "pyqs", "syllabus", "all"])
    .optional()
    .default("all"),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
});

export type SearchInput = z.infer<typeof searchSchema>;
