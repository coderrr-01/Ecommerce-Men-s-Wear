import type { ApiErrorCode } from "@/types/api";

export class AppError extends Error {
  readonly code: ApiErrorCode;
  readonly status: number;
  readonly details?: unknown;

  constructor(
    code: ApiErrorCode,
    message: string,
    options: { status?: number; details?: unknown; cause?: unknown } = {},
  ) {
    super(message, { cause: options.cause });
    this.name = "AppError";
    this.code = code;
    this.status = options.status ?? 500;
    this.details = options.details;
  }
}

export class ValidationError extends AppError {
  constructor(message = "Please check the submitted fields.", details?: unknown) {
    super("VALIDATION_ERROR", message, { status: 422, details });
    this.name = "ValidationError";
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "You must be signed in to continue.") {
    super("UNAUTHORIZED", message, { status: 401 });
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "You do not have permission to perform this action.") {
    super("FORBIDDEN", message, { status: 403 });
    this.name = "ForbiddenError";
  }
}

export class NotFoundError extends AppError {
  constructor(resource = "Resource") {
    super("NOT_FOUND", `${resource} could not be found.`, { status: 404 });
    this.name = "NotFoundError";
  }
}

export class ConflictError extends AppError {
  constructor(message = "This action conflicts with existing data.") {
    super("CONFLICT", message, { status: 409 });
    this.name = "ConflictError";
  }
}

export class InsufficientStockError extends AppError {
  constructor(message = "One or more items are no longer available in the requested quantity.") {
    super("INSUFFICIENT_STOCK", message, { status: 409 });
    this.name = "InsufficientStockError";
  }
}

export class ProviderError extends AppError {
  constructor(provider: string, message: string, cause?: unknown) {
    super("PROVIDER_ERROR", `${provider}: ${message}`, { status: 502, cause });
    this.name = "ProviderError";
  }
}
