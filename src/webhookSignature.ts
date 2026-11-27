import {
	createHmac,
	createPublicKey,
	type KeyObject,
	timingSafeEqual,
	verify,
} from "node:crypto";
import {
	MonimeWebhookSignatureError,
	type WebhookSignatureErrorReason,
} from "./error";
import type { Result } from "./types/core";
import type { WebhookEvent, WebhookVerifyOptions } from "./types/webhookEvent";

const DEFAULT_TOLERANCE = 300;
const DEFAULT_FUTURE_TOLERANCE = 60;

function fail<T>(
	reason: WebhookSignatureErrorReason,
	message: string,
): Result<T> {
	return {
		success: false,
		error: new MonimeWebhookSignatureError(message, reason),
	};
}

/** Splits `t=<unix>,v1=<base64>[,v1=<base64>]` into its parts. */
function parseHeader(header: string): { t: string; v1: string[] } | null {
	let t: string | undefined;
	const v1: string[] = [];

	for (const part of header.split(",")) {
		const index = part.indexOf("=");
		if (index === -1) continue;
		const key = part.slice(0, index).trim();
		const value = part.slice(index + 1).trim();
		if (key === "t") {
			if (t !== undefined) return null;
			t = value;
		} else if (key === "v1" && value !== "") {
			v1.push(value);
		}
	}

	if (t === undefined || !/^\d+$/.test(t) || v1.length === 0) return null;
	return { t, v1 };
}

function signedPayload(t: string, payload: string | Uint8Array): Buffer {
	const body =
		typeof payload === "string"
			? Buffer.from(payload, "utf8")
			: Buffer.from(payload);
	return Buffer.concat([Buffer.from(`${t}_`, "utf8"), body]);
}

function hmacMatches(secret: string, data: Buffer, signature: string): boolean {
	const expected = createHmac("sha256", secret).update(data).digest();
	const received = Buffer.from(signature, "base64");
	return (
		received.length === expected.length && timingSafeEqual(received, expected)
	);
}

function ecdsaMatches(
	key: KeyObject,
	data: Buffer,
	signature: string,
): boolean {
	try {
		return verify(
			"sha256",
			data,
			{ key, dsaEncoding: "der" },
			Buffer.from(signature, "base64"),
		);
	} catch {
		return false;
	}
}

/**
 * Checks that a webhook delivery came from Monime and is fresh, using the
 * `Monime-Signature` header (`t=<unix>,v1=<base64>`). The signed payload is
 * `t + "_" + rawBody`. HS256 deliveries are checked against `secret`, ES256
 * ones against `publicKey`; with both set, either may match. A delivery more
 * than `tolerance` seconds old or `futureTolerance` seconds ahead is refused.
 *
 * Never throws: a failure returns `{ success: false, error }` with a
 * {@link MonimeWebhookSignatureError} whose `reason` says why.
 * @see https://docs.monime.io/docs/developer-resources/guides/webhook/hmac-verification
 */
export function verifyWebhookSignature(
	options: WebhookVerifyOptions,
): Result<void> {
	const { payload, header, secret, publicKey } = options;

	if (!secret && !publicKey) {
		return fail(
			"missing_verification_key",
			"Give the webhook's secret (HS256) or public key (ES256).",
		);
	}
	if (!header || header.trim() === "") {
		return fail("missing_header", "The Monime-Signature header is missing.");
	}

	const parsed = parseHeader(header);
	if (!parsed) {
		return fail(
			"malformed_header",
			"The Monime-Signature header is not in the form t=<unix>,v1=<signature>.",
		);
	}

	const nowMs =
		options.now === undefined
			? Date.now()
			: typeof options.now === "number"
				? options.now
				: options.now.getTime();
	const now = Math.floor(nowMs / 1000);
	const timestamp = Number.parseInt(parsed.t, 10);
	const tolerance = options.tolerance ?? DEFAULT_TOLERANCE;
	const futureTolerance = options.futureTolerance ?? DEFAULT_FUTURE_TOLERANCE;

	if (now - timestamp > tolerance || timestamp - now > futureTolerance) {
		return fail(
			"timestamp_out_of_tolerance",
			"The delivery's timestamp is outside the accepted window.",
		);
	}

	let key: KeyObject | undefined;
	if (publicKey) {
		try {
			key = createPublicKey(publicKey);
		} catch {
			return fail("invalid_public_key", "The public key could not be read.");
		}
		if (
			key.asymmetricKeyType !== "ec" ||
			key.asymmetricKeyDetails?.namedCurve !== "prime256v1"
		) {
			return fail(
				"invalid_public_key",
				"The public key is not an ECDSA P-256 key.",
			);
		}
	}

	const data = signedPayload(parsed.t, payload);
	const matched = parsed.v1.some(
		(signature) =>
			(secret !== undefined &&
				secret !== "" &&
				hmacMatches(secret, data, signature)) ||
			(key !== undefined && ecdsaMatches(key, data, signature)),
	);

	if (!matched) {
		return fail(
			"signature_mismatch",
			"The signature does not match this delivery.",
		);
	}

	return { success: true };
}

/**
 * Verifies a delivery with {@link verifyWebhookSignature}, then decodes it.
 * Use `event.id` to drop repeats and `object.id` to fetch the full object.
 */
export function parseWebhookEvent<TData = unknown>(
	options: WebhookVerifyOptions,
): Result<WebhookEvent<TData>> {
	const verified = verifyWebhookSignature(options);
	if (!verified.success && verified.error) {
		return { success: false, error: verified.error };
	}

	let event: WebhookEvent<TData>;
	try {
		const text =
			typeof options.payload === "string"
				? options.payload
				: Buffer.from(options.payload).toString("utf8");
		event = JSON.parse(text) as WebhookEvent<TData>;
	} catch {
		return fail("malformed_payload", "The delivery's body is not JSON.");
	}

	if (
		typeof event !== "object" ||
		event === null ||
		typeof event.event?.id !== "string" ||
		typeof event.event?.name !== "string" ||
		typeof event.object?.id !== "string"
	) {
		return fail(
			"malformed_payload",
			"The delivery's body is not a Monime webhook event.",
		);
	}

	return { success: true, data: event };
}
