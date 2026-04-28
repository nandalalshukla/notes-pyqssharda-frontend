/**
 * Aggregated validators index for easy imports
 * Import patterns:
 * - import { loginSchema } from '@/lib/validators'
 * - import { searchSchema, type SearchInput } from '@/lib/validators'
 */

// Auth validators
export {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  changePasswordSchema,
  editProfileSchema,
  becomeModeratorSchema,
  resendOtpSchema,
  type RegisterInput,
  type LoginInput,
  type ForgotPasswordInput,
  type ResetPasswordInput,
  type VerifyEmailInput,
  type ChangePasswordInput,
  type EditProfileInput,
  type BecomeModeratorInput,
  type ResendOtpInput,
} from "./auth.zod";

// Notes validators
export {
  notesSchema,
  updateNotesSchema,
  notesQuerySchema,
  type NotesInput,
  type UpdateNotesInput,
  type NotesQueryInput,
} from "./notes.zod";

// PYQs validators
export {
  pyqsSchema,
  updatePYQsSchema,
  pyqsQuerySchema,
  type PYQsInput,
  type UpdatePYQsInput,
  type PYQsQueryInput,
} from "./pyqs.zod";

// Syllabus validators
export {
  syllabusSchema,
  updateSyllabusSchema,
  syllabusQuerySchema,
  type SyllabusInput,
  type UpdateSyllabusInput,
  type SyllabusQueryInput,
} from "./syllabus.zod";

// Social validators
export {
  createPostSchema,
  editPostSchema,
  createCommentSchema,
  editCommentSchema,
  likeActionSchema,
  followActionSchema,
  feedQuerySchema,
  followerQuerySchema,
  notificationQuerySchema,
  type CreatePostInput,
  type EditPostInput,
  type CreateCommentInput,
  type EditCommentInput,
  type LikeActionInput,
  type FollowActionInput,
  type FeedQueryInput,
  type FollowerQueryInput,
  type NotificationQueryInput,
} from "./social.zod";

// Search validators
export { searchSchema, type SearchInput } from "./search.zod";
