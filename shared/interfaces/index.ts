/**
 * SignLearn Monorepo - Shared API Interfaces
 */

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: Record<string, any>;
  errors?: any[] | null;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasMore: boolean;
}

export interface ApiErrorResponse {
  success: false;
  statusCode: number;
  message: string;
  errorType: string;
  path: string;
  timestamp: string;
  details?: any;
}
