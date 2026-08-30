import type { ApiSuccessResponse, ApiErrorResponse, ApiResponseMeta } from '../types/index.js';

export function successResponse<T>(data: T, meta: Partial<ApiResponseMeta> = {}): ApiSuccessResponse<T> {
  return {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      ...meta
    }
  };
}

export function paginatedResponse<T>(
  data: T[],
  page: number,
  pageSize: number,
  total: number,
  meta: Partial<ApiResponseMeta> = {}
): ApiSuccessResponse<T[]> {
  return {
    success: true,
    data,
    meta: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / (pageSize || 1)),
      timestamp: new Date().toISOString(),
      ...meta
    }
  };
}

export function errorResponse(
  code: string,
  message: string,
  details?: unknown,
  meta: Partial<ApiResponseMeta> = {}
): ApiErrorResponse {
  return {
    success: false,
    error: {
      code,
      message,
      ...(details !== undefined ? { details } : {})
    },
    meta: {
      timestamp: new Date().toISOString(),
      ...meta
    }
  };
}
