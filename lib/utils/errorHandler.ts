/**
 * Utility function to extract error message from various error types
 * Handles Axios errors, Error objects, and unknown error types
 */

interface AxiosError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  // Handle Axios error structure
  const axiosError = error as AxiosError;
  if (axiosError.response?.data?.message) {
    return axiosError.response.data.message;
  }

  if (axiosError.message) {
    return axiosError.message;
  }

  // Fallback for unknown error types
  if (typeof error === "string") {
    return error;
  }

  return "An unexpected error occurred";
}
