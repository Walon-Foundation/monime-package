import { createHash } from "node:crypto";

/**
 * Namespace for {@link idempotencyKeyFor}: uuid5(NAMESPACE_URL,
 * "https://github.com/Walon-Foundation/monime-package"). The Go SDK uses the
 * same one, so both derive identical keys from the same reference.
 */
export const IDEMPOTENCY_NAMESPACE = "324f9f23-0e7a-54ba-9149-8240b1833dc1";

function uuidBytes(uuid: string): Buffer {
	return Buffer.from(uuid.replace(/-/g, ""), "hex");
}

/**
 * Derives a deterministic idempotency key (a UUIDv5) from a stable reference
 * in your own system, such as `payout:<line id>:<attempt>`. Retrying with the
 * same reference sends the same key, so Monime never performs the operation
 * twice. This is what Monime's idempotency guide recommends.
 */
export function idempotencyKeyFor(reference: string): string {
	const hash = createHash("sha1")
		.update(uuidBytes(IDEMPOTENCY_NAMESPACE))
		.update(Buffer.from(reference, "utf8"))
		.digest();

	const bytes = hash.subarray(0, 16);
	bytes[6] = ((bytes[6] ?? 0) & 0x0f) | 0x50;
	bytes[8] = ((bytes[8] ?? 0) & 0x3f) | 0x80;

	const hex = bytes.toString("hex");
	return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
