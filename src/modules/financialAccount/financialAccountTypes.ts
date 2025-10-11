export interface CreateFinancialAccount {
	success: boolean;
	messages: string[];
	result: Result;
}

interface Result {
	id: string;
	uvan: string;
	name: string;
	currency: string;
	reference: string;
	description: string;
	balance: Balance;
	createTime: string;
	updateTime: string;
	// metadata: any;
}

interface Balance {
	available: Available;
}

interface Available {
	currency: string;
	value: number;
}

//------------------------------------------------------------------------------------------------------

export interface GetFinancialAccount {
	success: boolean;
	messages: string[];
	result: Result;
}

interface Result {
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

export interface AllFinancialAccount {
	success: boolean;
	messages: string[];
	result: Result[];
	pagination: Pagination;
}

interface Pagination {
	count: number;
	next: string;
}

interface Result {
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
