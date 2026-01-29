import { describe, expect, it } from "vitest";
import {
	createWebhookSchema,
	updateWebhookSchema,
} from "../../../src/validators/webhook.validator";

describe("Webhook Validators", () => {
	describe("createWebhookSchema", () => {
		it("should validate a correct webhook creation request", () => {
			const result = createWebhookSchema.safeParse({
				name: "My Webhook",
				url: "https://example.com/webhook",
				events: ["payment.success"],
			});
			expect(result.success).toBe(true);
		});

		it("should fail when url is invalid", () => {
			const result = createWebhookSchema.safeParse({
				name: "My Webhook",
				url: "not-a-url",
				events: ["payment.success"],
			});
			expect(result.success).toBe(false);
		});

		it("should fail when events array is empty", () => {
			const result = createWebhookSchema.safeParse({
				name: "My Webhook",
				url: "https://example.com/webhook",
				events: [],
			});
			expect(result.success).toBe(false);
		});
	});

	describe("updateWebhookSchema", () => {
		it("should validate a correct webhook update request", () => {
			const result = updateWebhookSchema.safeParse({
				name: "Updated Name",
				enabled: false,
			});
			expect(result.success).toBe(true);
		});

		it("should validate when only metadata is updated", () => {
			const result = updateWebhookSchema.safeParse({
				metadata: { key: "value" },
			});
			expect(result.success).toBe(true);
		});

		it("should fail if url is invalid in update", () => {
			const result = updateWebhookSchema.safeParse({
				url: "invalid-url",
			});
			expect(result.success).toBe(false);
		});
	});
});
