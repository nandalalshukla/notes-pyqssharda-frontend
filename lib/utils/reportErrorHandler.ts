/**
 * Report-specific error handler with proper error code detection
 */

export interface ReportError {
  code: string;
  message: string;
  status: number;
  retryAfter?: number;
}

export interface ApiErrorResponse {
  success?: boolean;
  code?: string;
  message?: string;
  retryAfter?: number;
}

export function getReportErrorDetails(error: unknown): ReportError {
  const defaultError: ReportError = {
    code: "UNKNOWN_ERROR",
    message:
      "We encountered an issue while processing your report. Please try again.",
    status: 500,
  };

  // Handle axios error structure
  const anyError = error as any;

  // Check for response data with error code
  if (anyError?.response?.data) {
    const data = anyError.response.data as ApiErrorResponse;
    const status = anyError.response.status || 500;

    return {
      code: data.code || "ERROR",
      message: data.message || defaultError.message,
      status,
      retryAfter: data.retryAfter,
    };
  }

  // Check for error message from Error object
  if (error instanceof Error) {
    return {
      ...defaultError,
      message: error.message,
    };
  }

  return defaultError;
}

export function getReportErrorFeedback(error: ReportError): {
  title: string;
  description: string;
  actionText?: string;
  retryAfter?: number;
} {
  const feedbackMap: Record<
    string,
    {
      title: string;
      description: string;
      actionText?: string;
    }
  > = {
    DUPLICATE_REPORT: {
      title: "Already Reported",
      description:
        "You've already reported this item. Our moderation team is reviewing it. We appreciate your vigilance!",
    },
    SELF_REPORT: {
      title: "Can't Report Own Content",
      description:
        "You cannot report content you created. If you want to delete it, use the delete option instead.",
    },
    TARGET_NOT_FOUND: {
      title: "Item Not Found",
      description:
        "The item you're trying to report no longer exists or has been removed.",
    },
    REPORT_COOLDOWN: {
      title: "Please Wait",
      description:
        "You recently reported this item. Please wait a moment before reporting it again.",
    },
    RATE_LIMIT_EXCEEDED: {
      title: "Too Many Reports",
      description:
        "You're reporting too quickly. Please wait a moment before submitting another report.",
    },
    INVALID_TARGET: {
      title: "Invalid Report",
      description: "The item you're trying to report appears to be invalid.",
    },
    UNAUTHORIZED: {
      title: "Login Required",
      description: "You must be logged in to submit a report.",
      actionText: "Login",
    },
    INTERNAL_ERROR: {
      title: "Server Error",
      description:
        "We're experiencing technical difficulties. Please try again in a few moments.",
    },
    UNKNOWN_ERROR: {
      title: "Something Went Wrong",
      description:
        "We couldn't process your report. Please try again or contact support if the problem persists.",
    },
  };

  const feedback = feedbackMap[error.code] || feedbackMap["UNKNOWN_ERROR"];

  return {
    ...feedback,
    retryAfter: error.retryAfter,
  };
}
