import { createHmac, generateKeyPairSync, sign } from "node:crypto";
import { describe, expect, it } from "vitest";
import { MonimeWebhookSignatureError } from "../../src/error";
import {
	parseWebhookEvent,
	verifyWebhookSignature,
} from "../../src/webhookSignature";

// The shared vector, also used by the Go SDK's tests.
const secret = "whsec_test_secret_0123456789abcdef";
const t = "1773386779";
const body =
	'{"apiVersion":"caph.2025-08-23","event":{"id":"wke-1","name":"payout.completed","timestamp":"1773386779"},"object":{"id":"pyt-1","type":"payout"},"data":{"id":"pyt-1"}}';
const v1 = "oH5YCvgxXM8T9Wqpk17s3ulNxDNMZNpFUsVvxlOkfgQ=";
const now = Number(t) * 1000;

function reason(result: { error?: Error }) {
	return (result.error as MonimeWebhookSignatureError).reason;
}

describe("verifyWebhookSignature (HS256)", () => {
	it("accepts the shared vector", () => {
		const result = verifyWebhookSignature({
			payload: body,
			header: `t=${t},v1=${v1}`,
			secret,
			now,
		});
		expect(result).toEqual({ success: true });
	});

	it("accepts the raw body as bytes", () => {
		const result = verifyWebhookSignature({
			payload: Buffer.from(body),
			header: `t=${t},v1=${v1}`,
			secret,
			now,
		});
		expect(result.success).toBe(true);
	});

	it("signs t + '_' + body (underscore, base64)", () => {
		const expected = createHmac("sha256", secret)
			.update(`${t}_${body}`)
			.digest("base64");
		expect(expected).toBe(v1);
	});

	it("accepts any matching v1 among several (key rotation)", () => {
		const result = verifyWebhookSignature({
			payload: body,
			header: `t=${t}, v1=AAAA, v1=${v1}`,
			secret,
			now,
		});
		expect(result.success).toBe(true);
	});

	it("refuses a changed body", () => {
		const result = verifyWebhookSignature({
			payload: body.replace("pyt-1", "pyt-2"),
			header: `t=${t},v1=${v1}`,
			secret,
			now,
		});
		expect(result.success).toBe(false);
		expect(result.error).toBeInstanceOf(MonimeWebhookSignatureError);
		expect(reason(result)).toBe("signature_mismatch");
	});

	it("refuses the wrong secret", () => {
		const result = verifyWebhookSignature({
			payload: body,
			header: `t=${t},v1=${v1}`,
			secret: "another_secret_0123456789abcdef!!",
			now,
		});
		expect(reason(result)).toBe("signature_mismatch");
	});

	it("refuses a delivery older than 300 s or more than 60 s ahead", () => {
		const header = `t=${t},v1=${v1}`;
		const at = (offsetSeconds: number) =>
			verifyWebhookSignature({
				payload: body,
				header,
				secret,
				now: now + offsetSeconds * 1000,
			});

		expect(at(300).success).toBe(true);
		expect(reason(at(301))).toBe("timestamp_out_of_tolerance");
		expect(at(-60).success).toBe(true);
		expect(reason(at(-61))).toBe("timestamp_out_of_tolerance");
	});

	it("honours a custom tolerance", () => {
		const result = verifyWebhookSignature({
			payload: body,
			header: `t=${t},v1=${v1}`,
			secret,
			now: now + 10_000,
			tolerance: 5,
		});
		expect(reason(result)).toBe("timestamp_out_of_tolerance");
	});

	it("refuses a missing or malformed header", () => {
		expect(
			reason(
				verifyWebhookSignature({ payload: body, header: undefined, secret }),
			),
		).toBe("missing_header");
		for (const header of [
			`v1=${v1}`,
			`t=${t}`,
			`t=abc,v1=${v1}`,
			`t=1,t=2,v1=${v1}`,
			"garbage",
		]) {
			expect(
				reason(verifyWebhookSignature({ payload: body, header, secret, now })),
			).toBe("malformed_header");
		}
	});

	it("refuses to verify without a secret or public key", () => {
		const result = verifyWebhookSignature({
			payload: body,
			header: `t=${t},v1=${v1}`,
			now,
		});
		expect(reason(result)).toBe("missing_verification_key");
	});
});

describe("verifyWebhookSignature (ES256)", () => {
	const { privateKey, publicKey } = generateKeyPairSync("ec", {
		namedCurve: "prime256v1",
	});
	const pem = publicKey.export({ type: "spki", format: "pem" }).toString();
	const signature = sign("sha256", Buffer.from(`${t}_${body}`), {
		key: privateKey,
		dsaEncoding: "der",
	}).toString("base64");

	it("accepts a DER signature from the matching P-256 key", () => {
		const result = verifyWebhookSignature({
			payload: body,
			header: `t=${t},v1=${signature}`,
			publicKey: pem,
			now,
		});
		expect(result.success).toBe(true);
	});

	it("refuses a signature from another key", () => {
		const other = generateKeyPairSync("ec", { namedCurve: "prime256v1" });
		const result = verifyWebhookSignature({
			payload: body,
			header: `t=${t},v1=${signature}`,
			publicKey: other.publicKey
				.export({ type: "spki", format: "pem" })
				.toString(),
			now,
		});
		expect(reason(result)).toBe("signature_mismatch");
	});

	it("refuses a key that is not P-256, or not a key", () => {
		const p384 = generateKeyPairSync("ec", { namedCurve: "secp384r1" });
		for (const key of [
			p384.publicKey.export({ type: "spki", format: "pem" }).toString(),
			"not a key",
		]) {
			const result = verifyWebhookSignature({
				payload: body,
				header: `t=${t},v1=${signature}`,
				publicKey: key,
				now,
			});
			expect(reason(result)).toBe("invalid_public_key");
		}
	});
});

describe("parseWebhookEvent", () => {
	it("verifies, then returns the event", () => {
		const result = parseWebhookEvent<{ id: string }>({
			payload: body,
			header: `t=${t},v1=${v1}`,
			secret,
			now,
		});
		expect(result.success).toBe(true);
		expect(result.data?.event).toEqual({
			id: "wke-1",
			name: "payout.completed",
			timestamp: "1773386779",
		});
		expect(result.data?.object).toEqual({ id: "pyt-1", type: "payout" });
		expect(result.data?.data.id).toBe("pyt-1");
	});

	it("does not decode a delivery that fails verification", () => {
		const result = parseWebhookEvent({
			payload: body,
			header: `t=${t},v1=AAAA`,
			secret,
			now,
		});
		expect(result.success).toBe(false);
		expect(result.data).toBeUndefined();
	});

	it("refuses a signed body that is not a webhook event", () => {
		for (const payload of ["not json", '{"hello":"world"}']) {
			const signed = createHmac("sha256", secret)
				.update(`${t}_${payload}`)
				.digest("base64");
			const result = parseWebhookEvent({
				payload,
				header: `t=${t},v1=${signed}`,
				secret,
				now,
			});
			expect(reason(result)).toBe("malformed_payload");
		}
	});
});
