import { z } from "zod";

/**
 * Syllabus Upload Schema
 */
export const syllabusSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must not exceed 100 characters"),
  program: z
    .string()
    .trim()
    .min(2, "Program must be at least 2 characters")
    .max(100, "Program must not exceed 100 characters"),
  courseCode: z
    .string()
    .trim()
    .min(2, "Course code must be at least 2 characters")
    .max(20, "Course code must not exceed 20 characters")
    .regex(/^[A-Z0-9]+$/, "Course code must be alphanumeric"),
  courseName: z
    .string()
    .trim()
    .min(2, "Course name must be at least 2 characters")
    .max(100, "Course name must not exceed 100 characters"),
  semester: z.coerce
    .number()
    .int("Semester must be a whole number")
    .min(1, "Semester must be at least 1")
    .max(12, "Semester must not exceed 12"),
  file: z.instanceof(File).refine((file) => file instanceof File, {
    message: "File is required",
  }),
});

export type SyllabusInput = z.infer<typeof syllabusSchema>;

/**
 * Syllabus Update Schema
 */
export const updateSyllabusSchema = syllabusSchema
  .omit({ file: true })
  .partial();

export type UpdateSyllabusInput = z.infer<typeof updateSyllabusSchema>;

/**
 * Syllabus Query Schema
 */
export const syllabusQuerySchema = z.object({
  program: z.string().optional(),
  courseCode: z.string().optional(),
  semester: z.string().optional(),
  status: z.enum(["pending", "approved", "rejected"]).optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

export type SyllabusQueryInput = z.infer<typeof syllabusQuerySchema>;
