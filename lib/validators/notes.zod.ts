import { z } from "zod";

/**
 * Notes Upload Schema
 */
export const notesSchema = z.object({
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

export type NotesInput = z.infer<typeof notesSchema>;

/**
 * Notes Update Schema
 */
export const updateNotesSchema = notesSchema.omit({ file: true }).partial();

export type UpdateNotesInput = z.infer<typeof updateNotesSchema>;

/**
 * Notes Query Schema
 */
export const notesQuerySchema = z.object({
  program: z.string().optional(),
  courseCode: z.string().optional(),
  semester: z.string().optional(),
  status: z.enum(["pending", "approved", "rejected"]).optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

export type NotesQueryInput = z.infer<typeof notesQuerySchema>;
