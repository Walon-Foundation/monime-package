import { HttpClient } from "../http";
import type { ListOptions, MutationOptions, Result } from "../types";
import type {
	CreateCheckoutOptions,
	CreateCheckoutResponse,
	ListCheckoutsResponse,
	RetrieveCheckoutResponse,
} from "../types/checkoutSession";
import { createCheckoutSchema } from "../validators/checkoutSession.validator";
import { compact } from "../validators/common";

export type { CreateCheckoutOptions } from "../types/checkoutSession";

export class CheckoutSessionAPI extends HttpClient {
	private readonly path = "/checkout-sessions";

	/**
	 * Create a new checkout session for a hosted payment page. Send the payer
	 * to the returned `redirectUrl`. Prices are in minor units.
	 */
	async create(
		options: CreateCheckoutOptions,
		requestOptions?: MutationOptions,
	): Promise<Result<CreateCheckoutResponse>> {
		const validation = createCheckoutSchema.safeParse(options);
		if (!validation.success) return this.invalid(validation.error);

		const body = compact({
			...options,
			financialAccountId: options.financialAccountId || undefined,
			lineItems: options.lineItems.map((item) =>
				compact({
					...item,
					type: item.type ?? "custom",
					price: {
						currency: item.price.currency ?? "SLE",
						value: item.price.value,
					},
				}),
			),
		});

		return this.request<CreateCheckoutResponse>({
			method: "POST",
			path: this.path,
			body,
			idempotencyKey: this.idempotencyKey(requestOptions),
		});
	}

	/**
	 * List a page of checkout sessions.
	 */
	async list(options?: ListOptions): Promise<Result<ListCheckoutsResponse>> {
		return this.request<ListCheckoutsResponse>({
			method: "GET",
			path: this.path,
			query: this.listQuery(options),
		});
	}

	/**
	 * Retrieve a specific checkout session by ID.
	 * @param checkoutId - The unique identifier of the checkout session.
	 */
	async retrieve(
		checkoutId: string,
	): Promise<Result<RetrieveCheckoutResponse>> {
		if (!checkoutId) return this.invalid("checkoutId is required");

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
		if (!checkoutId) return this.invalid("checkoutId is required");

		return this.request<void>({
			method: "DELETE",
			path: `${this.path}/${checkoutId}`,
		});
	}
}
