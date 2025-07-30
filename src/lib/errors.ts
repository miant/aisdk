export class Base44Error extends Error {
  public status?: number;
  public code?: string;
  public data?: any;
  public originalError?: Error;

  constructor(
      message: string,
      status?: number,
      code?: string,
      data?: any,
      originalError?: Error
  ) {
    super(message);
    this.name = 'Base44Error';
    this.status = status;
    this.code = code;
    this.data = data;
    this.originalError = originalError;

    // Maintains proper stack trace for where our error was thrown
    /*if (Error.captureStackTrace) {
      Error.captureStackTrace(this, Base44Error);
    }*/
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      status: this.status,
      code: this.code,
      data: this.data,
      stack: this.stack
    };
  }

  static fromResponse(response: any, originalError?: Error): Base44Error {
    const message = response?.data?.message || response?.data?.detail || 'Unknown error';
    return new Base44Error(
        message,
        response?.status,
        response?.data?.code,
        response?.data,
        originalError
    );
  }
}

export class ValidationError extends Base44Error {
  constructor(message: string, validationErrors?: any) {
    super(message, 400, 'VALIDATION_ERROR', validationErrors);
  }
}

export class AuthenticationError extends Base44Error {
  constructor(message = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_REQUIRED');
  }
}

export class AuthorizationError extends Base44Error {
  constructor(message = 'Insufficient permissions') {
    super(message, 403, 'INSUFFICIENT_PERMISSIONS');
  }
}

export class NotFoundError extends Base44Error {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}