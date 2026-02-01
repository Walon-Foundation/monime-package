import type { Pagination } from "./core";
export interface Payment {
	id: string;
	status: "pending" | "processing" | "completed" | "failed";
	amount: {
		currency: string;
		value: number;
	};
	channel: {
		type: "bank" | "card" | "momo" | "wallet";
	};
	name: string | null;
	reference: string | null;
	orderNumber: string | null;
	financialAccountId: string | null;
	financialTransactionReference: string | null;
	fees: Array<{
		code: string;
		amount: {
			currency: string;
			value: number;
		};
	}>;
	createTime: string;
	updateTime: string;
	ownershipGraph: {
		owner: {
			id: string;
			type: string;
			metadata: Record<string, unknown> | null;
		};
	};
	metadata: Record<string, unknown> | null;
}

export interface RetrievePaymentResponse extends Payment {}

export interface ListPaymentsResponse {
	result: Payment[];
	pagination: Pagination;
}

export interface UpdatePaymentResponse extends Payment {}
