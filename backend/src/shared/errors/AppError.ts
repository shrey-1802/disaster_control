export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: unknown;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode = 500,
    code = 'INTERNAL_ERROR',
    details?: unknown,
    isOperational = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

// Authentication & Authorization Errors
export class InvalidCredentialsError extends AppError {
  constructor(message = 'Invalid operational credentials or passcode.') {
    super(message, 401, 'AUTH_INVALID_CREDENTIALS');
  }
}

export class TokenExpiredError extends AppError {
  constructor(message = 'Authentication token has expired.') {
    super(message, 401, 'AUTH_TOKEN_EXPIRED');
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'You are not authorized to perform this operational action.') {
    super(message, 403, 'AUTH_FORBIDDEN');
  }
}

// Resource & Validation Errors
export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    super(
      id ? `${resource} with identifier '${id}' was not found.` : `${resource} was not found.`,
      404,
      'RESOURCE_NOT_FOUND'
    );
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 400, 'VALIDATION_FAILED', details);
  }
}

// Domain Specific Errors (Inventory, Supply Swap, Convoys, Hazards, Routes)
export class InsufficientInventoryError extends AppError {
  constructor(available: number, requested: number) {
    super(
      `Insufficient available inventory. Available: ${available}, Requested: ${requested}.`,
      400,
      'INVENTORY_INSUFFICIENT',
      { available, requested }
    );
  }
}

export class InvalidStateTransitionError extends AppError {
  constructor(entity: string, current: string, target: string) {
    super(
      `Invalid ${entity} state transition from '${current}' to '${target}'.`,
      409,
      'INVALID_STATE_TRANSITION',
      { entity, current, target }
    );
  }
}

export class RouteStaleError extends AppError {
  constructor(message = 'Route is stale due to active road hazards and requires recalculation.') {
    super(message, 409, 'ROUTE_STALE');
  }
}

export class IdempotencyDuplicateError extends AppError {
  constructor(clientEventId: string) {
    super(
      `Duplicate offline event '${clientEventId}' already processed.`,
      200,
      'SYNC_DUPLICATE',
      { clientEventId }
    );
  }
}
