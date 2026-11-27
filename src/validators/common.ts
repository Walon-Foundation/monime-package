import { z } from "zod";

export const currencySchema = z.enum(["SLE", "USD"], {
	message: "Currency must be either SLE or USD",
});

/** An amount sent to the API: a whole number of minor units. */
export const amountInputSchema = z
	.object({
		currency: currencySchema.optional(),
		value: z
			.number()
			.int("Amount must be a whole number of minor units (e.g. cents)")
			.gt(0, "Amount must be greater than zero"),
	})
	.strict();

const METADATA_KEY = /^[a-zA-Z0-9_-]{1,64}$/;
const RESERVED_KEY = /^([_-]|monime)/i;

function metadata(allowDelete: boolean) {
	const value = allowDelete
		? z
				.string()
				.max(100, "Metadata values are at most 100 characters")
				.nullable()
		: z.string().max(100, "Metadata values are at most 100 characters");

	return z.record(z.string(), value).superRefine((record, ctx) => {
		const keys = Object.keys(record);
		if (keys.length > 64) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Metadata holds at most 64 pairs",
			});
		}
		for (const key of keys) {
			if (!METADATA_KEY.test(key)) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					path: [key],
					message:
						"Metadata keys are 1-64 characters of letters, digits, '_' or '-'",
				});
			} else if (RESERVED_KEY.test(key)) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					path: [key],
					message: "Metadata keys cannot begin with '_', '-' or 'monime'",
				});
			}
		}
	});
}

/** Metadata on create: string values only. */
export const metadataSchema = metadata(false);

/** Metadata on update: `null` (or `""`) deletes a key. */
export const metadataUpdateSchema = metadata(true);

/**
 * Removes keys whose value is `undefined`, so request bodies carry only what
 * the caller set (several endpoints reject unknown or empty properties).
 */
export function compact<T extends Record<string, unknown>>(
	value: T,
): Partial<T> {
	const out: Record<string, unknown> = {};
	for (const [key, v] of Object.entries(value)) {
		if (v !== undefined) out[key] = v;
	}
	return out as Partial<T>;
}

/** Formats a zod failure as one readable message. */
export function validationMessage(error: z.ZodError): string {
	return error.issues
		.map((issue) =>
			issue.path.length > 0
				? `${issue.path.join(".")}: ${issue.message}`
				: issue.message,
		)
		.join("; ");
}
