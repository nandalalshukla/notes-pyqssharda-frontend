import { z } from "zod";

/**
 * Create Post Schema
 */
export const createPostSchema = z.object({
  content: z
    .string()
    .optional()
    .refine(
      (value) => value === undefined || value.length > 0,
      "Content cannot be empty",
    ),
  files: z.instanceof(FileList).optional(),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;

/**
 * Edit Post Schema
 */
export const editPostSchema = z.object({
  content: z.string().trim().max(2000, "Post content is too long").optional(),
  files: z.instanceof(FileList).optional(),
  removePublicIds: z.array(z.string()).optional(),
});

export type EditPostInput = z.infer<typeof editPostSchema>;

/**
 * Create Comment Schema
 */
export const createCommentSchema = z.object({
  text: z
    .string()
    .trim()
    .min(1, "Comment text is required")
    .max(1000, "Comment must not exceed 1000 characters"),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;

/**
 * Edit Comment Schema
 */
export const editCommentSchema = z.object({
  text: z
    .string()
    .trim()
    .min(1, "Comment text is required")
    .max(1000, "Comment must not exceed 1000 characters"),
});

export type EditCommentInput = z.infer<typeof editCommentSchema>;

/**
 * Like Action Schema
 */
export const likeActionSchema = z.object({
  targetId: z.string().min(1, "Target ID is required"),
  targetType: z.enum(["post", "comment"]),
});

export type LikeActionInput = z.infer<typeof likeActionSchema>;

/**
 * Follow Action Schema
 */
export const followActionSchema = z.object({
  targetUserId: z.string().min(1, "User ID is required"),
});

export type FollowActionInput = z.infer<typeof followActionSchema>;

/**
 * Feed Query Schema
 */
export const feedQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
});

export type FeedQueryInput = z.infer<typeof feedQuerySchema>;

/**
 * Followers/Following Query Schema
 */
export const followerQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export type FollowerQueryInput = z.infer<typeof followerQuerySchema>;

/**
 * Notifications Query Schema
 */
export const notificationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  read: z.enum(["true", "false"]).optional(),
});

export type NotificationQueryInput = z.infer<typeof notificationQuerySchema>;
