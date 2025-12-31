export interface AppErrorOptions {
  type?: string;
  code?: string;
  status?: number;
  message?: string;
  info?: any;
}

export class AppError extends Error {
  public type: string;
  public code: string;
  public status: number;
  public info?: any;
  public isOperational: boolean;

  constructor(options: AppErrorOptions = {}) {
    super(options.message || "Something went wrong");

    this.type = options.type || "APP_ERROR";
    this.code = options.code || "UNKNOWN_ERROR";
    this.status = options.status || 500;
    this.info = options.info || null;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      type: this.type,
      code: this.code,
      status: this.status,
      message: this.message,
      info: this.info,
    };
  }
}

export const ERRORS: Record<string, AppErrorOptions> = {
  // 🔐 AUTH
  TOKEN_EXPIRED: {
    type: "AUTH_ERROR",
    code: "TOKEN_EXPIRED",
    status: 403,
    message: "Your session has expired. Please log in again.",
  },

  INVALID_TOKEN: {
    type: "AUTH_ERROR",
    code: "INVALID_TOKEN",
    status: 401,
    message: "Invalid authentication token.",
  },

  UNAUTHORIZED: {
    type: "AUTH_ERROR",
    code: "UNAUTHORIZED",
    status: 401,
    message: "Authentication is required to access this resource.",
  },

  FORBIDDEN: {
    type: "AUTH_ERROR",
    code: "FORBIDDEN",
    status: 403,
    message: "You do not have permission to perform this action.",
  },

  // 🧾 API / VALIDATION
  BAD_REQUEST: {
    type: "API_ERROR",
    code: "BAD_REQUEST",
    status: 400,
    message: "The request could not be understood by the server.",
  },

  VALIDATION_FAILED: {
    type: "VALIDATION_ERROR",
    code: "VALIDATION_FAILED",
    status: 422,
    message: "One or more fields failed validation.",
  },

  MISSING_PARAMETER: {
    type: "VALIDATION_ERROR",
    code: "MISSING_PARAMETER",
    status: 400,
    message: "A required parameter is missing.",
  },

  INVALID_PARAMETER: {
    type: "VALIDATION_ERROR",
    code: "INVALID_PARAMETER",
    status: 400,
    message: "One or more parameters are invalid.",
  },

  PAYLOAD_TOO_LARGE: {
    type: "API_ERROR",
    code: "PAYLOAD_TOO_LARGE",
    status: 413,
    message: "Request payload is too large.",
  },

  // 🔎 RESOURCE
  NOT_FOUND: {
    type: "RESOURCE_ERROR",
    code: "NOT_FOUND",
    status: 404,
    message: "The requested resource was not found.",
  },

  ALREADY_EXISTS: {
    type: "RESOURCE_ERROR",
    code: "ALREADY_EXISTS",
    status: 409,
    message: "The resource already exists.",
  },

  CONFLICT: {
    type: "RESOURCE_ERROR",
    code: "CONFLICT",
    status: 409,
    message: "The request could not be completed due to a conflict.",
  },

  // 🗄 DATABASE
  DB_ERROR: {
    type: "SQL_ERROR",
    code: "DB_ERROR",
    status: 500,
    message: "A database error occurred.",
  },

  DUPLICATE_ENTRY: {
    type: "SQL_ERROR",
    code: "DUPLICATE_ENTRY",
    status: 409,
    message: "Duplicate record detected.",
  },

  FOREIGN_KEY_ERROR: {
    type: "SQL_ERROR",
    code: "FOREIGN_KEY_ERROR",
    status: 409,
    message: "Related resource does not exist.",
  },

  TRANSACTION_FAILED: {
    type: "SQL_ERROR",
    code: "TRANSACTION_FAILED",
    status: 500,
    message: "Database transaction failed.",
  },

  // 🌐 EXTERNAL
  EXTERNAL_SERVICE_ERROR: {
    type: "EXTERNAL_ERROR",
    code: "EXTERNAL_SERVICE_ERROR",
    status: 502,
    message: "External service failed to process the request.",
  },

  RATE_LIMITED: {
    type: "EXTERNAL_ERROR",
    code: "RATE_LIMITED",
    status: 429,
    message: "Too many requests. Please try again later.",
  },

  TIMEOUT: {
    type: "EXTERNAL_ERROR",
    code: "TIMEOUT",
    status: 504,
    message: "The request timed out.",
  },

  // ⚙ SYSTEM
  INTERNAL_ERROR: {
    type: "SERVER_ERROR",
    code: "INTERNAL_ERROR",
    status: 500,
    message: "An unexpected error occurred.",
  },

  SERVICE_UNAVAILABLE: {
    type: "SERVER_ERROR",
    code: "SERVICE_UNAVAILABLE",
    status: 503,
    message: "Service is temporarily unavailable.",
  },

  NOT_IMPLEMENTED: {
    type: "SERVER_ERROR",
    code: "NOT_IMPLEMENTED",
    status: 501,
    message: "This functionality is not implemented yet.",
  },

  CONFIG_ERROR: {
    type: "SERVER_ERROR",
    code: "CONFIG_ERROR",
    status: 500,
    message: "Server configuration error.",
  },
};

export class BadRequestError extends AppError {
  constructor(overrides?: Partial<AppError>) {
    super({
      type: overrides?.type || ERRORS.BAD_REQUEST.type,
      code: overrides?.code || ERRORS.BAD_REQUEST.code,
      status: overrides?.status || ERRORS.BAD_REQUEST.status,
      message: overrides?.message || ERRORS.BAD_REQUEST.message,
      info: overrides?.info,
    });
  }
}

export class NotFoundError extends AppError {
  constructor(overrides?: Partial<AppError>) {
    super({
      type: overrides?.type || ERRORS.NOT_FOUND.type,
      code: overrides?.code || ERRORS.NOT_FOUND.code,
      status: overrides?.status || ERRORS.NOT_FOUND.status,
      message: overrides?.message || ERRORS.NOT_FOUND.message,
      info: overrides?.info,
    });
  }
}

export class UnauthorizedError extends AppError {
  constructor(overrides?: Partial<AppError>) {
    super({
      type: overrides?.type || ERRORS.UNAUTHORIZED.type,
      code: overrides?.code || ERRORS.UNAUTHORIZED.code,
      status: overrides?.status || ERRORS.UNAUTHORIZED.status,
      message: overrides?.message || ERRORS.UNAUTHORIZED.message,
      info: overrides?.info,
    });
  }
}

export class ForbiddenError extends AppError {
  constructor(overrides?: Partial<AppError>) {
    super({
      type: overrides?.type || ERRORS.FORBIDDEN.type,
      code: overrides?.code || ERRORS.FORBIDDEN.code,
      status: overrides?.status || ERRORS.FORBIDDEN.status,
      message: overrides?.message || ERRORS.FORBIDDEN.message,
      info: overrides?.info,
    });
  }
}

export class ConflictError extends AppError {
  constructor(overrides?: Partial<AppError>) {
    super({
      type: overrides?.type || ERRORS.CONFLICT.type,
      code: overrides?.code || ERRORS.CONFLICT.code,
      status: overrides?.status || ERRORS.CONFLICT.status,
      message: overrides?.message || ERRORS.CONFLICT.message,
      info: overrides?.info,
    });
  }
}
