import type { ApiError, ApiFailure, ApiResponse, ApiSuccess } from "@/types/api";

export function ok<T>(data: T): ApiSuccess<T> {
  return { success: true, data };
}

export function fail(error: ApiError): ApiFailure {
  return { success: false, error };
}

export function isApiSuccess<T>(response: ApiResponse<T>): response is ApiSuccess<T> {
  return response.success;
}
