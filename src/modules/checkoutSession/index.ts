import type { ClientConfig, Result } from "../../types";
import {
	createCheckout,
	deleteCheckout,
	getAllCheckout,
	getOnecheckout,
} from "./checkoutSession";
import type {
	AllCheckout,
	CreateCheckout,
	OneCheckout,
} from "./checkoutSessionType";

export function CheckoutSessionAPI(config: ClientConfig) {
	return {
		create: (
			name: string,
			amount: number,
			quantity: number,
			successUrl: string,
			cancelUrl: string,
			description?: string,
			financialAccountId?: string,
			primaryColor?: string,
			images?: string[],
		) =>
			createCheckout(
				config,
				name,
				amount,
				quantity,
				successUrl,
				cancelUrl,
				description,
				financialAccountId,
				primaryColor,
				images,
			) as Promise<Result<CreateCheckout>>,
		get: () => getAllCheckout(config) as Promise<Result<AllCheckout>>,
		getOne: (checkoutId: string) =>
			getOnecheckout(config, checkoutId) as Promise<Result<OneCheckout>>,
		delete: (checkoutId: string) =>
			deleteCheckout(config, checkoutId) as Promise<Result<OneCheckout>>,
	};
}
