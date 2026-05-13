import { z } from "zod";

/**
 * PYQs Upload Schema
 */
export const pyqsSchema = z.object({
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
  year: z.coerce
    .number()
    .int("Year must be a whole number")
    .min(2000, "Year must be 2000 or later")
    .max(new Date().getFullYear(), "Year cannot be in the future"),
  file: z.instanceof(File).refine((file) => file instanceof File, {
    message: "File is required",
  }),
});

export type PYQsInput = z.infer<typeof pyqsSchema>;

/**
 * PYQs Update Schema
 */
export const updatePYQsSchema = pyqsSchema.omit({ file: true }).partial();

export type UpdatePYQsInput = z.infer<typeof updatePYQsSchema>;

/**
 * PYQs Query Schema
 */
export const pyqsQuerySchema = z.object({
  program: z.string().optional(),
  courseCode: z.string().optional(),
  semester: z.string().optional(),
  year: z.string().optional(),
  status: z.enum(["pending", "approved", "rejected"]).optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

export type PYQsQueryInput = z.infer<typeof pyqsQuerySchema>;
