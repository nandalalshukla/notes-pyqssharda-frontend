/**
 * Common API Response Types
 * Defines the structure of responses from the backend API
 */

// Base API Response
export interface ApiResponse<T = unknown> {
  success?: boolean;
  message?: string;
  data?: T;
}

// Error Response
export interface ApiError {
  message: string;
  statusCode?: number;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

// Pagination Response
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Pagination Info (used in comment responses)
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  pages?: number;
  hasMore: boolean;
}

// File Upload Progress
export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}
