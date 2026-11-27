import type { Amount, Metadata, MetadataInput } from "./core";

export interface ReceiptEntitlement {
	key: string;
	name: string | null;
	limit: number;
	current: number;
	remaining: number;
	exhausted: boolean;
}

export interface Receipt {
	status: "not_redeemed" | "partially_redeemed" | "fully_redeemed";
	orderName: string | null;
	orderNumber: string;
	orderAmount: Amount;
	createTime: string;
	updateTime: string;
	entitlements: ReceiptEntitlement[] | null;
	metadata: Metadata | null;
}

export interface RedeemReceiptOptions {
	/** Redeem everything left on the receipt. */
	redeemAll?: boolean | null;
	/** Redeem specific entitlements: `units` defaults to 1. */
	entitlements?: { key: string; units?: number }[] | null;
	metadata?: MetadataInput | null;
}

export type GetReceiptResponse = Receipt;

/** The outcome of a redemption and the receipt as it now stands. */
export interface RedeemReceiptResponse {
	redeem: boolean;
	receipt: Receipt;
}
