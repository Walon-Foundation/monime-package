import { HttpClient } from "../http";
import type { Result } from "../types";
import { createCheckoutSchema } from "../validators/checkoutSession.validator";
import type {
	ListCheckoutsResponse,
	CreateCheckoutResponse,
	RetrieveCheckoutResponse,
} from "../types/checkoutSession";
import { randomBytes } from "node:crypto";

export class CheckoutSessionAPI extends HttpClient {
	private readonly path = "/checkout-sessions";

	/**
	 * Create a new checkout session for hosted payment pages.
	 */
	async create(
		name: string,
		amount: number,
		quantity: number,
		successUrl: string,
		cancelUrl: string,
		options: {
			description?: string;
			financialAccountId?: string;
			primaryColor?: string;
			images?: string[];
		} = {},
	): Promise<Result<CreateCheckoutResponse>> {
		const { description, financialAccountId, primaryColor, images } = options;

		const validation = createCheckoutSchema.safeParse({
			name,
			amount,
			quantity,
			successUrl,
			cancelUrl,
			description,
			financialAccountId,
			primaryColor,
			images,
		});

		if (!validation.success) {
			return { success: false, error: new Error(validation.error.message) };
		}

		const body = {
			name,
			description,
			cancelUrl,
			successUrl,
			callbackState: null,
			reference: null,
			financialAccountId: financialAccountId,
			lineItems: [
				{
					type: "custom",
					name,
					price: {
						currency: "SLE",
						value: amount,
					},
					quantity,
					reference: null,
					description: description,
					images: images,
				},
			],
			paymentOptions: {
				card: { disable: false },
				bank: {
					disable: false,
					enabledProviders: ["slb001", "slb004", "slb007"],
				},
				momo: {
					disable: false,
					enabledProviders: ["m17", "m18"],
				},
				wallet: {
					disable: false,
					enabledProviders: ["dw001"],
				},
			},
			brandingOptions: {
				primaryColor: primaryColor,
			},
			metadata: {},
		};

		const idempotencyKey = randomBytes(20).toString("hex");

		return this.request<CreateCheckoutResponse>({
			method: "POST",
			path: this.path,
			body,
			idempotencyKey,
		});
	}

	/**
	 * List all checkout sessions.
	 */
	async list(): Promise<Result<ListCheckoutsResponse>> {
		return this.request<ListCheckoutsResponse>({
			method: "GET",
			path: this.path,
		});
	}

	/**
	 * Retrieve a specific checkout session by ID.
	 * @param checkoutId - The unique identifier of the checkout session.
	 */
	async retrieve(checkoutId: string): Promise<Result<RetrieveCheckoutResponse>> {
		return this.request<RetrieveCheckoutResponse>({
			method: "GET",
			path: `${this.path}/${checkoutId}`,
		});
	}

	/**
	 * Delete or cancel a checkout session.
	 * @param checkoutId - The unique identifier of the checkout session.
	 */
	async delete(checkoutId: string): Promise<Result<void>> {
		return this.request<void>({
			method: "DELETE",
			path: `${this.path}/${checkoutId}`,
		});
	}
}
