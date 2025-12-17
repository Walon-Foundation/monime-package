import type { MonimeClient } from "../../client";
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

export function CheckoutSessionAPI(client: MonimeClient) {
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
				client,
				name,
				amount,
				quantity,
				successUrl,
				cancelUrl,
				description,
				financialAccountId,
				primaryColor,
				images,
			) as Promise<{
				success: boolean;
				error?: Error;
				data: CreateCheckout;
			}>,
		get: () =>
			getAllCheckout(client) as Promise<{
				success: boolean;
				error?: Error;
				data: AllCheckout;
			}>,
		getOne: (checkoutId: string) =>
			getOnecheckout(client, checkoutId) as Promise<{
				success: boolean;
				error?: Error;
				data: OneCheckout;
			}>,
		delete: (checkoutId: string) =>
			deleteCheckout(client, checkoutId) as Promise<{
				success: boolean;
				error?: Error;
			}>,
	};
}
