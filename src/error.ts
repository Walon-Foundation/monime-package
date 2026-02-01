export class MonimeError extends Error {
	public readonly status?: number;
	public readonly requestId?: string;
	public readonly details?: unknown;

	constructor(message: string, status?: number, requestId?: string, details?: unknown) {
		super(message);
		this.name = "MonimeError";
		if (status !== undefined) this.status = status;
		if (requestId !== undefined) this.requestId = requestId;
		this.details = details;

		// Maintain proper stack trace for where our error was thrown (only available on V8)
		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, MonimeError);
		}
	}
}

export class MonimeAuthenticationError extends MonimeError {
	constructor(message = "Invalid or missing access token") {
		super(message, 401);
		this.name = "MonimeAuthenticationError";
	}
}

export class MonimeValidationError extends MonimeError {
	constructor(message: string, details?: unknown) {
		super(message, 400, undefined, details);
		this.name = "MonimeValidationError";
	}
}
