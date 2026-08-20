import axios from "axios";

/**
 * The one place in the app that turns a caught error — from an API call,
 * or anything else — into something safe and useful to show a user.
 *
 * The backend (see errorHandler.middleware.ts on the API) now guarantees
 * every error response has this shape, and that `message` is ALWAYS
 * already written to be shown to a user as-is:
 *   { success: false, message: string, code?: string, errors?: Record<string,string>, data?: unknown }
 * This function trusts that contract — it reads `response.data.message`
 * first, before anything else, which is the opposite of the order this
 * file used to check things in (see the bug note on `getErrorMessage`).
 */
export interface ApiError {
  /** Always safe to render directly — a toast, an inline message, etc. */
  message: string;
  status?: number;
  /** Stable machine-readable identifier, e.g. "SESSION_EXPIRED" — for
   *  callers that need to branch on *why*, not just display *what*. */
  code?: string;
  /** Field-level validation errors, `{ field: message }`. */
  fieldErrors?: Record<string, string>;
  /** Extra structured payload some errors carry (see AppError's `data`
   *  on the backend) — e.g. a report's current state after a conflict. */
  data?: unknown;
  /** Seconds until a rate-limited request can be retried, when the
   *  endpoint provides one (e.g. report cooldowns). */
  retryAfter?: number;
  isNetworkError: boolean;
  isTimeout: boolean;
}

const STATUS_FALLBACKS: Record<number, string> = {
  400: "That request wasn't valid. Please check your input and try again.",
  401: "Your session has expired. Please sign in again.",
  403: "You don't have permission to do that.",
  404: "We couldn't find what you were looking for.",
  409: "This conflicts with something that already exists.",
  413: "That's too large to upload.",
  422: "Some of the submitted information isn't valid.",
  429: "You're doing that too much — please slow down and try again shortly.",
};

const GENERIC_MESSAGE = "Something went wrong. Please try again.";
const SERVER_ERROR_MESSAGE =
  "Something went wrong on our end. Please try again shortly.";
const NETWORK_ERROR_MESSAGE =
  "You appear to be offline. Please check your internet connection and try again.";
const TIMEOUT_MESSAGE =
  "That took too long to respond. Please check your connection and try again.";

function statusFallback(status: number): string {
  if (STATUS_FALLBACKS[status]) return STATUS_FALLBACKS[status];
  if (status >= 500) return SERVER_ERROR_MESSAGE;
  return GENERIC_MESSAGE;
}

/**
 * Structured version — use this when a caller needs more than just a
 * string (a `code` to branch on, `fieldErrors` to attach to a form,
 * `data` a conflict error carried along with it).
 */
export function getApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      const body = error.response.data as
        | {
            message?: string;
            code?: string;
            errors?: Record<string, string>;
            data?: unknown;
            retryAfter?: number;
          }
        | undefined;
      return {
        message: body?.message || statusFallback(error.response.status),
        status: error.response.status,
        code: body?.code,
        fieldErrors: body?.errors,
        data: body?.data,
        retryAfter: body?.retryAfter,
        isNetworkError: false,
        isTimeout: false,
      };
    }

    if (error.code === "ECONNABORTED") {
      return {
        message: TIMEOUT_MESSAGE,
        isNetworkError: false,
        isTimeout: true,
      };
    }

    // A request that never got a response and wasn't a timeout is a
    // connectivity problem — offline, DNS failure, CORS misconfiguration,
    // server unreachable. Axios's own message here ("Network Error") is
    // accurate but not something to show a user verbatim.
    return {
      message: NETWORK_ERROR_MESSAGE,
      isNetworkError: true,
      isTimeout: false,
    };
  }

  if (error instanceof Error) {
    return { message: error.message, isNetworkError: false, isTimeout: false };
  }

  if (typeof error === "string") {
    return { message: error, isNetworkError: false, isTimeout: false };
  }

  return { message: GENERIC_MESSAGE, isNetworkError: false, isTimeout: false };
}

/**
 * The common case — just the message string. Safe to pass straight to
 * `toast.error()` or render inline, for any error caught anywhere in the
 * app (API call or otherwise).
 */
export function getErrorMessage(error: unknown): string {
  return getApiError(error).message;
}

/** Field-level validation errors from a 400, if the error has any — for
 *  wiring inline "this field is wrong" messages onto a form. */
export function getFieldErrors(error: unknown): Record<string, string> | undefined {
  return getApiError(error).fieldErrors;
}
