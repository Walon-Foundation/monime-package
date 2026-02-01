import type { Pagination } from "./core";
export interface CreateFinancialAccountResponse {
	id: string;
	uvan: string;
	name: string;
	currency: string;
	reference: string;
	description: string;
	balance: Balance;
	createTime: string;
	updateTime: string;
	// metadata: unknown;
}

interface Balance {
	available: Available;
}

interface Available {
	currency: string;
	value: number;
}

//------------------------------------------------------------------------------------------------------

export interface RetrieveFinancialAccountResponse {
	id: string;
	uvan: string;
	name: string;
	currency: string;
	reference: string;
	description: string;
	balance: Balance;
	createTime: string;
	updateTime: string;
	// metadata: Metadata;
}

interface Balance {
	available: Available;
}

interface Available {
	currency: string;
	value: number;
}

//----------------------------------------------------------------------------------------------------------------------------------------------------------------------------

export interface ListFinancialAccountsResponse {
	result: FinancialAccount[];
	pagination: Pagination;
}

interface FinancialAccount {
	id: string;
	uvan: string;
	name: string;
	currency: string;
	reference: string;
	description: string;
	balance: Balance;
	createTime: string;
	updateTime: string;
	//   metadata: Metadata;
}

interface Balance {
	available: Available;
}

interface Available {
	currency: string;
	value: number;
}
